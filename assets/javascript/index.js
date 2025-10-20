function showRegister() {
    const loginBox = document.getElementById('caja_inicio');
    const registerBox = document.getElementById('caja_registro');

    loginBox.classList.add('fade-slide-out');

    setTimeout(() => {
        loginBox.style.display = 'none';
        loginBox.classList.remove('fade-slide-out');

        registerBox.style.display = 'flex';
        registerBox.classList.add('fade-slide-in');

        setTimeout(() => {
            registerBox.classList.remove('fade-slide-in');
        }, 500);
    }, 0);
    
    document.getElementById('caja_inicio').style.display = 'none';
    document.getElementById('caja_registro').style.display = 'block';
}

function showLogin() {
    const loginBox = document.getElementById('caja_inicio');
    const registerBox = document.getElementById('caja_registro');

    registerBox.classList.add('fade-slide-out');

    setTimeout(() => {
        registerBox.style.display = 'none';
        registerBox.classList.remove('fade-slide-out');

        loginBox.style.display = 'flex';
        loginBox.classList.add('fade-slide-in');

        setTimeout(() => {
            loginBox.classList.remove('fade-slide-in');
        }, 500);
    }, 0);

    document.getElementById('caja_inicio').style.display = 'block';
    document.getElementById('caja_registro').style.display = 'none';
}

function showMessage(message, type, tipoFormulario) {
    const messageDiv = document.getElementById(`mensaje_${tipoFormulario}`);
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
    messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
    messageDiv.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
    const toggles = document.querySelectorAll(".toggle-password");

    toggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            const targetId = toggle.getAttribute("data-target");
            const input = document.getElementById(targetId);

            if (input.type === "password") {
                input.type = "text";
                toggle.src = "assets/icons/eye_contra_abierto.svg";
            } else {
                input.type = "password";
                toggle.src = "assets/icons/eye_contra_cerrado.svg";
            }
        });
    });
});
