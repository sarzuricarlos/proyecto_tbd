// ===============================
// VARIABLES GLOBALES
// ===============================
let statsContainer;
let reportTitle;
let reportContent;
let menuAdmin;
let btnVolver;

// ===============================
// INICIALIZACION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    statsContainer = document.getElementById("statsContainer");
    reportTitle = document.getElementById("reportTitle");
    reportContent = document.getElementById("reportContent");
    menuAdmin = document.querySelector(".menu_admin");
    btnVolver = document.getElementById("btn_volver");

    // Configurar eventos para todos los botones de reporte
    const reportButtons = document.querySelectorAll(".menu_admin button");
    reportButtons.forEach(button => {
        button.addEventListener("click", mostrarSelectorFechas);
    });

    // Configurar botón volver
    if (btnVolver) {
        btnVolver.addEventListener("click", volverAMenu);
    }
});

// ===============================
// FUNCIONES DE INTERFAZ
// ===============================
function mostrarSelectorFechas(event) {
    const reportType = event.target.id;
    const reportName = event.target.textContent.trim();
    
    // Crear modal para seleccionar fechas
    const modalHTML = `
        <div class="modal-fechas">
            <div class="modal-content">
                <h3>${reportName}</h3>
                <p>Selecciona el período para el reporte:</p>
                
                <div class="fecha-inputs">
                    <div>
                        <label for="fechaInicio">Fecha Inicio:</label>
                        <input type="date" id="fechaInicio" required>
                    </div>
                    <div>
                        <label for="fechaFin">Fecha Fin:</label>
                        <input type="date" id="fechaFin" required>
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button type="button" id="btnGenerarReporte">Generar Reporte</button>
                    <button type="button" id="btnCancelar">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    
    // Agregar modal al DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Configurar eventos del modal
    const modal = modalContainer.querySelector('.modal-fechas');
    const btnGenerar = modalContainer.querySelector('#btnGenerarReporte');
    const btnCancelar = modalContainer.querySelector('#btnCancelar');
    
    // Establecer fechas por defecto (últimos 30 días)
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 30);
    
    document.getElementById('fechaInicio').valueAsDate = fechaInicio;
    document.getElementById('fechaFin').valueAsDate = fechaFin;
    
    btnGenerar.addEventListener('click', () => {
        const fechaInicioVal = document.getElementById('fechaInicio').value;
        const fechaFinVal = document.getElementById('fechaFin').value;
        
        if (!fechaInicioVal || !fechaFinVal) {
            alert('Por favor selecciona ambas fechas');
            return;
        }
        
        if (new Date(fechaInicioVal) > new Date(fechaFinVal)) {
            alert('La fecha de inicio no puede ser mayor a la fecha fin');
            return;
        }
        
        // Cerrar modal y generar reporte
        modal.remove();
        generarReporte(reportType, fechaInicioVal, fechaFinVal);
    });
    
    btnCancelar.addEventListener('click', () => {
        modal.remove();
    });
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function mostrarReporteInterfaz() {
    // Ocultar menú, mostrar contenido del reporte y botón volver
    if (menuAdmin) menuAdmin.style.display = 'none';
    if (reportContent) reportContent.style.display = 'block';
    if (btnVolver) btnVolver.style.display = 'block';
}

function volverAMenu() {
    // Ocultar contenido del reporte, mostrar menú y ocultar botón volver
    if (menuAdmin) menuAdmin.style.display = 'grid';
    if (reportContent) reportContent.style.display = 'none';
    if (btnVolver) btnVolver.style.display = 'none';
    statsContainer.innerHTML = '';
    reportTitle.textContent = '';
}

// ===============================
// FUNCIÓN PRINCIPAL PARA GENERAR REPORTES
// ===============================
async function generarReporte(tipoReporte, fechaInicio, fechaFin) {
    mostrarReporteInterfaz();
    
    // Mostrar loading
    statsContainer.innerHTML = '<div class="loading">Generando reporte...</div>';
    
    try {
        let resultado;
        
        // Mapear tipos de reporte a funciones RPC
        switch (tipoReporte) {
            case 'progreso_report':
                resultado = await obtenerReporteProgreso(fechaInicio, fechaFin);
                mostrarReporteProgreso(resultado);
                break;
                
            case 'recompensa_report':
                resultado = await obtenerReportePuntos(fechaInicio, fechaFin);
                mostrarReportePuntos(resultado);
                break;
                
            case 'curso_report':
                resultado = await obtenerReporteCursos(fechaInicio, fechaFin);
                mostrarReporteCursos(resultado);
                break;
                
            case 'pago_report':
                resultado = await obtenerReportePagos(fechaInicio, fechaFin);
                mostrarReportePagos(resultado);
                break;
                
            case 'docentes_report':
                resultado = await obtenerReporteDocentes(fechaInicio, fechaFin);
                mostrarReporteDocentes(resultado);
                break;
                
            case 'gamificacion_report':
                resultado = await obtenerReporteGamificacion();
                mostrarReporteGamificacion(resultado);
                break;
                
            case 'Administrativo_report':
                resultado = await obtenerReporteAdministrativo(fechaInicio, fechaFin);
                mostrarReporteAdministrativo(resultado);
                break;
                
            default:
                throw new Error('Tipo de reporte no válido');
        }
        
    } catch (error) {
        console.error('Error generando reporte:', error);
        statsContainer.innerHTML = `
            <div class="error">
                <p>Error al generar el reporte: ${error.message}</p>
                <button onclick="volverAMenu()">Volver al menú</button>
            </div>
        `;
    }
}

// ===============================
// LLAMADAS A PROCEDIMIENTOS ALMACENADOS
// ===============================
async function obtenerReporteProgreso(fechaInicio, fechaFin) {
    const { data, error } = await supabase
        .rpc('obtener_reporte_progreso_academico', {
            p_fecha_inicio: fechaInicio,
            p_fecha_fin: fechaFin
        });
    
    if (error) throw error;
    return data;
}

async function obtenerReportePuntos(fechaInicio, fechaFin) {
    const { data, error } = await supabase
        .rpc('obtener_reporte_puntos_recompensas', {
            p_fecha_inicio: fechaInicio,
            p_fecha_fin: fechaFin
        });
    
    if (error) throw error;
    return data;
}

async function obtenerReporteCursos(fechaInicio, fechaFin) {
    const { data, error } = await supabase
        .rpc('obtener_reporte_cursos_certificaciones', {
            p_fecha_inicio: fechaInicio,
            p_fecha_fin: fechaFin
        });
    
    if (error) throw error;
    return data;
}

async function obtenerReportePagos(fechaInicio, fechaFin) {
    const { data, error } = await supabase
        .rpc('obtener_reporte_pagos', {
            p_fecha_inicio: fechaInicio,
            p_fecha_fin: fechaFin
        });
    
    if (error) throw error;
    return data;
}

async function obtenerReporteDocentes(fechaInicio, fechaFin) {
    const { data, error } = await supabase
        .rpc('obtener_reporte_docentes', {
            p_fecha_inicio: fechaInicio,
            p_fecha_fin: fechaFin
        });
    
    if (error) throw error;
    return data;
}

async function obtenerReporteGamificacion() {
    const { data, error } = await supabase
        .rpc('obtener_reporte_gamificacion');
    
    if (error) throw error;
    return data;
}

async function obtenerReporteAdministrativo(fechaInicio, fechaFin) {
    const { data, error } = await supabase
        .rpc('obtener_reporte_administrativo', {
            p_fecha_inicio: fechaInicio,
            p_fecha_fin: fechaFin
        });
    
    if (error) throw error;
    return data;
}

// ===============================
// FUNCIONES PARA MOSTRAR REPORTES
// ===============================
function mostrarReporteProgreso(datos) {
    reportTitle.textContent = "Reporte de Progreso Académico";
    
    let html = `
        <div class="report-section">
            <h3>📊 Estado de Cursos por Estudiante</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Cursos Iniciados</th>
                            <th>Cursos en Proceso</th>
                            <th>Cursos Finalizados</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.cursos_estado && datos.cursos_estado.length > 0) {
        datos.cursos_estado.forEach(estado => {
            html += `
                <tr>
                    <td>${estado.usuario_nombre}</td>
                    <td>${estado.cursos_iniciados}</td>
                    <td>${estado.cursos_en_proceso}</td>
                    <td>${estado.cursos_finalizados}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="4">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="report-section">
            <h3>📈 Promedio de Notas por Estudiante</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Promedio de Notas</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.promedio_notas && datos.promedio_notas.length > 0) {
        datos.promedio_notas.forEach(nota => {
            html += `
                <tr>
                    <td>${nota.usuario_nombre}</td>
                    <td>${nota.promedio_nota}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="2">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="report-section">
            <h3>🏆 Cursos Más Completados</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Estudiantes Completados</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.cursos_completados_certificados?.cursos_mas_completados) {
        datos.cursos_completados_certificados.cursos_mas_completados.forEach(curso => {
            html += `
                <tr>
                    <td>${curso.curso_nombre}</td>
                    <td>${curso.completados_count}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="2">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="report-section">
            <h3>💬 Estudiantes con Mayor Participación</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Comentarios Realizados</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.estudiantes_participacion && datos.estudiantes_participacion.length > 0) {
        datos.estudiantes_participacion.forEach(estudiante => {
            html += `
                <tr>
                    <td>${estudiante.usuario_nombre}</td>
                    <td>${estudiante.comentarios_count}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="2">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    statsContainer.innerHTML = html;
}

function mostrarReportePuntos(datos) {
    reportTitle.textContent = "Reporte de Puntos y Recompensas";
    
    let html = `
        <div class="stats-summary">
            <div class="stat-card">
                <h4>Total Puntos Acumulados</h4>
                <p class="stat-number">${datos.puntos_acumulados}</p>
            </div>
            <div class="stat-card">
                <h4>Total Puntos Canjeados</h4>
                <p class="stat-number">${datos.puntos_canjeados}</p>
            </div>
        </div>
        
        <div class="report-section">
            <h3>🏆 Ranking de Estudiantes con Más Puntos</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Puesto</th>
                            <th>Estudiante</th>
                            <th>Puntos</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.ranking_puntos && datos.ranking_puntos.length > 0) {
        datos.ranking_puntos.forEach(ranking => {
            html += `
                <tr>
                    <td>${ranking.puesto}º</td>
                    <td>${ranking.usuario_nombre}</td>
                    <td>${ranking.saldo_puntos}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="3">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="report-section">
            <h3>🎁 Recompensas Más Canjeadas</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Recompensa</th>
                            <th>Veces Canjeada</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.recompensas_mas_canjeadas && datos.recompensas_mas_canjeadas.length > 0) {
        datos.recompensas_mas_canjeadas.forEach(recompensa => {
            html += `
                <tr>
                    <td>${recompensa.recompensa_nombre}</td>
                    <td>${recompensa.veces_canjeada}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="2">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="report-section">
            <h3>🌟 Usuarios con Más Recompensas Obtenidas</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Recompensas Obtenidas</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.usuarios_mas_recompensas && datos.usuarios_mas_recompensas.length > 0) {
        datos.usuarios_mas_recompensas.forEach(usuario => {
            html += `
                <tr>
                    <td>${usuario.usuario_nombre}</td>
                    <td>${usuario.recompensas_obtenidas}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="2">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    statsContainer.innerHTML = html;
}

function mostrarReporteCursos(datos) {
    reportTitle.textContent = "Reporte de Cursos y Certificaciones";
    
    let html = `
        <div class="report-section">
            <h3>📊 Cursos Más Inscritos</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Inscripciones</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.cursos_mas_inscritos && datos.cursos_mas_inscritos.length > 0) {
        datos.cursos_mas_inscritos.forEach(curso => {
            html += `
                <tr>
                    <td>${curso.curso_nombre}</td>
                    <td>${curso.inscripciones_count}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="2">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="report-section">
            <h3>📈 Cursos con Mayor Demanda</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Cupos Disponibles</th>
                            <th>% Ocupación</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.cursos_mas_demanda && datos.cursos_mas_demanda.length > 0) {
        datos.cursos_mas_demanda.forEach(curso => {
            html += `
                <tr>
                    <td>${curso.curso_nombre}</td>
                    <td>${curso.cupos_disponibles}</td>
                    <td>${curso.porcentaje_ocupacion}%</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="3">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="report-section">
            <h3>🏅 Certificaciones Emitidas</h3>
    `;
    
    if (datos.certificaciones_emitidas && datos.certificaciones_emitidas.length > 0) {
        html += `<p>Total certificados emitidos: ${datos.certificaciones_emitidas.length}</p>`;
        html += `<div class="table-container"><table>
            <thead>
                <tr>
                    <th>Estudiante</th>
                    <th>Curso</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>`;
        
        datos.certificaciones_emitidas.forEach(cert => {
            html += `
                <tr>
                    <td>${cert.usuario_nombre}</td>
                    <td>${cert.curso_nombre}</td>
                    <td>${new Date(cert.fecha_certificado).toLocaleDateString()}</td>
                </tr>
            `;
        });
        
        html += `</tbody></table></div>`;
    } else {
        html += `<p>No se emitieron certificados en el período seleccionado</p>`;
    }
    
    html += `
        </div>
        
        <div class="report-section">
            <h3>🎯 Cupos Disponibles vs Usados</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Cupos Totales</th>
                            <th>Cupos Usados</th>
                            <th>Cupos Disponibles</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.cupos_disponibles_vs_usados && datos.cupos_disponibles_vs_usados.length > 0) {
        datos.cupos_disponibles_vs_usados.forEach(cupo => {
            html += `
                <tr>
                    <td>${cupo.curso_nombre}</td>
                    <td>${cupo.cupos_totales}</td>
                    <td>${cupo.cupos_usados}</td>
                    <td>${cupo.cupos_disponibles}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="4">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    statsContainer.innerHTML = html;
}

function mostrarReportePagos(datos) {
    reportTitle.textContent = "Reporte de Pagos";
    
    let html = `
        <div class="report-section">
            <h3>💰 Cursos con Más Ingresos Generados</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Curso</th>
                            <th>Total Ingresos</th>
                            <th>Estudiantes</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.cursos_mas_ingresos && datos.cursos_mas_ingresos.length > 0) {
        datos.cursos_mas_ingresos.forEach(curso => {
            html += `
                <tr>
                    <td>${curso.curso_nombre}</td>
                    <td>$${curso.total_ingresos.toFixed(2)}</td>
                    <td>${curso.estudiantes_count}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="3">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="report-section">
            <h3>👤 Pagos Realizados por Estudiante</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Total Pagado</th>
                            <th>Pagos Realizados</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.pagos_por_estudiante && datos.pagos_por_estudiante.length > 0) {
        datos.pagos_por_estudiante.forEach(pago => {
            html += `
                <tr>
                    <td>${pago.usuario_nombre}</td>
                    <td>$${pago.total_pagado.toFixed(2)}</td>
                    <td>${pago.pagos_count}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="3">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="stats-summary">
            <div class="stat-card">
                <h4>Becas Aplicadas</h4>
                <p class="stat-number">${datos.becas_descuentos_puntos?.becas_aplicadas || 0}</p>
            </div>
            <div class="stat-card">
                <h4>Descuentos Aplicados</h4>
                <p class="stat-number">${datos.becas_descuentos_puntos?.descuentos_aplicados || 0}</p>
            </div>
            <div class="stat-card">
                <h4>Total Beneficiados</h4>
                <p class="stat-number">${datos.becas_descuentos_puntos?.total_beneficiados || 0}</p>
            </div>
        </div>
        
        <div class="report-section">
            <h3>🎫 Descuentos Aplicados por Puntos</h3>
    `;
    
    if (datos.descuentos_aplicados_puntos?.detalle_descuentos) {
        html += `<p>Total descuentos: $${datos.descuentos_aplicados_puntos.total_descuentos.toFixed(2)}</p>`;
        html += `<div class="table-container"><table>
            <thead>
                <tr>
                    <th>Curso</th>
                    <th>Costo Original</th>
                    <th>Monto Pagado</th>
                    <th>Descuento</th>
                </tr>
            </thead>
            <tbody>`;
        
        datos.descuentos_aplicados_puntos.detalle_descuentos.forEach(descuento => {
            html += `
                <tr>
                    <td>${descuento.curso_nombre}</td>
                    <td>$${descuento.costo_original.toFixed(2)}</td>
                    <td>$${descuento.monto_pagado.toFixed(2)}</td>
                    <td>$${descuento.descuento_aplicado.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `</tbody></table></div>`;
    } else {
        html += `<p>No se aplicaron descuentos en el período seleccionado</p>`;
    }
    
    html += `</div>`;
    
    statsContainer.innerHTML = html;
}

function mostrarReporteDocentes(datos) {
    reportTitle.textContent = "Reporte de Docentes";
    
    let html = `
        <div class="report-section">
            <h3>📝 Evaluaciones Corregidas por Docente</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Docente</th>
                            <th>Evaluaciones Corregidas</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.evaluaciones_corregidas && datos.evaluaciones_corregidas.length > 0) {
        datos.evaluaciones_corregidas.forEach(docente => {
            html += `
                <tr>
                    <td>${docente.docente_nombre}</td>
                    <td>${docente.evaluaciones_corregidas}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="2">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Mostrar detalle de evaluaciones si está disponible
    if (datos.evaluaciones_corregidas && datos.evaluaciones_corregidas.length > 0) {
        datos.evaluaciones_corregidas.forEach(docente => {
            if (docente.detalle_evaluaciones && docente.detalle_evaluaciones.length > 0) {
                html += `
                    <div class="report-section">
                        <h4>📋 Detalle de Evaluaciones - ${docente.docente_nombre}</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Fecha Subida</th>
                                        <th>Fecha Corrección</th>
                                        <th>Días de Demora</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                docente.detalle_evaluaciones.forEach(evaluacion => {
                    html += `
                        <tr>
                            <td>${new Date(evaluacion.fecha_subida).toLocaleDateString()}</td>
                            <td>${new Date(evaluacion.fecha_correccion).toLocaleDateString()}</td>
                            <td>${evaluacion.dias_demora} días</td>
                        </tr>
                    `;
                });
                
                html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    statsContainer.innerHTML = html;
}

function mostrarReporteGamificacion(datos) {
    reportTitle.textContent = "Reporte de Gamificación";
    
    let html = `
        <div class="report-section">
            <h3>🏆 Ranking Global de Estudiantes Destacados</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Puesto</th>
                            <th>Estudiante</th>
                            <th>Puntos Totales</th>
                            <th>Recompensas</th>
                            <th>Cursos Completados</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.ranking_global_estudiantes && datos.ranking_global_estudiantes.length > 0) {
        datos.ranking_global_estudiantes.forEach(estudiante => {
            html += `
                <tr>
                    <td>${estudiante.puesto}º</td>
                    <td>${estudiante.usuario_nombre}</td>
                    <td>${estudiante.puntos_totales}</td>
                    <td>${estudiante.recompensas_obtenidas}</td>
                    <td>${estudiante.cursos_completados}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="5">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="report-section">
            <h3>🎯 Actividades con Mayor Impacto Motivacional</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Evento</th>
                            <th>Fecha</th>
                            <th>Participantes</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.actividades_mayor_impacto && datos.actividades_mayor_impacto.length > 0) {
        datos.actividades_mayor_impacto.forEach(evento => {
            html += `
                <tr>
                    <td>${evento.evento_nombre}</td>
                    <td>${new Date(evento.fecha_evento).toLocaleDateString()}</td>
                    <td>${evento.participantes_count}</td>
                    <td>${evento.descripcion || 'Sin descripción'}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="4">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    statsContainer.innerHTML = html;
}

function mostrarReporteAdministrativo(datos) {
    reportTitle.textContent = "Reporte Administrativo";
    
    let html = `
        <div class="report-section">
            <h3>📅 Control de Horarios Completados</h3>
            <div class="stats-summary">
                <div class="stat-card">
                    <h4>Cursos con Horario</h4>
                    <p class="stat-number">${datos.control_horarios_completados?.cursos_con_horario || 0}</p>
                </div>
                <div class="stat-card">
                    <h4>Cursos sin Horario</h4>
                    <p class="stat-number">${datos.control_horarios_completados?.cursos_sin_horario || 0}</p>
                </div>
                <div class="stat-card">
                    <h4>Total Cursos</h4>
                    <p class="stat-number">${datos.control_horarios_completados?.total_cursos || 0}</p>
                </div>
                <div class="stat-card">
                    <h4>% Completado</h4>
                    <p class="stat-number">${datos.control_horarios_completados?.porcentaje_completado || 0}%</p>
                </div>
            </div>
        </div>
    `;
    
    // Mostrar cursos sin horario si existen
    if (datos.control_horarios_completados?.detalle_incompletos && 
        datos.control_horarios_completados.detalle_incompletos.length > 0) {
        html += `
            <div class="report-section">
                <h4>📋 Cursos que Requieren Horario</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Horario General</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        datos.control_horarios_completados.detalle_incompletos.forEach(curso => {
            html += `
                <tr>
                    <td>${curso.curso_nombre}</td>
                    <td>${curso.horario_general || 'No especificado'}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    html += `
        <div class="report-section">
            <h3>👥 Nuevos Estudiantes Registrados</h3>
    `;
    
    if (datos.nuevos_estudiantes_registrados && datos.nuevos_estudiantes_registrados.length > 0) {
        html += `<div class="table-container"><table>
            <thead>
                <tr>
                    <th>Estudiante</th>
                    <th>Fecha Registro</th>
                    <th>Correo</th>
                </tr>
            </thead>
            <tbody>`;
        
        datos.nuevos_estudiantes_registrados.forEach(estudiante => {
            html += `
                <tr>
                    <td>${estudiante.usuario_nombre}</td>
                    <td>${new Date(estudiante.fecha_registro).toLocaleDateString()}</td>
                    <td>${estudiante.correo || 'No disponible'}</td>
                </tr>
            `;
        });
        
        html += `</tbody></table></div>`;
    } else {
        html += `<p>No hay nuevos estudiantes registrados en el período seleccionado</p>`;
    }
    
    html += `
        </div>
        
        <div class="report-section">
            <h3>📊 Actividad de Usuarios Nuevos</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Fecha Registro</th>
                            <th>Cursos Inscritos</th>
                            <th>Puntos Obtenidos</th>
                            <th>Recompensas Canjeadas</th>
                            <th>Actividad Total</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (datos.actividad_usuarios_nuevos && datos.actividad_usuarios_nuevos.length > 0) {
        datos.actividad_usuarios_nuevos.forEach(usuario => {
            html += `
                <tr>
                    <td>${usuario.usuario_nombre}</td>
                    <td>${new Date(usuario.fecha_registro).toLocaleDateString()}</td>
                    <td>${usuario.cursos_inscritos}</td>
                    <td>${usuario.puntos_obtenidos}</td>
                    <td>${usuario.recompensas_canjeadas}</td>
                    <td>${usuario.actividad_total}</td>
                </tr>
            `;
        });
    } else {
        html += `<tr><td colspan="6">No hay datos disponibles</td></tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    statsContainer.innerHTML = html;
}