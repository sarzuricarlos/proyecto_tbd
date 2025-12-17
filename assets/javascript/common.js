// ==========================================================
// 🔐 SISTEMA GLOBAL DE ROLES Y PERMISOS - ACTUALIZADO
// ==========================================================

// Mapa de nombres de permisos a identificadores consistentes
const MAPA_PERMISOS = {
    "Ver Cursos": "ver_cursos",
    "Crear/Editar Cursos": "crear_editar_cursos", 
    "Gestionar Estudiantes": "gestionar_estudiantes",
    "Gestionar Usuarios": "gestionar_usuarios",
    "Ver Reportes": "ver_reportes",
    "Ver Ranking": "ver_ranking",
    "Moderar Foros": "moderar_foros",
    "Asignar Notas": "asignar_notas",
    "Gestionar Aulas": "gestionar_aulas",
    "Configurar Sistema": "configurar_sistema",
    "Ver Dashboard": "ver_dashboard",
    "Gestionar Eventos": "gestionar_eventos",
    "Ver Datos Personales": "ver_datos_personales",
    "Ver Datos Usuarios": "ver_datos_usuarios",
    "Ver Recompensas": "ver_recompensas",
    "Inscribir Estudiantes": "inscribir_estudiantes",
    "Eliminar Cursos": "eliminar_cursos",
    "Gestionar Pagos": "gestionar_pagos",
    "Asignar Roles": "asignar_roles",
    "Super Admin": "super_admin",
    "Ver Menu Principal": "ver_menu_principal",
    "Ver Foros": "ver_foros"
};

// Permisos por rol (basados en tus datos de rol_permiso)
const PERMISOS_ESTUDIANTE = [
    "Ver Dashboard",           // id_permiso: 11
    "Ver Menu Principal",      // id_permiso: 21  
    "Ver Reportes",           // id_permiso: 5
    "Ver Foros"
];

const PERMISOS_ADMINISTRADOR = [
    "Ver Cursos",              // id_permiso: 1
    "Crear/Editar Cursos",     // id_permiso: 2
    "Eliminar Cursos",         // id_permiso: 3 (pero en tu tabla es Gestionar Estudiantes)
    "Gestionar Usuarios",      // id_permiso: 4
    "Ver Reportes",            // id_permiso: 5
    "Gestionar Pagos",         // id_permiso: 6
    "Moderar Foros",           // id_permiso: 7
    "Asignar Roles",           // id_permiso: 8 (pero en tu tabla es Asignar Notas)
    "Gestionar Aulas",         // id_permiso: 9
    "Configurar Sistema",      // id_permiso: 10
    "Ver Dashboard",           // id_permiso: 11
    "Gestionar Eventos",       // id_permiso: 12
    "Ver Datos Personales",    // id_permiso: 13
    "Ver Datos Usuarios",      // id_permiso: 14
    "Ver Recompensas",         // id_permiso: 15
    "Inscribir Estudiantes",   // id_permiso: 16
    "Gestionar Estudiantes",   // id_permiso: 3 (ajustado)
    "Asignar Notas",           // id_permiso: 8
    "Super Admin",             // id_permiso: 20
    "Ver Menu Principal",      // id_permiso: 21
    "Ver Foros"
];

const PERMISOS_PERSONAL = [
    "Ver Cursos",              // id_permiso: 1
    "Crear/Editar Cursos",     // id_permiso: 2  
    "Gestionar Usuarios",      // id_permiso: 4
    "Moderar Foros",           // id_permiso: 7
    "Gestionar Aulas",         // id_permiso: 9
    "Gestionar Eventos",       // id_permiso: 12
    "Ver Datos Personales",    // id_permiso: 13
    "Ver Menu Principal",       // id_permiso: 21
    "Asignar Notas",
    "Ver Foros"
];

// Mapa de páginas permitidas por rol
const PAGINAS_PERMITIDAS_POR_ROL = {
    1: ["menuprincipal.html", "datos-personales.html", "eventos.html", "cursos.html", "foros.html", "ranking.html", "recompensas.html"],
    2: ["menu_administrador.html", "configuracion_admin.html", "datos-personales.html", "datos_usuarios.html", "cursos.html", "foros.html", "reportes.html", "aula_reservar.html"],
    3: ["menu_personal.html", "datos-personales.html", "eventos.html", "cursos.html", "notas.html", "aula_reservar.html", "foros.html"]
};

