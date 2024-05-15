from flask import Flask, jsonify, request
import sqlite3
from flask_cors import CORS

CORS(app)
app = Flask(__name__)

@app.route('/data')
def get_data():
    number = request.args.get('number', default=0, type=int)  # Get 'number' from query parameters
    schema = "date, leave_days, colour"  # Define the schema for extraction
    try:
        conn = sqlite3.connect('holiday&dates_db')
        c = conn.cursor()
        c.execute(f"SELECT {schema} FROM leave_days_za WHERE leave_days = {number}")
        data = c.fetchall()
        conn.close()
        
        results = []
        for row in data:
        # Assume description is not provided by the database
            results.append({
                "date": row[0],  # Send as 'YYYY-MM-DD'
                "total_leave": row[1],
                "colour": row[2],
            })
        
        if results:
            return jsonify(results)
        else:
            return jsonify({'result': 'No data found'})
    except sqlite3.DatabaseError as e:
        return jsonify({'error': str(e)}), 500  # Send a 500 Internal Server Error response

if __name__ == '__main__':
    app.run(debug=True)