document.addEventListener("DOMContentLoaded", async () => {
    // ✅ VERIFICACIONES AUTOMÁTICAS
    if (!verificarSupabase()) return;
    const user = await verificarAutenticacion();
    if (!user) return;

    console.log("🎯 Usuario:", user.nombre_usuario, "ID:", user.id_usuario);

    // ✅ ELEMENTOS DEL DOM
    const btnDisponibles = document.getElementById("boton_disponibles");
    const btnHorario = document.getElementById("boton_horario");
    const seccionMenu = document.getElementById("menu");
    const seccionCursos = document.getElementById("seccion_cursos");
    const seccionHorario = document.getElementById("seccion_horario");
    const tablaCursos = document.getElementById("tabla_cursos_disponibles");
    const tablaHorario = document.getElementById("tabla_horario_usuario");
    const buscador = document.getElementById("buscador_cursos");
    const btnVolverCursos = document.getElementById('btn_volver_disponibles');
    const btnVolverMenu = document.getElementById('volver_menu');

    // Verificar que los elementos existen
    if (!btnDisponibles || !btnHorario || !seccionMenu || !seccionCursos || !seccionHorario || !tablaCursos || !tablaHorario) {
        console.error("❌ No se encontraron algunos elementos del DOM");
        return;
    }
    console.log("✅ Todos los elementos del DOM encontrados");

    let cursoSeleccionado = null;

    // ============================================================
    // 🔹 Mostrar cursos disponibles
    // ============================================================
    async function mostrarCursosDisponibles() {
        seccionMenu.style.display = "none";
        seccionHorario.style.display = "none";
        seccionCursos.style.display = "block";
        btnVolverCursos.style.display = "inline-block";
        tablaCursos.innerHTML = "<tr><td style='color:white; text-align:center;'>Cargando cursos...</td></tr>";

        try {
            const { data, error } = await supabase.rpc('sp_obtener_cursos_con_estado', {
                p_id_usuario: user.id_usuario
            });

            if (error) throw error;

            if (!data || data.length === 0) {
                tablaCursos.innerHTML = `<tr><td colspan="8" style="color:white; text-align:center;">No hay cursos disponibles.</td></tr>`;
                return;
            }

            tablaCursos.innerHTML = `
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Duración</th>
                        <th>Modalidad</th>
                        <th>Horario</th>
                        <th>Costo</th>
                        <th>Cupos</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(curso => `
                        <tr class="fila-curso ${curso.esta_inscrito ? 'fila-inscrito' : ''}" 
                            data-id="${curso.id_curso}">
                            <td>${curso.titulo_curso}</td>
                            <td>${curso.descripcion_curso}</td>
                            <td>${curso.duracion} semanas</td>
                            <td>${curso.modalidad}</td>
                            <td>${curso.horario_general}</td>
                            <td>$${curso.costo}</td>
                            <td>${curso.cupos}</td>
                            <td>
                                ${curso.esta_inscrito ? 
                                    '<span style="color: #28a745; font-weight: bold;">✅ Inscrito</span>' : 
                                    `<button class="btn-inscribir" 
                                            data-id="${curso.id_curso}"
                                            data-titulo="${curso.titulo_curso}"
                                            data-costo="${curso.costo}"
                                            data-duracion="${curso.duracion}">
                                        Inscribirse
                                    </button>`
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;

            // Agregar eventos a botones "Inscribirse"
            document.querySelectorAll('.btn-inscribir').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idCurso = btn.getAttribute('data-id');
                    const tituloCurso = btn.getAttribute('data-titulo');
                    const costo = btn.getAttribute('data-costo');
                    const duracion = btn.getAttribute('data-duracion');

                    cursoSeleccionado = { idCurso, tituloCurso, costo, duracion };
                    mostrarModalInscripcion();
                });
            });

            // Click en fila para cursos no inscritos
            document.querySelectorAll('.fila-curso:not(.fila-inscrito)').forEach(fila => {
                fila.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('btn-inscribir')) {
                        const idCurso = fila.getAttribute('data-id');
                        const tituloCurso = fila.cells[0].textContent;
                        const costo = fila.cells[5].textContent.replace('$', '');
                        const duracion = fila.cells[2].textContent.replace(' semanas', '');
                        cursoSeleccionado = { idCurso, tituloCurso, costo, duracion };
                        mostrarModalInscripcion();
                    }
                });
            });

        } catch (err) {
            console.error("❌ Error al cargar cursos:", err);
            showMessage("Error al cargar los cursos disponibles: " + err.message, "error");
            tablaCursos.innerHTML = `<tr><td colspan="8" style="color:white; text-align:center;">Error al cargar los cursos disponibles.</td></tr>`;
        }
    }

    // ============================================================
    // 🔹 Modal de Inscripción
    // ============================================================
    function mostrarModalInscripcion() {
        const modalHTML = `
            <div id="modalInscripcion" class="modal-inscripcion">
                <div class="modal-inscripcion-contenido">
                    <h3>Confirmar Inscripción</h3>
                    <p><strong>Curso:</strong> ${cursoSeleccionado.tituloCurso}</p>
                    <p><strong>Duración:</strong> ${cursoSeleccionado.duracion} semanas</p>
                    <p><strong>Costo:</strong> $${cursoSeleccionado.costo} </p>
                    <label style="display:block; margin:15px 0 5px 0;"><strong>Método de pago:</strong></label>
                    <select id="selectMetodoPago">
                        <option value="">Selecciona método de pago</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Pago QR">Pago QR</option>
                    </select>
                    <div class="modal-inscripcion-botones">
                        <button id="confirmarInscripcion" class="btn-confirmar">
                            ✅ Confirmar Inscripción
                        </button>
                        <button id="cancelarInscripcion" class="btn-cancelar">
                            ❌ Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalInscripcion')?.remove();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('confirmarInscripcion').addEventListener('click', realizarInscripcion);
        document.getElementById('cancelarInscripcion').addEventListener('click', () => {
            document.getElementById('modalInscripcion').remove();
            cursoSeleccionado = null;
        });
    }

    // ============================================================
    // 🔹 Realizar Inscripción
    // ============================================================
    async function realizarInscripcion() {
        const metodoPago = document.getElementById('selectMetodoPago').value;
        if (!metodoPago) {
            showMessage('Por favor selecciona un método de pago', 'error');
            return;
        }

        // Mostrar loader
        const modal = document.getElementById('modalInscripcion');
        const originalContent = modal.querySelector('.modal-inscripcion-contenido').innerHTML;
        modal.querySelector('.modal-inscripcion-contenido').innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <div class="spinner" style="margin: 0 auto 20px; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p>Procesando inscripción...</p>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            </div>
        `;

        try {
            const { data, error } = await supabase.rpc('sp_realizar_inscripcion_completa', {
                p_id_usuario: user.id_usuario,
                p_id_curso: parseInt(cursoSeleccionado.idCurso),
                p_metodo_pago: metodoPago
            });

            if (error) throw error;

            if (data.success) {
                showMessage('✅ ' + data.message, 'success');
                document.getElementById('modalInscripcion').remove();
                
                // ✅ Mostrar el voucher automáticamente
                await mostrarResumenPagoCompleto(user.id_usuario, parseInt(cursoSeleccionado.idCurso));
                
                cursoSeleccionado = null;
                // Recargar cursos después de 1.5 segundos
                setTimeout(() => mostrarCursosDisponibles(), 1500);
            } else {
                showMessage('❌ ' + data.message, 'error');
                modal.querySelector('.modal-inscripcion-contenido').innerHTML = originalContent;
                document.getElementById('confirmarInscripcion').addEventListener('click', realizarInscripcion);
                document.getElementById('cancelarInscripcion').addEventListener('click', () => {
                    document.getElementById('modalInscripcion').remove();
                    cursoSeleccionado = null;
                });
            }

        } catch (err) {
            console.error("❌ Error realizando inscripción:", err);
            showMessage('❌ Error al realizar la inscripción: ' + err.message, 'error');
            modal.querySelector('.modal-inscripcion-contenido').innerHTML = originalContent;
            document.getElementById('confirmarInscripcion').addEventListener('click', realizarInscripcion);
            document.getElementById('cancelarInscripcion').addEventListener('click', () => {
                document.getElementById('modalInscripcion').remove();
                cursoSeleccionado = null;
            });
        }
    }

    // ============================================================
    // 🔹 FUNCIÓN PRINCIPAL: Mostrar resumen completo del pago
    // ============================================================
    async function mostrarResumenPagoCompleto(idUsuario, idCurso) {
        try {
            console.log(`🔍 Buscando información del pago - Usuario: ${idUsuario}, Curso: ${idCurso}`);
            
            // 1. Consultar el PAGO más reciente (SOLO datos de pago)
            const { data: pagoData, error: pagoError } = await supabase
                .from('pago')
                .select('*')
                .eq('id_usuario', idUsuario)
                .eq('id_curso', idCurso)
                .order('fecha_pago', { ascending: false })
                .limit(1)
                .single();

            if (pagoError || !pagoData) {
                console.error("❌ Error obteniendo datos del pago:", pagoError);
                return mostrarVoucherBasico(idCurso, idUsuario);
            }

            console.log("✅ Datos del pago obtenidos:", pagoData);
            
            // 2. Consultar datos del USUARIO por separado
            const { data: usuarioData, error: usuarioError } = await supabase
                .from('usuario')
                .select('*')
                .eq('id_usuario', idUsuario)
                .single();

            if (usuarioError) {
                console.error("❌ Error obteniendo datos del usuario:", usuarioError);
            }

            // 3. Consultar datos del CURSO por separado
            const { data: cursoData, error: cursoError } = await supabase
                .from('curso')
                .select('*')
                .eq('id_curso', idCurso)
                .single();

            if (cursoError) {
                console.error("❌ Error obteniendo datos del curso:", cursoError);
            }

            // 4. Consultar datos de INSCRIPCIÓN por separado
            const { data: inscripcionData, error: inscripcionError } = await supabase
                .from('inscripcion')
                .select('*')
                .eq('id_usuario', idUsuario)
                .eq('id_curso', idCurso)
                .order('fecha_inscripcion', { ascending: false })
                .limit(1)
                .single();

            if (inscripcionError) {
                console.error("❌ Error obteniendo datos de inscripción:", inscripcionError);
            }

            // 5. Generar voucher con toda la información obtenida
            generarVoucherCompleto(pagoData, usuarioData, cursoData, inscripcionData);

        } catch (err) {
            console.error("❌ Error en mostrarResumenPagoCompleto:", err);
            mostrarVoucherBasico(idCurso, idUsuario);
        }
    }

    // ============================================================
    // 🔹 Generar voucher completo con toda la información
    // ============================================================
    function generarVoucherCompleto(pagoData, usuarioData, cursoData, inscripcionData) {
        // Formatear fecha del pago
        const fechaPago = pagoData.fecha_pago ? 
            new Date(pagoData.fecha_pago + 'T00:00:00Z').toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : 'No especificada';

        // Estado del pago
        const estadoPago = pagoData.estado_pago ? 
            { texto: '✅ PAGADO', clase: 'status-approved', estado: 'Completado' } : 
            { texto: '⏳ PENDIENTE', clase: 'status-pending', estado: 'Pendiente de confirmación' };

        // Estado de la inscripción
        let estadoInscripcion = 'No especificado';
        if (inscripcionData && inscripcionData.estado_inscripcion) {
            const estados = { 
                1: 'Activa', 
                2: 'Completada', 
                3: 'Cancelada',
                0: 'Pendiente'
            };
            estadoInscripcion = estados[inscripcionData.estado_inscripcion] || 'Desconocido';
        }

        // Código del voucher = ID de Pago
        const codigoVoucher = `#${pagoData.id_pago.toString().padStart(6, '0')}`;

        // Obtener datos seguros con valores por defecto
        const usuarioNombre = usuarioData ? 
            (usuarioData.nombre_apellido || usuarioData.nombre_usuario || 'No disponible') : 
            'No disponible';
        
        const usuarioEmail = usuarioData ? 
            (usuarioData.correo || 'No disponible') : 
            'No disponible';
        
        const usuarioUsername = usuarioData ? 
            (usuarioData.nombre_usuario || 'No disponible') : 
            'No disponible';
        
        const cursoTitulo = cursoData ? 
            (cursoData.titulo_curso || 'No disponible') : 
            'No disponible';
        
        const cursoDescripcion = cursoData ? 
            (cursoData.descripcion_curso || 'Sin descripción') : 
            'Sin descripción';
        
        const cursoDuracion = cursoData ? 
            (cursoData.duracion || 'N/A') : 
            'N/A';
        
        const cursoModalidad = cursoData ? 
            (cursoData.modalidad || 'No especificada') : 
            'No especificada';
        
        const cursoHorario = cursoData ? 
            (cursoData.horario_general || 'No especificado') : 
            'No especificado';

        const voucherHTML = `
            <div id="modalVoucher" class="voucher-modal-overlay">
                <div class="voucher-container">
                    <div class="voucher-header">
                        <div class="voucher-logo">
                            <div class="logo-icon">🎓</div>
                            <h3>Bash Academy</h3>
                        </div>
                        <div class="voucher-status ${estadoPago.clase}">
                            ${estadoPago.texto}
                        </div>
                    </div>
                    
                    <div class="voucher-body">
                        <!-- SECCIÓN: INFORMACIÓN DEL COMPROBANTE -->
                        <div class="voucher-section">
                            <h4>COMPROBANTE DE INSCRIPCIÓN</h4>
                            <div class="voucher-details">
                                <div class="detail-row">
                                    <span class="detail-label">Código de Voucher:</span>
                                    <span class="detail-value" style="color: #764ba2; font-weight: 700;">${codigoVoucher}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Fecha de Pago:</span>
                                    <span class="detail-value">${fechaPago}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="voucher-divider"></div>
                        
                        <!-- SECCIÓN: INFORMACIÓN DEL ESTUDIANTE -->
                        <div class="voucher-section">
                            <h4>INFORMACIÓN DEL ESTUDIANTE</h4>
                            <div class="voucher-details">
                                <div class="detail-row">
                                    <span class="detail-label">Nombre Completo:</span>
                                    <span class="detail-value">${usuarioNombre}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Usuario:</span>
                                    <span class="detail-value">${usuarioUsername}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span class="detail-value">${usuarioEmail}</span>
                                </div>
                                ${usuarioData && usuarioData.id_usuario ? `
                                <div class="detail-row">
                                    <span class="detail-label">ID de Usuario:</span>
                                    <span class="detail-value">${usuarioData.id_usuario}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="voucher-divider"></div>
                        
                        <!-- SECCIÓN: DETALLES DEL CURSO -->
                        <div class="voucher-section">
                            <h4>DETALLES DEL CURSO</h4>
                            <div class="voucher-details">
                                <div class="detail-row">
                                    <span class="detail-label">Curso:</span>
                                    <span class="detail-value">${cursoTitulo}</span>
                                </div>
                                ${cursoData && cursoData.id_curso ? `
                                <div class="detail-row">
                                    <span class="detail-label">ID Curso:</span>
                                    <span class="detail-value">${cursoData.id_curso}</span>
                                </div>
                                ` : ''}
                                <div class="detail-row">
                                    <span class="detail-label">Descripción:</span>
                                    <span class="detail-value">${cursoDescripcion.substring(0, 80)}${cursoDescripcion.length > 80 ? '...' : ''}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Duración:</span>
                                    <span class="detail-value">${cursoDuracion} semanas</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Modalidad:</span>
                                    <span class="detail-value">${cursoModalidad}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Horario:</span>
                                    <span class="detail-value">${cursoHorario}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="voucher-divider"></div>
                        
                        <!-- SECCIÓN: INFORMACIÓN DE PAGO -->
                        <div class="voucher-section">
                            <h4>INFORMACIÓN DE PAGO</h4>
                            <div class="voucher-details">
                                <div class="detail-row">
                                    <span class="detail-label">Método de Pago:</span>
                                    <span class="detail-value payment-method">${pagoData.metodo_pago || 'No especificado'}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Monto Total:</span>
                                    <span class="detail-value amount">$${pagoData.monto || 0} </span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Estado del Pago:</span>
                                    <span class="detail-value status ${pagoData.estado_pago ? 'text-success' : 'text-warning'}">
                                        ${estadoPago.estado}
                                    </span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Estado Inscripción:</span>
                                    <span class="detail-value">${estadoInscripcion}</span>
                                </div>
                                ${inscripcionData && inscripcionData.fecha_inscripcion ? `
                                <div class="detail-row">
                                    <span class="detail-label">Fecha Inscripción:</span>
                                    <span class="detail-value">${new Date(inscripcionData.fecha_inscripcion).toLocaleDateString('es-ES')}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- SECCIÓN: RESUMEN FINAL -->
                        <div class="voucher-section" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <div class="voucher-details">
                                <div class="detail-row" style="border: none; padding: 10px 0;">
                                    <span class="detail-label" style="font-size: 16px; font-weight: 700;">RESUMEN:</span>
                                    <span class="detail-value" style="font-size: 18px; font-weight: 700; color: #4CAF50;">
                                        $${pagoData.monto || 0} 
                                    </span>
                                </div>
                                <div class="detail-row" style="border: none; padding: 5px 0;">
                                    <span class="detail-label">Curso:</span>
                                    <span class="detail-value">${cursoTitulo}</span>
                                </div>
                                <div class="detail-row" style="border: none; padding: 5px 0;">
                                    <span class="detail-label">Pagado el:</span>
                                    <span class="detail-value">${fechaPago}</span>
                                </div>
                                <div class="detail-row" style="border: none; padding: 5px 0;">
                                    <span class="detail-label">Código:</span>
                                    <span class="detail-value">${codigoVoucher}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- PIE DEL VOUCHER -->
                    <div class="voucher-footer">
                        <div class="voucher-actions">
                            <button onclick="imprimirVoucher()" class="btn-print">
                                🖨️ Imprimir Comprobante
                            </button>
                            <button onclick="descargarVoucher()" class="btn-download" style="background: #6c757d; color: white;">
                                ⬇️ Descargar
                            </button>
                            <button onclick="cerrarVoucher()" class="btn-close">
                                ✅ Cerrar
                            </button>
                        </div>
                        <div class="voucher-note">
                            <p><strong>⚠️ IMPORTANTE:</strong> Guarde este comprobante como respaldo de su inscripción.</p>
                            <p style="font-size: 11px; color: #888; margin-top: 10px;">
                                Código: ${codigoVoucher} | Generado: ${new Date().toLocaleString('es-ES')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insertar el voucher en el documento
        document.getElementById('modalVoucher')?.remove();
        document.body.insertAdjacentHTML('beforeend', voucherHTML);
        
        // Agregar funcionalidad de descarga
        agregarFuncionalidadDescarga(pagoData, cursoData, usuarioData, codigoVoucher, fechaPago);
    }

    // ============================================================
    // 🔹 Voucher básico (fallback)
    // ============================================================
    function mostrarVoucherBasico(idCurso, idUsuario) {
        const voucherBasicoHTML = `
            <div id="modalVoucher" class="voucher-modal-overlay">
                <div class="voucher-container">
                    <div class="voucher-header" style="background: #ff9800;">
                        <h3>⚠️ Comprobante de Inscripción</h3>
                    </div>
                    <div class="voucher-body">
                        <div class="voucher-section" style="text-align: center;">
                            <div style="font-size: 48px; margin: 20px 0;">✅</div>
                            <h4 style="color: #4CAF50;">Inscripción Exitosa</h4>
                            <p>Su inscripción ha sido registrada correctamente.</p>
                        </div>
                        
                        <div class="voucher-divider"></div>
                        
                        <div class="voucher-section">
                            <div class="voucher-details">
                                <div class="detail-row">
                                    <span class="detail-label">Curso ID:</span>
                                    <span class="detail-value">${idCurso}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Usuario ID:</span>
                                    <span class="detail-value">${idUsuario}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Fecha:</span>
                                    <span class="detail-value">${new Date().toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Estado:</span>
                                    <span class="detail-value text-warning">Pendiente de confirmación</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="voucher-note" style="background: #e3f2fd; border-left: 4px solid #2196f3;">
                            <p><strong>Nota:</strong> Los detalles completos del pago estarán disponibles en breve.</p>
                            <p>Puede verificar el estado en su historial de pagos.</p>
                        </div>
                    </div>
                    <div class="voucher-footer">
                        <button onclick="cerrarVoucher()" class="btn-close">
                            ✅ Entendido
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalVoucher')?.remove();
        document.body.insertAdjacentHTML('beforeend', voucherBasicoHTML);
    }

    // ============================================================
    // 🔹 Agregar funcionalidad de descarga
    // ============================================================
    function agregarFuncionalidadDescarga(pagoData, cursoData, usuarioData, codigoVoucher, fechaPago) {
        // Agregar evento al botón de descarga
        const downloadBtn = document.querySelector('.btn-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                generarPDF(pagoData, cursoData, usuarioData, codigoVoucher, fechaPago);
            });
        }
    }

