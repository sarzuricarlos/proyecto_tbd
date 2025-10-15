document.addEventListener("DOMContentLoaded", async () => {
    const tablaCuerpo = document.getElementById("cuerpo_tabla_ranking");
    const botonMenu = document.getElementById("volver_menu");

    if (!supabase) {
        console.error("Supabase no está inicializado.");
        return;
    }

    try {
        const { data, error } = await supabase.rpc('sp_ranking_mejores_notas');

        if (error) throw error;

        tablaCuerpo.innerHTML = "";

        if (data.length === 0) {
            const fila = document.createElement("tr");
            fila.innerHTML = `<td colspan="3">No hay evaluaciones en el ranking.</td>`;
            tablaCuerpo.appendChild(fila);
            return;
        }

        data.forEach((usuario, index) => {
            const fila = document.createElement("tr");

            let clasePosicion = "";
            if (index === 0) clasePosicion = "oro";
            else if (index === 1) clasePosicion = "plata";
            else if (index === 2) clasePosicion = "bronce";

            fila.classList.add(clasePosicion);

            fila.innerHTML = `
                <td>${index + 1}</td>
                <td>${usuario.nombre_usuario} ${usuario.apellido}</td>
                <td>${usuario.notas}</td>
            `;

            tablaCuerpo.appendChild(fila);
        });

    } catch (err) {
        console.error("Error al obtener el ranking:", err.message);
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="3">Error al cargar el ranking.</td>`;
        tablaCuerpo.appendChild(fila);
    }

    botonMenu.addEventListener("click", () => {
    console.log("✅ Botón clickeado - Intentando redireccionar...");
    console.log("📍 Ruta destino:", "/menu_principal.html");
    
    window.location.href = "/menu_principal.html";
    });
});