// Mapa de páginas a permisos requeridos (usando nombres reales de permisos)
const PERMISOS_POR_PAGINA = {
    // Páginas de Estudiante
    "menuprincipal.html": ["Ver Menu Principal"],
    "datos-personales.html": ["Ver Datos Personales"],
    "eventos.html": ["Gestionar Eventos"],
    "cursos.html": ["Ver Cursos"],
    "foros.html": ["Ver Foros"],
    "ranking.html": ["Ver Ranking"],
    "recompensas.html": ["Ver Recompensas"],
    
    // Páginas de Administrador
    "menu_administrador.html": ["Ver Menu Principal"],
    "configuracion_admin.html": ["Configurar Sistema"],
    "datos_usuarios.html": ["Ver Datos Usuarios"],
    "reportes.html": ["Ver Reportes"],
    
    // Páginas de Personal/Profesor
    "menu_personal.html": ["Ver Menu Principal"],
    "notas.html": ["Asignar Notas"],
    "aula_reservar.html": ["Gestionar Aulas"]
};

// ==========================================================
// 🔐 FUNCIONES PRINCIPALES DE PERMISOS
// ==========================================================

window.USER_PERMISSIONS = JSON.parse(localStorage.getItem("permisos") || "[]");

function tienePermiso(permiso) {
    // Convertir a identificador consistente si es necesario
    const permisoKey = MAPA_PERMISOS[permiso] || permiso;
    return window.USER_PERMISSIONS.includes(permisoKey);
}

window.hasPermission = function (permiso) {
    return tienePermiso(permiso);
};

window.requirePermission = function (...permisosNecesarios) {
    const permitido = permisosNecesarios.some(p => tienePermiso(p));

    if (!permitido) {
        alert("No tienes permisos para acceder a esta sección.");
        window.location.href = "/assets/html/menuprincipal.html";
    }
};

window.aplicarPermisosUI = function () {
    document.querySelectorAll("[data-permiso]").forEach(el => {
        const permiso = el.getAttribute("data-permiso");
        const permisoKey = MAPA_PERMISOS[permiso] || permiso;
        
        if (!tienePermiso(permisoKey)) {
            el.style.display = "none";
        }
    });
};

function obtenerPermisosPorRol(idRol) {
    switch (idRol) {
        case 1: return PERMISOS_ESTUDIANTE.map(p => MAPA_PERMISOS[p] || p);
        case 2: return PERMISOS_ADMINISTRADOR.map(p => MAPA_PERMISOS[p] || p);
        case 3: return PERMISOS_PERSONAL.map(p => MAPA_PERMISOS[p] || p);
        default: return [];
    }
}

// ==========================================================
// 🔐 VERIFICACIÓN DE PERMISOS EN BASE DE DATOS
// ==========================================================

async function obtenerPermisosActivosDesdeBD(idRol) {
    try {
        if (!verificarSupabase()) return [];

        console.log(`🔍 Obteniendo permisos para rol ${idRol} desde BD...`);
        
        const { data, error } = await supabase
            .from("rol_permiso")
            .select(`
                permiso!inner(id_permiso, nombre_permiso, estado_permiso)
            `)
            .eq("id_rol", idRol)
            .eq("permiso.estado_permiso", true);

        if (error) {
            console.error("❌ Error obteniendo permisos desde BD:", error);
            return [];
        }

        // Convertir nombres de permisos a identificadores consistentes
        const permisosActivos = data
            .map(item => item.permiso.nombre_permiso)
            .map(nombre => MAPA_PERMISOS[nombre] || nombre.toLowerCase().replace(/ /g, '_'));
        
        console.log(`✅ Permisos obtenidos para rol ${idRol}:`, permisosActivos);
        return permisosActivos;

    } catch (error) {
        console.error("💥 Error obteniendo permisos activos desde BD:", error);
        return [];
    }
}

/**
 * Verifica si el rol tiene un permiso específico en BD
 */
async function verificarPermisoEnBD(idRol, permisoNombre) {
    try {
        if (!verificarSupabase()) return false;

        console.log(`🔍 Verificando permiso: rol=${idRol}, permiso=${permisoNombre}`);
        
        const { data, error } = await supabase
            .from("rol_permiso")
            .select(`
                permiso!inner(id_permiso, nombre_permiso, estado_permiso)
            `)
            .eq("id_rol", idRol)
            .eq("permiso.nombre_permiso", permisoNombre)
            .eq("permiso.estado_permiso", true)
            .single();

        if (error) {
            console.warn(`⚠️ Permiso no encontrado o inactivo: ${permisoNombre} para rol ${idRol}`);
            return false;
        }

        console.log(`✅ Permiso verificado: ${permisoNombre} para rol ${idRol}`);
        return true;

    } catch (error) {
        console.error(`💥 Error verificando permiso en BD:`, error);
        return false;
    }
}

