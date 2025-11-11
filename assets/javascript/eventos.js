document.addEventListener('DOMContentLoaded', function() {
    const cuerpoTabla = document.getElementById('cuerpo_tabla_eventos');
    const botonVolver = document.getElementById('volver_menu');
    const modal = document.getElementById('modalParticipar');
    const modalTitulo = document.getElementById('modalTitulo');
    const modalDescripcion = document.getElementById('modalDescripcion');
    const btnConfirmarParticipar = document.getElementById('btnConfirmarParticipar');
    const btnCancelarParticipar = document.getElementById('btnCancelarParticipar');
    const buscadorEventos = document.getElementById("buscador_eventos");
    
    let usuarioActual = null;
    let eventoSeleccionado = null;

    // Obtener usuario actual desde localStorage
    async function obtenerUsuarioActual() {
        try {
            const usuarioGuardado = localStorage.getItem('user');
            
            if (!usuarioGuardado) {
                console.log('No hay usuario en localStorage');
                return null;
            }

            const usuario = JSON.parse(usuarioGuardado);
            
            if (!usuario.id_usuario) {
                console.error('Usuario no tiene id_usuario:', usuario);
                return null;
            }

            usuarioActual = {
                id_usuario: usuario.id_usuario,
                nombre_usuario: usuario.nombre_usuario,
                nombre_apellido: usuario.nombre_apellido
            };

            console.log('Usuario actual establecido:', usuarioActual);
            return usuarioActual;

        } catch (error) {
            console.error('Error al obtener usuario desde localStorage:', error);
            return null;
        }
    }

    async function cargarEventos() {
        try {
            console.log('Cargando eventos desde la tabla "evento"...');
            
            if (typeof supabase === 'undefined') {
                mostrarMensajeError('Error: Supabase no está configurado');
                return;
            }

            // Consulta a la tabla "evento"
            const { data: eventos, error } = await supabase
                .from('evento')
                .select('*')
                .order('fecha_evento', { ascending: true });

            if (error) {
                console.error('Error al cargar eventos:', error);
                mostrarMensajeError('Error: ' + error.message);
                return;
            }

            console.log('Eventos cargados correctamente:', eventos);
            await mostrarEventos(eventos);

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
            fila.style.cursor = 'pointer';
            fila.dataset.idEvento = evento.id_evento;
            
            // Celda Evento (nombre del evento)
            const celdaEvento = document.createElement('td');
            celdaEvento.textContent = evento.nombre_evento || 'Sin nombre';
            
            // Celda Fecha del Evento
            const celdaFecha = document.createElement('td');
            const fecha = evento.fecha_evento;
            celdaFecha.textContent = formatearFecha(fecha) || 'Sin fecha';
            
            // Celda Lugar
            const celdaLugar = document.createElement('td');
            celdaLugar.textContent = evento.lugar || 'Sin lugar';
            
            // Celda Descripción
            const celdaDescripcion = document.createElement('td');
            celdaDescripcion.textContent = evento.descripcion_evento || 'Sin descripción';
            
            fila.appendChild(celdaEvento);
            fila.appendChild(celdaFecha);
            fila.appendChild(celdaLugar);
            fila.appendChild(celdaDescripcion);
            
            // Hacer la fila clickeable para participar
            fila.addEventListener('click', () => mostrarModalParticipar(evento));
            
            cuerpoTabla.appendChild(fila);
        });
    }

    function mostrarModalParticipar(evento) {
        if (!usuarioActual) {
            alert('Debes iniciar sesión para participar en eventos');
            return;
        }

        // Verificar si ya participa en el evento
        verificarParticipacion(evento).then(yaParticipa => {
            if (yaParticipa) {
                alert(`Ya estás participando en el evento "${evento.nombre_evento}"`);
                return;
            }

            eventoSeleccionado = evento;
            modalTitulo.textContent = `¿Participar en "${evento.nombre_evento}"?`;
            modalDescripcion.textContent = `¿Confirmas que deseas participar en el evento "${evento.nombre_evento}" que se realizará el ${formatearFecha(evento.fecha_evento)} en ${evento.lugar}?`;
            modal.style.display = 'flex';
        });
    }

    // Verificar si el usuario ya participa en el evento
    async function verificarParticipacion(evento) {
        if (!usuarioActual) return false;
        
        try {
            const { data, error } = await supabase
                .from('evento_usuario')
                .select('id_evento_usuario')
                .eq('id_usuario', usuarioActual.id_usuario)
                .eq('id_evento', evento.id_evento)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 es "no encontrado"
                console.error('Error al verificar participación:', error);
                return false;
            }

            return !!data; // Retorna true si encontró participación, false si no
        } catch (error) {
            console.error('Error inesperado al verificar participación:', error);
            return false;
        }
    }

    async function participarEnEvento() {
        if (!usuarioActual || !eventoSeleccionado) {
            console.error('No hay usuario o evento seleccionado');
            return;
        }

        try {
            btnConfirmarParticipar.disabled = true;
            btnConfirmarParticipar.textContent = 'Participando...';

            // ✅ VERIFICACIÓN FINAL ANTES DE INSERTAR
            const yaParticipa = await verificarParticipacion(eventoSeleccionado);
            if (yaParticipa) {
                alert(`Ya estás participando en el evento "${eventoSeleccionado.nombre_evento}"`);
                cerrarModal();
                return;
            }

            console.log('Participando en evento:', {
                id_usuario: usuarioActual.id_usuario,
                id_evento: eventoSeleccionado.id_evento
            });

            // Insertar en la tabla evento_usuario
            const { data, error } = await supabase
                .from('evento_usuario')
                .insert([
                    {
                        id_usuario: usuarioActual.id_usuario,
                        id_evento: eventoSeleccionado.id_evento
                    }
                ])
                .select();

            if (error) {
                // Si el error es por duplicado (aunque no debería pasar con la verificación)
                if (error.code === '23505') { // Código de error de unique constraint
                    alert(`Ya estás participando en el evento "${eventoSeleccionado.nombre_evento}"`);
                    cerrarModal();
                    return;
                }
                
                console.error('Error al participar en evento:', error);
                alert('Error al participar en el evento: ' + error.message);
                return;
            }

            console.log('Participación registrada exitosamente:', data);
            alert('¡Te has registrado exitosamente en el evento!');
            
            // Cerrar modal
            cerrarModal();

        } catch (error) {
            console.error('Error inesperado al participar en evento:', error);
            alert('Error de conexión al participar en el evento');
        } finally {
            btnConfirmarParticipar.disabled = false;
            btnConfirmarParticipar.textContent = 'Sí, participar';
        }
    }

    function cerrarModal() {
        modal.style.display = 'none';
        eventoSeleccionado = null;
    }

    // Función para formatear fechas - VERSIÓN ROBUSTA
    function formatearFecha(fechaString) {
        if (!fechaString) return '';
        
        try {
            // Dividir la fecha en partes para evitar problemas de zona horaria
            const [anio, mes, dia] = fechaString.split('-');
            const fecha = new Date(anio, mes - 1, dia); // mes - 1 porque JavaScript cuenta meses desde 0
            
            return fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            // Si falla el método anterior, intentar con Date normal
            try {
                const fecha = new Date(fechaString);
                return fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (e) {
                return fechaString;
            }
        }
    }
    function mostrarMensajeError(mensaje) {
        cuerpoTabla.innerHTML = '';
        const fila = document.createElement('tr');
        fila.innerHTML = `<td colspan="4" style="color: red; text-align: center;">${mensaje}</td>`;
        cuerpoTabla.appendChild(fila);
    }

    // Event Listeners
    btnConfirmarParticipar.addEventListener('click', participarEnEvento);
    btnCancelarParticipar.addEventListener('click', cerrarModal);

    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    // Inicializar
    obtenerUsuarioActual().then(() => {
        cargarEventos();
    });

    
    if (buscadorEventos) {
        buscadorEventos.addEventListener("input", () => {
            const filtro = buscadorEventos.value.toLowerCase().trim();
            const filas = cuerpoTabla.querySelectorAll("tr");

            if (filas.length === 0) return;

            let resultados = 0;
            filas.forEach(fila => {
                const textoFila = fila.innerText.toLowerCase();
                if (textoFila.includes(filtro)) {
                    fila.style.display = "";
                    resultados++;
                } else {
                    fila.style.display = "none";
                }
            });

            // Si no hay coincidencias
            const noResultados = document.getElementById("fila_sin_resultados");
            if (resultados === 0) {
                if (!noResultados) {
                    const tr = document.createElement("tr");
                    tr.id = "fila_sin_resultados";
                    tr.innerHTML = `<td colspan="4" style="color:white; text-align:center;">No se encontraron eventos con ese criterio.</td>`;
                    cuerpoTabla.appendChild(tr);
                }
            } else if (noResultados) {
                noResultados.remove();
            }
        });
    }
});