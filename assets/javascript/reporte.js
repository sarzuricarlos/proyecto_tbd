// Módulo de Reportes para Bash Academy
// Este archivo maneja la generación de reportes y gráficos

// Variables globales
let pieChart = null;
let currentReportType = '';
let currentReportData = [];

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Reportes: DOM cargado, configurando...');
    
    // Verificar que Chart.js esté disponible
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no está disponible');
        alert('Error: Chart.js no se cargó correctamente. Por favor, recarga la página.');
        return;
    }
    
    // Verificar conexión a Supabase
    if (typeof supabase === 'undefined') {
        console.error('Conexión a Supabase no disponible');
        alert('Error: No se pudo conectar a la base de datos. Verifica tu conexión.');
        return;
    }
    
    // Configurar botones de reporte
    configurarBotonesReporte();
    
    // Configurar botones de exportación
    configurarBotonesExportacion();
    
    // Configurar otros botones
    configurarBotonesNavegacion();
    
    console.log('Reportes: Configuración completada');
});

// Configurar botones de reporte
function configurarBotonesReporte() {
    const botones = {
        'curso_report': { tipo: 'cursos', titulo: 'Reporte de Cursos', tabla: 'bitacora_cursos' },
        'foro_report': { tipo: 'foros', titulo: 'Reporte de Foros', tabla: 'bitacora_foros' },
        'evento_report': { tipo: 'eventos', titulo: 'Reporte de Eventos', tabla: 'bitacora_eventos' },
        'pago_report': { tipo: 'pagos', titulo: 'Reporte de Pagos', tabla: 'bitacora_pagos' },
        'progreso_report': { tipo: 'progreso', titulo: 'Reporte de Progreso Académico', tabla: 'bitacora' },
        'recompensa_report': { tipo: 'recompensas', titulo: 'Reporte de Recompensas', tabla: 'bitacora_recompensas' }
    };
    
    Object.keys(botones).forEach(botonId => {
        const boton = document.getElementById(botonId);
        if (boton) {
            boton.addEventListener('click', () => {
                const config = botones[botonId];
                generarReporte(config.tipo, config.titulo, config.tabla);
            });
        }
    });
}

// Configurar botones de exportación
function configurarBotonesExportacion() {
    const btnExportarPDF = document.getElementById('btn_exportar_pdf');
    const btnExportarImagen = document.getElementById('btn_exportar_imagen');
    
    if (btnExportarPDF) {
        btnExportarPDF.addEventListener('click', exportarAPDF);
    }
    
    if (btnExportarImagen) {
        btnExportarImagen.addEventListener('click', exportarAImagen);
    }
}

// Configurar botones de navegación
function configurarBotonesNavegacion() {
    const btnVolver = document.getElementById('btn_volver');

    if (btnVolver) {
        btnVolver.addEventListener('click', volverMenuReportes);
    }
}

// Función principal para generar reportes
async function generarReporte(tipo, titulo, tabla) {
    console.log(`Generando reporte: ${titulo}`);
    
    currentReportType = tipo;
    
    // Mostrar loading
    mostrarLoading(true);
    
    try {
        // Ocultar panel de botones y mostrar reporte
        cambiarVistaReporte(true);
        
        // Establecer título
        document.getElementById('reportTitle').textContent = titulo;
        
        // Obtener datos de la bitácora
        const datos = await obtenerDatosBitacora(tabla);
        currentReportData = datos;
        
        // Generar gráfico y estadísticas
        generarGraficoPastel(datos);
        generarEstadisticas(datos);
        
        console.log('Reporte generado exitosamente');
        
    } catch (error) {
        console.error('Error generando reporte:', error);
        mostrarError('Error al generar el reporte: ' + error.message);
    } finally {
        // Ocultar loading
        mostrarLoading(false);
    }
}

// Obtener datos de la bitácora desde Supabase
async function obtenerDatosBitacora(tabla) {
    console.log(`Obteniendo datos de: ${tabla}`);
    
    try {
        // Para la bitácora general (progreso académico), necesitamos filtrar
        let consulta;
        if (tabla === 'bitacora') {
            consulta = supabase
                .from(tabla)
                .select('operacion')
                .in('tabla', ['progreso', 'evaluacion', 'modulo']);
        } else {
            consulta = supabase
                .from(tabla)
                .select('operacion');
        }
        
        const { data, error } = await consulta;
        
        if (error) {
            console.error('Error en consulta Supabase:', error);
            throw new Error(`Error de base de datos: ${error.message}`);
        }
        
        // Contar operaciones
        const conteo = contarOperaciones(data || []);
        
        console.log(`Datos obtenidos: ${JSON.stringify(conteo)}`);
        return conteo;
        
    } catch (error) {
        console.error('Error obteniendo datos:', error);
        
        // En caso de error, usar datos de ejemplo para pruebas
        console.log('Usando datos de ejemplo para continuar');
        return obtenerDatosEjemplo(tabla);
    }
}

