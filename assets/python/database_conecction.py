import psycopg2
from dotenv import load_dotenv
import os

def setup_connection():
    """Configurar la conexión a la base de datos"""
    load_dotenv()
try:
    connection = psycopg2.connect(
        user="postgres.bapoikminyclqxdfxjxc",
        password="melissa123camila123", 
        host="aws-1-us-east-2.pooler.supabase.com",
        port="6543",
        dbname="postgres"
    )
    print("✅ Connection successful!")
    
    cursor = connection.cursor()
    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()
    print("Current Time:", result)
    
    cursor.close()
    connection.close()
    
except Exception as e:
    print(f"❌ Failed to connect: {e}")

def main():
    # Conectar a la base de datos
    connection = setup_connection()
    if not connection:
        return
    
    cursor = connection.cursor()
    
    try:
        # 🔍 EJEMPLO 1: Consultar todos los cursos
        print("\n📚 Cursos disponibles:")
        cursor.execute("SELECT id_curso, titulo_curso, costo FROM curso;")
        cursos = cursor.fetchall()
        for curso in cursos:
            print(f"  - {curso[1]} (${curso[2]})")
        
        # 🔍 EJEMPLO 2: Consultar usuarios
        print("\n👥 Usuarios registrados:")
        cursor.execute("SELECT id_usuario, nombre_usuario, correo FROM usuario LIMIT 5;")
        usuarios = cursor.fetchall()
        for usuario in usuarios:
            print(f"  - {usuario[1]} ({usuario[2]})")
        
        # 🔍 EJEMPLO 3: Consultar estadísticas
        print("\n📊 Estadísticas del sistema:")
        cursor.execute("SELECT COUNT(*) FROM usuario;")
        total_usuarios = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM curso;")
        total_cursos = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM inscripcion;")
        total_inscripciones = cursor.fetchone()[0]
        
        print(f"  - Usuarios: {total_usuarios}")
        print(f"  - Cursos: {total_cursos}")
        print(f"  - Inscripciones: {total_inscripciones}")
        
        # ➕ EJEMPLO 4: Insertar un nuevo usuario (descomenta para probar)
        """
        create_user(connection, cursor, 
                   "Ana", "Garcia", "ana@email.com", "password123")
        """
        
    except Exception as e:
        print(f"❌ Error en consultas: {e}")
    finally:
        cursor.close()
        connection.close()
        print("\n🔌 Conexión cerrada.")

if __name__ == "__main__":
    main()