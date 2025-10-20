document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id_usuario) {
        alert("No se encontró una sesión activa. Redirigiendo...");
        window.location.href = "../../index.html";
        return;
    }

    const nombre = document.getElementById("nombre_usu");
    const apellido = document.getElementById("apellidos_usu");
    const correo = document.getElementById("email_usu");
    const nacimiento = document.getElementById("nacimiento_usu");
    const foto = document.getElementById("foto_perfil_usu");
    const inputFoto = document.getElementById("input_foto");

    const btnEditar = document.getElementById("boton_editar_datos");
    const btnCancelar = document.getElementById("boton_cancelar");
    const btnMenu = document.getElementById("volver_menu");

    let datosOriginales = {};
    let nuevaFoto = null;
    async function cargarDatos() {
        const { data, error } = await supabase
            .from("usuario")
            .select("id_usuario, nombre_usuario, apellido, correo, fecha_nacimiento, foto")
            .eq("id_usuario", user.id_usuario)
            .single();

        if (error) {
            console.error("Error cargando datos:", error.message);
            alert("No se pudieron cargar los datos del usuario.");
            return;
        }

        nombre.value = data.nombre_usuario || "";
        apellido.value = data.apellido || "";
        correo.value = data.correo || "";
        nacimiento.value = data.fecha_nacimiento || "";
        foto.src = data.foto || "/assets/icons/default_user.svg";

        datosOriginales = { ...data };
    }

    await cargarDatos();

    foto.addEventListener("click", () => {
        inputFoto.click();
    });

    inputFoto.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        foto.src = URL.createObjectURL(file);
        nuevaFoto = file;
    });

    btnEditar.addEventListener("click", async () => {
        const editando = btnEditar.textContent === "Guardar datos";
        btnMenu.style.display = "none";

        if (!editando) {
            [nombre, apellido, correo, nacimiento].forEach(i => i.disabled = false);
            btnEditar.textContent = "Guardar datos";
            btnCancelar.style.display = "inline-block";
        } else {
            const nuevosDatos = {
                nombre_usuario: nombre.value.trim(),
                apellido: apellido.value.trim(),
                correo: correo.value.trim(),
                fecha_nacimiento: nacimiento.value
            };

            if (nuevaFoto) {
                const nombreArchivo = `${Date.now()}_${nuevaFoto.name}`;
                const { data: fileData, error: uploadError } = await supabase.storage
                    .from("perfil")
                    .upload(`fotos/${nombreArchivo}`, nuevaFoto, { upsert: true });

                if (uploadError) {
                    alert("Error al subir la foto: " + uploadError.message);
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
                alert("❌ Error al guardar los cambios: " + error.message);
                return;
            }

            alert("✅ Datos actualizados correctamente.");

            [nombre, apellido, correo, nacimiento].forEach(i => i.disabled = true);
            btnEditar.textContent = "Editar datos";
            btnCancelar.style.display = "none";
            btnMenu.style.display = "inline-block";

            datosOriginales = { ...datosOriginales, ...nuevosDatos };
            nuevaFoto = null;
        }
    });

    btnCancelar.addEventListener("click", () => {
        nombre.value = datosOriginales.nombre_usuario || "";
        apellido.value = datosOriginales.apellido || "";
        correo.value = datosOriginales.correo || "";
        nacimiento.value = datosOriginales.fecha_nacimiento || "";
        foto.src = datosOriginales.foto || "/assets/icons/default_user.svg";

        [nombre, apellido, correo, nacimiento].forEach(i => i.disabled = true);
        btnEditar.textContent = "Editar datos";
        btnCancelar.style.display = "none";
        btnMenu.style.display = "inline-block";
        nuevaFoto = null;
    }); 
    btnMenu.addEventListener("click", () => {
        window.location.href = "./menuprincipal.html";
    });
});
