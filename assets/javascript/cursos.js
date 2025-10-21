document.addEventListener("DOMContentLoaded", async () => {
    const btnMenuPrincipal = document.getElementById("volver_menu");
    const btnDisponibles = document.getElementById("boton_disponibles");
    const btnHorario = document.getElementById("boton_horario");

    const seccionMenu = document.getElementById("menu");
    const seccionCursos = document.getElementById("seccion_cursos");
    const seccionHorario = document.getElementById("seccion_horario");

    const tablaCursos = document.getElementById("tabla_cursos_disponibles");
    const tablaHorario = document.getElementById("tabla_horario_usuario");

    const btnVolverCursos = document.querySelector("#volver_disponibles button");
    const btnVolverHorario = document.querySelector("#volver_horario button");

    if (!supabase) {
        console.error("❌ Supabase no está inicializado.");
        return;
    }

    // 🔹 Menú principal
    btnMenuPrincipal.addEventListener("click", () => {
        window.location.href = "./menuprincipal.html";
    });

    // ============================================================
    // 🔹 Mostrar cursos disponibles
    // ============================================================
    async function mostrarCursosDisponibles() {
        seccionMenu.style.display = "none";
        seccionHorario.style.display = "none";
        seccionCursos.style.display = "block";
        tablaCursos.innerHTML = "";

        try {
            const { data, error } = await supabase
                .from("curso")
                .select("titulo_curso, descripcion_curso, duracion, modalidad, horario_general, costo, cupos")
                .gt("cupos", 0);

            if (error) throw error;

            if (!data || data.length === 0) {
                tablaCursos.innerHTML = `<tr><td style="color:white; text-align:center;">No hay cursos disponibles.</td></tr>`;
                return;
            }

            // Crear encabezado
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
                    </tr>
                </thead>
                <tbody>
                    ${data.map(c => `
                        <tr>
                            <td>${c.titulo_curso}</td>
                            <td>${c.descripcion_curso}</td>
                            <td>${c.duracion} semanas</td>
                            <td>${c.modalidad}</td>
                            <td>${c.horario_general}</td>
                            <td>$${c.costo}</td>
                            <td>${c.cupos}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        } catch (err) {
            console.error("Error al cargar cursos:", err.message);
            tablaCursos.innerHTML = `<tr><td style="color:white;">Error al cargar los cursos disponibles.</td></tr>`;
        }
    }

    // ============================================================
    // 🔹 Mostrar horario del usuario (procedimiento almacenado)
    // ============================================================
    async function mostrarHorarioUsuario() {
        seccionMenu.style.display = "none";
        seccionCursos.style.display = "none";
        seccionHorario.style.display = "block";
        tablaHorario.innerHTML = "";

        try {
            const userData = localStorage.getItem("user");
            if (!userData) {
                alert("⚠️ No hay sesión activa. Redirigiendo al inicio...");
                window.location.href = "../../index.html";
                return;
            }

            const usuario = JSON.parse(userData);
            const idUsuario = usuario.id_usuario;

            const { data, error } = await supabase.rpc("sp_horario_semana_actual", {
                p_id_usuario: idUsuario
            });

            if (error) throw error;

            if (!data || data.length === 0) {
                tablaHorario.innerHTML = `<tr><td style="color:white; text-align:center;">No tienes cursos activos esta semana.</td></tr>`;
                return;
            }

            // Crear encabezado
            tablaHorario.innerHTML = `
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Día</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Modalidad</th>
                        <th>Progreso</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(h => `
                        <tr>
                            <td>${h.titulo_curso}</td>
                            <td>${h.dia_semana}</td>
                            <td>${h.hora_inicio_clase}</td>
                            <td>${h.hora_fin_clase}</td>
                            <td>${h.modalidades}</td>
                            <td>${h.progreso_semanal}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        } catch (err) {
            console.error("Error al cargar horario:", err.message);
            tablaHorario.innerHTML = `<tr><td style="color:white;">Error al cargar tu horario.</td></tr>`;
        }
    }

    // ============================================================
    // 🔹 Eventos
    // ============================================================
    btnDisponibles.addEventListener("click", mostrarCursosDisponibles);
    btnHorario.addEventListener("click", mostrarHorarioUsuario);

    btnVolverCursos.addEventListener("click", () => {
        seccionCursos.style.display = "none";
        seccionMenu.style.display = "flex";
    });

    btnVolverHorario.addEventListener("click", () => {
        seccionHorario.style.display = "none";
        seccionMenu.style.display = "flex";
    });
});
