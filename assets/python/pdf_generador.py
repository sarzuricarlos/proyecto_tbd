# pdf_generator.py
import io
import json
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from datetime import datetime

def generar_pdf_desde_json(datos_json, tipo_reporte):
    """
    Función principal que genera PDF desde datos JSON
    """
    try:
        datos = json.loads(datos_json)
        
        print(f"Python: Generando reporte de {tipo_reporte} con {len(datos)} registros")
        
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
                
                # PREPARAR DATOS CON PARAGRAPH PARA SALTO DE LÍNEA
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
                
                # DEFINIR ANCHOS DE COLUMNA
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
                        anchos_columna.append(180)
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
                
                print(f"Anchos de columna: {anchos_columna}")
                
                # CREAR TABLA
                table = Table(
                    table_data, 
                    colWidths=anchos_columna, 
                    repeatRows=1,
                    hAlign='LEFT'
                )
                
                # ESTILO OPTIMIZADO
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E86AB')),
                    ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
                    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
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
        
        return list(pdf_bytes)

    except Exception as e:
        print(f"Python Error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return []

# Función disponible para JavaScript
def main(datos_json, tipo_reporte):
    return generar_pdf_desde_json(datos_json, tipo_reporte)