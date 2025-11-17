document.addEventListener("DOMContentLoaded", async () => {
    // Elementos del DOM
    const menuAulas = document.getElementById("menu_aulas");
    const seccionDisponibles = document.getElementById("seccion_aulas_disponibles");
    const seccionReservadas = document.getElementById("seccion_aulas_reservadas");
    const tablaDisponibles = document.getElementById("tabla_aulas_disponibles");
    const tablaReservadas = document.getElementById("tabla_aulas_reservadas");
    const btnDisponibles = document.getElementById("boton_disponibles");
    const btnReservadas = document.getElementById("boton_reservadas");
    const btnVolverDisponibles = document.getElementById("btn_volver_disponibles");
    const btnVolverReservadas = document.getElementById("btn_volver_reservadas");
    const buscadorDisponibles = document.getElementById("buscador_disponibles");
    const buscadorReservadas = document.getElementById("buscador_reservadas");

    // 🔹 Mostrar aulas disponibles
    btnDisponibles.addEventListener("click", () => {
        menuAulas.style.display = "none";
        seccionDisponibles.style.display = "block";
        cargarAulasDisponibles();
    });

    // 🔹 Mostrar aulas reservadas
    btnReservadas.addEventListener("click", () => {
        menuAulas.style.display = "none";
        seccionReservadas.style.display = "block";
        cargarAulasReservadas();
    });

    // 🔹 Volver desde sección disponibles
    btnVolverDisponibles.addEventListener("click", () => {
        seccionDisponibles.style.display = "none";
        menuAulas.style.display = "grid"; // ✅ mantener el layout original
        menuAulas.style.justifyItems = "center";
        menuAulas.style.alignItems = "center";
    });

    // 🔹 Volver desde sección reservadas
    btnVolverReservadas.addEventListener("click", () => {
        seccionReservadas.style.display = "none";
        menuAulas.style.display = "grid"; // ✅ mantener el layout original
        menuAulas.style.justifyItems = "center";
        menuAulas.style.alignItems = "center";
    });


    // 🔹 Cargar aulas disponibles
    async function cargarAulasDisponibles() {
        try {
            const fechaHoy = new Date().toISOString().split('T')[0];
            
            const { data, error } = await supabase.rpc('sp_aulas_disponibles', {
                p_fecha_reserva: fechaHoy
            });

            if (error) throw error;

            tablaDisponibles.innerHTML = `
                <thead>
                    <tr>
                        <th>Aula</th>
                        <th>Ubicación</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.length === 0 ? 
                        '<tr><td colspan="3">No hay aulas disponibles</td></tr>' : 
                        data.map(aula => `
                            <tr>
                                <td>${aula.nombre_aula}</td>
                                <td>${aula.ubicacion}</td>
                                <td>
                                    <button class="btn-reservar" data-id="${aula.id_aula}" data-nombre="${aula.nombre_aula}">
                                        Reservar
                                    </button>
                                </td>
                            </tr>
                        `).join('')
                    }
                </tbody>
            `;

            // Agregar event listeners a los botones de reservar
            document.querySelectorAll('.btn-reservar').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idAula = btn.getAttribute('data-id');
                    const nombreAula = btn.getAttribute('data-nombre');
                    mostrarModalReserva(idAula, nombreAula);
                });
            });

        } catch (err) {
            console.error("Error cargando aulas disponibles:", err);
            tablaDisponibles.innerHTML = `
                <tr><td colspan="3">Error al cargar aulas disponibles</td></tr>
            `;
        }
    }