async function obtenerPermisosSegurosDesdeBD(idRol) {
    try {
        const permisosBD = await obtenerPermisosActivosDesdeBD(idRol);
        
        if (permisosBD && permisosBD.length > 0) {
            return permisosBD;
        } else {
            console.log("⚠️ Usando permisos por defecto (respuesta vacía de BD)");
            return obtenerPermisosPorRol(idRol);
        }
    } catch (error) {
        console.error("💥 Error obteniendo permisos seguros:", error);
        return obtenerPermisosPorRol(idRol);
    }
}

// ==========================================================
// 🔐 AUTENTICACIÓN Y CARGA DE PERMISOS
// ==========================================================

async function verificarAutenticacion() {
    try {
        const userData = localStorage.getItem("user");

        if (!userData) {
            console.warn("⚠️ No hay usuario en localStorage");
            return null;
        }

        const user = JSON.parse(userData);

        if (!user.id_usuario) {
            console.error("❌ Usuario sin ID:", user);
            redirigirALogin();
            return null;
        }

        // Obtener rol si no está en localStorage
        if (!user.id_rol) {
            console.log("🔄 Obteniendo rol desde la base de datos...");
            const rol = await obtenerRolDesdeBD(user.id_usuario);
            if (rol) {
                user.id_rol = rol.id_rol;
                user.nombre_rol = rol.nombre_rol;
                localStorage.setItem("user", JSON.stringify(user));
            } else {
                user.id_rol = 1;
                user.nombre_rol = 'Estudiante';
            }
        }

        // Obtener permisos activos desde BD
        console.log("🔄 Obteniendo permisos activos desde BD...");
        const permisosActivos = await obtenerPermisosSegurosDesdeBD(user.id_rol);
        
        // Guardar en localStorage y variable global
        localStorage.setItem("permisos", JSON.stringify(permisosActivos));
        localStorage.setItem("id_rol", user.id_rol.toString());
        window.USER_PERMISSIONS = permisosActivos;
        
        console.log("🔑 Usuario autenticado:", user.nombre_usuario, "Rol:", user.nombre_rol);
        console.log("📋 Permisos asignados:", permisosActivos);
        
        return user;

    } catch (error) {
        console.error("💥 Error verificando autenticación:", error);
        redirigirALogin();
        return null;
    }
}

