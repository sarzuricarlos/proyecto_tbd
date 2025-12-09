document.addEventListener("DOMContentLoaded", async () => {
    // ============================================================
    // 🔹 ELEMENTOS DEL DOM - ACTUALIZADOS
    // ============================================================
    const menuNotas = document.getElementById("menu_notas");
    const seccionSubir = document.getElementById("seccion_subir_notas");
    const seccionCambiar = document.getElementById("seccion_cambiar_notas");
    const tablaCambiarNotas = document.getElementById("tabla_cambiar_notas");

    const btnSubirNotas = document.getElementById("boton_subir_notas");
    const btnCambiarNotas = document.getElementById("boton_cambiar_notas");
    const btnVolverSubir = document.getElementById("btn_volver_subir_notas");
    const btnVolverCambiar = document.getElementById("btn_volver_cambiar_notas");
    const btnVolverMenu = document.getElementById("volver_menu");

    const tipoNota = document.getElementById("tipo_nota");
    const opcionesTarea = document.getElementById("opciones_tarea");
    const opcionesEvaluacion = document.getElementById("opciones_evaluacion");
    
    // Elementos para tareas - ACTUALIZADOS
    const cursoTareaSelect = document.getElementById("curso_tarea");
    const moduloTareaSelect = document.getElementById("modulo_tarea");
    const temaTareaSelect = document.getElementById("tema_tarea");
    const tareaSelect = document.getElementById("tarea_tema");
    const btnMarcarCompletada = document.getElementById("btn_marcar_completada");
    
    // Elementos para evaluaciones - ACTUALIZADOS
    const estudianteSelect = document.getElementById("estudiante_evaluacion");
    const cursoEvaluacionSelect = document.getElementById("curso_evaluacion");
    const moduloEvaluacionSelect = document.getElementById("modulo_evaluacion");
    const notaInput = document.getElementById("nota_evaluacion");
    const btnSubirNota = document.getElementById("btn_subir_nota");

    // Variables globales para almacenar datos
    let cursosData = [];
    let estudiantesData = [];

    // ============================================================
    // 🔹 FUNCIONES DE NAVEGACIÓN
    // ============================================================
    function mostrarMenuPrincipal() {
        seccionSubir.style.display = "none";
        seccionCambiar.style.display = "none";
        menuNotas.style.display = "grid";
    }

    function mostrarSeccionSubir() {
        menuNotas.style.display = "none";
        seccionCambiar.style.display = "none";
        seccionSubir.style.display = "block";
    }

    function mostrarSeccionCambiar() {
        menuNotas.style.display = "none";
        seccionSubir.style.display = "none";
        seccionCambiar.style.display = "block";
    }

    // Event listeners de navegación
    btnSubirNotas.onclick = () => {
        mostrarSeccionSubir();
        cargarDatosIniciales();
    };

    btnCambiarNotas.onclick = () => {
        mostrarSeccionCambiar();
        cargarTablaNotas();
    };

    btnVolverSubir.onclick = mostrarMenuPrincipal;
    btnVolverCambiar.onclick = mostrarMenuPrincipal;
    btnVolverMenu.onclick = mostrarMenuPrincipal;

    // ============================================================
    // 🔹 FUNCIONES PARA SUBIR NOTAS - TAREAS (ACTUALIZADAS)
    // ============================================================
    tipoNota.addEventListener("change", () => {
        const valor = tipoNota.value;
        opcionesTarea.style.display = valor === "tarea" ? "block" : "none";
        opcionesEvaluacion.style.display = valor === "evaluacion" ? "block" : "none";
        
        if (valor === "tarea") {
            cargarCursosParaTareas();
        } else if (valor === "evaluacion") {
            cargarEstudiantes();
            cargarCursosParaEvaluaciones();
        }
    });

    async function cargarDatosIniciales() {
        await Promise.all([
            cargarCursosParaTareas(),
            cargarEstudiantes(),
            cargarCursosParaEvaluaciones()
        ]);
    }

    async function cargarCursosParaTareas() {
        try {
            const { data: cursos, error } = await supabase
                .from('curso')
                .select('id_curso, titulo_curso')
                .order('titulo_curso');

            if (error) throw error;

            // Guardar datos globalmente
            cursosData = cursos || [];
            
            // Actualizar select de cursos para tareas
            cursoTareaSelect.innerHTML = '<option value="" selected disabled>Seleccione un curso...</option>';
            cursosData.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.id_curso;
                option.textContent = curso.titulo_curso;
                cursoTareaSelect.appendChild(option);
            });

            // Limpiar selects siguientes
            moduloTareaSelect.innerHTML = '<option value="" selected disabled>Seleccione un módulo...</option>';
            temaTareaSelect.innerHTML = '<option value="" selected disabled>Seleccione un tema...</option>';
            tareaSelect.innerHTML = '<option value="" selected disabled>Seleccione una tarea...</option>';

        } catch (error) {
            console.error("Error cargando cursos para tareas:", error);
        }
    }

    // Event listener para curso (tareas)
    cursoTareaSelect.addEventListener("change", async () => {
        const idCurso = cursoTareaSelect.value;
        
        if (!idCurso) {
            moduloTareaSelect.innerHTML = '<option value="" selected disabled>Seleccione un módulo...</option>';
            temaTareaSelect.innerHTML = '<option value="" selected disabled>Seleccione un tema...</option>';
            tareaSelect.innerHTML = '<option value="" selected disabled>Seleccione una tarea...</option>';
            return;
        }
        
        await cargarModulosParaTareas(idCurso);
    });

    // Event listener para módulo (tareas)
    moduloTareaSelect.addEventListener("change", async () => {
        const idModulo = moduloTareaSelect.value;
        
        if (!idModulo) {
            temaTareaSelect.innerHTML = '<option value="" selected disabled>Seleccione un tema...</option>';
            tareaSelect.innerHTML = '<option value="" selected disabled>Seleccione una tarea...</option>';
            return;
        }
        
        await cargarTemasParaTareas(idModulo);
    });

    // Event listener para tema (tareas)
    temaTareaSelect.addEventListener("change", async () => {
        const idTema = temaTareaSelect.value;
        
        if (!idTema) {
            tareaSelect.innerHTML = '<option value="" selected disabled>Seleccione una tarea...</option>';
            return;
        }
        
        await cargarTareasParaTema(idTema);
    });

    async function cargarModulosParaTareas(idCurso) {
        try {
            const { data: modulos, error } = await supabase
                .from('modulo')
                .select('id_modulo, titulo_modulo')
                .eq('id_curso', idCurso)
                .order('titulo_modulo');

            if (error) throw error;

            // Actualizar select de módulos
            moduloTareaSelect.innerHTML = '<option value="" selected disabled>Seleccione un módulo...</option>';
            modulos.forEach(modulo => {
                const option = document.createElement('option');
                option.value = modulo.id_modulo;
                option.textContent = modulo.titulo_modulo;
                moduloTareaSelect.appendChild(option);
            });

            // Limpiar selects siguientes
            temaTareaSelect.innerHTML = '<option value="" selected disabled>Seleccione un tema...</option>';
            tareaSelect.innerHTML = '<option value="" selected disabled>Seleccione una tarea...</option>';

        } catch (error) {
            console.error("Error cargando módulos para tareas:", error);
        }
    }

    async function cargarTemasParaTareas(idModulo) {
        try {
            const { data: temas, error } = await supabase
                .from('tema')
                .select('id_tema, nombre_tema')
                .eq('id_modulo', idModulo)
                .order('nombre_tema');

            if (error) throw error;

            // Actualizar select de temas
            temaTareaSelect.innerHTML = '<option value="" selected disabled>Seleccione un tema...</option>';
            temas.forEach(tema => {
                const option = document.createElement('option');
                option.value = tema.id_tema;
                option.textContent = tema.nombre_tema;
                temaTareaSelect.appendChild(option);
            });

            // Limpiar select de tareas
            tareaSelect.innerHTML = '<option value="" selected disabled>Seleccione una tarea...</option>';

        } catch (error) {
            console.error("Error cargando temas para tareas:", error);
        }
    }

    async function cargarTareasParaTema(idTema) {
        try {
            const { data: tareas, error } = await supabase
                .from('tarea')
                .select('id_tarea, nombre_tarea, estado_tarea')
                .eq('id_tema', idTema)
                .order('nombre_tarea');

            if (error) throw error;

            // Actualizar select de tareas
            tareaSelect.innerHTML = '<option value="" selected disabled>Seleccione una tarea...</option>';
            tareas.forEach(tarea => {
                const option = document.createElement('option');
                option.value = tarea.id_tarea;
                const estado = tarea.estado_tarea ? '✅ Completada' : '❌ Pendiente';
                option.textContent = `${tarea.nombre_tarea} (${estado})`;
                tareaSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error cargando tareas:", error);
        }
    }

    // ============================================================
    // 🔹 FUNCIONALIDAD PARA MARCAR TAREAS COMPLETADAS (ACTUALIZADA)
    // ============================================================
    btnMarcarCompletada.onclick = async () => {
        const idTarea = tareaSelect.value;
        
        if (!idTarea) {
            alert("Por favor seleccione una tarea");
            return;
        }

        try {
            const { error } = await supabase
                .from('tarea')
                .update({ estado_tarea: true })
                .eq('id_tarea', idTarea);

            if (error) throw error;

            alert("✅ Tarea marcada como completada");
            
            // Recargar tareas para actualizar estado
            if (temaTareaSelect.value) {
                await cargarTareasParaTema(temaTareaSelect.value);
            }

        } catch (error) {
            console.error("Error marcando tarea:", error);
            alert("❌ Error al marcar tarea como completada");
        }
    };

    // ============================================================
    // 🔹 FUNCIONES PARA SUBIR NOTAS - EVALUACIONES (ACTUALIZADAS)
    // ============================================================
    async function cargarEstudiantes() {
        try {
            const { data: estudiantes, error } = await supabase
                .from('usuario')
                .select(`
                    id_usuario,
                    nombre_apellido,
                    correo,
                    asignacion_usuario_rol!inner(id_rol)
                `)
                .eq('asignacion_usuario_rol.id_rol', 1) // Rol de estudiante
                .order('nombre_apellido');

            if (error) {
                // Fallback: cargar todos los usuarios
                const { data: usuarios } = await supabase
                    .from('usuario')
                    .select('id_usuario, nombre_apellido, correo')
                    .order('nombre_apellido');
                
                estudiantesData = usuarios || [];
            } else {
                estudiantesData = estudiantes || [];
            }

            // Actualizar select de estudiantes
            estudianteSelect.innerHTML = '<option value="" selected disabled>Seleccione un estudiante...</option>';
            estudiantesData.forEach(estudiante => {
                const option = document.createElement('option');
                option.value = estudiante.id_usuario;
                option.textContent = `${estudiante.nombre_apellido} (${estudiante.correo})`;
                estudianteSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error cargando estudiantes:", error);
        }
    }

    async function cargarCursosParaEvaluaciones() {
        try {
            const { data: cursos, error } = await supabase
                .from('curso')
                .select('id_curso, titulo_curso')
                .order('titulo_curso');

            if (error) throw error;

            // Actualizar select de cursos para evaluaciones
            cursoEvaluacionSelect.innerHTML = '<option value="" selected disabled>Seleccione un curso...</option>';
            cursos.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.id_curso;
                option.textContent = curso.titulo_curso;
                cursoEvaluacionSelect.appendChild(option);
            });

            // Limpiar select de módulos
            moduloEvaluacionSelect.innerHTML = '<option value="" selected disabled>Seleccione un módulo...</option>';

        } catch (error) {
            console.error("Error cargando cursos para evaluaciones:", error);
        }
    }

    // Event listener para curso (evaluaciones)
    cursoEvaluacionSelect.addEventListener("change", async () => {
        const idCurso = cursoEvaluacionSelect.value;
        
        if (!idCurso) {
            moduloEvaluacionSelect.innerHTML = '<option value="" selected disabled>Seleccione un módulo...</option>';
            return;
        }
        
        await cargarModulosParaEvaluaciones(idCurso);
    });

    async function cargarModulosParaEvaluaciones(idCurso) {
        try {
            const { data: modulos, error } = await supabase
                .from('modulo')
                .select('id_modulo, titulo_modulo')
                .eq('id_curso', idCurso)
                .order('titulo_modulo');

            if (error) throw error;

            // Actualizar select de módulos
            moduloEvaluacionSelect.innerHTML = '<option value="" selected disabled>Seleccione un módulo...</option>';
            modulos.forEach(modulo => {
                const option = document.createElement('option');
                option.value = modulo.id_modulo;
                option.textContent = modulo.titulo_modulo;
                moduloEvaluacionSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error cargando módulos para evaluaciones:", error);
        }
    }

    // ============================================================
    // 🔹 FUNCIONALIDAD PARA SUBIR EVALUACIONES (ACTUALIZADA)
    // ============================================================
    btnSubirNota.onclick = async () => {
        const idEstudiante = estudianteSelect.value;
        const idModulo = moduloEvaluacionSelect.value;
        const nota = notaInput.value;

        // Validaciones
        if (!idEstudiante || !idModulo || !nota) {
            alert("Por favor complete todos los campos");
            return;
        }

        const notaNum = parseInt(nota);
        if (isNaN(notaNum) || notaNum < 0 || notaNum > 100) {
            alert("La nota debe ser un número entre 0 y 100");
            return;
        }

        try {
            // 1. Insertar en evaluación
            const { data: evaluacion, error: errorEval } = await supabase
                .from('evaluacion')
                .insert([
                    {
                        id_modulo: idModulo,
                        notas: notaNum,
                        fecha_subida: new Date().toISOString().split('T')[0]
                    }
                ])
                .select()
                .single();

            if (errorEval) throw errorEval;

            // 2. Obtener id_asignacion del usuario
            const { data: asignacion, error: errorAsig } = await supabase
                .from('asignacion_usuario_rol')
                .select('id_asignacion')
                .eq('id_usuario', idEstudiante)
                .single();

            if (errorAsig) throw errorAsig;

            // 3. Insertar en ranking
            const { error: errorRank } = await supabase
                .from('ranking')
                .insert([
                    {
                        id_asignacion: asignacion.id_asignacion,
                        id_evaluacion: evaluacion.id_evaluacion,
                        fecha_actualizacion: new Date().toISOString()
                    }
                ]);

            if (errorRank) throw errorRank;

            alert("✅ Evaluación subida correctamente");
            
            // Limpiar formulario
            estudianteSelect.value = "";
            cursoEvaluacionSelect.value = "";
            moduloEvaluacionSelect.innerHTML = '<option value="" selected disabled>Seleccione un módulo...</option>';
            notaInput.value = "";

        } catch (error) {
            console.error("Error subiendo evaluación:", error);
            alert("❌ Error al subir evaluación");
        }
    };

    // ============================================================
    // 🔹 FUNCIONES PARA CAMBIAR NOTAS (TABLA) - SIN CAMBIOS
    // ============================================================
    async function cargarTablaNotas() {
        try {
            tablaCambiarNotas.innerHTML = "<tr><td colspan='6'>Cargando datos...</td></tr>";

            // Obtener datos de ranking con todas las relaciones
            const { data: rankingData, error } = await supabase
                .from('ranking')
                .select(`
                    id_ranking,
                    fecha_actualizacion,
                    asignacion_usuario_rol:asignacion_usuario_rol(
                        id_asignacion,
                        usuario:usuario(
                            id_usuario,
                            nombre_apellido,
                            correo
                        )
                    ),
                    evaluacion:evaluacion(
                        id_evaluacion,
                        notas,
                        fecha_subida,
                        modulo:modulo(
                            id_modulo,
                            titulo_modulo,
                            curso:curso(
                                id_curso,
                                titulo_curso
                            )
                        )
                    )
                `)
                .order('fecha_actualizacion', { ascending: false });

            if (error) throw error;

            if (!rankingData || rankingData.length === 0) {
                tablaCambiarNotas.innerHTML = "<tr><td colspan='6'>No hay notas registradas</td></tr>";
                return;
            }

            // Cargar datos de cursos para los selectores
            const { data: todosLosCursos } = await supabase
                .from('curso')
                .select('id_curso, titulo_curso')
                .order('titulo_curso');

            construirTablaNotas(rankingData, todosLosCursos || []);

        } catch (error) {
            console.error("Error cargando tabla de notas:", error);
            tablaCambiarNotas.innerHTML = "<tr><td colspan='6'>Error al cargar las notas</td></tr>";
        }
    }

    function construirTablaNotas(rankingData, cursos) {
        let html = `
            <tr>
                <th>Usuario</th>
                <th>Curso</th>
                <th>Módulo</th>
                <th>Nota</th>
                <th>Fecha</th>
                <th>Acciones</th>
            </tr>
        `;

        rankingData.forEach(item => {
            const usuario = item.asignacion_usuario_rol?.usuario;
            const evaluacion = item.evaluacion;
            const modulo = evaluacion?.modulo;
            const curso = modulo?.curso;
            const notaActual = evaluacion?.notas || 0;

            html += `
                <tr data-id-ranking="${item.id_ranking}" data-id-evaluacion="${evaluacion?.id_evaluacion}" data-id-usuario="${usuario?.id_usuario}">
                    <td>
                        <strong>${usuario?.nombre_apellido || 'N/A'}</strong>
                        <br><small>${usuario?.correo || ''}</small>
                    </td>
                    <td>
                        <select class="select-curso" data-usuario="${usuario?.id_usuario}">
                            <option value="">Seleccione curso...</option>
                            ${cursos.map(cursoItem => `
                                <option value="${cursoItem.id_curso}" ${cursoItem.id_curso === curso?.id_curso ? 'selected' : ''}>
                                    ${cursoItem.titulo_curso}
                                </option>
                            `).join('')}
                        </select>
                    </td>
                    <td class="td-modulo">
                        <select class="select-modulo" disabled>
                            <option value="">Primero seleccione curso</option>
                            ${modulo ? `<option value="${modulo.id_modulo}" selected>${modulo.titulo_modulo}</option>` : ''}
                        </select>
                    </td>
                    <td>
                        <input type="number" class="input-nota" value="${notaActual}" min="0" max="100" 
                               data-evaluacion="${evaluacion?.id_evaluacion}">
                    </td>
                    <td>${new Date(item.fecha_actualizacion).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-actualizar" data-id-evaluacion="${evaluacion?.id_evaluacion}">Actualizar</button>
                        <button class="btn-eliminar" data-id-ranking="${item.id_ranking}" data-id-evaluacion="${evaluacion?.id_evaluacion}">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        tablaCambiarNotas.innerHTML = html;
        agregarEventListenersTabla();
    }

    function agregarEventListenersTabla() {
        // Event listeners para selectores de curso
        tablaCambiarNotas.querySelectorAll('.select-curso').forEach(select => {
            select.addEventListener('change', async (e) => {
                const idCurso = e.target.value;
                const idUsuario = e.target.dataset.usuario;
                const fila = e.target.closest('tr');
                const moduloSelect = fila.querySelector('.select-modulo');

                if (idCurso) {
                    await cargarModulosParaFila(idCurso, moduloSelect);
                    moduloSelect.disabled = false;
                } else {
                    moduloSelect.innerHTML = '<option value="">Primero seleccione curso</option>';
                    moduloSelect.disabled = true;
                }
            });
        });

        // Event listeners para botones actualizar
        tablaCambiarNotas.querySelectorAll('.btn-actualizar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const idEvaluacion = e.target.dataset.idEvaluacion;
                const fila = e.target.closest('tr');
                const nuevaNota = fila.querySelector('.input-nota').value;
                const nuevoModulo = fila.querySelector('.select-modulo').value;

                if (!nuevoModulo) {
                    alert("Por favor seleccione un módulo válido");
                    return;
                }

                if (nuevaNota === '' || nuevaNota < 0 || nuevaNota > 100) {
                    alert("Por favor ingrese una nota válida entre 0 y 100");
                    return;
                }

                await actualizarNotaEnTabla(idEvaluacion, nuevoModulo, nuevaNota);
            });
        });

        // Event listeners para botones eliminar
        tablaCambiarNotas.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const idRanking = e.target.dataset.idRanking;
                const idEvaluacion = e.target.dataset.idEvaluacion;

                if (confirm("¿Está seguro de eliminar esta evaluación?")) {
                    await eliminarNotaEnTabla(idRanking, idEvaluacion);
                }
            });
        });
    }

    async function cargarModulosParaFila(idCurso, moduloSelect) {
        try {
            const { data: modulos, error } = await supabase
                .from('modulo')
                .select('id_modulo, titulo_modulo')
                .eq('id_curso', idCurso)
                .order('titulo_modulo');

            if (error) throw error;

            moduloSelect.innerHTML = '<option value="">Seleccione módulo...</option>';
            modulos.forEach(modulo => {
                const option = document.createElement('option');
                option.value = modulo.id_modulo;
                option.textContent = modulo.titulo_modulo;
                moduloSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error cargando módulos:", error);
            moduloSelect.innerHTML = '<option value="">Error al cargar módulos</option>';
        }
    }

    async function actualizarNotaEnTabla(idEvaluacion, idModulo, nuevaNota) {
        try {
            const { error } = await supabase
                .from('evaluacion')
                .update({
                    notas: parseInt(nuevaNota),
                    id_modulo: idModulo
                })
                .eq('id_evaluacion', idEvaluacion);

            if (error) throw error;

            alert("✅ Nota actualizada correctamente");
            await cargarTablaNotas(); // Recargar tabla

        } catch (error) {
            console.error("Error actualizando nota:", error);
            alert("❌ Error al actualizar nota");
        }
    }

    async function eliminarNotaEnTabla(idRanking, idEvaluacion) {
        try {
            // Eliminar de ranking primero
            const { error: errorRanking } = await supabase
                .from('ranking')
                .delete()
                .eq('id_ranking', idRanking);

            if (errorRanking) throw errorRanking;

            // Luego eliminar la evaluación
            const { error: errorEvaluacion } = await supabase
                .from('evaluacion')
                .delete()
                .eq('id_evaluacion', idEvaluacion);

            if (errorEvaluacion) throw errorEvaluacion;

            alert("✅ Evaluación eliminada correctamente");
            await cargarTablaNotas(); // Recargar tabla

        } catch (error) {
            console.error("Error eliminando evaluación:", error);
            alert("❌ Error al eliminar evaluación");
        }
    }

    // ============================================================
    // 🔹 INICIALIZACIÓN
    // ============================================================
    mostrarMenuPrincipal();
});