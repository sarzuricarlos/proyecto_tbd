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
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;

    // Auto-ocultar después de 8 segundos (más tiempo para notificaciones importantes)
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 500);
        }
    }, 8000);
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
// 🎯 SISTEMA DE NOTIFICACIONES DE EVENTOS
// ================================================

// En common.js - actualizar la lógica de comparación de fechas
async function verificarEventosCercanos() {
    try {
        const user = await verificarAutenticacion();
        if (!user) return;

        // Verificar si ya se mostró la notificación hoy PARA ESTE USUARIO
        const claveNotificacion = `ultimaNotificacionEventos_${user.id_usuario}`;
        const ultimaNotificacion = localStorage.getItem(claveNotificacion);
        const hoy = new Date().toDateString();
        
        if (ultimaNotificacion === hoy) {
            console.log(`🔔 Notificación ya mostrada hoy para usuario ${user.id_usuario}`);
            return;
        }

        console.log('🔍 Buscando eventos cercanos...');

        // Obtener eventos en los que el usuario participa
        const { data: eventosUsuario, error } = await supabase
            .from('evento_usuario')
            .select(`
                evento!inner(
                    id_evento,
                    nombre_evento,
                    fecha_evento,
                    lugar,
                    descripcion_evento
                )
            `)
            .eq('id_usuario', user.id_usuario);

        if (error) {
            console.error('❌ Error al obtener eventos del usuario:', error);
            return;
        }

        if (!eventosUsuario || eventosUsuario.length === 0) {
            console.log('📭 Usuario no participa en ningún evento');
            return;
        }

        const hoyDate = new Date();
        // Normalizar a inicio del día en zona horaria local
        const hoyNormalizado = new Date(hoyDate.getFullYear(), hoyDate.getMonth(), hoyDate.getDate());

        let eventosHoy = [];
        let eventosProximos = [];

        eventosUsuario.forEach(item => {
            const evento = item.evento;
            
            // Parsear fecha del evento correctamente
            const [anio, mes, dia] = evento.fecha_evento.split('-');
            const fechaEvento = new Date(anio, mes - 1, dia);
            
            // Calcular diferencia en días
            const diferenciaMs = fechaEvento - hoyNormalizado;
            const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

            console.log(`Evento: ${evento.nombre_evento}, Fecha: ${evento.fecha_evento}, Días faltantes: ${diferenciaDias}`);

            // Solo eventos futuros o hoy
            if (diferenciaDias >= 0) {
                if (diferenciaDias === 0) {
                    eventosHoy.push(evento);
                } else if (diferenciaDias <= 3) {
                    eventosProximos.push({ ...evento, diasFaltantes: diferenciaDias });
                }
            }
        });

        // Mostrar notificaciones
        if (eventosHoy.length > 0) {
            mostrarNotificacionEventosHoy(eventosHoy);
            localStorage.setItem(claveNotificacion, hoy);
            console.log(`✅ Notificación guardada para usuario ${user.id_usuario}`);
        } else if (eventosProximos.length > 0) {
            mostrarNotificacionEventosProximos(eventosProximos);
            localStorage.setItem(claveNotificacion, hoy);
            console.log(`✅ Notificación guardada para usuario ${user.id_usuario}`);
        } else {
            console.log('📅 No hay eventos cercanos');
            // También guardamos que ya verificamos para este usuario hoy
            localStorage.setItem(claveNotificacion, hoy);
        }

    } catch (error) {
        console.error('💥 Error en sistema de notificaciones:', error);
    }
}

// Función auxiliar para formatear fechas en common.js
function formatearFechaCommon(fechaString) {
    if (!fechaString) return '';
    
    try {
        const [anio, mes, dia] = fechaString.split('-');
        const fecha = new Date(anio, mes - 1, dia);
        
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return fechaString;
    }
}

/**
 * Muestra notificación para eventos que son hoy
 * @param {Array} eventos - Lista de eventos para hoy
 */
function mostrarNotificacionEventosHoy(eventos) {
    let mensaje = '🎉 <strong>¡Eventos para hoy!</strong><br><br>';
    
    eventos.forEach((evento, index) => {
        mensaje += `• <strong>${evento.nombre_evento}</strong><br>`;
        mensaje += `  📍 ${evento.lugar}<br>`;
        if (evento.descripcion_evento) {
            mensaje += `  📝 ${evento.descripcion_evento}<br>`;
        }
        if (index < eventos.length - 1) mensaje += '<br>';
    });

    mensaje += '<br>¡No te lo pierdas!';

    showMessage(mensaje, 'success');
    
    // También mostrar alerta nativa para mayor visibilidad
    if (eventos.length === 1) {
        const fechaFormateada = formatearFechaCommon(eventos[0].fecha_evento);
        alert(`🎉 EVENTO HOY: ${eventos[0].nombre_evento}\n📅 ${fechaFormateada}\n📍 ${eventos[0].lugar}`);
    } else {
        alert(`🎉 TIENES ${eventos.length} EVENTOS PARA HOY\nRevisa la notificación en pantalla.`);
    }
}

/**
 * Muestra notificación para eventos próximos
 * @param {Array} eventos - Lista de eventos próximos
 */
function mostrarNotificacionEventosProximos(eventos) {
    let mensaje = '📅 <strong>Eventos próximos</strong><br><br>';
    
    eventos.forEach((evento, index) => {
        const diasTexto = evento.diasFaltantes === 1 ? 'mañana' : `en ${evento.diasFaltantes} días`;
        const fechaFormateada = formatearFechaCommon(evento.fecha_evento);
        
        mensaje += `• <strong>${evento.nombre_evento}</strong><br>`;
        mensaje += `  📅 ${fechaFormateada} (${diasTexto})<br>`;
        mensaje += `  📍 ${evento.lugar}<br>`;
        if (evento.descripcion_evento) {
            mensaje += `  📝 ${evento.descripcion_evento}<br>`;
        }
        if (index < eventos.length - 1) mensaje += '<br>';
    });

    mensaje += '<br>¡Prepárate!';

    showMessage(mensaje, 'info');
}

/**
 * Limpia el historial de notificaciones (útil para testing)
 */
function limpiarHistorialNotificaciones() {
    // Limpiar todas las notificaciones de todos los usuarios
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('ultimaNotificacionEventos_')) {
            localStorage.removeItem(key);
            console.log(`🧹 Notificación eliminada: ${key}`);
        }
    });
    console.log('🧹 Historial de notificaciones limpiado para todos los usuarios');
}

/**
 * Limpia el historial de notificaciones solo para el usuario actual
 */
async function limpiarMisNotificaciones() {
    const user = await verificarAutenticacion();
    if (user) {
        const claveNotificacion = `ultimaNotificacionEventos_${user.id_usuario}`;
        localStorage.removeItem(claveNotificacion);
        console.log(`🧹 Notificaciones limpiadas para usuario ${user.id_usuario}`);
        alert('Notificaciones limpiadas. Verás notificaciones nuevamente al recargar.');
    }
}

// ================================================
// 🎯 INICIALIZACIÓN AUTOMÁTICA
// ================================================

// Configurar automáticamente cuando se carga la página
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Common.js cargado - Configurando página...");
    
    // Configurar botón volver
    await configurarBotonVolver();
    
    // Verificar eventos cercanos (con pequeño delay para que cargue la página primero)
    setTimeout(() => {
        verificarEventosCercanos();
    }, 1000);
});