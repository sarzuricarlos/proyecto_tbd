document.addEventListener("DOMContentLoaded", async () => {
    const tablaCuerpo = document.getElementById("cuerpo_tabla_usuarios");
    const btnGuardar = document.getElementById("guardar_cambios");
    const btnCancelar = document.getElementById("cancelar_edicion");
    const btnMenu = document.getElementById("volver_menu");

    let filaSeleccionada = null;
    let usuarioSeleccionado = null;

    // 🔹 Botón menú principal
    btnMenu.addEventListener("click", () => {
        window.location.href = "./menu_administrador.html";
    });

    // ============================================================
    // 🔹 Cargar usuarios CON ROLES usando procedimiento
    // ============================================================
    async function cargarUsuarios() {
        try {
            const { data, error } = await supabase.rpc('sp_obtener_usuarios_con_roles');

            if (error) throw error;

            tablaCuerpo.innerHTML = "";

            if (data && data.length > 0) {
                data.forEach(usuario => {
                    const fila = document.createElement("tr");
                    fila.innerHTML = `
                        <td>${usuario.id_usuario}</td>
                        <td>${usuario.nombre_usuario}</td>
                        <td>${usuario.nombre_apellido}</td>
                        <td>${usuario.correo}</td>
                        <td>${usuario.fecha_nacimiento || '—'}</td>
                        <td>${usuario.nombre_rol}</td>
                    `;
                    fila.addEventListener("click", () => seleccionarFila(fila, usuario));
                    tablaCuerpo.appendChild(fila);
                });
            } else {
                tablaCuerpo.innerHTML = `<tr><td colspan="6">No hay usuarios registrados</td></tr>`;
            }
        } catch (err) {
            console.error("Error al cargar usuarios:", err.message);
            tablaCuerpo.innerHTML = `<tr><td colspan="6">Error al cargar los usuarios</td></tr>`;
        }
    }

    // ============================================================
    // 🔹 Seleccionar fila y habilitar edición inline
    // ============================================================
function seleccionarFila(fila, usuario) {
    if (filaSeleccionada && filaSeleccionada !== fila) {
        filaSeleccionada.classList.remove("seleccionado");
        restaurarFila(filaSeleccionada);
    }

    filaSeleccionada = fila;
    usuarioSeleccionado = usuario;
    fila.classList.add("seleccionado");

    const celdas = fila.querySelectorAll("td");
    
    // 🔥 PREVENIR PROPAGACIÓN DE EVENTOS en la fila
    fila.style.pointerEvents = "none"; // ❌ Deshabilitar eventos en la fila
    
    celdas[1].innerHTML = `<input type="text" value="${usuario.nombre_usuario}" class="input-editable" style="pointer-events: auto">`;
    celdas[2].innerHTML = `<input type="text" value="${usuario.nombre_apellido}" class="input-editable" style="pointer-events: auto">`;
    celdas[3].innerHTML = `<input type="email" value="${usuario.correo}" class="input-editable" style="pointer-events: auto">`;
    celdas[4].innerHTML = `<input type="date" value="${usuario.fecha_nacimiento || ''}" class="input-editable" style="pointer-events: auto">`;
    celdas[5].innerHTML = `
        <select class="input-editable" style="pointer-events: auto">
            <option ${usuario.nombre_rol === "Administrador" ? "selected" : ""}>Administrador</option>
            <option ${usuario.nombre_rol === "Estudiante" ? "selected" : ""}>Estudiante</option>
            <option ${usuario.nombre_rol === "Personal" ? "selected" : ""}>Personal</option>
            <option ${usuario.nombre_rol === "Sin rol" ? "selected" : ""}>Sin rol</option>
        </select>
    `;

    // 🔥 PREVENIR CLICKS en la fila que interfieran con los inputs
    fila.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
    }, true);

    btnGuardar.style.display = "inline-block";
    btnCancelar.style.display = "inline-block";
}

    // ============================================================
    // 🔹 Restaurar fila original - CORREGIDO
    // ============================================================
    function restaurarFila(fila) {
        if (!usuarioSeleccionado) return;
        fila.innerHTML = `
            <td>${usuarioSeleccionado.id_usuario}</td>
            <td>${usuarioSeleccionado.nombre_usuario}</td>
            <td>${usuarioSeleccionado.nombre_apellido}</td>
            <td>${usuarioSeleccionado.correo}</td>
            <td>${usuarioSeleccionado.fecha_nacimiento || '—'}</td>
            <td>${usuarioSeleccionado.nombre_rol}</td>
        `;
        fila.addEventListener("click", () => seleccionarFila(fila, usuarioSeleccionado));
    }

    // ============================================================
    // 🔹 Guardar cambios usando procedimiento
    // ============================================================
    btnGuardar.addEventListener("click", async () => {
        if (!filaSeleccionada) {
            alert("Selecciona un usuario primero.");
            return;
        }

        const inputs = filaSeleccionada.querySelectorAll("input, select");
        const nuevoNombreUsuario = inputs[0].value.trim();
        const nuevoNombreCompleto = inputs[1].value.trim();
        const nuevoCorreo = inputs[2].value.trim();
        const nuevaFechaNacimiento = inputs[3].value;
        const nuevoRol = inputs[4].value;

        if (!nuevoNombreUsuario || !nuevoCorreo) {
            alert("Por favor completa todos los campos.");
            return;
        }

        try {
            const { data, error } = await supabase.rpc('sp_actualizar_usuario_rol', {
                p_id_usuario: usuarioSeleccionado.id_usuario,
                p_nombre_usuario: nuevoNombreUsuario,
                p_nombre_apellido: nuevoNombreCompleto,
                p_correo: nuevoCorreo,
                p_fecha_nacimiento: nuevaFechaNacimiento,
                p_nombre_rol: nuevoRol
            });

            if (error) throw error;

            if (data.success) {
                alert("✅ " + data.message);
                
                // Actualizar datos locales
                usuarioSeleccionado.nombre_usuario = nuevoNombreUsuario;
                usuarioSeleccionado.nombre_apellido = nuevoNombreCompleto;
                usuarioSeleccionado.correo = nuevoCorreo;
                usuarioSeleccionado.fecha_nacimiento = nuevaFechaNacimiento;
                usuarioSeleccionado.nombre_rol = nuevoRol;

                restaurarFila(filaSeleccionada);
                filaSeleccionada.classList.remove("seleccionado");
                filaSeleccionada = null;
                usuarioSeleccionado = null;

                btnGuardar.style.display = "none";
                btnCancelar.style.display = "none";
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error("Error al guardar cambios:", err.message);
            alert("❌ No se pudieron guardar los cambios.");
        }
    });

    // ============================================================
    // 🔹 Cancelar edición
    // ============================================================
    btnCancelar.addEventListener("click", () => {
        if (filaSeleccionada) {
            restaurarFila(filaSeleccionada);
            filaSeleccionada.classList.remove("seleccionado");
            filaSeleccionada = null;
            usuarioSeleccionado = null;
        }
        btnGuardar.style.display = "none";
        btnCancelar.style.display = "none";
    });

    // ============================================================
    // 🔹 Inicializar carga
    // ============================================================
    await cargarUsuarios();
});