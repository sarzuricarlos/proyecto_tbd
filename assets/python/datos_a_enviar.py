# Insertar datos iniciales
def insert_sample_data(connection, cursor):
    try:
        # Insertar usuario de prueba
        cursor.execute("""
            INSERT INTO usuario (nombre_usuario, apellido, correo, contrasena) 
            VALUES ('Juan', 'Perez', 'juan@email.com', '123456')
            RETURNING id_usuario;
        """)
        user_id = cursor.fetchone()[0]
        
        # Insertar curso de prueba
        cursor.execute("""
            INSERT INTO curso (titulo_curso, descripcion_curso, costo, cupos) 
            VALUES ('Python Básico', 'Curso introductorio de Python', 99.99, 30)
            RETURNING id_curso;
        """)
        curso_id = cursor.fetchone()[0]
        
        connection.commit()
        print(f"✅ Datos de prueba insertados - Usuario ID: {user_id}, Curso ID: {curso_id}")
        
    except Exception as e:
        connection.rollback()
        print(f"❌ Error insertando datos: {e}")