async function obtenerRolDesdeBD(idUsuario) {
    try {
        if (!verificarSupabase()) return null;

        const { data, error } = await supabase
            .from("asignacion_usuario_rol")
            .select(`id_rol, rol!inner(nombre_rol)`)
            .eq("id_usuario", idUsuario)
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

// ==========================================================
// 🔐 VALIDACIÓN DE ACCESO
// ==========================================================

async function validarAccesoPorRol() {
    const idRol = parseInt(localStorage.getItem("id_rol"));
    if (!idRol) {
        console.warn("⚠️ Usuario no autenticado");
        redirigirALogin();
        return;
    }

    const paginaActual = window.location.pathname.split("/").pop();
    console.log(`🔍 Validando acceso a: ${paginaActual} para rol: ${idRol}`);

    // 1. Verificar si la página está en la lista permitida para el rol
    const paginasPermitidas = PAGINAS_PERMITIDAS_POR_ROL[idRol] || [];
    
    if (!paginasPermitidas.includes(paginaActual)) {
        console.error(`❌ Página no permitida para rol ${idRol}: ${paginaActual}`);
        alert("❌ No tienes permiso para acceder a esta página.");
        redirectByRole(idRol);
        return;
    }

    // 2. Verificar permisos específicos requeridos para la página
    const permisosRequeridos = PERMISOS_POR_PAGINA[paginaActual];
    
    if (permisosRequeridos && permisosRequeridos.length > 0) {
        console.log(`🔍 Permisos requeridos para ${paginaActual}:`, permisosRequeridos);
        
        let tieneTodosPermisos = true;
        
        // Verificar cada permiso requerido
        for (const permisoNombre of permisosRequeridos) {
            const permisoKey = MAPA_PERMISOS[permisoNombre] || permisoNombre;
            
            if (!tienePermiso(permisoKey)) {
                console.warn(`❌ Permiso requerido no activo: ${permisoNombre}`);
                tieneTodosPermisos = false;
                break;
            }
        }

        
        if (!tieneTodosPermisos) {
            alert("❌ No cuentas con los permisos necesarios para acceder a esta página.");
            redirectByRole(idRol);
            return;
        }
    }

    console.log(`✅ Acceso permitido a ${paginaActual} para rol ${idRol}`);
}

// ==========================================================
// 🔄 FUNCIONES DE NAVEGACIÓN
// ==========================================================

function redirigirALogin() {
    alert("🔐 Sesión expirada o no válida. Redirigiendo al login...");
    window.location.href = "../../index.html";
}

function redirectByRole(idRol) {
    const routes = {
        1: "../html/menuprincipal.html",           // Estudiante
        2: "../html/menu_administrador.html",      // Administrador  
        3: "../html/menu_personal.html"            // Personal (Profesor)
    };
    
    const route = routes[idRol] || routes[1];
    window.location.href = route;
}

async function configurarBotonVolver() {
    const btnMenu = document.getElementById("volver_menu");

    if (!btnMenu) {
        console.log("ℹ️ No se encontró botón 'volver_menu' en esta página");
        return;
    }

    const user = await verificarAutenticacion();
    if (user) {
        btnMenu.addEventListener("click", () => {
            redirectByRole(user.id_rol);
        });
        console.log("✅ Botón 'Volver' configurado para rol:", user.id_rol, user.nombre_rol);
    }
}

// ==========================================================
// 📣 SISTEMA DE NOTIFICACIONES DE EVENTOS
// ==========================================================

async function verificarEventosCercanos() {
    try {
        const user = await verificarAutenticacion();
        if (!user) return;

        const claveNotificacion = `ultimaNotificacionEventos_${user.id_usuario}`;
        const ultimaNotificacion = localStorage.getItem(claveNotificacion);
        const hoy = new Date().toDateString();

        if (ultimaNotificacion === hoy) {
            console.log(`🔔 Notificación ya mostrada hoy para usuario ${user.id_usuario}`);
            return;
        }

        console.log('🔍 Buscando eventos cercanos...');

        const { data: eventosUsuario, error } = await supabase
            .from("evento_usuario")
            .select(`evento!inner(id_evento, nombre_evento, fecha_evento, lugar, descripcion_evento)`)
            .eq("id_usuario", user.id_usuario);

        if (error) {
            console.error("❌ Error al obtener eventos del usuario:", error);
            return;
        }

        if (!eventosUsuario || eventosUsuario.length === 0) {
            console.log("📭 Usuario no participa en ningún evento");
            localStorage.setItem(claveNotificacion, hoy);
            return;
        }

        const hoyDate = new Date();
        const hoyNormalizado = new Date(hoyDate.getFullYear(), hoyDate.getMonth(), hoyDate.getDate());

        let eventosHoy = [];
        let eventosProximos = [];

        eventosUsuario.forEach(item => {
            const evento = item.evento;
            const [anio, mes, dia] = evento.fecha_evento.split("-");
            const fechaEvento = new Date(anio, mes - 1, dia);

            const diferenciaMs = fechaEvento - hoyNormalizado;
            const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

            console.log(`Evento: ${evento.nombre_evento}, Fecha: ${evento.fecha_evento}, Días faltantes: ${diferenciaDias}`);

            if (diferenciaDias >= 0) {
                if (diferenciaDias === 0) {
                    eventosHoy.push(evento);
                } else if (diferenciaDias <= 3) {
                    eventosProximos.push({ ...evento, diasFaltantes: diferenciaDias });
                }
            }
        });

        if (eventosHoy.length > 0) {
            mostrarNotificacionEventosHoy(eventosHoy);
            localStorage.setItem(claveNotificacion, hoy);
        } else if (eventosProximos.length > 0) {
            mostrarNotificacionEventosProximos(eventosProximos);
            localStorage.setItem(claveNotificacion, hoy);
        } else {
            console.log("📅 No hay eventos cercanos");
            localStorage.setItem(claveNotificacion, hoy);
        }

    } catch (error) {
        console.error("💥 Error en sistema de notificaciones:", error);
    }
}

function formatearFechaCommon(fechaString) {
    if (!fechaString) return '';

    try {
        const [anio, mes, dia] = fechaString.split("-");
        const fecha = new Date(anio, mes - 1, dia);

        return fecha.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    } catch (error) {
        return fechaString;
    }
}

function mostrarNotificacionEventosHoy(eventos) {
    let mensaje = "🎉 <strong>¡Eventos para hoy!</strong><br><br>";

    eventos.forEach((evento, index) => {
        mensaje += `• <strong>${evento.nombre_evento}</strong><br>`;
        mensaje += `  📍 ${evento.lugar}<br>`;
        if (evento.descripcion_evento) {
            mensaje += `  📝 ${evento.descripcion_evento}<br>`;
        }
        if (index < eventos.length - 1) mensaje += "<br>";
    });

    mensaje += "<br>¡No te lo pierdas!";

    showMessage(mensaje, "success");

    if (eventos.length === 1) {
        const fechaFormateada = formatearFechaCommon(eventos[0].fecha_evento);
        alert(`🎉 EVENTO HOY: ${eventos[0].nombre_evento}\n📅 ${fechaFormateada}\n📍 ${eventos[0].lugar}`);
    } else {
        alert(`🎉 TIENES ${eventos.length} EVENTOS PARA HOY\nRevisa la notificación en pantalla.`);
    }
}

function mostrarNotificacionEventosProximos(eventos) {
    let mensaje = "📅 <strong>Eventos próximos</strong><br><br>";

    eventos.forEach((evento, index) => {
        const diasTexto = evento.diasFaltantes === 1 ? "mañana" : `en ${evento.diasFaltantes} días`;
        const fechaFormateada = formatearFechaCommon(evento.fecha_evento);

        mensaje += `• <strong>${evento.nombre_evento}</strong><br>`;
        mensaje += `  📅 ${fechaFormateada} (${diasTexto})<br>`;
        mensaje += `  📍 ${evento.lugar}<br>`;
        if (evento.descripcion_evento) {
            mensaje += `  📝 ${evento.descripcion_evento}<br>`;
        }
        if (index < eventos.length - 1) mensaje += "<br>";
    });

    mensaje += "<br>¡Prepárate!";

    showMessage(mensaje, "info");
}

function limpiarHistorialNotificaciones() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith("ultimaNotificacionEventos_")) {
            localStorage.removeItem(key);
            console.log(`🧹 Notificación eliminada: ${key}`);
        }
    });
    console.log("🧹 Historial de notificaciones limpiado para todos los usuarios");
}

