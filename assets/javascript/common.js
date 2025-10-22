/**
 * Verifica si hay un usuario autenticado y obtiene su rol
 * @returns {Object|null} Datos del usuario con rol o null si no está autenticado
 */
async function verificarAutenticacion() {
    try {
        const userData = localStorage.getItem("user");
        
        if (!userData) {
            console.warn("⚠️ No hay usuario en localStorage");
            redirigirALogin();
            return null;
        }

        const user = JSON.parse(userData);
        
        if (!user.id_usuario) {
            console.error("❌ Usuario sin ID:", user);
            redirigirALogin();
            return null;
        }

        // ✅ OBTENER EL ROL DESDE LA BASE DE DATOS SI NO ESTÁ EN localStorage
        if (!user.id_rol) {
            console.log("🔄 Obteniendo rol desde la base de datos...");
            const rol = await obtenerRolDesdeBD(user.id_usuario);
            if (rol) {
                user.id_rol = rol.id_rol;
                user.nombre_rol = rol.nombre_rol;
                // ✅ ACTUALIZAR localStorage con el rol
                localStorage.setItem("user", JSON.stringify(user));
            } else {
                user.id_rol = 1; // Default: Estudiante
                user.nombre_rol = 'Estudiante';
            }
        }

        console.log("✅ Usuario autenticado:", user.nombre_usuario, "Rol:", user.id_rol, user.nombre_rol);
        return user;

    } catch (error) {
        console.error("💥 Error verificando autenticación:", error);
        redirigirALogin();
        return null;
    }
}

/**
 * Obtiene el rol del usuario desde la base de datos
 * @param {number} idUsuario - ID del usuario
 * @returns {Object|null} Datos del rol
 */
async function obtenerRolDesdeBD(idUsuario) {
    try {
        if (!verificarSupabase()) return null;

        const { data, error } = await supabase
            .from('asignacion_usuario_rol')
            .select(`
                id_rol,
                rol!inner(nombre_rol)
            `)
            .eq('id_usuario', idUsuario)
            .single();

        if (error) {
            console.warn("⚠️ Usuario sin rol asignado, usando default");
            return null;
        }

        console.log("🎯 Rol obtenido de BD:", data);
        return {
            id_rol: data.id_rol,
            nombre_rol: data.rol.nombre_rol
        };

    } catch (error) {
        console.error("❌ Error obteniendo rol:", error);
        return null;
    }
}

/**
 * Redirige al login
 */
function redirigirALogin() {
    alert("🔐 Sesión expirada o no válida. Redirigiendo al login...");
    window.location.href = "../../index.html";
}

/**
 * Redirige según el rol del usuario
 * @param {number} idRol - ID del rol del usuario
 */
function redirectByRole(idRol) {
    const routes = {
        1: '../html/menuprincipal.html',           // Estudiante
        2: '../html/menu_administrador.html',      // Administrador  
        3: '../html/menu_personal.html'            // Personal (Profesor)
    };
    const route = routes[idRol];
    if (!route) {
        console.error("❌ Rol no reconocido:", idRol, "Redirigiendo a Estudiante");
        window.location.href = routes[1];
        return;
    }
    console.log("🔄 Redirigiendo usuario rol", idRol, "a:", route);
    window.location.href = route;
}


/**
 * Configura el botón "Volver al menú" automáticamente
 */
async function configurarBotonVolver() {
    const btnMenu = document.getElementById("volver_menu");
    
    if (!btnMenu) {
        console.log("ℹ️ No se encontró botón 'volver_menu' en esta página");
        return;
    }

    const user = await verificarAutenticacion(); // ✅ Ahora es async
    if (user) {
        btnMenu.addEventListener("click", () => {
            redirectByRole(user.id_rol);
        });
        console.log("✅ Botón 'Volver' configurado para rol:", user.id_rol, user.nombre_rol);
    }
}

/**
 * Muestra mensajes de forma consistente
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'warning'
 * @param {string} containerId - ID del contenedor (opcional)
 */
function showMessage(message, type = 'info', containerId = null) {
    const styles = {
        success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
        error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
        warning: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
        info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
    };

    const style = styles[type] || styles.info;
    
    let messageDiv;
    if (containerId) {
        messageDiv = document.getElementById(containerId);
    } else {
        messageDiv = document.createElement('div');
        document.body.appendChild(messageDiv);
    }

    messageDiv.innerHTML = message;
    messageDiv.style.cssText = `
        display: block;
        padding: 12px;
        margin: 10px 0;
        border-radius: 5px;
        background-color: ${style.bg};
        color: ${style.color};
        border: 1px solid ${style.border};
        font-weight: 500;
    `;

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

/**
 * Verifica la conexión con Supabase
 * @returns {boolean} True si Supabase está inicializado
 */
function verificarSupabase() {
    if (!window.supabase) {
        console.error("❌ Supabase no está inicializado");
        showMessage("Error de conexión con la base de datos", "error");
        return false;
    }
    return true;
}

// ================================================
// 🎯 INICIALIZACIÓN AUTOMÁTICA
// ================================================

// Configurar automáticamente el botón volver cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Common.js cargado - Configurando página...");
    configurarBotonVolver();
});