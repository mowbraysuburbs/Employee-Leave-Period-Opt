from flask import Flask, jsonify, request
import sqlite3


schema = "date, leave_days, colour"  # Define the schema for extraction
# try:
#     number = 2
#     conn = sqlite3.connect('holiday&dates_db')
#     c = conn.cursor()
#     c.execute(f"SELECT {schema} FROM leave_days_za WHERE leave_days = {number}")
#     data = c.fetchall()
#     conn.close()
    
#     # Convert rows to a list of dicts to jsonify properly
#     results = [dict(row) for row in data]
    
# #     if results:
# #         return jsonify(results)
# #     else:
# #         return jsonify({'result': 'No data found'})
# except sqlite3.DatabaseError as e:
#      jsonify({'error': str(e)}), 500  # Send a 500 Internal Server Error response

number = 2
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



# Convert rows to a list of dicts to jsonify properly
# results = [dict(row) for row in data]
print(results)