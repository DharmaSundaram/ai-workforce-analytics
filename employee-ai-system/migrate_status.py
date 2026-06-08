import sqlite3

db_path = r"c:\Users\DHARMA\inten_1\employee-ai-system\instance\employee_data.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

try:
    c.execute("ALTER TABLE employee_history ADD COLUMN status VARCHAR(50)")
    print("Added status to employee_history")
except Exception as e:
    print(e)

conn.commit()
conn.close()
