from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)  # ¡IMPORTANTE!

load_dotenv()

def get_db_connection():
    try:
        return psycopg2.connect(
            user="postgres.bapoikminyclqxdfxjxc",
            password="melissa123camila123", 
            host="aws-1-us-east-2.pooler.supabase.com",
            port="6543",
            dbname="postgres"
        )
    except Exception as e:
        print(f"Error de conexión: {e}")
        return None

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    correo = data.get('correo')
    contrasena = data.get('contrasena')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Error de conexión a BD'})
    
    try:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT id_usuario, nombre_usuario, apellido FROM usuario WHERE correo = %s AND contrasena = %s;",
            (correo, contrasena)
        )
        usuario = cursor.fetchone()
        
        if usuario:
            return jsonify({
                'success': True,
                'user': {
                    'id': usuario[0],
                    'nombre': usuario[1],
                    'apellido': usuario[2]
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Credenciales incorrectas'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        cursor.close()
        connection.close()

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    nombre = data.get('nombre')
    apellido = data.get('apellido')
    correo = data.get('correo')
    contrasena = data.get('contrasena')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Error de conexión a BD'})
    
    try:
        cursor = connection.cursor()
        
        # Verificar si el correo ya existe
        cursor.execute("SELECT id_usuario FROM usuario WHERE correo = %s;", (correo,))
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'El correo ya está registrado'})
        
        # Insertar nuevo usuario
        cursor.execute("""
            INSERT INTO usuario (nombre_usuario, apellido, correo, contrasena) 
            VALUES (%s, %s, %s, %s) RETURNING id_usuario;
        """, (nombre, apellido, correo, contrasena))
        
        user_id = cursor.fetchone()[0]
        connection.commit()
        
        return jsonify({
            'success': True,
            'message': 'Usuario registrado exitosamente',
            'user_id': user_id
        })
            
    except Exception as e:
        connection.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)