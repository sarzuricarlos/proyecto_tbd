document.addEventListener("DOMContentLoaded", async () => {
    try {
        const tablaCuerpo = document.getElementById("cuerpo_tabla_ranking");
        const btnMenu = document.getElementById("volver_menu");

        if (!supabase) {
            console.error("Supabase no está inicializado.");
            return;
        }

        const { data, error } = await supabase.rpc('sp_ranking_mejores_notas');

        if (error) throw error;

        tablaCuerpo.innerHTML = "";

        if (data.length === 0) {
            const fila = document.createElement("tr");
            fila.innerHTML = `<td colspan="3">No hay evaluaciones en el ranking.</td>`;
            tablaCuerpo.appendChild(fila);
        } else {
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