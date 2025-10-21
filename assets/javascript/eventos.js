document.addEventListener("DOMContentLoaded", async () => {
    try {
        const btnMenu = document.getElementById("volver_menu");

        if (!supabase) {
            console.error("Supabase no está inicializado.");
            return;
        }
        btnMenu.addEventListener("click", () => {
            window.location.href = "./menuprincipal.html";
        });

    } catch (err) {
        console.error("Error en el ranking:", err.message);
        const tablaCuerpo = document.getElementById("cuerpo_tabla_ranking");
        if (tablaCuerpo) {
            const fila = document.createElement("tr");
            fila.innerHTML = `<td colspan="3">Error al cargar el ranking.</td>`;
            tablaCuerpo.appendChild(fila);
        }
    }
});