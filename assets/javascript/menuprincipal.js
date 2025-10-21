document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('user');
    const nombreUsuario = document.getElementById('nombre_usuario');
    if (userData) {
        
        try {
            const usuario = JSON.parse(userData);
            nombreUsuario.textContent = usuario.nombre_usuario
                ? usuario.nombre_usuario
                : "Usuario";
            localStorage.setItem('user', JSON.stringify({
                id_usuario: usuario.id_usuario,
                nombre_usuario: usuario.nombre_usuario
            }));
        } catch (err) {
            console.error("Error al leer el usuario:", err);
            nombreUsuario.textContent = "Usuario";
        }
    } else {
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