document.addEventListener("DOMContentLoaded", async () => {
    const btnMenu = document.getElementById("volver_menu");
    const btnDisponibles = document.getElementById("boton_disponibles");
    const btnHorario = document.getElementById("boton_horario");
    const contenedor = document.getElementById("menu");

    if (!supabase) {
        console.error("❌ Supabase no está inicializado.");
        return;
    }

    // 🔹 Botón volver al menú principal
    btnMenu.addEventListener("click", () => {
        window.location.href = "./menuprincipal.html";
    });

    // ============================================================
    // 🔹 Función para mostrar los botones principales
    // ============================================================
    function mostrarMenuOpciones() {
        contenedor.innerHTML = `
            <button type="button" class="boton_menu" id="boton_disponibles">
                <img src="../icons/book_curso.svg" alt="">
                <span>Cursos disponibles</span>
            </button>
            <button type="button" class="boton_menu" id="boton_horario">
                <img src="../icons/calendar_horario.svg" alt="">
                <span>Horarios</span>
            </button>
        `;
        
        // Re-asignar eventos a los nuevos botones
        document.getElementById("boton_disponibles").addEventListener("click", mostrarCursosDisponibles);
        document.getElementById("boton_horario").addEventListener("click", mostrarHorarioUsuario);
    }

    // ============================================================
    // 🔹 Función para crear tablas genéricas
    // ============================================================
    function crearTabla(titulos, datos) {
        const tabla = document.createElement("table");
        tabla.classList.add("tabla_cursos");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        // Encabezados
        const filaEncabezado = document.createElement("tr");
        titulos.forEach(t => {
            const th = document.createElement("th");
            th.textContent = t;
            filaEncabezado.appendChild(th);
        });
        thead.appendChild(filaEncabezado);

        // Cuerpo de la tabla
        datos.forEach(item => {
            const fila = document.createElement("tr");
            Object.values(item).forEach(valor => {
                const td = document.createElement("td");
                td.textContent = valor ?? "-";
                fila.appendChild(td);
            });
            tbody.appendChild(fila);
        });

        tabla.appendChild(thead);
        tabla.appendChild(tbody);
        return tabla;
    }

    // ============================================================
    // 🔹 Cursos disponibles
    // ============================================================
    async function mostrarCursosDisponibles() {
        try {
            console.log("🔍 Cargando cursos disponibles...");
            
            const { data, error } = await supabase
                .from("curso")
                .select("titulo_curso, descripcion_curso, duracion, modalidad, horario_general, costo, cupos")
                .gt("cupos", 0); // Solo cursos con cupos disponibles

            console.log("📊 Cursos encontrados:", data);

            if (error) throw error;

            contenedor.innerHTML = "";

            if (!data || data.length === 0) {
                const mensaje = document.createElement("p");
                mensaje.textContent = "No hay cursos disponibles en este momento.";
                mensaje.style.color = "white";
                mensaje.style.textAlign = "center";
                contenedor.appendChild(mensaje);
            } else {
                const titulos = ["Título", "Descripción", "Duración", "Modalidad", "Horario", "Costo", "Cupos"];
                const datosFormateados = data.map(curso => ({
                    Título: curso.titulo_curso,
                    Descripción: curso.descripcion_curso,
                    Duración: `${curso.duracion} semanas`,
                    Modalidad: curso.modalidad,
                    Horario: curso.horario_general,
                    Costo: `$${curso.costo}`,
                    Cupos: curso.cupos
                }));
                
                const tabla = crearTabla(titulos, datosFormateados);
                contenedor.appendChild(tabla);
            }

            // 🔹 Botón volver al menú de opciones
            const btnVolver = document.createElement("button");
            btnVolver.textContent = "Volver";
            btnVolver.classList.add("boton_menu");
            btnVolver.addEventListener("click", mostrarMenuOpciones);
            contenedor.appendChild(btnVolver);

        } catch (err) {
            console.error("Error al cargar cursos:", err.message);
            contenedor.innerHTML = "<p style='color:white;'>Error al cargar los cursos disponibles.</p>";
            
            const btnVolver = document.createElement("button");
            btnVolver.textContent = "Volver";
            btnVolver.classList.add("boton_menu");
            btnVolver.addEventListener("click", mostrarMenuOpciones);
            contenedor.appendChild(btnVolver);
        }
    }

    // ============================================================
    // 🔹 Horario del usuario (procedimiento almacenado)
    // ============================================================
    async function mostrarHorarioUsuario() {
        try {
            console.log("🔍 Cargando horario del usuario...");
            
            // Obtenemos el usuario desde localStorage
            const userData = localStorage.getItem("user");
            if (!userData) {
                alert("⚠️ No hay sesión activa. Redirigiendo al inicio...");
                window.location.href = "../../index.html";
                return;
            }
            const usuario = JSON.parse(userData);
            const idUsuario = usuario.id_usuario;
            
            console.log("👤 ID Usuario:", idUsuario);

            // Llamada al procedimiento almacenado
            const { data, error } = await supabase.rpc("sp_horario_usuario_semanas", {
                p_id_usuario: idUsuario
            });

            console.log("📅 Horario encontrado:", data);

            if (error) throw error;

            contenedor.innerHTML = "";

            if (!data || data.length === 0) {
                const mensaje = document.createElement("p");
                mensaje.textContent = "No tienes cursos activos esta semana.";
                mensaje.style.color = "white";
                mensaje.style.textAlign = "center";
                contenedor.appendChild(mensaje);
            } else {
                const titulos = ["Curso", "Día", "Inicio", "Fin", "Modalidad", "Estado", "Semanas Restantes"];
                const datosFormateados = data.map(item => ({
                    Curso: item.titulo_curso,
                    Día: item.dia_semana,
                    Inicio: item.hora_inicio_clase,
                    Fin: item.hora_fin_clase,
                    Modalidad: item.modalidades,
                    Estado: item.estado_curso,
                    "Semanas Restantes": item.semanas_restantes
                }));

                const tabla = crearTabla(titulos, datosFormateados);
                contenedor.appendChild(tabla);
            }

            // 🔹 Botón volver al menú de opciones
            const btnVolver = document.createElement("button");
            btnVolver.textContent = "Volver";
            btnVolver.classList.add("boton_menu");
            btnVolver.addEventListener("click", mostrarMenuOpciones);
            contenedor.appendChild(btnVolver);

        } catch (err) {
            console.error("Error al cargar horario:", err.message);
            contenedor.innerHTML = "<p style='color:white;'>Error al cargar tu horario.</p>";
            
            const btnVolver = document.createElement("button");
            btnVolver.textContent = "Volver";
            btnVolver.classList.add("boton_menu");
            btnVolver.addEventListener("click", mostrarMenuOpciones);
            contenedor.appendChild(btnVolver);
        }
    }

    // ============================================================
    // 🔹 Asignación de eventos inicial
    // ============================================================
    btnDisponibles.addEventListener("click", mostrarCursosDisponibles);
    btnHorario.addEventListener("click", mostrarHorarioUsuario);
});