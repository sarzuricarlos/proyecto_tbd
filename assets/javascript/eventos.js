// eventos.js

document.addEventListener('DOMContentLoaded', function() {
    const cuerpoTabla = document.getElementById('cuerpo_tabla_eventos');
    const botonVolver = document.getElementById('volver_menu');
    
    async function cargarEventos() {
        try {
            console.log('Cargando eventos desde la tabla "evento"...');
            
            if (typeof supabase === 'undefined') {
                mostrarMensajeError('Error: Supabase no está configurado');
                return;
            }

            // Consulta a la tabla "evento"
            const { data: eventos, error } = await supabase
                .from('evento')  // Tabla correcta: evento
                .select('*')
                .order('fecha_evento', { ascending: true }); // Ordenar por fecha

            if (error) {
                console.error('Error al cargar eventos:', error);
                mostrarMensajeError('Error: ' + error.message);
                return;
            }

            console.log('Eventos cargados correctamente:', eventos);
            mostrarEventos(eventos);

        } catch (error) {
            console.error('Error inesperado:', error);
            mostrarMensajeError('Error de conexión');
        }
    }

    function mostrarEventos(eventos) {
        cuerpoTabla.innerHTML = '';
        
        if (!eventos || eventos.length === 0) {
            const fila = document.createElement('tr');
            fila.innerHTML = '<td colspan="4">No hay eventos disponibles</td>';
            cuerpoTabla.appendChild(fila);
            return;
        }
        
        eventos.forEach(evento => {
            const fila = document.createElement('tr');
            
            // Celda Evento (nombre del evento)
            const celdaEvento = document.createElement('td');
            celdaEvento.textContent = evento.nombre_evento || evento.titulo || evento.nombre || 'Sin nombre';
            
            // Celda Fecha del Evento
            const celdaFecha = document.createElement('td');
            // Formatear la fecha si es necesario
            const fecha = evento.fecha_evento || evento.fecha;
            celdaFecha.textContent = formatearFecha(fecha) || 'Sin fecha';
            
            // Celda Lugar
            const celdaLugar = document.createElement('td');
            celdaLugar.textContent = evento.lugar || evento.ubicacion || 'Sin lugar';
            
            // Celda Descripción
            const celdaDescripcion = document.createElement('td');
            celdaDescripcion.textContent = evento.descripcion || evento.descripcion_evento || 'Sin descripción';
            
            fila.appendChild(celdaEvento);
            fila.appendChild(celdaFecha);
            fila.appendChild(celdaLugar);
            fila.appendChild(celdaDescripcion);
            cuerpoTabla.appendChild(fila);
        });
    }

    // Función para formatear fechas
    function formatearFecha(fechaString) {
        if (!fechaString) return '';
        
        try {
            const fecha = new Date(fechaString);
            return fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return fechaString; // Devolver la fecha original si hay error
        }
    }

    function mostrarMensajeError(mensaje) {
        cuerpoTabla.innerHTML = '';
        const fila = document.createElement('tr');
        fila.innerHTML = `<td colspan="4" style="color: red; text-align: center;">${mensaje}</td>`;
        cuerpoTabla.appendChild(fila);
    }

    botonVolver.addEventListener('click', function() {
        window.location.href = 'menu_principal.html';
    });

    // Cargar los eventos reales de la base de datos
    cargarEventos();
});