// ============================================================
// 🔹 Generar PDF REAL con jsPDF
// ============================================================
async function generarPDF(pagoData, cursoData, usuarioData, codigoVoucher, fechaPago) {
    try {
        showMessage('🔄 Generando PDF...', 'info');
        
        // Crear un contenedor temporal para el PDF
        const pdfContainer = document.createElement('div');
        pdfContainer.id = 'pdf-container';
        pdfContainer.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: 210mm; /* Tamaño A4 */
            padding: 20mm;
            background: white;
            color: #333;
            font-family: Arial, sans-serif;
            box-sizing: border-box;
        `;
        
        // Crear contenido del PDF
        const pdfContent = `
            <div style="
                max-width: 170mm;
                margin: 0 auto;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            ">
                <!-- Encabezado -->
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    text-align: center;
                ">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px;">
                        <div style="font-size: 32px;">🎓</div>
                        <h1 style="margin: 0; font-size: 24px;">Bash Academy</h1>
                    </div>
                    <div style="
                        display: inline-block;
                        padding: 8px 16px;
                        background: ${pagoData.estado_pago ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 193, 7, 0.2)'};
                        border: 1px solid ${pagoData.estado_pago ? '#4CAF50' : '#FFC107'};
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: bold;
                        margin-top: 10px;
                    ">
                        ${pagoData.estado_pago ? '✅ PAGADO' : '⏳ PENDIENTE'}
                    </div>
                </div>
                
                <!-- Cuerpo -->
                <div style="padding: 25px;">
                    <!-- Título -->
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h2 style="color: #333; margin: 0; font-size: 20px;">COMPROBANTE DE INSCRIPCIÓN</h2>
                        <div style="height: 2px; background: linear-gradient(to right, transparent, #667eea, transparent); margin: 10px 0;"></div>
                    </div>
                    
                    <!-- Información del comprobante -->
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #666; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                            INFORMACIÓN DEL COMPROBANTE
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee; width: 50%;"><strong>Código:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee; color: #764ba2; font-weight: 700;">${codigoVoucher}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>Fecha de Pago:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">${fechaPago}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Información del estudiante -->
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #666; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                            INFORMACIÓN DEL ESTUDIANTE
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee; width: 50%;"><strong>Nombre:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">${usuarioData ? (usuarioData.nombre_apellido || usuarioData.nombre_usuario || 'No disponible') : 'No disponible'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>Usuario:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">${usuarioData ? usuarioData.nombre_usuario || 'No disponible' : 'No disponible'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>Email:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">${usuarioData ? usuarioData.correo || 'No disponible' : 'No disponible'}</td>
                            </tr>
                            ${usuarioData && usuarioData.id_usuario ? `
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>ID Usuario:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">${usuarioData.id_usuario}</td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>
                    
                    <!-- Detalles del curso -->
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #666; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                            DETALLES DEL CURSO
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee; width: 50%;"><strong>Curso:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">${cursoData ? cursoData.titulo_curso || 'No disponible' : 'No disponible'}</td>
                            </tr>
                            ${cursoData && cursoData.id_curso ? `
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>ID Curso:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">${cursoData.id_curso}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>Duración:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">${cursoData ? cursoData.duracion || 'N/A' : 'N/A'} semanas</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>Modalidad:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">${cursoData ? cursoData.modalidad || 'No especificada' : 'No especificada'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>Horario:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">${cursoData ? cursoData.horario_general || 'No especificado' : 'No especificado'}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Información de pago -->
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #666; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                            INFORMACIÓN DE PAGO
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee; width: 50%;"><strong>Método:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee; color: #667eea;">${pagoData.metodo_pago || 'No especificado'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>Monto:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee; color: #4CAF50; font-weight: bold; font-size: 18px;">$${pagoData.monto || 0} </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>Estado:</strong></td>
                                <td style="padding: 8px 0; border-bottom: 1px dashed #eee; color: ${pagoData.estado_pago ? '#4CAF50' : '#FFC107'}">
                                    ${pagoData.estado_pago ? 'Completado' : 'Pendiente de confirmación'}
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Resumen -->
                    <div style="
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 20px;
                        margin-top: 30px;
                        border-left: 4px solid #4CAF50;
                    ">
                        <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; text-align: center;">RESUMEN</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Total:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right; font-size: 20px; color: #4CAF50; font-weight: bold;">
                                    $${pagoData.monto || 0} 
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Curso:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right;">
                                    ${cursoData ? cursoData.titulo_curso || 'Curso' : 'Curso'}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0;"><strong>Fecha:</strong></td>
                                <td style="padding: 10px 0; text-align: right;">${fechaPago}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Pie de página -->
                    <div style="
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    ">
                        <p style="margin: 5px 0;"><strong>⚠️ IMPORTANTE:</strong> Guarde este comprobante como respaldo de su inscripción.</p>
                        <p style="margin: 5px 0; font-size: 11px; color: #888;">
                            Código: ${codigoVoucher} | Generado: ${new Date().toLocaleString('es-ES')}
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        pdfContainer.innerHTML = pdfContent;
        document.body.appendChild(pdfContainer);
        
        // Esperar a que el contenido se renderice
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Convertir HTML a canvas
        const canvas = await html2canvas(pdfContainer, {
            scale: 2, // Mejor calidad
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // Crear PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Calcular dimensiones para ajustar al A4
        const imgWidth = 170; // Ancho A4 en mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Añadir imagen al PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 18, -12, imgWidth, imgHeight);
        
        // Guardar PDF
        const fileName = `comprobante-${codigoVoucher.replace('#', '')}.pdf`;
        pdf.save(fileName);
        
        // Limpiar
        document.body.removeChild(pdfContainer);
        showMessage('✅ PDF descargado correctamente', 'success');
        
    } catch (error) {
        console.error('❌ Error generando PDF:', error);
        showMessage('❌ Error al generar el PDF', 'error');
        
        // Fallback: descargar como texto
        generarPDFTexto(pagoData, cursoData, usuarioData, codigoVoucher, fechaPago);
    }
}




    // ============================================================
    // 🔹 Mostrar horario del usuario
    // ============================================================
    async function mostrarHorarioUsuario() {
        seccionMenu.style.display = "none";
        seccionCursos.style.display = "none";
        seccionHorario.style.display = "block";
        btnVolverCursos.style.display = "inline-block";
        tablaHorario.innerHTML = "<tr><td style='color:white; text-align:center;'>Cargando horario...</td></tr>";

        try {
            const { data, error } = await supabase.rpc("sp_horario_semana_actual", {
                p_id_usuario: user.id_usuario
            });

            if (error) throw error;

            if (!data || data.length === 0) {
                tablaHorario.innerHTML = `<tr><td colspan="5" style="color:white; text-align:center;">No tienes cursos activos esta semana.</td></tr>`;
                return;
            }

            tablaHorario.innerHTML = `
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Día</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Modalidad</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(h => `
                        <tr>
                            <td>${h.titulo_curso}</td>
                            <td>${h.dia_semana}</td>
                            <td>${h.hora_inicio}</td>
                            <td>${h.hora_fin}</td>
                            <td>${h.modalidades}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        } catch (err) {
            console.error("❌ Error al cargar horario:", err);
            showMessage("Error al cargar tu horario: " + err.message, "error");
            tablaHorario.innerHTML = `<tr><td colspan="5" style="color:white; text-align:center;">Error al cargar tu horario.</td></tr>`;
        }
    }

    // ============================================================
    // 🔹 EVENTOS BOTONES
    // ============================================================
    btnDisponibles.addEventListener("click", mostrarCursosDisponibles);
    btnHorario.addEventListener("click", mostrarHorarioUsuario);

    if (btnVolverCursos) {
        btnVolverCursos.addEventListener('click', () => {
            console.log("🔍 Botón volver cursos clickeado");
            seccionCursos.style.display = "none";
            seccionHorario.style.display = "none";
            seccionMenu.style.display = "";
            btnVolverCursos.style.display = "none";
        });
    }

    if (btnVolverMenu) {
        btnVolverMenu.addEventListener('click', () => {
            window.location.href = "menu.html";
        });
    }

    if (buscador) {
        buscador.addEventListener("input", () => {
            const filtro = buscador.value.toLowerCase().trim();
            const filas = tablaCursos.querySelectorAll("tbody tr");

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
                    tr.innerHTML = `<td colspan="8" style="color:white; text-align:center;">No se encontraron cursos con ese criterio.</td>`;
                    tablaCursos.querySelector("tbody").appendChild(tr);
                }
            } else if (noResultados) {
                noResultados.remove();
            }
        });
    }

    // ============================================================
    // 🔹 Funciones globales para el voucher
    // ============================================================
    window.cerrarVoucher = function() {
        const modal = document.getElementById('modalVoucher');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
    };

    window.imprimirVoucher = function() {
        const voucherContent = document.querySelector('.voucher-container').cloneNode(true);
        
        // Ocultar botones para impresión
        const buttons = voucherContent.querySelectorAll('.voucher-actions');
        buttons.forEach(btn => btn.style.display = 'none');
        
        // Crear ventana de impresión
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Comprobante de Inscripción - Bash Academy</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px;
                            color: #333;
                        }
                        @media print {
                            @page { margin: 0; }
                            body { margin: 1.6cm; }
                        }
                        .voucher-container {
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            padding: 20px;
                            max-width: 600px;
                            margin: 0 auto;
                        }
                        .voucher-header {
                            background: #f5f5f5;
                            padding: 15px;
                            border-radius: 8px 8px 0 0;
                            text-align: center;
                        }
                        .voucher-body {
                            padding: 20px 0;
                        }
                        .detail-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 8px 0;
                            padding-bottom: 8px;
                            border-bottom: 1px dashed #ddd;
                        }
                        .voucher-note {
                            background: #fff8e1;
                            padding: 10px;
                            border-left: 4px solid #ffc107;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    ${voucherContent.outerHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Agregar CSS para botón de descarga
    const style = document.createElement('style');
    style.textContent = `
        .btn-download {
            background: #6c757d !important;
            color: white !important;
            border: none;
            padding: 12px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .btn-download:hover {
            background: #5a6268 !important;
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    console.log("✅ Cursos.js cargado correctamente - Versión Corregida");
});