async function limpiarMisNotificaciones() {
    const user = await verificarAutenticacion();
    if (user) {
        const claveNotificacion = `ultimaNotificacionEventos_${user.id_usuario}`;
        localStorage.removeItem(claveNotificacion);
        console.log(`🧹 Notificaciones limpiadas para usuario ${user.id_usuario}`);
        alert("Notificaciones limpiadas. Verás notificaciones nuevamente al recargar.");
    }
}

// ==========================================================
// 📌 FUNCIONES DE UTILIDAD
// ==========================================================

function showMessage(message, type = "info", containerId = null) {
    const styles = {
        success: { bg: "#d4edda", color: "#155724", border: "#c3e6cb" },
        error: { bg: "#f8d7da", color: "#721c24", border: "#f5c6cb" },
        warning: { bg: "#fff3cd", color: "#856404", border: "#ffeaa7" },
        info: { bg: "#d1ecf1", color: "#0c5460", border: "#bee5eb" }
    };

    const style = styles[type] || styles.info;

    let messageDiv;
    if (containerId) {
        messageDiv = document.getElementById(containerId);
    } else {
        messageDiv = document.createElement("div");
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

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.opacity = "0";
            messageDiv.style.transition = "opacity 0.5s ease";
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 500);
        }
    }, 8000);
}

function verificarSupabase() {
    if (!window.supabase) {
        console.error("❌ Supabase no está inicializado");
        showMessage("Error de conexión con la base de datos", "error");
        return false;
    }
    return true;
}

// ==========================================================
// 🚀 INICIALIZACIÓN AUTOMÁTICA
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Common.js cargado - Configurando página...");
    
    const user = await verificarAutenticacion();
    
    if (user) {
        await validarAccesoPorRol();
        aplicarPermisosUI();
        await configurarBotonVolver();

        setTimeout(() => {
            verificarEventosCercanos();
        }, 1000);
    }
});