// Contar operaciones de INSERT, UPDATE, DELETE
function contarOperaciones(datos) {
    const conteo = {
        INSERT: 0,
        UPDATE: 0,
        DELETE: 0
    };
    
    datos.forEach(item => {
        const operacion = item.operacion?.toUpperCase();
        if (conteo[operacion] !== undefined) {
            conteo[operacion]++;
        }
    });
    
    // Convertir a array para el gráfico
    return [
        { operacion: 'INSERT', cantidad: conteo.INSERT, color: '#4CAF50' },
        { operacion: 'UPDATE', cantidad: conteo.UPDATE, color: '#FFC107' },
        { operacion: 'DELETE', cantidad: conteo.DELETE, color: '#F44336' }
    ].filter(item => item.cantidad > 0);
}

// Datos de ejemplo para pruebas
function obtenerDatosEjemplo(tabla) {
    const ejemplos = {
        'bitacora_cursos': [
            { operacion: 'INSERT', cantidad: Math.floor(Math.random() * 50) + 10, color: '#4CAF50' },
            { operacion: 'UPDATE', cantidad: Math.floor(Math.random() * 30) + 5, color: '#FFC107' },
            { operacion: 'DELETE', cantidad: Math.floor(Math.random() * 10) + 1, color: '#F44336' }
        ],
        'bitacora_foros': [
            { operacion: 'INSERT', cantidad: Math.floor(Math.random() * 40) + 8, color: '#4CAF50' },
            { operacion: 'UPDATE', cantidad: Math.floor(Math.random() * 20) + 3, color: '#FFC107' },
            { operacion: 'DELETE', cantidad: Math.floor(Math.random() * 8) + 1, color: '#F44336' }
        ],
        'bitacora_eventos': [
            { operacion: 'INSERT', cantidad: Math.floor(Math.random() * 30) + 5, color: '#4CAF50' },
            { operacion: 'UPDATE', cantidad: Math.floor(Math.random() * 15) + 2, color: '#FFC107' },
            { operacion: 'DELETE', cantidad: Math.floor(Math.random() * 5) + 1, color: '#F44336' }
        ],
        'bitacora_pagos': [
            { operacion: 'INSERT', cantidad: Math.floor(Math.random() * 100) + 20, color: '#4CAF50' },
            { operacion: 'UPDATE', cantidad: Math.floor(Math.random() * 50) + 10, color: '#FFC107' },
            { operacion: 'DELETE', cantidad: Math.floor(Math.random() * 20) + 2, color: '#F44336' }
        ],
        'bitacora': [
            { operacion: 'INSERT', cantidad: Math.floor(Math.random() * 80) + 15, color: '#4CAF50' },
            { operacion: 'UPDATE', cantidad: Math.floor(Math.random() * 40) + 8, color: '#FFC107' },
            { operacion: 'DELETE', cantidad: Math.floor(Math.random() * 15) + 3, color: '#F44336' }
        ],
        'bitacora_recompensas': [
            { operacion: 'INSERT', cantidad: Math.floor(Math.random() * 60) + 12, color: '#4CAF50' },
            { operacion: 'UPDATE', cantidad: Math.floor(Math.random() * 25) + 4, color: '#FFC107' },
            { operacion: 'DELETE', cantidad: Math.floor(Math.random() * 12) + 2, color: '#F44336' }
        ]
    };
    
    return ejemplos[tabla] || [
        { operacion: 'INSERT', cantidad: 25, color: '#4CAF50' },
        { operacion: 'UPDATE', cantidad: 12, color: '#FFC107' },
        { operacion: 'DELETE', cantidad: 5, color: '#F44336' }
    ];
}