// 🔹 Cargar TODAS las aulas reservadas (con nombres en lugar de IDs)
async function cargarAulasReservadas() {
    try {
        await supabase.rpc('sp_actualizar_reservas_vencidas');
        
        const { data, error } = await supabase.rpc('sp_todas_aulas_reservadas');

        if (error) throw error;

        console.log("📊 Todas las aulas reservadas:", data);

        tablaReservadas.innerHTML = `
            <thead>
                <tr>
                    <th>ID Reserva</th>
                    <th>Aula</th>
                    <th>Curso</th>
                    <th>Fecha</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${data.length === 0 ? 
                    '<tr><td colspan="7">No hay aulas reservadas</td></tr>' : 
                    data.map(reserva => `
                        <tr>
                            <td>${reserva.id_reserva}</td>
                            <td>${reserva.nombre_aula}</td>
                            <td>${reserva.nombre_curso}</td>
                            <td>${reserva.fecha_reserva}</td>
                            <td>${reserva.hora_inicio}</td>
                            <td>${reserva.hora_fin}</td>    
                            <td>
                                <span class="estado-${reserva.estado_reserva === 1 ? 'activo' : 'cancelado'}">
                                    ${reserva.estado_reserva === 1 ? '✅ Reservada' : '❌ Cancelada'}
                                </span>
                            </td>
                        </tr>
                    `).join('')
                }
            </tbody>
        `;

    } catch (err) {
        console.error("Error cargando aulas reservadas:", err);
        tablaReservadas.innerHTML = `
            <tr><td colspan="7">Error al cargar aulas reservadas: ${err.message}</td></tr>
        `;
    }
}

    // 🔹 Mostrar modal para reservar aula (ACTUALIZADA)
    function mostrarModalReserva(idAula, nombreAula) {
        const modalHTML = `
            <div id="modalReserva" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;">
                <div style="background:white; padding:20px; border-radius:10px; width:350px;">
                    <h3>Reservar Aula: ${nombreAula}</h3>
                    
                    <!-- AGREGAR SELECTOR DE CURSOS -->
                    <label>Curso:</label>
                    <select id="selectCursoReserva" style="width:100%; margin-bottom:10px; padding:5px;">
                        <option value="">Cargando cursos...</option>
                    </select>
                    
                    <label>Fecha:</label>
                    <input type="date" id="fechaReserva" style="width:100%; margin-bottom:10px; padding:5px;">
                    
                    <label>Hora Inicio:</label>
                    <input type="time" id="horaInicio" style="width:100%; margin-bottom:10px; padding:5px;">
                    
                    <label>Hora Fin:</label>
                    <input type="time" id="horaFin" style="width:100%; margin-bottom:10px; padding:5px;">
                    
                    <div style="display:flex; justify-content:space-between; margin-top:15px;">
                        <button id="confirmarReserva" style="padding:8px 15px;">Confirmar</button>
                        <button id="cancelarReserva" style="padding:8px 15px;">Cancelar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Configurar fecha mínima como hoy
        document.getElementById('fechaReserva').min = new Date().toISOString().split('T')[0];

        // Cargar cursos en el select
        cargarCursosEnModal();

        document.getElementById('confirmarReserva').addEventListener('click', () => {
            realizarReserva(idAula, nombreAula);
        });

        document.getElementById('cancelarReserva').addEventListener('click', () => {
            document.getElementById('modalReserva').remove();
        });
    }

    // 🔹 NUEVA FUNCIÓN: Cargar cursos en el modal
    async function cargarCursosEnModal() {
        try {
            const selectCurso = document.getElementById('selectCursoReserva');
            
            const { data, error } = await supabase.rpc('sp_obtener_cursos_disponibles');
            
            if (error) throw error;
            
            selectCurso.innerHTML = '<option value="">Selecciona un curso</option>';
            
            data.forEach(curso => {
                const option = document.createElement("option");
                option.value = curso.id_curso;
                option.textContent = `${curso.titulo_curso}`;
                selectCurso.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error al cargar cursos:', error);
            document.getElementById('selectCursoReserva').innerHTML = '<option value="">Error al cargar cursos</option>';
        }
    }
    
   // 🔹 Realizar reserva (ACTUALIZADA)
    async function realizarReserva(idAula, nombreAula) {
        const fecha = document.getElementById('fechaReserva').value;
        const horaInicio = document.getElementById('horaInicio').value;
        const horaFin = document.getElementById('horaFin').value;
        const idCurso = document.getElementById('selectCursoReserva').value; // NUEVO

        if (!fecha || !horaInicio || !horaFin || !idCurso) { // AGREGAR idCurso a la validación
            alert('Por favor completa todos los campos');
            return;
        }

        if (horaInicio >= horaFin) {
            alert('❌ La hora de inicio debe ser anterior a la hora de fin.');
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem("user"));
            
            // ACTUALIZAR la llamada al procedimiento
            const { data, error } = await supabase.rpc('sp_reservar_aula_completa', {
                p_id_usuario: user.id_usuario,
                p_id_aula: idAula,
                p_id_curso: parseInt(idCurso), // NUEVO PARÁMETRO
                p_fecha_reserva: fecha,
                p_hora_inicio: horaInicio,
                p_hora_fin: horaFin
            });

            if (error) throw error;

            if (data.success) {
                alert('✅ ' + data.message);
                document.getElementById('modalReserva').remove();
                cargarAulasDisponibles(); // Recargar lista
            } else {
                alert('❌ ' + data.message);
            }

        } catch (err) {
            console.error("Error realizando reserva:", err);
            alert('❌ Error al realizar la reserva');
        }
    }
    
    if (buscadorDisponibles) {
        buscadorDisponibles.addEventListener("input", () => {
            const filtro = buscadorDisponibles.value.toLowerCase().trim();
            const tablaDisponibles = document.getElementById("tabla_aulas_disponibles");
            const filas = tablaDisponibles.querySelectorAll("tbody tr");

            if (filas.length === 0) return;

            let resultados = 0;
            filas.forEach(fila => {
                const textoFila = fila.innerText.toLowerCase();
                if (textoFila.includes(filtro)) {
                    fila.style.display = "";
                    resultados++;
                } else {
                    fila.style.display = "none";
                }
            });

            // Si no hay coincidencias
            const noResultados = document.getElementById("fila_sin_resultados_disponibles");
            if (resultados === 0) {
                if (!noResultados) {
                    const tr = document.createElement("tr");
                    tr.id = "fila_sin_resultados_disponibles";
                    tr.innerHTML = `<td colspan="6" style="color:white; text-align:center;">No se encontraron aulas disponibles con ese criterio.</td>`;
                    tablaDisponibles.querySelector("tbody").appendChild(tr);
                }
            } else if (noResultados) {
                noResultados.remove();
            }
        });
    }

    if (buscadorReservadas) {
        buscadorReservadas.addEventListener("input", () => {
            const filtro = buscadorReservadas.value.toLowerCase().trim();
            const tablaReservadas = document.getElementById("tabla_aulas_reservadas");
            const filas = tablaReservadas.querySelectorAll("tbody tr");

            if (filas.length === 0) return;

            let resultados = 0;
            filas.forEach(fila => {
                const textoFila = fila.innerText.toLowerCase();
                if (textoFila.includes(filtro)) {
                    fila.style.display = "";
                    resultados++;
                } else {
                    fila.style.display = "none";
                }
            });

            // Si no hay coincidencias
            const noResultados = document.getElementById("fila_sin_resultados_reservadas");
            if (resultados === 0) {
                if (!noResultados) {
                    const tr = document.createElement("tr");
                    tr.id = "fila_sin_resultados_reservadas";
                    tr.innerHTML = `<td colspan="6" style="color:white; text-align:center;">No se encontraron aulas reservadas con ese criterio.</td>`;
                    tablaReservadas.querySelector("tbody").appendChild(tr);
                }
            } else if (noResultados) {
                noResultados.remove();
            }
        });
    }
});