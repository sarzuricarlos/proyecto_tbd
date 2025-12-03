document.addEventListener("DOMContentLoaded", async () => {
    // ✅ VERIFICACIONES AUTOMÁTICAS
    if (!verificarSupabase()) return;
    const user = await verificarAutenticacion();
    if (!user) return;
    
    // ✅ ELEMENTOS DEL DOM
    const menuAdmin = document.querySelector('.menu_admin');
    const panelAcciones = document.getElementById('panel_acciones');
    const contenedorTabla = document.getElementById('contenedor_tabla');
    const tablaCabecera = document.getElementById('tabla_cabecera');
    const tablaCuerpo = document.getElementById('tabla_cuerpo');
    const btnAgregar = document.getElementById('btn_agregar');
    const btnGuardar = document.getElementById('btn_guardar');
    const btnCancelar = document.getElementById('btn_cancelar');
    const btnVolver = document.getElementById('btn_volver');
    const btnVolverMenu = document.getElementById('volver_menu');

    // Variables globales
    let tablaActual = null;
    let datosOriginales = new Map();
    let enEdicion = false;

    // ✅ CONFIGURACIÓN DE COLUMNAS POR TABLA
    const configTablas = {
        curso: {
            columnas: ['id_curso', 'titulo_curso', 'descripcion_curso', 'duracion', 'modalidad', 'horario_general', 'costo', 'cupos'],
            nombres: ['ID', 'Título', 'Descripción', 'Duración', 'Modalidad', 'Horario', 'Costo', 'Cupos'],
            editables: ['titulo_curso', 'descripcion_curso', 'duracion', 'modalidad', 'horario_general', 'costo', 'cupos']
        },
        foro: {
            columnas: ['id_foro', 'titulo_foro', 'fecha_creacion', 'descripcion_foro'],
            nombres: ['ID', 'Título', 'Fecha Creación', 'Descripción'],
            editables: ['titulo_foro', 'descripcion_foro']
        },
        evento: {
            columnas: ['id_evento', 'nombre_evento', 'fecha_evento', 'lugar', 'descripcion_evento'],
            nombres: ['ID', 'Nombre', 'Fecha', 'Lugar', 'Descripción'],
            editables: ['nombre_evento', 'fecha_evento', 'lugar', 'descripcion_evento']
        },
        pago: {
            columnas: ['id_pago', 'id_usuario', 'id_curso', 'fecha_pago', 'monto', 'metodo_pago', 'estado_pago'],
            nombres: ['ID', 'Usuario', 'Curso', 'Fecha', 'Monto', 'Método', 'Estado'],
            editables: ['estado_pago'] // Solo el estado es editable
        },
        aula: {
            columnas: ['id_aula', 'nombre_aula', 'ubicacion'],
            nombres: ['ID', 'Nombre', 'Ubicación'],
            editables: ['nombre_aula', 'ubicacion']
        }
    };

    // ✅ EVENT LISTENERS
    menuAdmin.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const tabla = e.target.getAttribute('data-tabla');
            cargarTabla(tabla);
        }
    });

    btnAgregar.addEventListener('click', agregarFila);
    btnGuardar.addEventListener('click', guardarCambios);
    btnCancelar.addEventListener('click', cancelarEdicion);
    
    // ✅ BOTÓN VOLVER (oculto inicialmente)
    btnVolver.style.display = 'none';
    btnVolver.addEventListener('click', () => {
        // Ocultar tabla y mostrar menú
        contenedorTabla.style.display = 'none';
        panelAcciones.style.display = 'none';
        btnVolver.style.display = 'none';
        menuAdmin.style.display = 'grid';
        
        // Resetear estado
        tablaActual = null;
        enEdicion = false;
        datosOriginales.clear();
    });

    // ✅ CARGAR TABLA
    async function cargarTabla(tabla) {
        tablaActual = tabla;
        
        // Ocultar menú y mostrar tabla
        menuAdmin.style.display = 'none';
        contenedorTabla.style.display = 'block';
        panelAcciones.style.display = 'flex';
        btnVolver.style.display = 'inline-block';
        
        // Ocultar botones de edición
        btnGuardar.style.display = 'none';
        btnCancelar.style.display = 'none';
        enEdicion = false;

        try {
            tablaCuerpo.innerHTML = '<tr><td colspan="100">Cargando...</td></tr>';
            
            const { data, error } = await supabase
                .from(tabla)
                .select('*')
                .order('id_' + tabla, { ascending: true });

            if (error) throw error;

            construirTabla(data);
            
        } catch (error) {
            console.error(`Error cargando ${tabla}:`, error);
            showMessage(`Error al cargar ${tabla}: ${error.message}`, 'error');
            tablaCuerpo.innerHTML = '<tr><td colspan="100">Error al cargar datos</td></tr>';
        }
    }

    // ✅ CONSTRUIR TABLA
    function construirTabla(datos) {
        const config = configTablas[tablaActual];
        
        // Construir cabecera
        let htmlCabecera = '<tr>';
        config.nombres.forEach(nombre => {
            htmlCabecera += `<th>${nombre}</th>`;
        });
        htmlCabecera += '<th>Acciones</th></tr>';
        tablaCabecera.innerHTML = htmlCabecera;

        // Construir cuerpo
        let htmlCuerpo = '';
        datosOriginales.clear();

        datos.forEach((fila, index) => {
            const id = fila['id_' + tablaActual];
            datosOriginales.set(id, {...fila});
            
            htmlCuerpo += `<tr data-id="${id}">`;
            
            config.columnas.forEach(columna => {
                const valor = fila[columna];
                const esEditable = config.editables.includes(columna);
                
                if (esEditable) {
                    htmlCuerpo += `<td><input type="text" value="${valor || ''}" data-columna="${columna}" style="width: 100%; border: none; background: transparent;"></td>`;
                } else {
                    htmlCuerpo += `<td>${valor || ''}</td>`;
                }
            });

            htmlCuerpo += `<td>
                <button class="btn-eliminar" data-id="${id}">🗑️ Eliminar</button>
            </td></tr>`;
        });

        tablaCuerpo.innerHTML = htmlCuerpo;

        // Agregar event listeners a botones eliminar
        tablaCuerpo.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                eliminarRegistroSeguro(id);
            });
        });

        // Agregar event listeners a inputs para detectar cambios
        tablaCuerpo.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                if (!enEdicion) {
                    iniciarEdicion();
                }
            });
        });
    }

    // ✅ INICIAR EDICIÓN
    function iniciarEdicion() {
        enEdicion = true;
        btnGuardar.style.display = 'inline-block';
        btnCancelar.style.display = 'inline-block';
    }

    // ✅ AGREGAR FILA
    function agregarFila() {
        const config = configTablas[tablaActual];
        const nuevaFila = document.createElement('tr');
        nuevaFila.className = 'nueva-fila';
        
        let html = '';
        config.columnas.forEach(columna => {
            const esEditable = config.editables.includes(columna);
            const esId = columna === 'id_' + tablaActual;
            
            if (esId) {
                html += `<td><em>Nuevo</em></td>`;
            } else if (esEditable) {
                html += `<td><input type="text" data-columna="${columna}" style="width: 100%;"></td>`;
            } else {
                html += `<td></td>`;
            }
        });

        html += `<td>
            <button class="btn-eliminar" onclick="this.closest('tr').remove()">❌</button>
        </td>`;
        
        nuevaFila.innerHTML = html;
        tablaCuerpo.appendChild(nuevaFila);
        
        if (!enEdicion) {
            iniciarEdicion();
        }
    }

    // ✅ GUARDAR CAMBIOS
    async function guardarCambios() {
        try {
            const config = configTablas[tablaActual];
            const updates = [];
            const inserts = [];
            
            // Procesar filas existentes
            tablaCuerpo.querySelectorAll('tr:not(.nueva-fila)').forEach(fila => {
                const id = fila.getAttribute('data-id');
                const datosOriginalesFila = datosOriginales.get(parseInt(id));
                const datosActualizados = {};
                let hayCambios = false;

                config.editables.forEach(columna => {
                    const input = fila.querySelector(`input[data-columna="${columna}"]`);
                    if (input) {
                        const valorOriginal = datosOriginalesFila[columna];
                        let valorActual = input.value.trim();
                        
                        // Convertir tipos de datos según la columna
                        if (columna === 'duracion' || columna === 'cupos') {
                            // Campos enteros
                            valorActual = valorActual === '' ? null : parseInt(valorActual);
                            if (isNaN(valorActual)) {
                                showMessage(`El campo ${columna} debe ser un número entero válido`, 'error');
                                input.focus();
                                throw new Error(`Campo ${columna} inválido`);
                            }
                        } else if (columna === 'costo') {
                            // Campo decimal
                            valorActual = valorActual === '' ? null : parseFloat(valorActual);
                            if (isNaN(valorActual)) {
                                showMessage(`El campo ${columna} debe ser un número válido`, 'error');
                                input.focus();
                                throw new Error(`Campo ${columna} inválido`);
                            }
                        }
                        
                        if (valorActual !== valorOriginal) {
                            datosActualizados[columna] = valorActual;
                            hayCambios = true;
                        }
                    }
                });

                if (hayCambios) {
                    datosActualizados['id_' + tablaActual] = parseInt(id);
                    updates.push(datosActualizados);
                }
            });

            // Procesar nuevas filas
            tablaCuerpo.querySelectorAll('tr.nueva-fila').forEach(fila => {
                const nuevosDatos = {};
                let datosValidos = false;
                
                config.editables.forEach(columna => {
                    const input = fila.querySelector(`input[data-columna="${columna}"]`);
                    if (input && input.value.trim()) {
                        let valor = input.value.trim();
                        
                        // Convertir tipos de datos según la columna
                        if (columna === 'duracion' || columna === 'cupos') {
                            valor = parseInt(valor);
                            if (isNaN(valor)) {
                                showMessage(`El campo ${columna} debe ser un número entero válido`, 'error');
                                input.focus();
                                throw new Error(`Campo ${columna} inválido`);
                            }
                        } else if (columna === 'costo') {
                            valor = parseFloat(valor);
                            if (isNaN(valor)) {
                                showMessage(`El campo ${columna} debe ser un número válido`, 'error');
                                input.focus();
                                throw new Error(`Campo ${columna} inválido`);
                            }
                        }
                        
                        nuevosDatos[columna] = valor;
                        datosValidos = true;
                    }
                });

                if (datosValidos) {
                    inserts.push(nuevosDatos);
                }
            });

            // Ejecutar actualizaciones e inserciones
            let promises = [];

            if (updates.length > 0) {
                promises.push(
                    supabase.from(tablaActual).upsert(updates)
                );
            }

            if (inserts.length > 0) {
                promises.push(
                    supabase.from(tablaActual).insert(inserts)
                );
            }

            if (promises.length > 0) {
                const resultados = await Promise.all(promises);
                
                let errores = resultados.filter(r => r.error);
                if (errores.length > 0) {
                    throw new Error(errores.map(e => e.error.message).join(', '));
                }
            }

            showMessage('Cambios guardados correctamente', 'success');
            await cargarTabla(tablaActual); // Recargar tabla
            
        } catch (error) {
            console.error('Error guardando cambios:', error);
            if (!error.message.includes('Campo')) {
                showMessage(`Error al guardar cambios: ${error.message}`, 'error');
            }
        }
    }

    // ✅ CANCELAR EDICIÓN
    function cancelarEdicion() {
        if (confirm('¿Estás seguro de cancelar? Se perderán los cambios no guardados.')) {
            cargarTabla(tablaActual);
        }
    }

    // ✅ ELIMINAR REGISTRO SEGURO (MANEJA DEPENDENCIAS)
    async function eliminarRegistroSeguro(id) {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;

        try {
            // Intentar eliminar directamente primero
            const { error } = await supabase
                .from(tablaActual)
                .delete()
                .eq('id_' + tablaActual, id);

            if (error) {
                // Si hay error de clave foránea, manejar dependencias
                if (error.code === '23503') {
                    await manejarDependencias(id);
                } else {
                    throw error;
                }
            } else {
                showMessage('Registro eliminado correctamente', 'success');
            }
            
            await cargarTabla(tablaActual); // Recargar tabla
            
        } catch (error) {
            console.error('Error eliminando registro:', error);
            showMessage(`Error al eliminar: ${error.message}`, 'error');
        }
    }

    // ✅ MANEJAR DEPENDENCIAS POR TABLA
    async function manejarDependencias(id) {
        const confirmacion = confirm(
            `Este ${tablaActual} tiene dependencias. ¿Desea eliminarlo junto con sus dependencias?\n\n` +
            `⚠️ Esta acción no se puede deshacer.`
        );
        
        if (!confirmacion) return;

        try {
            switch (tablaActual) {
                case 'curso':
                    await eliminarCursoConDependencias(id);
                    break;
                    
                case 'foro':
                    await eliminarForoConDependencias(id);
                    break;
                    
                case 'evento':
                    await eliminarEventoConDependencias(id);
                    break;
                    
                case 'aula':
                    await eliminarAulaConDependencias(id);
                    break;
                    
                default:
                    throw new Error(`No se puede eliminar ${tablaActual} con dependencias`);
            }
            
            showMessage(`${tablaActual} y dependencias eliminados correctamente`, 'success');
            
        } catch (error) {
            console.error('Error eliminando dependencias:', error);
            throw new Error(`No se pudieron eliminar las dependencias: ${error.message}`);
        }
    }