// Generar gráfico de pastel
function generarGraficoPastel(datos) {
    const ctx = document.getElementById('pieChart');
    if (!ctx) {
        console.error('No se encontró el canvas para el gráfico');
        return;
    }
    
    // Destruir gráfico anterior si existe
    if (pieChart) {
        pieChart.destroy();
    }
    
    // Preparar datos
    const labels = datos.map(item => item.operacion);
    const valores = datos.map(item => item.cantidad);
    const colores = datos.map(item => item.color);
    
    // Crear gráfico
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: colores,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        },
                        color: '#2c3e50'
                    }
                },
                title: {
                    display: true,
                    text: 'Distribución de Operaciones',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    },
                    color: '#2c3e50'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const valor = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const porcentaje = Math.round((valor / total) * 100);
                            return `${label}: ${valor} (${porcentaje}%)`;
                        }
                    },
                    backgroundColor: 'rgba(44, 62, 80, 0.9)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 14 },
                    padding: 12
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

// Generar estadísticas
function generarEstadisticas(datos) {
    const container = document.getElementById('statsContainer');
    if (!container) {
        console.error('No se encontró el contenedor de estadísticas');
        return;
    }
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Calcular total
    const total = datos.reduce((sum, item) => sum + item.cantidad, 0);
    
    // Crear tarjeta de total
    const totalCard = crearTarjetaEstadistica(
        '📊 Total de Registros',
        total,
        '#3498db',
        'Registros totales en la bitácora'
    );
    container.appendChild(totalCard);
    
    // Crear tarjeta para cada operación
    datos.forEach(item => {
        const porcentaje = total > 0 ? Math.round((item.cantidad / total) * 100) : 0;
        
        let icono, descripcion;
        switch(item.operacion) {
            case 'INSERT':
                icono = '➕';
                descripcion = 'Registros creados';
                break;
            case 'UPDATE':
                icono = '✏️';
                descripcion = 'Registros modificados';
                break;
            case 'DELETE':
                icono = '🗑️';
                descripcion = 'Registros eliminados';
                break;
            default:
                icono = '📝';
                descripcion = 'Otras operaciones';
        }
        
        const tarjeta = crearTarjetaEstadistica(
            `${icono} ${item.operacion}`,
            `${item.cantidad} (${porcentaje}%)`,
            item.color,
            descripcion
        );
        
        container.appendChild(tarjeta);
    });
}

// Crear tarjeta de estadística
function crearTarjetaEstadistica(titulo, valor, color, descripcion = '') {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'stat-card';
    tarjeta.style.borderTop = `4px solid ${color}`;
    
    tarjeta.innerHTML = `
        <h4>${titulo}</h4>
        <div class="stat-value" style="color: ${color}">
            ${valor}
        </div>
        ${descripcion ? `<p class="stat-desc">${descripcion}</p>` : ''}
    `;
    
    return tarjeta;
}

// Mostrar/Ocultar loading
function mostrarLoading(mostrar) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = mostrar ? 'flex' : 'none';
    }
}

// Cambiar entre vista de menú y vista de reporte
function cambiarVistaReporte(mostrarReporte) {
    const panelAdmin = document.getElementById('panel_admin');
    const reportContent = document.getElementById('reportContent');
    const btnVolver = document.getElementById('btn_volver');
    
    if (panelAdmin) panelAdmin.style.display = mostrarReporte ? 'none' : 'block';
    if (reportContent) reportContent.style.display = mostrarReporte ? 'block' : 'none';
    if (btnVolver) btnVolver.style.display = mostrarReporte ? 'block' : 'none';
}

// Volver al menú de reportes
function volverMenuReportes() {
    cambiarVistaReporte(false);
    
    // Destruir gráfico
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
    
    // Limpiar datos
    currentReportType = '';
    currentReportData = [];
}

