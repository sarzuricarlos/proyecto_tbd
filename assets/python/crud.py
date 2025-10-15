# Consultar todos los usuarios
def get_all_users(cursor):
    cursor.execute("SELECT * FROM usuario;")
    return cursor.fetchall()

# Consultar usuario específico
def get_user_by_id(cursor, user_id):
    cursor.execute("SELECT * FROM usuario WHERE id_usuario = %s;", (user_id,))
    return cursor.fetchone()

# Consultar cursos disponibles
def get_available_courses(cursor):
    cursor.execute("SELECT titulo_curso, descripcion_curso, costo FROM curso WHERE cupos > 0;")
    return cursor.fetchall()

# Insertar nuevo usuario
def create_user(connection, cursor, nombre, apellido, correo, contrasena):
    try:
        cursor.execute("""
            INSERT INTO usuario (nombre_usuario, apellido, correo, contrasena, fecha_nacimiento) 
            VALUES (%s, %s, %s, %s, %s);
        """, (nombre, apellido, correo, contrasena, '2000-01-01'))
        connection.commit()
        print("✅ Usuario creado exitosamente")
        return True
    except Exception as e:
        connection.rollback()
        print(f"❌ Error al crear usuario: {e}")
        return False
    
# Actualizar información de usuario
def update_user(connection, cursor, user_id, nuevo_nombre, nuevo_correo):
    try:
        cursor.execute("""
            UPDATE usuario 
            SET nombre_usuario = %s, correo = %s 
            WHERE id_usuario = %s;
        """, (nuevo_nombre, nuevo_correo, user_id))
        connection.commit()
        print("✅ Usuario actualizado exitosamente")
        return True
    except Exception as e:
        connection.rollback()
        print(f"❌ Error al actualizar usuario: {e}")
        return False
    
# Eliminar usuario
def delete_user(connection, cursor, user_id):
    try:
        cursor.execute("DELETE FROM usuario WHERE id_usuario = %s;", (user_id,))
        connection.commit()
        print("✅ Usuario eliminado exitosamente")
        return True
    except Exception as e:
        connection.rollback()
        print(f"❌ Error al eliminar usuario: {e}")
        return False
    
# Consultar inscripciones de un usuario
def get_user_enrollments(cursor, user_id):
    cursor.execute("""
        SELECT c.titulo_curso, i.fecha_inscripcion, i.estado_inscripcion
        FROM inscripcion i
        JOIN curso c ON i.id_curso = c.id_curso
        WHERE i.id_usuario = %s;
    """, (user_id,))
    return cursor.fetchall()

# Consultar foros y comentarios
def get_forum_with_comments(cursor, forum_id):
    cursor.execute("""
        SELECT f.titulo_foro, c.contenido, u.nombre_usuario, c.fecha_comentario
        FROM foro f
        LEFT JOIN comentario c ON f.id_foro = c.id_foro
        LEFT JOIN usuario u ON c.id_usuario = u.id_usuario
        WHERE f.id_foro = %s
        ORDER BY c.fecha_comentario DESC;
    """, (forum_id,))
    return cursor.fetchall()

# Consultar progreso de un usuario en módulos
def get_user_progress(cursor, user_id):
    cursor.execute("""
        SELECT m.materias, pm.porcentaje_progr_modulo, pm.estado_modulo
        FROM progreso_modulo pm
        JOIN modulos m ON pm.id_modulo = m.id_modulo
        JOIN inscripcion i ON m.id_curso = i.id_curso
        WHERE i.id_usuario = %s;
    """, (user_id,))
    return cursor.fetchall()