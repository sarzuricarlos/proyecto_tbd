document.addEventListener("DOMContentLoaded", async () => {
    // ✅ VERIFICACIONES AUTOMÁTICAS con common.js
    if (!verificarSupabase()) return;
    await verificarAutenticacion(); // Solo verifica, no necesita el user aquí
    
    // ✅ EL RESTO DEL CÓDIGO ESPECÍFICO DE EVENTOS IRÍA AQUÍ
    // Por ejemplo:
    // - Cargar eventos desde la base de datos
    // - Mostrar eventos en una tabla
    // - Permitir inscripción a eventos
    // - etc.
    
    console.log("✅ Página de eventos cargada correctamente");
    
    // ✅ EL BOTÓN "VOLVER_MENU" SE CONFIGURA AUTOMÁTICAMENTE EN COMMON.JS
    // ✅ NO necesitas configurarlo manualmente
});