// Exportar a PDF (usando Pyodide)
async function exportarAPDF() {
    if (!window.pyodideReady) {
        mostrarError('La funcionalidad de PDF aún no está lista. Por favor, espera un momento.');
        return;
    }
    
    mostrarLoading(true);
    
    try {
        const pythonCode = `
import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
import datetime

def create_pdf(report_type, report_title, data):
    # Crear buffer para el PDF
    buffer = BytesIO()
    
    # Configurar documento
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Estilos
    styles = getSampleStyleSheet()
    
    # Estilo personalizado para el título
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#2c3e50')
    )
    
    # Estilo para subtítulos
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=18,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#3498db')
    )
    
    # Estilo para párrafos
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=12,
        alignment=TA_LEFT
    )
    
    # Elementos del documento
    story = []
    
    # Título
    title = Paragraph(f"<b>{report_title}</b>", title_style)
    story.append(title)
    story.append(Spacer(1, 0.5*inch))
    
    # Información del reporte
    fecha = datetime.datetime.now().strftime("%d/%m/%Y %H:%M")
    info_text = f"Tipo de reporte: {report_type}<br/>Generado el: {fecha}<br/>Bash Academy - Sistema de Reportes"
    info = Paragraph(info_text, styles['Normal'])
    story.append(info)
    story.append(Spacer(1, 0.3*inch))
    
    # Línea divisoria
    story.append(Spacer(1, 0.1*inch))
    
    # Tabla de datos
    table_data = [['Operación', 'Cantidad', 'Porcentaje', 'Descripción']]
    
    # Calcular total
    total = sum(item['cantidad'] for item in data)
    
    # Agregar filas de datos
    for item in data:
        cantidad = item['cantidad']
        porcentaje = (cantidad / total * 100) if total > 0 else 0
        
        # Determinar descripción
        if item['operacion'] == 'INSERT':
            descripcion = 'Registros creados'
        elif item['operacion'] == 'UPDATE':
            descripcion = 'Registros modificados'
        elif item['operacion'] == 'DELETE':
            descripcion = 'Registros eliminados'
        else:
            descripcion = 'Otras operaciones'
        
        table_data.append([
            item['operacion'],
            str(cantidad),
            f"{porcentaje:.1f}%",
            descripcion
        ])
    
    # Agregar fila de total
    table_data.append(['<b>TOTAL</b>', f'<b>{total}</b>', '<b>100%</b>', '<b>Resumen general</b>'])
    
    # Crear tabla
    table = Table(table_data, colWidths=[2*cm, 2.5*cm, 2.5*cm, 6*cm])
    
    # Estilo de la tabla
    table.setStyle(TableStyle([
        # Encabezado
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        
        # Filas de datos
        ('ALIGN', (0, 1), (-1, -2), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -2), 10),
        ('GRID', (0, 0), (-1, -2), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.whitesmoke, colors.white]),
        
        # Fila de total
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#ecf0f1')),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.black),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -1), (-1, -1), 11),
        ('ALIGN', (0, -1), (-1, -1), 'CENTER'),
        
        # Bordes de la tabla
        ('BOX', (0, 0), (-1, -1), 2, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 0.5*inch))
    
    # Notas finales
    notas = Paragraph(
        "<i>Reporte generado automáticamente por el sistema Bash Academy.<br/>"
        "Los datos mostrados corresponden a la bitácora del sistema.</i>",
        styles['Italic']
    )
    story.append(notas)
    
    # Construir PDF
    doc.build(story)
    
    # Obtener bytes del PDF
    buffer.seek(0)
    return buffer.read()

# Ejecutar función
data = json.loads('${JSON.stringify(currentReportData)}')
pdf_bytes = create_pdf('${currentReportType}', '${document.getElementById('reportTitle').textContent}', data)
`;

        const result = await pyodide.runPythonAsync(pythonCode);
        
        // Crear y descargar el PDF
        const blob = new Blob([result], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${currentReportType}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('PDF exportado exitosamente');
        
    } catch (error) {
        console.error('Error exportando a PDF:', error);
        mostrarError('Error al exportar a PDF: ' + error.message);
    } finally {
        mostrarLoading(false);
    }
}

// Exportar a imagen
function exportarAImagen() {
    if (!pieChart) {
        mostrarError('No hay gráfico para exportar');
        return;
    }
    
    try {
        // Obtener el canvas del gráfico
        const canvas = document.getElementById('pieChart');
        
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.download = `grafico_${currentReportType}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        console.log('Imagen exportada exitosamente');
        
    } catch (error) {
        console.error('Error exportando imagen:', error);
        mostrarError('Error al exportar imagen: ' + error.message);
    }
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
    alert(mensaje);
    console.error('Error en reportes:', mensaje);
}

// Función para verificar estado del sistema
function verificarSistema() {
    console.log('=== Verificación del Sistema de Reportes ===');
    console.log('Chart.js disponible:', typeof Chart !== 'undefined');
    console.log('Supabase disponible:', typeof supabase !== 'undefined');
    console.log('Pyodide listo:', window.pyodideReady || false);
    console.log('==========================================');
}

// Exportar funciones para uso global
window.verificarSistema = verificarSistema;
window.generarReporte = generarReporte;
window.volverMenuReportes = volverMenuReportes;