// ✅ ELIMINAR CURSO CON TODAS SUS DEPENDENCIAS COMPLETAS
async function eliminarCursoConDependencias(idCurso) {
    try {
        console.log(`🔄 Eliminando curso ${idCurso} con todas sus dependencias...`);
        
        // 1. PRIMERO: Obtener todos los módulos del curso
        const { data: modulos } = await supabase
            .from('modulo')
            .select('id_modulo')
            .eq('id_curso', idCurso);
        
        const idsModulos = modulos ? modulos.map(m => m.id_modulo) : [];
        
        if (idsModulos.length > 0) {
            // 2. Eliminar dependencias de EVALUACIONES primero
            await eliminarDependenciasEvaluaciones(idsModulos);
            
            // 3. Eliminar evaluaciones
            await supabase.from('evaluacion').delete().in('id_modulo', idsModulos);
        }
        
        // 4. Eliminar progreso_modulo (depende de modulo)
        if (idsModulos.length > 0) {
            await supabase.from('progreso_modulo').delete().in('id_modulo', idsModulos);
        }
        
        // 5. Eliminar módulos
        await supabase.from('modulo').delete().eq('id_curso', idCurso);
        
        // 6. Eliminar temas y tareas (si existen)
        await eliminarTemasYTareas(idsModulos);
        
        // 7. Eliminar inscripciones
        await supabase.from('inscripcion').delete().eq('id_curso', idCurso);
        
        // 8. Eliminar pagos
        await supabase.from('pago').delete().eq('id_curso', idCurso);
        
        // 9. Eliminar horarios
        await supabase.from('horario').delete().eq('id_curso', idCurso);
        
        // 10. Eliminar certificados
        await supabase.from('certificado').delete().eq('id_curso', idCurso);
        
        // 11. Eliminar tipo_curso
        await supabase.from('tipo_curso').delete().eq('id_curso', idCurso);
        
        // 12. Eliminar reserva_aula
        await supabase.from('reserva_aula').delete().eq('id_curso', idCurso);
        
        // 13. FINALMENTE eliminar el curso
        const { error } = await supabase
            .from('curso')
            .delete()
            .eq('id_curso', idCurso);
        
        if (error) throw error;
        
        console.log(`✅ Curso ${idCurso} eliminado exitosamente`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error eliminando curso ${idCurso}:`, error);
        throw error;
    }
}

// ✅ ELIMINAR DEPENDENCIAS DE EVALUACIONES
async function eliminarDependenciasEvaluaciones(idsModulos) {
    if (idsModulos.length === 0) return;
    
    try {
        // Obtener todas las evaluaciones de estos módulos
        const { data: evaluaciones } = await supabase
            .from('evaluacion')
            .select('id_evaluacion')
            .in('id_modulo', idsModulos);
        
        if (!evaluaciones || evaluaciones.length === 0) return;
        
        const idsEvaluaciones = evaluaciones.map(e => e.id_evaluacion);
        
        // 1. Eliminar de RANKING (si existe)
        try {
            await supabase.from('ranking').delete().in('id_evaluacion', idsEvaluaciones);
        } catch (e) {
            console.log('⚠️ No se pudo eliminar de ranking:', e.message);
        }
        
        // 2. Eliminar de PROGRESO (si existe)
        try {
            await supabase.from('progreso').delete().in('id_evaluacion', idsEvaluaciones);
        } catch (e) {
            console.log('⚠️ No se pudo eliminar de progreso:', e.message);
        }
        
    } catch (error) {
        console.error('Error eliminando dependencias de evaluaciones:', error);
        // Continuar aunque falle esta parte
    }
}

// ✅ ELIMINAR TEMAS Y TAREAS
async function eliminarTemasYTareas(idsModulos) {
    if (idsModulos.length === 0) return;
    
    try {
        // Obtener todos los temas de estos módulos
        const { data: temas } = await supabase
            .from('tema')
            .select('id_tema')
            .in('id_modulo', idsModulos);
        
        if (temas && temas.length > 0) {
            const idsTemas = temas.map(t => t.id_tema);
            
            // Eliminar tareas de estos temas
            await supabase.from('tarea').delete().in('id_tema', idsTemas);
            
            // Eliminar temas
            await supabase.from('tema').delete().in('id_modulo', idsModulos);
        }
        
    } catch (error) {
        console.error('Error eliminando temas y tareas:', error);
        // Continuar aunque falle
    }
}

// ✅ FUNCIÓN DE ELIMINACIÓN MEJORADA CON VERIFICACIÓN
async function eliminarRegistroSeguro(id) {
    if (!confirm(`¿Está seguro de eliminar este ${tablaActual}?\n\n⚠️ Esta acción eliminará TODAS las dependencias asociadas.`)) {
        return;
    }

    try {
        if (tablaActual === 'curso') {
            // Para cursos, usar la función completa
            await eliminarCursoConDependencias(id);
            showMessage('✅ Curso y todas sus dependencias eliminados correctamente', 'success');
            
        } else {
            // Para otras tablas, intentar eliminación normal primero
            const { error } = await supabase
                .from(tablaActual)
                .delete()
                .eq('id_' + tablaActual, id);

            if (error) {
                if (error.code === '23503') {
                    // Si falla por dependencias, pedir confirmación
                    const confirmar = confirm(
                        `No se puede eliminar porque tiene dependencias.\n\n` +
                        `¿Desea forzar la eliminación eliminando primero las dependencias?`
                    );
                    
                    if (confirmar) {
                        await forzarEliminacionConDependencias(id);
                        showMessage(`✅ ${tablaActual} eliminado forzosamente`, 'success');
                    } else {
                        return;
                    }
                } else {
                    throw error;
                }
            } else {
                showMessage(`✅ ${tablaActual} eliminado correctamente`, 'success');
            }
        }
        
        // Recargar la tabla
        await cargarTabla(tablaActual);
        
    } catch (error) {
        console.error(`Error eliminando ${tablaActual}:`, error);
        
        // Mensaje de error más específico
        let mensajeError = `Error al eliminar: ${error.message}`;
        
        if (error.message.includes('violates foreign key constraint')) {
            mensajeError = `No se puede eliminar porque está siendo usado en otras partes del sistema.\n\n` +
                          `Contacte al administrador de la base de datos.`;
        }
        
        showMessage(mensajeError, 'error');
    }
}

// ✅ FORZAR ELIMINACIÓN CON DEPENDENCIAS (PARA TABLAS NO CURSO)
async function forzarEliminacionConDependencias(id) {
    switch (tablaActual) {
        case 'foro':
            // Eliminar comentarios primero
            await supabase.from('comentario').delete().eq('id_foro', id);
            // Poner cursos en NULL
            await supabase.from('curso').update({ id_foro: null }).eq('id_foro', id);
            // Eliminar foro
            await supabase.from('foro').delete().eq('id_foro', id);
            break;
            
        case 'evento':
            // Eliminar relaciones con usuarios
            await supabase.from('evento_usuario').delete().eq('id_evento', id);
            // Eliminar evento
            await supabase.from('evento').delete().eq('id_evento', id);
            break;
            
        case 'aula':
            // Eliminar asignaciones
            await supabase.from('asigna_aula').delete().eq('id_aula', id);
            // Eliminar reservas
            await supabase.from('reserva_aula').delete().eq('id_aula', id);
            // Eliminar aula
            await supabase.from('aula').delete().eq('id_aula', id);
            break;
            
        default:
            throw new Error(`No se puede forzar eliminación para ${tablaActual}`);
    }
}

    // ✅ ELIMINAR FORO CON DEPENDENCIAS
    async function eliminarForoConDependencias(idForo) {
        // 1. Eliminar comentarios
        await supabase.from('comentario').delete().eq('id_foro', idForo);
        
        // 2. Poner cursos en NULL (no eliminar cursos)
        await supabase.from('curso').update({ id_foro: null }).eq('id_foro', idForo);
        
        // 3. Eliminar el foro
        await supabase.from('foro').delete().eq('id_foro', idForo);
    }

    // ✅ ELIMINAR EVENTO CON DEPENDENCIAS
    async function eliminarEventoConDependencias(idEvento) {
        // Eliminar relaciones con usuarios
        await supabase.from('evento_usuario').delete().eq('id_evento', idEvento);
        
        // Eliminar el evento
        await supabase.from('evento').delete().eq('id_evento', idEvento);
    }

    // ✅ ELIMINAR AULA CON DEPENDENCIAS
    async function eliminarAulaConDependencias(idAula) {
        // Eliminar asignaciones
        await supabase.from('asigna_aula').delete().eq('id_aula', idAula);
        
        // Eliminar reservas
        await supabase.from('reserva_aula').delete().eq('id_aula', idAula);
        
        // Eliminar el aula
        await supabase.from('aula').delete().eq('id_aula', idAula);
    }

    console.log("✅ Configuración Admin cargada correctamente");
});