document.addEventListener("DOMContentLoaded", async () => {
    // ✅ VERIFICACIONES AUTOMÁTICAS
    if (!verificarSupabase()) return;
    const user = await verificarAutenticacion();
    if (!user) return;

    console.log("🎯 Usuario:", user.nombre_usuario, "ID:", user.id_usuario);

    // ✅ ELEMENTOS DEL DOM
    const btnDisponibles = document.getElementById("boton_disponibles");
    const btnHorario = document.getElementById("boton_horario");
    const seccionMenu = document.getElementById("menu");
    const seccionCursos = document.getElementById("seccion_cursos");
    const seccionHorario = document.getElementById("seccion_horario");
    const tablaCursos = document.getElementById("tabla_cursos_disponibles");
    const tablaHorario = document.getElementById("tabla_horario_usuario");
    const buscador = document.getElementById("buscador_cursos");
    const btnVolverCursos = document.getElementById('btn_volver_disponibles');

    // Verificar que los elementos existen
    if (!btnDisponibles || !btnHorario || !seccionMenu || !seccionCursos || !seccionHorario || !tablaCursos || !tablaHorario) {
        console.error("❌ No se encontraron algunos elementos del DOM");
        return;
    }
    console.log("✅ Todos los elementos del DOM encontrados");

    let cursoSeleccionado = null;

    // ============================================================
    // 🔹 Mostrar cursos disponibles
    // ============================================================
    async function mostrarCursosDisponibles() {
        seccionMenu.style.display = "none";
        seccionHorario.style.display = "none";
        seccionCursos.style.display = "block";
        btnVolverCursos.style.display = "inline-block"; // Asegura que el botón de volver sea visible
        tablaCursos.innerHTML = "<tr><td style='color:white; text-align:center;'>Cargando cursos...</td></tr>";

        try {
            const { data, error } = await supabase.rpc('sp_obtener_cursos_con_estado', {
                p_id_usuario: user.id_usuario
            });

            if (error) throw error;

            if (!data || data.length === 0) {
                tablaCursos.innerHTML = `<tr><td colspan="8" style="color:white; text-align:center;">No hay cursos disponibles.</td></tr>`;
                return;
            }

            tablaCursos.innerHTML = `
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Duración</th>
                        <th>Modalidad</th>
                        <th>Horario</th>
                        <th>Costo</th>
                        <th>Cupos</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(curso => `
                        <tr class="fila-curso ${curso.esta_inscrito ? 'fila-inscrito' : ''}" 
                            data-id="${curso.id_curso}">
                            <td>${curso.titulo_curso}</td>
                            <td>${curso.descripcion_curso}</td>
                            <td>${curso.duracion} semanas</td>
                            <td>${curso.modalidad}</td>
                            <td>${curso.horario_general}</td>
                            <td>$${curso.costo}</td>
                            <td>${curso.cupos}</td>
                            <td>
                                ${curso.esta_inscrito ? 
                                    '<span style="color: #28a745; font-weight: bold;">✅ Inscrito</span>' : 
                                    `<button class="btn-inscribir" 
                                            data-id="${curso.id_curso}"
                                            data-titulo="${curso.titulo_curso}"
                                            data-costo="${curso.costo}"
                                            data-duracion="${curso.duracion}">
                                        Inscribirse
                                    </button>`
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;

            // Agregar eventos a botones "Inscribirse"
            document.querySelectorAll('.btn-inscribir').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idCurso = btn.getAttribute('data-id');
                    const tituloCurso = btn.getAttribute('data-titulo');
                    const costo = btn.getAttribute('data-costo');
                    const duracion = btn.getAttribute('data-duracion');

                    cursoSeleccionado = { idCurso, tituloCurso, costo, duracion };
                    mostrarModalInscripcion();
                });
            });

            // Click en fila para cursos no inscritos
            document.querySelectorAll('.fila-curso:not(.fila-inscrito)').forEach(fila => {
                fila.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('btn-inscribir')) {
                        const idCurso = fila.getAttribute('data-id');
                        const tituloCurso = fila.cells[0].textContent;
                        const costo = fila.cells[5].textContent.replace('$', '');
                        const duracion = fila.cells[2].textContent.replace(' semanas', '');
                        cursoSeleccionado = { idCurso, tituloCurso, costo, duracion };
                        mostrarModalInscripcion();
                    }
                });
            });

        } catch (err) {
            console.error("❌ Error al cargar cursos:", err);
            showMessage("Error al cargar los cursos disponibles: " + err.message, "error");
            tablaCursos.innerHTML = `<tr><td colspan="8" style="color:white; text-align:center;">Error al cargar los cursos disponibles.</td></tr>`;
        }
    }

    // ============================================================
    // 🔹 Modal de Inscripción
    // ============================================================
    function mostrarModalInscripcion() {
        const modalHTML = `
            <div id="modalInscripcion" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;">
                <div style="background:white; padding:20px; border-radius:10px; width:400px; max-width:90vw;">
                    <h3>Confirmar Inscripción</h3>
                    <p><strong>Curso:</strong> ${cursoSeleccionado.tituloCurso}</p>
                    <p><strong>Duración:</strong> ${cursoSeleccionado.duracion} semanas</p>
                    <p><strong>Costo:</strong> $${cursoSeleccionado.costo}</p>
                    <label style="display:block; margin:15px 0 5px 0;"><strong>Método de pago:</strong></label>
                    <select id="selectMetodoPago" style="width:100%; padding:8px; margin-bottom:15px; border:1px solid #ddd; border-radius:4px;">
                        <option value="">Selecciona método de pago</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Pago QR">Pago QR</option>
                    </select>
                    <div style="display:flex; justify-content:space-between; margin-top:20px;">
                        <button id="confirmarInscripcion" style="padding:10px 20px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer;">
                            ✅ Confirmar Inscripción
                        </button>
                        <button id="cancelarInscripcion" style="padding:10px 20px; background:#dc3545; color:white; border:none; border-radius:5px; cursor:pointer;">
                            ❌ Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('confirmarInscripcion').addEventListener('click', realizarInscripcion);
        document.getElementById('cancelarInscripcion').addEventListener('click', () => {
            document.getElementById('modalInscripcion').remove();
            cursoSeleccionado = null;
        });
    }

    // ============================================================
    // 🔹 Realizar Inscripción
    // ============================================================
    async function realizarInscripcion() {
        const metodoPago = document.getElementById('selectMetodoPago').value;
        if (!metodoPago) {
            showMessage('Por favor selecciona un método de pago', 'error');
            return;
        }

        try {
            const { data, error } = await supabase.rpc('sp_realizar_inscripcion_completa', {
                p_id_usuario: user.id_usuario,
                p_id_curso: parseInt(cursoSeleccionado.idCurso),
                p_metodo_pago: metodoPago
            });

            if (error) throw error;

            if (data.success) {
                showMessage('✅ ' + data.message, 'success');
                document.getElementById('modalInscripcion').remove();
                cursoSeleccionado = null;
                setTimeout(() => mostrarCursosDisponibles(), 1000);
            } else {
                showMessage('❌ ' + data.message, 'error');
            }

        } catch (err) {
            console.error("❌ Error realizando inscripción:", err);
            showMessage('❌ Error al realizar la inscripción: ' + err.message, 'error');
        }
    }

    // ============================================================
    // 🔹 Mostrar horario del usuario
    // ============================================================
    async function mostrarHorarioUsuario() {
        seccionMenu.style.display = "none";
        seccionCursos.style.display = "none";
        seccionHorario.style.display = "block";
        btnVolverCursos.style.display = "inline-block"; // Asegura que el botón de volver sea visible
        tablaHorario.innerHTML = "<tr><td style='color:white; text-align:center;'>Cargando horario...</td></tr>";

        try {
            const { data, error } = await supabase.rpc("sp_horario_semana_actual", {
                p_id_usuario: user.id_usuario
            });

            if (error) throw error;

            if (!data || data.length === 0) {
                tablaHorario.innerHTML = `<tr><td colspan="5" style="color:white; text-align:center;">No tienes cursos activos esta semana.</td></tr>`;
                return;
            }

            tablaHorario.innerHTML = `
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Día</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Modalidad</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(h => `
                        <tr>
                            <td>${h.titulo_curso}</td>
                            <td>${h.dia_semana}</td>
                            <td>${h.hora_inicio}</td>
                            <td>${h.hora_fin}</td>
                            <td>${h.modalidades}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        } catch (err) {
            console.error("❌ Error al cargar horario:", err);
            showMessage("Error al cargar tu horario: " + err.message, "error");
            tablaHorario.innerHTML = `<tr><td colspan="5" style="color:white; text-align:center;">Error al cargar tu horario.</td></tr>`;
        }
    }

    // ============================================================
    // 🔹 EVENTOS BOTONES
    // ============================================================
    btnDisponibles.addEventListener("click", mostrarCursosDisponibles);
    btnHorario.addEventListener("click", mostrarHorarioUsuario);

   if (btnVolverCursos) {
    btnVolverCursos.addEventListener('click', () => {
        console.log("🔍 DEBUG: Botón volver cursos clickeado");
        seccionCursos.style.display = "none";
        seccionHorario.style.display = "none";
        seccionMenu.style.display = ""; // permite que CSS (grid) aplique
        btnVolverCursos.style.display = "none";
    });
    }

    if (buscador) {
        buscador.addEventListener("input", () => {
            const filtro = buscador.value.toLowerCase().trim();
            const filas = tablaCursos.querySelectorAll("tbody tr");

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
            const noResultados = document.getElementById("fila_sin_resultados");
            if (resultados === 0) {
                if (!noResultados) {
                    const tr = document.createElement("tr");
                    tr.id = "fila_sin_resultados";
                    tr.innerHTML = `<td colspan="8" style="color:white; text-align:center;">No se encontraron cursos con ese criterio.</td>`;
                    tablaCursos.querySelector("tbody").appendChild(tr);
                }
            } else if (noResultados) {
                noResultados.remove();
            }
        });
    }

    console.log("✅ Cursos.js cargado correctamente");
});