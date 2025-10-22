// foros.js - Versión corregida con el nombre correcto de la tabla

document.addEventListener('DOMContentLoaded', function() {
    const cuerpoTabla = document.getElementById('cuerpo_tabla_eventos');
    const botonVolver = document.getElementById('volver_menu');
    
    async function cargarForos() {
        try {
            console.log('Cargando foros desde la tabla "foro"...');
            
            if (typeof supabase === 'undefined') {
                mostrarMensajeError('Error: Supabase no está configurado');
                return;
            }

            // Consulta con el nombre correcto de la tabla: "foro"
            const { data: foros, error } = await supabase
                .from('foro')  // ← TABLA CORRECTA
                .select('*')
                .order('id_foro', { ascending: true });

            if (error) {
                console.error('Error al cargar foros:', error);
                mostrarMensajeError('Error: ' + error.message);
                return;
            }

            console.log('Foros cargados correctamente:', foros);
            mostrarForos(foros);

        } catch (error) {
            console.error('Error inesperado:', error);
            mostrarMensajeError('Error de conexión');
        }
    }

    function mostrarForos(foros) {
        cuerpoTabla.innerHTML = '';
        
        if (!foros || foros.length === 0) {
            const fila = document.createElement('tr');
            fila.innerHTML = '<td colspan="2">No hay foros disponibles</td>';
            cuerpoTabla.appendChild(fila);
            return;
        }
        
        foros.forEach(foro => {
            const fila = document.createElement('tr');
            
            const celdaTitulo = document.createElement('td');
            celdaTitulo.textContent = foro.titulo_foro;
            
            const celdaDescripcion = document.createElement('td');
            celdaDescripcion.textContent = foro.descripcion_foro;
            
            fila.appendChild(celdaTitulo);
            fila.appendChild(celdaDescripcion);
            cuerpoTabla.appendChild(fila);
        });
    }

    function mostrarMensajeError(mensaje) {
        cuerpoTabla.innerHTML = '';
        const fila = document.createElement('tr');
        fila.innerHTML = `<td colspan="2" style="color: red; text-align: center;">${mensaje}</td>`;
        cuerpoTabla.appendChild(fila);
    }

    botonVolver.addEventListener('click', function() {
        window.location.href = 'menu_principal.html';
    });

    // Cargar los foros reales de la base de datos
    cargarForos();
});