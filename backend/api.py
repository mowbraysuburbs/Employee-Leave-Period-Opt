from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)

@app.route('/data')
def get_data():
    number = request.args.get('number', default=0, type=int)  # Get 'number' from query parameters
    # Map numbers to specific column names
    selected_column = f"leave_days_{number}"

    conn = sqlite3.connect('holiday&dates_db')  # Adjust the DB path/name accordingly
    cursor = conn.cursor()
    cursor.execute(f"SELECT date, {selected_column} FROM leave_days")
    data = cursor.fetchall()
    if data:
        return jsonify(data)
    else:
        return jsonify({'result': 'No data found'})

if __name__ == '__main__':
    app.run(debug=True)
