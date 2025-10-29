document.addEventListener("DOMContentLoaded", async () => {
    // 🔹 VERIFICAR AUTENTICACIÓN PRIMERO
    const user = await verificarAutenticacion();
    if (!user) return;

    // 🔹 VERIFICAR SUPABASE
    if (!verificarSupabase()) return;

    // Elementos del DOM
    const menuRecompensas = document.getElementById("menu_recompensas");
    const seccionDisponibles = document.getElementById("seccion_recompensas_disponibles");
    const seccionCanjeadas = document.getElementById("seccion_recompensas_canjeadas");
    const tablaDisponibles = document.getElementById("tabla_recompensas_disponibles");
    const tablaCanjeadas = document.getElementById("tabla_recompensas_canjeadas");
    const btnDisponibles = document.getElementById("boton_disponibles");
    const btnCanjeadas = document.getElementById("boton_canjeadas");
    const btnVolverDisponibles = document.getElementById("btn_volver_disponibles");
    const btnVolverCanjeadas = document.getElementById("btn_volver_canjeadas");
    
    console.log("🎯 Usuario:", user.nombre_usuario, "ID:", user.id_usuario);

    // Event listeners
    btnDisponibles.addEventListener("click", () => {
        menuRecompensas.style.display = "none";
        seccionDisponibles.style.display = "block";
        cargarRecompensasDisponibles();
    });

    btnCanjeadas.addEventListener("click", () => {
        menuRecompensas.style.display = "none";
        seccionCanjeadas.style.display = "block";
        cargarRecompensasCanjeadas();
    });

    btnVolverDisponibles.addEventListener("click", () => {
        seccionDisponibles.style.display = "none";
        menuRecompensas.style.display = "grid";
    });

    btnVolverCanjeadas.addEventListener("click", () => {
        seccionCanjeadas.style.display = "none";
        menuRecompensas.style.display = "grid";
    });

    // 🔹 Cargar recompensas disponibles
    async function cargarRecompensasDisponibles() {
        try {
            console.log("🔄 Cargando recompensas disponibles...");
            
            const { data, error } = await supabase.rpc('sp_recompensas_disponibles_usuario', {
                p_id_usuario: user.id_usuario
            });

            if (error) {
                console.error("❌ Error procedimiento:", error);
                throw error;
            }

            console.log("✅ Recompensas disponibles:", data);

            tablaDisponibles.innerHTML = `
                <thead>
                    <tr>
                        <th>Recompensa</th>
                        <th>Costo (Puntos)</th>
                        <th>Tus Puntos</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.length === 0 ? 
                        '<tr><td colspan="4">No hay recompensas disponibles</td></tr>' : 
                        data.map(recompensa => `
                            <tr>
                                <td>${recompensa.nombre_recompensa}</td>
                                <td>${recompensa.costo_puntos}</td>
                                <td>${recompensa.saldo_puntos}</td>
                                <td>
                                    ${recompensa.saldo_puntos >= recompensa.costo_puntos ? 
                                        `<button class="btn-canjear" 
                                            data-id="${recompensa.id_recompensa}" 
                                            data-nombre="${recompensa.nombre_recompensa}"
                                            data-costo="${recompensa.costo_puntos}">
                                            Canjear
                                        </button>` :
                                        '<span style="color: #ccc;">Puntos insuficientes</span>'
                                    }
                                </td>
                            </tr>
                        `).join('')
                    }
                </tbody>
            `;

            // Agregar event listeners
            document.querySelectorAll('.btn-canjear').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idRecompensa = btn.getAttribute('data-id');
                    const nombreRecompensa = btn.getAttribute('data-nombre');
                    const costoPuntos = btn.getAttribute('data-costo');
                    mostrarModalCanje(idRecompensa, nombreRecompensa, costoPuntos);
                });
            });

        } catch (err) {
            console.error("❌ Error cargando recompensas disponibles:", err);
            showMessage("Error al cargar recompensas disponibles: " + err.message, "error");
            tablaDisponibles.innerHTML = `
                <tr><td colspan="4">Error al cargar recompensas disponibles</td></tr>
            `;
        }
    }

    // 🔹 Cargar recompensas canjeadas
    async function cargarRecompensasCanjeadas() {
        try {
            console.log("🔄 Cargando recompensas canjeadas...");
            
            const { data, error } = await supabase.rpc('sp_recompensas_canjeadas_usuario', {
                p_id_usuario: user.id_usuario
            });

            if (error) {
                console.error("❌ Error procedimiento:", error);
                throw error;
            }

            console.log("✅ Recompensas canjeadas:", data);

            tablaCanjeadas.innerHTML = `
                <thead>
                    <tr>
                        <th>Recompensa</th>
                        <th>Costo (Puntos)</th>
                        <th>Fecha de Canje</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.length === 0 ? 
                        '<tr><td colspan="4">No has canjeado recompensas</td></tr>' : 
                        data.map(canje => `
                            <tr>
                                <td>${canje.nombre_recompensa}</td>
                                <td>${canje.costo_puntos}</td>
                                <td>${canje.fecha_canje}</td>
                                <td>
                                    <span class="estado-canjeado">✅ Canjeado</span>
                                </td>
                            </tr>
                        `).join('')
                    }
                </tbody>
            `;

        } catch (err) {
            console.error("❌ Error cargando recompensas canjeadas:", err);
            showMessage("Error al cargar recompensas canjeadas: " + err.message, "error");
            tablaCanjeadas.innerHTML = `
                <tr><td colspan="4">Error al cargar recompensas canjeadas</td></tr>
            `;
        }
    }

    // 🔹 Mostrar modal para confirmar canje
    function mostrarModalCanje(idRecompensa, nombreRecompensa, costoPuntos) {
        const modalHTML = `
            <div id="modalCanje" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;">
                <div style="background:white; padding:20px; border-radius:10px; width:350px; text-align:center;">
                    <h3>Confirmar Canje</h3>
                    <p>¿Estás seguro de que quieres canjear?</p>
                    <p><strong>${nombreRecompensa}</strong></p>
                    <p>Costo: <strong>${costoPuntos} puntos</strong></p>
                    
                    <div style="display:flex; justify-content:space-between; margin-top:20px;">
                        <button id="confirmarCanje" style="padding:8px 15px; background:#28a745; color:white; border:none; border-radius:5px;">
                            ✅ Confirmar
                        </button>
                        <button id="cancelarCanje" style="padding:8px 15px; background:#dc3545; color:white; border:none; border-radius:5px;">
                            ❌ Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('confirmarCanje').addEventListener('click', () => {
            realizarCanje(idRecompensa, nombreRecompensa, costoPuntos);
        });

        document.getElementById('cancelarCanje').addEventListener('click', () => {
            document.getElementById('modalCanje').remove();
        });
    }

    // 🔹 Realizar canje
    async function realizarCanje(idRecompensa, nombreRecompensa, costoPuntos) {
        try {
            console.log("🔄 Realizando canje...");
            
            const { data, error } = await supabase.rpc('sp_realizar_canje', {
                p_id_usuario: user.id_usuario,
                p_id_recompensa: parseInt(idRecompensa),
                p_costo_puntos: parseInt(costoPuntos)
            });

            if (error) throw error;

            if (data.success) {
                showMessage('✅ ' + data.message, "success");
                document.getElementById('modalCanje').remove();
                cargarRecompensasDisponibles(); // Recargar lista
            } else {
                showMessage('❌ ' + data.message, "error");
            }

        } catch (err) {
            console.error("❌ Error realizando canje:", err);
            showMessage('❌ Error al realizar el canje: ' + err.message, "error");
        }
    }

    console.log("✅ Recompensas.js cargado correctamente");
});