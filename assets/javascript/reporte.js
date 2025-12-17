// ===============================
// VARIABLES GLOBALES
// ===============================
let statsContainer;
let reportTitle;
let loading;
let reportContent;

// ===============================
// INICIALIZACION
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    statsContainer = document.getElementById("statsContainer");
    reportTitle = document.getElementById("reportTitle");
    loading = document.getElementById("loading");
    reportContent = document.getElementById("reportContent");

    const btnRecompensaReport = document.getElementById("recompensa_report");
    const btnCursoReport = document.getElementById("curso_report");

    if (btnRecompensaReport) {
        btnRecompensaReport.addEventListener("click", reportePuntosYRecompensas);
    }

    if (btnCursoReport) {
        btnCursoReport.addEventListener("click", reporteCursosCertificaciones);
    }
});


// ===============================
// REPORTE DE PUNTOS Y RECOMPENSAS
// ===============================
async function reportePuntosYRecompensas() {
    reportTitle.textContent = "Reporte de Puntos y Recompensas";
    statsContainer.innerHTML = "";

    reportContent.style.display = "block";
    loading.style.display = "flex";

    try {
        const totalPuntos = await totalPuntosAcumulados();
        const totalCanjeados = await totalPuntosCanjeados();
        const recompensas = await recompensasMasCanjeadas();

        mostrarTotalesPuntos(totalPuntos, totalCanjeados);
        mostrarRecompensas(recompensas);

    } catch (error) {
        console.error("Error reporte puntos:", error);
        alert("Error al generar reporte de puntos");
    } finally {
        loading.style.display = "none";
    }
}


// ===============================
// REPORTE DE CURSOS Y CERTIFICACIONES
// ===============================
async function reporteCursosCertificaciones() {
    reportTitle.textContent = "Reporte de Cursos y Certificaciones";
    statsContainer.innerHTML = "";

    reportContent.style.display = "block";
    loading.style.display = "flex";

    try {
        const cursosInscritos = await cursosMasInscritos();
        const cupos = await cuposCursos();

        mostrarCursosMasInscritos(cursosInscritos);
        mostrarCuposCursos(cupos);

    } catch (error) {
        console.error("Error reporte cursos:", error);
        alert("Error al generar reporte de cursos");
    } finally {
        loading.style.display = "none";
    }
}


// ===============================
// CONSULTAS SUPABASE
// ===============================
async function totalPuntosAcumulados() {
    const { data, error } = await supabase
        .from("puntos")
        .select("saldo_puntos");

    if (error) throw error;

    return data.reduce((sum, p) => sum + (p.saldo_puntos || 0), 0);
}

async function totalPuntosCanjeados() {
    const { data, error } = await supabase
        .from("movimientos_puntos")
        .select("puntos_gastados");

    if (error) throw error;

    return data.reduce((sum, m) => sum + (m.puntos_gastados || 0), 0);
}

async function recompensasMasCanjeadas() {
    const { data, error } = await supabase
        .from("movimientos_puntos")
        .select(`
            id_recompensa,
            recompensa ( nombre_recompensa )
        `);

    if (error) throw error;

    const conteo = {};
    data.forEach(r => {
        const nombre = r.recompensa?.nombre_recompensa || "Desconocida";
        conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    return conteo;
}

async function cursosMasInscritos() {
    const { data, error } = await supabase
        .from("inscripcion")
        .select(`
            id_curso,
            curso ( titulo_curso )
        `);

    if (error) throw error;

    const conteo = {};
    data.forEach(i => {
        const nombre = i.curso?.titulo_curso || "Sin nombre";
        conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    return conteo;
}

async function cuposCursos() {
    const { data: cursos, error } = await supabase
        .from("curso")
        .select("id_curso, titulo_curso, cupos");

    if (error) throw error;

    const { data: inscripciones } = await supabase
        .from("inscripcion")
        .select("id_curso");

    const usados = {};
    inscripciones.forEach(i => {
        usados[i.id_curso] = (usados[i.id_curso] || 0) + 1;
    });

    return cursos.map(c => ({
        curso: c.titulo_curso,
        cupos_totales: c.cupos,
        cupos_usados: usados[c.id_curso] || 0,
        cupos_disponibles: c.cupos - (usados[c.id_curso] || 0)
    }));
}


// ===============================
// MOSTRAR DATOS
// ===============================
function mostrarTotalesPuntos(acumulados, canjeados) {
    statsContainer.innerHTML += `
        <div class="stat-card">
            <h4>Total puntos acumulados</h4>
            <p>${acumulados}</p>
        </div>
        <div class="stat-card">
            <h4>Total puntos canjeados</h4>
            <p>${canjeados}</p>
        </div>
    `;
}

function mostrarRecompensas(recompensas) {
    let html = `<h3>Recompensas más canjeadas</h3><ul>`;
    for (const r in recompensas) {
        html += `<li>${r}: ${recompensas[r]} canjes</li>`;
    }
    html += `</ul>`;
    statsContainer.innerHTML += html;
}

function mostrarCursosMasInscritos(cursos) {
    let html = `<h3>Cursos más inscritos</h3><ul>`;
    for (const c in cursos) {
        html += `<li>${c}: ${cursos[c]} inscritos</li>`;
    }
    html += `</ul>`;
    statsContainer.innerHTML += html;
}

function mostrarCuposCursos(cupos) {
    let html = `<h3>Cupos por curso</h3><ul>`;
    cupos.forEach(c => {
        html += `
            <li>
                <strong>${c.curso}</strong><br>
                Totales: ${c.cupos_totales} |
                Usados: ${c.cupos_usados} |
                Disponibles: ${c.cupos_disponibles}
            </li><br>
        `;
    });
    html += `</ul>`;
    statsContainer.innerHTML += html;
}
