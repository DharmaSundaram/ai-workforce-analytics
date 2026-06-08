import sqlite3
import os

db_path = r"c:\Users\DHARMA\inten_1\employee-ai-system\instance\employee_data.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

def add_column(table, column, data_type):
    try:
        c.execute(f"ALTER TABLE {table} ADD COLUMN {column} {data_type}")
        print(f"Added {column} to {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"Column {column} already exists in {table}")
        else:
            print(f"Error adding {column} to {table}: {e}")

add_column("employee_history", "project_id", "VARCHAR(100)")
add_column("employee_history", "project_key", "VARCHAR(100)")
add_column("employee_history", "project_name", "VARCHAR(255)")
add_column("employee_history", "department", "VARCHAR(100)")

conn.commit()
conn.close()
print("Done.")
