from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('kanban.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    conn = get_db_connection()
    tasks = conn.execute('SELECT * FROM tasks').fetchall()
    conn.close()
    return jsonify([dict(row) for row in tasks])

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)',
        (data['title'], data['description'], data['status'], data['priority'])
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE tasks SET title=?, description=?, status=?, priority=? WHERE id=?',
        (data['title'], data['description'], data['status'], data['priority'], id)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM tasks WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
