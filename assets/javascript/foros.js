document.addEventListener('DOMContentLoaded', function() {
    const cuerpoTabla = document.getElementById('cuerpo_tabla_eventos');
    const botonVolver = document.getElementById('volver_menu');
    const botonVolverForos = document.getElementById('volver_a_foros');
    const listaForos = document.getElementById('lista_foros');
    const comentariosForo = document.getElementById('comentarios_foro');
    const tituloPagina = document.getElementById('titulo_pagina');
    const tituloForoSeleccionado = document.getElementById('titulo_foro_seleccionado');
    const descripcionForoSeleccionado = document.getElementById('descripcion_foro_seleccionado');
    const contenedorComentarios = document.getElementById('contenedor_comentarios');
    const inputComentario = document.getElementById('nuevo_comentario');
    const btnComentar = document.getElementById('btn_comentar');
    const contadorCaracteres = document.getElementById('contador_caracteres');
    const buscadorForos = document.getElementById("buscador_foros");

    let foroSeleccionado = null;
    let usuarioActual = null;

    // Obtener usuario actual desde localStorage
    async function obtenerUsuarioActual() {
        try {
            console.log('Obteniendo usuario actual desde localStorage...');
            
            // Obtener usuario desde localStorage
            const usuarioGuardado = localStorage.getItem('user');
            
            if (!usuarioGuardado) {
                console.log('No hay usuario en localStorage');
                mostrarMensajeTemporal('Debes iniciar sesión para comentar', 'error');
                return null;
            }

            const usuario = JSON.parse(usuarioGuardado);
            console.log('Usuario desde localStorage:', usuario);

            // Verificar que tenga los campos necesarios
            if (!usuario.id_usuario) {
                console.error('Usuario no tiene id_usuario:', usuario);
                mostrarMensajeTemporal('Error: Datos de usuario incompletos', 'error');
                return null;
            }

            usuarioActual = {
                id_usuario: usuario.id_usuario,
                nombre_usuario: usuario.nombre_usuario,
                nombre_apellido: usuario.nombre_apellido,
                correo: usuario.correo
            };

            console.log('Usuario actual establecido:', usuarioActual);
            return usuarioActual;

        } catch (error) {
            console.error('Error al obtener usuario desde localStorage:', error);
            mostrarMensajeTemporal('Error al cargar datos de usuario', 'error');
            return null;
        }
    }

    async function cargarForos() {
        try {
            console.log('Cargando foros desde la tabla "foro"...');
            
            if (typeof supabase === 'undefined') {
                mostrarMensajeError('Error: Supabase no está configurado');
                return;
            }

            const { data: foros, error } = await supabase
                .from('foro')
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
            fila.dataset.idForo = foro.id_foro;
            
            const celdaTitulo = document.createElement('td');
            celdaTitulo.textContent = foro.titulo_foro;
            
            const celdaDescripcion = document.createElement('td');
            celdaDescripcion.textContent = foro.descripcion_foro;
            
            fila.appendChild(celdaTitulo);
            fila.appendChild(celdaDescripcion);
            
            // Hacer la fila clickeable
            fila.style.cursor = 'pointer';
            fila.addEventListener('click', () => abrirComentariosForo(foro));
            
            cuerpoTabla.appendChild(fila);
        });
    }

    async function abrirComentariosForo(foro) {
        foroSeleccionado = foro;
        
        // Actualizar la información del foro
        tituloForoSeleccionado.textContent = foro.titulo_foro;
        descripcionForoSeleccionado.textContent = foro.descripcion_foro;
        
        // Cambiar a la vista de comentarios
        listaForos.style.display = 'none';
        comentariosForo.style.display = 'block';
        tituloPagina.textContent = 'Comentarios del Foro';
        
        // Limpiar y resetear el formulario
        inputComentario.value = '';
        actualizarContadorCaracteres();
        actualizarEstadoBotonComentar();
        
        // Cargar los comentarios del foro
        await cargarComentariosForo(foro.id_foro);
    }

    async function cargarComentariosForo(idForo) {
        try {
            console.log(`Cargando comentarios para el foro ID: ${idForo}`);
            
            const { data: comentarios, error } = await supabase
                .from('comentario')
                .select(`
                    *,
                    usuario:usuario(id_usuario, nombre_usuario, nombre_apellido)
                `)
                .eq('id_foro', idForo)
                .order('fecha_comentario', { ascending: true });

            if (error) {
                console.error('Error al cargar comentarios:', error);
                mostrarMensajeComentarios('Error al cargar comentarios: ' + error.message);
                return;
            }

            console.log('Comentarios cargados:', comentarios);
            mostrarComentarios(comentarios);

        } catch (error) {
            console.error('Error inesperado al cargar comentarios:', error);
            mostrarMensajeComentarios('Error de conexión al cargar comentarios');
        }
    }

    function mostrarComentarios(comentarios) {
        contenedorComentarios.innerHTML = '';
        
        if (!comentarios || comentarios.length === 0) {
            const mensaje = document.createElement('div');
            mensaje.className = 'comentario';
            mensaje.innerHTML = '<p>No hay comentarios en este foro. ¡Sé el primero en comentar!</p>';
            contenedorComentarios.appendChild(mensaje);
            return;
        }
        
        comentarios.forEach(comentario => {
            const divComentario = document.createElement('div');
            divComentario.className = 'comentario';
            
            const infoUsuario = document.createElement('div');
            infoUsuario.className = 'info_usuario';
            
            const nombreUsuario = document.createElement('span');
            nombreUsuario.className = 'nombre_usuario';
            nombreUsuario.textContent = `${comentario.usuario.nombre_apellido} (@${comentario.usuario.nombre_usuario})`;
            
            const fechaComentario = document.createElement('span');
            fechaComentario.className = 'fecha_comentario';
            fechaComentario.textContent = formatearFecha(comentario.fecha_comentario);
            
            const contenidoComentario = document.createElement('div');
            contenidoComentario.className = 'contenido_comentario';
            contenidoComentario.textContent = comentario.contenido;
            
            infoUsuario.appendChild(nombreUsuario);
            infoUsuario.appendChild(fechaComentario);
            
            divComentario.appendChild(infoUsuario);
            divComentario.appendChild(contenidoComentario);
            
            contenedorComentarios.appendChild(divComentario);
        });
        
        // Scroll al final de los comentarios
        contenedorComentarios.scrollTop = contenedorComentarios.scrollHeight;
    }

    async function agregarComentario() {
        if (!usuarioActual) {
            mostrarMensajeTemporal('Debes iniciar sesión para comentar', 'error');
            return;
        }

        if (!foroSeleccionado) {
            mostrarMensajeTemporal('No hay foro seleccionado', 'error');
            return;
        }

        const contenido = inputComentario.value.trim();
        if (!contenido) {
            mostrarMensajeTemporal('El comentario no puede estar vacío', 'error');
            return;
        }

        if (contenido.length > 500) {
            mostrarMensajeTemporal('El comentario es demasiado largo', 'error');
            return;
        }

        try {
            btnComentar.disabled = true;
            btnComentar.textContent = 'Comentando...';

            console.log('Agregando comentario:', {
                id_usuario: usuarioActual.id_usuario,
                id_foro: foroSeleccionado.id_foro,
                contenido: contenido
            });

            // Intentar inserción directa en la tabla comentario
            const { data: comentarioDirecto, error: errorDirecto } = await supabase
                .from('comentario')
                .insert([
                    {
                        id_usuario: usuarioActual.id_usuario,
                        id_foro: foroSeleccionado.id_foro,
                        contenido: contenido,
                        fecha_comentario: new Date().toISOString().split('T')[0]
                    }
                ])
                .select();

            if (errorDirecto) {
                console.error('Error al insertar comentario:', errorDirecto);
                mostrarMensajeTemporal('Error al publicar comentario: ' + errorDirecto.message, 'error');
                return;
            }

            console.log('Comentario agregado exitosamente:', comentarioDirecto);
            
            // Limpiar el input
            inputComentario.value = '';
            actualizarContadorCaracteres();
            actualizarEstadoBotonComentar();
            
            // Recargar los comentarios para mostrar el nuevo
            await cargarComentariosForo(foroSeleccionado.id_foro);
            
            mostrarMensajeTemporal('Comentario publicado exitosamente', 'exito');

        } catch (error) {
            console.error('Error inesperado al agregar comentario:', error);
            mostrarMensajeTemporal('Error de conexión: ' + error.message, 'error');
        } finally {
            btnComentar.disabled = false;
            btnComentar.textContent = 'Comentar';
        }
    }

    function formatearFecha(fechaString) {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    function actualizarContadorCaracteres() {
        const longitud = inputComentario.value.length;
        contadorCaracteres.textContent = `${longitud}/500 caracteres`;
        
        if (longitud > 450) {
            contadorCaracteres.classList.add('alerta');
        } else {
            contadorCaracteres.classList.remove('alerta');
        }
    }

    async function actualizarEstadoBotonComentar() {
        const contenido = inputComentario.value.trim();
        
        // Si no tenemos usuario actual, intentar obtenerlo desde localStorage
        if (!usuarioActual) {
            await obtenerUsuarioActual();
        }
        
        const habilitado = contenido && 
                          contenido.length <= 500 && 
                          usuarioActual !== null;
        
        btnComentar.disabled = !habilitado;
        
        console.log('Estado botón comentar:', {
            tieneContenido: !!contenido,
            longitudValida: contenido.length <= 500,
            usuarioActual: !!usuarioActual,
            habilitado: habilitado
        });
    }

    function mostrarMensajeTemporal(mensaje, tipo) {
        // Remover mensajes anteriores
        const mensajesAnteriores = document.querySelectorAll('.mensaje-estado');
        mensajesAnteriores.forEach(msg => msg.remove());

        const divMensaje = document.createElement('div');
        divMensaje.className = `mensaje-estado mensaje-${tipo}`;
        divMensaje.textContent = mensaje;

        // Insertar después del formulario
        const formulario = document.getElementById('formulario_comentario');
        formulario.parentNode.insertBefore(divMensaje, formulario.nextSibling);

        // Remover después de 3 segundos
        setTimeout(() => {
            if (divMensaje.parentNode) {
                divMensaje.parentNode.removeChild(divMensaje);
            }
        }, 3000);
    }

    function mostrarMensajeError(mensaje) {
        cuerpoTabla.innerHTML = '';
        const fila = document.createElement('tr');
        fila.innerHTML = `<td colspan="2" style="color: red; text-align: center;">${mensaje}</td>`;
        cuerpoTabla.appendChild(fila);
    }

    function mostrarMensajeComentarios(mensaje) {
        contenedorComentarios.innerHTML = '';
        const divMensaje = document.createElement('div');
        divMensaje.className = 'comentario';
        divMensaje.innerHTML = `<p style="color: red; text-align: center;">${mensaje}</p>`;
        contenedorComentarios.appendChild(divMensaje);
    }

    function volverAListaForos() {
        listaForos.style.display = 'block';
        comentariosForo.style.display = 'none';
        tituloPagina.textContent = 'Foros';
        foroSeleccionado = null;
        
        // Limpiar mensajes temporales
        const mensajes = document.querySelectorAll('.mensaje-estado');
        mensajes.forEach(msg => msg.remove());
    }

    // Event Listeners - SOLO los específicos de foros
    botonVolverForos.addEventListener('click', volverAListaForos);

    inputComentario.addEventListener('input', function() {
        actualizarContadorCaracteres();
        actualizarEstadoBotonComentar();
    });

    inputComentario.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !btnComentar.disabled) {
            agregarComentario();
        }
    });

    btnComentar.addEventListener('click', agregarComentario);

    if (buscadorForos) {
        buscadorForos.addEventListener("input", () => {
            const filtro = buscadorForos.value.toLowerCase().trim();
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
                    tr.innerHTML = `<td colspan="2" style="color:white; text-align:center;">No se encontraron foros con ese criterio.</td>`;
                    cuerpoTabla.appendChild(tr);
                }
            } else if (noResultados) {
                noResultados.remove();
            }
        });
    }

    // Inicializar foros
    console.log('Inicializando foros...');
    obtenerUsuarioActual().then(() => {
        console.log('Usuario después de inicializar:', usuarioActual);
        cargarForos();
        actualizarEstadoBotonComentar();
    });
});