document.addEventListener('DOMContentLoaded', () => {
    // Intentar obtener el usuario desde localStorage
    const userData = localStorage.getItem('user');
    const nombreUsuario = document.getElementById('nombre_usuario');

    if (userData) {
        try {
            const usuario = JSON.parse(userData);

            // Si tu procedimiento RPC devuelve algo como { nombre_usuario: 'Carlos' }
            nombreUsuario.textContent = usuario.nombre_usuario
                ? usuario.nombre_usuario
                : "Usuario";
        } catch (err) {
            console.error("Error al leer el usuario:", err);
            nombreUsuario.textContent = "Usuario";
        }
    } else {
        // Si no hay sesión, redirigir al index
        alert("⚠️ No hay sesión activa. Redirigiendo al inicio...");
        window.location.href = "../../index.html";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const botonCerrarSesion = document.getElementById('cerrar_sesion');

    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener('click', () => {
            const confirmar = confirm('¿Deseas cerrar sesión?');
            if (confirmar) {
                localStorage.removeItem('user');
                window.location.href = '../../index.html';
            }
        });
    }
});