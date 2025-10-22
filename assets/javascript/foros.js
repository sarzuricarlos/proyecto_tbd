document.addEventListener("DOMContentLoaded", async () => {
    try {
        if (!verificarSupabase()) return;

        // Tu código específico de foros aquí...
        const { data, error } = await supabase
            .from('foro')
            .select('*')
            .order('fecha_creacion', { ascending: false });

        if (error) throw error;

        // Cargar foros...
        
    } catch (err) {
        console.error("Error en foros:", err.message);
        showMessage("Error al cargar los foros", "error");
    }
});