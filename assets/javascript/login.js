async function login() {
    const correo = document.getElementById('name_user').value.trim();
    const contrasena = document.getElementById('contra_user').value.trim();

    if (!correo || !contrasena) {
        showMessage('⚠️ Por favor ingresa correo y contraseña.', 'error', 'inicio');
        return;
    }

    try {
        const { data, error } = await supabase.rpc('login_usuario', {
            p_correo: correo,
            p_contrasena: contrasena
        });

        if (error) {
            showMessage('❌ Error al iniciar sesión.', 'error', 'inicio');
            return;
        }

        if (data && data.length > 0) {
            const usuario = data[0];
            showMessage('✅ Bienvenido ' + usuario.nombre_usuario, 'success', 'inicio');
            localStorage.setItem('user', JSON.stringify(usuario));
            setTimeout(() => {
                window.location.href = 'assets/html/menuprincipal.html';
            }, 1000);
        } else {
            showMessage('❌ Usuario o contraseña incorrectos.', 'error', 'inicio');
        }

    } catch (err) {
        showMessage('❌ Error de conexión.', 'error', 'inicio');
    }
}

async function register() {
    const nombre_usuario = document.getElementById('reg_nombre').value.trim();
    const apellido = document.getElementById('reg_apellido').value.trim();
    const correo = document.getElementById('reg_correo').value.trim();
    const contrasena = document.getElementById('reg_contrasena').value.trim();
    const nacimiento = document.getElementById('reg_nacimiento').value;
    const foto = document.getElementById('foto_perfil').files[0];

    if (!nombre_usuario || !apellido || !correo || !contrasena || !nacimiento || !foto) {
        showMessage('⚠️ Completa todos los campos.', 'error', 'registro');
        return;
    }

    try {
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('perfil')
            .upload(`fotos/${Date.now()}_${foto.name}`, foto);

        if (uploadError) {
            showMessage('❌ Error al subir la foto: ' + uploadError.message, 'error', 'registro');
            return;
        }

        const { data: urlData } = await supabase.storage
            .from('perfil')
            .getPublicUrl(uploadData.path);

        const { data, error } = await supabase.rpc('registrar_usuario', {
            p_nombre_usuario: nombre_usuario,
            p_apellido: apellido,
            p_correo: correo,
            p_contrasena: contrasena,
            p_fecha_nacimiento: nacimiento,
            p_foto_url: urlData.publicUrl
        });

        if (error) {
            showMessage('❌ Error técnico: ' + error.message, 'error', 'registro');
        } else if (data.success) {
            showMessage('✅ ' + data.message, 'success', 'registro');
                localStorage.setItem('user', JSON.stringify({
                    nombre_usuario,
                    apellido,
                    correo
                }));
            showLogin();
        } else {
            showMessage('❌ ' + data.message, 'error', 'registro');
        }

    } catch (err) {
        showMessage('❌ Error inesperado', 'error', 'registro');
    }
}
