async function login() {
    const identificador = document.getElementById('name_user').value.trim();
    const contrasena = document.getElementById('contra_user').value.trim();
    
    if (!identificador || !contrasena) {
        showMessage('⚠️ Por favor ingresa usuario/correo y contraseña.', 'error', 'inicio');
        return;
    }

    try {
        // ✅ USAR EL PROCEDIMIENTO ÚNICO QUE ACEPTA AMBOS
        const { data, error } = await supabase.rpc('login_usuario', {
            p_identificador: identificador,
            p_contrasena: contrasena
        });

        if (error) {
            showMessage('❌ Error al iniciar sesión: ' + error.message, 'error', 'inicio');
            return;
        }

        if (data && data.length > 0) {
            const usuario = data[0];
            
            // ✅ VERIFICAR Y OBTENER EL ROL DEL USUARIO
            const rolInfo = await obtenerRolUsuario(usuario.id_usuario);
            const idRol = rolInfo.id_rol;
            const nombreRol = rolInfo.nombre_rol;
            
            const mensajeBienvenida = `✅ Bienvenido ${usuario.nombre_apellido || usuario.nombre_usuario} (${nombreRol})`;
            
            showMessage(mensajeBienvenida, 'success', 'inicio');
            
            // ✅ GUARDAR USUARIO COMPLETO CON ROL
            localStorage.setItem('user', JSON.stringify({
                ...usuario,
                id_rol: idRol,
                nombre_rol: nombreRol
            }));
            
            setTimeout(() => {
                redirectByRole(idRol);
            }, 1000);
            
        } else {
            showMessage('❌ Usuario/correo o contraseña incorrectos.', 'error', 'inicio');
        }

    } catch (err) {
        showMessage('❌ Error de conexión.', 'error', 'inicio');
    }
}

// ✅ FUNCIÓN PARA OBTENER ROL DEL USUARIO
async function obtenerRolUsuario(idUsuario) {
    try {
        const { data, error } = await supabase
            .from('asignacion_usuario_rol')
            .select(`
                id_rol,
                rol!inner(nombre_rol)
            `)
            .eq('id_usuario', idUsuario)
            .single();

        if (error) {
            console.warn('⚠️ Usuario sin rol asignado, usando rol por defecto (Estudiante)');
            return { id_rol: 1, nombre_rol: 'Estudiante' };
        }
        
        return {
            id_rol: data.id_rol,
            nombre_rol: data.rol.nombre_rol
        };
        
    } catch (err) {
        console.error('❌ Error al obtener rol:', err);
        return { id_rol: 1, nombre_rol: 'Estudiante' };
    }
}

// ✅ FUNCIÓN ESPECÍFICA PARA REDIRIGIR DESDE INDEX.HTML
function redirectByRole(idRol) {
    const routes = {
        1: 'assets/html/menuprincipal.html',        // Estudiante
        2: 'assets/html/menu_administrador.html',   // Administrador
        3: 'assets/html/menu_personal.html'         // Personal (Profesor)
    };
    
    const route = routes[idRol] || routes[1];
    console.log(`🎯 Redirigiendo usuario con rol ${idRol} a: ${route}`);
    window.location.href = route;
}

async function register() {
    const nombre_usuario = document.getElementById('reg_nombre').value.trim();
    const nombre_apellido = document.getElementById('reg_apellido').value.trim();
    const correo = document.getElementById('reg_correo').value.trim();
    const contrasena = document.getElementById('reg_contrasena').value.trim();
    const nacimiento = document.getElementById('reg_nacimiento').value;
    const foto = document.getElementById('foto_perfil').files[0];

    if (!nombre_usuario || !nombre_apellido || !correo || !contrasena || !nacimiento || !foto) {
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
            p_nombre_apellido: nombre_apellido,
            p_correo: correo,
            p_contrasena: contrasena,
            p_fecha_nacimiento: nacimiento,
            p_foto_url: urlData.publicUrl
        });

        if (error) {
            showMessage('❌ Error técnico: ' + error.message, 'error', 'registro');
        } else if (data.success) {
            showMessage('✅ ' + data.message, 'success', 'registro');
            
            // ✅ OBTENER EL ROL DESPUÉS DEL REGISTRO
            const rolInfo = await obtenerRolUsuario(data.user_id);
            
            // ✅ GUARDAR USUARIO CON SU ROL REAL
            localStorage.setItem('user', JSON.stringify({
                id_usuario: data.user_id,
                nombre_usuario: nombre_usuario,
                nombre_apellido: nombre_apellido,
                correo: correo,
                id_rol: rolInfo.id_rol,
                nombre_rol: rolInfo.nombre_rol
            }));
            
            showLogin();
        } else {
            showMessage('❌ ' + data.message, 'error', 'registro');
        }

    } catch (err) {
        showMessage('❌ Error inesperado', 'error', 'registro');
    }
}