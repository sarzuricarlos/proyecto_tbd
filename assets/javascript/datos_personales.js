document.addEventListener("DOMContentLoaded", async () => {
    // ✅ VERIFICACIONES AUTOMÁTICAS con common.js
    if (!verificarSupabase()) return;
    const user = await verificarAutenticacion();
    if (!user) return;

    // ✅ ELEMENTOS DEL DOM
    const nombreUsuario = document.getElementById("nombre_usu");
    const nombreCompleto = document.getElementById("apellidos_usu");
    const correo = document.getElementById("email_usu");
    const nacimiento = document.getElementById("nacimiento_usu");
    const foto = document.getElementById("foto_perfil_usu");
    const inputFoto = document.getElementById("input_foto");
    const btnEditar = document.getElementById("boton_editar_datos");
    const btnGuardar = document.getElementById("boton_guardar");
    const btnCancelar = document.getElementById("boton_cancelar");

    let datosOriginales = {};
    let nuevaFoto = null;

    // ============================================================
    // 🔹 Cargar datos del usuario
    // ============================================================
    async function cargarDatos() {
        const { data, error } = await supabase
            .from("usuario")
            .select("id_usuario, nombre_usuario, nombre_apellido, correo, fecha_nacimiento, foto")
            .eq("id_usuario", user.id_usuario)
            .single();

        if (error) {
            console.error("Error cargando datos:", error.message);
            showMessage("No se pudieron cargar los datos del usuario", "error");
            return;
        }

        nombreUsuario.value = data.nombre_usuario || "";
        nombreCompleto.value = data.nombre_apellido || "";
        correo.value = data.correo || "";
        nacimiento.value = data.fecha_nacimiento || "";
        foto.src = data.foto || "/assets/icons/default_user.svg";

        datosOriginales = { ...data };
    }

    await cargarDatos();

    // ============================================================
    // 🔹 Manejo de foto de perfil
    // ============================================================
    foto.addEventListener("click", () => inputFoto.click());

    inputFoto.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        foto.src = URL.createObjectURL(file);
        nuevaFoto = file;
    });

    // ============================================================
    // 🔹 Editar datos
    // ============================================================
    btnEditar.addEventListener("click", () => {
        [nombreUsuario, nombreCompleto, correo, nacimiento].forEach(i => i.disabled = false);
        btnEditar.style.display = "none";
        btnGuardar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";
    });

    // ============================================================
    // 🔹 Guardar cambios
    // ============================================================
    btnGuardar.addEventListener("click", async () => {
        const nuevosDatos = {
            nombre_usuario: nombreUsuario.value.trim(),
            nombre_apellido: nombreCompleto.value.trim(),
            correo: correo.value.trim(),
            fecha_nacimiento: nacimiento.value
        };

        // ✅ Subir nueva foto si hay
        if (nuevaFoto) {
            const nombreArchivo = `${Date.now()}_${nuevaFoto.name}`;
            const { data: fileData, error: uploadError } = await supabase.storage
                .from("perfil")
                .upload(`fotos/${nombreArchivo}`, nuevaFoto, { upsert: true });

            if (uploadError) {
                showMessage("Error al subir la foto: " + uploadError.message, "error");
                return;
            }

            const { data: publicUrl } = supabase.storage
                .from("perfil")
                .getPublicUrl(`fotos/${nombreArchivo}`);

            nuevosDatos.foto = publicUrl.publicUrl;
        }

        const { error } = await supabase
            .from("usuario")
            .update(nuevosDatos)
            .eq("id_usuario", user.id_usuario);

        if (error) {
            showMessage("Error al guardar los cambios: " + error.message, "error");
            return;
        }

        showMessage("Datos actualizados correctamente", "success");

        // Deshabilitar edición
        [nombreUsuario, nombreCompleto, correo, nacimiento].forEach(i => i.disabled = true);
        btnEditar.style.display = "inline-block";
        btnGuardar.style.display = "none";
        btnCancelar.style.display = "none";

        datosOriginales = { ...datosOriginales, ...nuevosDatos };
        nuevaFoto = null;
    });

    // ============================================================
    // 🔹 Cancelar edición
    // ============================================================
    btnCancelar.addEventListener("click", () => {
        nombreUsuario.value = datosOriginales.nombre_usuario || "";
        nombreCompleto.value = datosOriginales.nombre_apellido || "";
        correo.value = datosOriginales.correo || "";
        nacimiento.value = datosOriginales.fecha_nacimiento || "";
        foto.src = datosOriginales.foto || "/assets/icons/default_user.svg";

        [nombreUsuario, nombreCompleto, correo, nacimiento].forEach(i => i.disabled = true);
        btnEditar.style.display = "inline-block";
        btnGuardar.style.display = "none";
        btnCancelar.style.display = "none";
        nuevaFoto = null;
    });
});