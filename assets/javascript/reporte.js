// reporte.js
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que Pyodide esté listo
    const checkPyodide = setInterval(() => {
        if (window.pyodideReady) {
            clearInterval(checkPyodide);
            initReportes();
        }
    }, 100);
});

function initReportes() {
    // Configurar event listeners para los botones
    document.getElementById('curso_report').addEventListener('click', () => {
        generarReporte('cursos');
    });
    
    document.getElementById('foro_report').addEventListener('click', () => {
        generarReporte('foros');
    });
    
    document.getElementById('evento_report').addEventListener('click', () => {
        generarReporte('eventos');
    });
    
    document.getElementById('pago_report').addEventListener('click', () => {
        generarReporte('pagos');
    });
    
    document.getElementById('progreso_report').addEventListener('click', () => {
        generarReporte('progreso');
    });
    
    document.getElementById('recompensa_report').addEventListener('click', () => {
        generarReporte('recompensas');
    });
}

async function generarReporte(tipoReporte) {
    try {
        mostrarLoading(true);
        
        // 1. Obtener datos de Supabase
        const datos = await obtenerDatosSupabase(tipoReporte);
        
        if (!datos || datos.length === 0) {
            alert('No hay datos disponibles para generar el reporte');
            mostrarLoading(false);
            return;
        }
        
        console.log(`Datos obtenidos para ${tipoReporte}:`, datos);
        
        // 2. Generar PDF con Python
        const pdfBlob = await generarPDFconPython(datos, tipoReporte);
        
        // 3. Descargar PDF
        descargarPDF(pdfBlob, `reporte_${tipoReporte}.pdf`);
        
        mostrarLoading(false);
        mostrarMensaje('✅ Reporte generado exitosamente');
        
    } catch (error) {
        console.error('Error:', error);
        mostrarLoading(false);
        mostrarMensaje('❌ Error al generar el reporte: ' + error.message, 'error');
    }
}

async function obtenerDatosSupabase(tipo) {
    // Mapear tipos a nombres de tabla reales
    const tablaMap = {
        'cursos': 'bitacora_cursos',
        'foros': 'bitacora_foros', 
        'eventos': 'bitacora_eventos',
        'pagos': 'bitacora_pagos',
        'progreso': 'bitacora_progreso',
        'recompensas': 'bitacora_recompensas'
    };
    
    const tabla = tablaMap[tipo] || `bitacora_${tipo}`;
    
    console.log(`Obteniendo datos de la tabla: ${tabla}`);
    
    const { data, error } = await supabase
        .from(tabla)
        .select('*');
    
    if (error) {
        console.error('Error Supabase:', error);
        throw new Error(`Error al obtener datos: ${error.message}`);
    }
    
    console.log(`Datos obtenidos: ${data ? data.length : 0} registros`);
    return data;
}

