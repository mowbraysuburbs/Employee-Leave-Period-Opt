from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)

@app.route('/data')
def get_data():
    number = request.args.get('number', default=0, type=int)  # Get 'number' from query parameters
    conn = sqlite3.connect('mydatabase.db')
    cursor = conn.cursor()
    cursor.execute("SELECT some_column FROM data_table WHERE condition_column = ?", (number,))
    data = cursor.fetchone()  # Or fetchall() if you expect multiple rows
    cursor.close()
    conn.close()
    if data:
        return jsonify({'result': data[0]})
    else:
        return jsonify({'result': 'No data found'})

if __name__ == '__main__':
    app.run(debug=True)