async function generarPDFconPython(datos, tipoReporte) {
    const datosJSON = JSON.stringify(datos);
    
    const pythonCode = `
import io
import json
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from datetime import datetime
from reportlab.platypus.flowables import KeepInFrame

try:
    datos_json = r'''${datosJSON}'''
    tipo_reporte = '${tipoReporte}'
    datos = json.loads(datos_json)
    
    print(f"Python: Generando reporte con saltos de línea automáticos")
    
    def generar_pdf():
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        elements = []
        
        styles = getSampleStyleSheet()
        
        # Título
        titulos = {
            'cursos': 'Cursos',
            'foros': 'Foros', 
            'eventos': 'Eventos',
            'pagos': 'Pagos',
            'progreso': 'Progreso Académico',
            'recompensas': 'Recompensas'
        }
        
        titulo_texto = f"Reporte de {titulos.get(tipo_reporte, tipo_reporte.capitalize())}"
        title = Paragraph(titulo_texto, styles['Heading1'])
        elements.append(title)
        elements.append(Spacer(1, 12))
        
        # Fecha y resumen
        fecha = Paragraph(f"Generado el: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal'])
        elements.append(fecha)
        resumen = Paragraph(f"Total de registros: {len(datos)}", styles['Normal'])
        elements.append(resumen)
        elements.append(Spacer(1, 20))
        
        if datos and len(datos) > 0:
            # Encabezados de la tabla
            headers = list(datos[0].keys())
            
            # ✅ PREPARAR DATOS CON PARAGRAPH PARA SALTO DE LÍNEA
            table_data = []
            
            # Encabezados como Paragraph
            header_row = []
            for header in headers:
                # Estilo para encabezados
                header_style = styles['Normal']
                header_style.fontName = 'Helvetica-Bold'
                header_style.fontSize = 9
                header_style.textColor = colors.black
                header_style.alignment = 1  # Centrado
                header_para = Paragraph(str(header), header_style)
                header_row.append(header_para)
            table_data.append(header_row)
            
            # Datos como Paragraph para permitir saltos de línea
            for registro in datos:
                row = []
                for campo in headers:
                    valor = registro.get(campo, '')
                    
                    # Crear estilo para celdas de datos
                    cell_style = styles['Normal']
                    cell_style.fontName = 'Helvetica'
                    cell_style.fontSize = 8
                    cell_style.alignment = 0  # Justificado a la izquierda
                    cell_style.leading = 9    # Espacio entre líneas
                    cell_style.wordWrap = 'CJK'  # Forzar saltos de línea
                    
                    # Convertir a Paragraph para saltos automáticos
                    cell_para = Paragraph(str(valor), cell_style)
                    row.append(cell_para)
                table_data.append(row)
            
            # ✅ DEFINIR ANCHOS DE COLUMNA
            num_columnas = len(headers)
            ancho_total = 750
            anchos_columna = []
            
            for i, header in enumerate(headers):
                header_lower = header.lower()
                
                if 'id' in header_lower:
                    anchos_columna.append(65)
                elif 'fecha' in header_lower:
                    anchos_columna.append(90)
                elif any(x in header_lower for x in ['estado', 'activo', 'status', 'tipo']):
                    anchos_columna.append(60)
                elif any(x in header_lower for x in ['precio', 'costo', 'monto', 'cantidad', 'duracion']):
                    anchos_columna.append(70)
                elif any(x in header_lower for x in ['descripcion', 'contenido', 'mensaje', 'comentario', 'temario']):
                    anchos_columna.append(180)  # Más ancho para texto largo
                elif any(x in header_lower for x in ['nombre', 'titulo', 'email']):
                    anchos_columna.append(120)
                elif any(x in header_lower for x in ['usuario', 'autor', 'instructor']):
                    anchos_columna.append(100)
                else:
                    anchos_columna.append(200)
            
            # Ajustar si excede el ancho total
            suma_anchos = sum(anchos_columna)
            if suma_anchos > ancho_total:
                factor_ajuste = ancho_total / suma_anchos
                anchos_columna = [int(ancho * factor_ajuste) for ancho in anchos_columna]
            
            print(f"Anchos de columna para saltos de línea: {anchos_columna}")
            
            # ✅ CREAR TABLA CON ALTURA AUTOMÁTICA
            table = Table(
                table_data, 
                colWidths=anchos_columna, 
                repeatRows=1,
                hAlign='LEFT'
            )
            
            # ✅ ESTILO OPTIMIZADO PARA SALTOS DE LÍNEA
            table.setStyle(TableStyle([
                # Encabezados
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E86AB')),
                ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                
                # Todas las celdas
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),  # Alineación vertical arriba
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                
                # Grid
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
                
                # Fondos alternados para filas
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8F9FA')]),
            ]))
            
            elements.append(table)
        else:
            elements.append(Paragraph("No hay datos disponibles", styles['Normal']))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer
    
    pdf_buffer = generar_pdf()
    pdf_bytes = pdf_buffer.getvalue()
    pdf_list = list(pdf_bytes)

except Exception as e:
    print(f"Python Error: {str(e)}")
    import traceback
    print(f"Traceback: {traceback.format_exc()}")
    pdf_list = []

pdf_list
`;

    console.log("Ejecutando código Python con saltos de línea...");
    
    const pdfBytes = await pyodide.runPythonAsync(pythonCode);
    
    if (!pdfBytes) {
        throw new Error("Python no devolvió datos del PDF");
    }
    
    const pdfArray = pdfBytes.toJs();
    
    if (!pdfArray || pdfArray.length === 0) {
        throw new Error("El PDF generado está vacío");
    }
    
    const pdfUint8Array = new Uint8Array(pdfArray);
    
    console.log("PDF con saltos de línea generado, tamaño:", pdfUint8Array.length, "bytes");
    
    return new Blob([pdfUint8Array], { type: 'application/pdf' });
}

function descargarPDF(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function mostrarLoading(mostrar) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = mostrar ? 'block' : 'none';
    }
}

function mostrarMensaje(mensaje, tipo = 'success') {
    // Crear notificación toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        background: ${tipo === 'success' ? '#28a745' : '#dc3545'};
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-family: Arial, sans-serif;
    `;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Agregar estilos CSS para las animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 2s linear infinite;
        margin: 0 auto 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    #loading {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center;
        z-index: 1000;
        border: 2px solid #2E86AB;
        font-family: Arial, sans-serif;
    }
`;
document.head.appendChild(style);