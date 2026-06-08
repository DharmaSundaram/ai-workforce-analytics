import os
import sqlite3


DB_PATH = os.path.join("instance", "employee_data.db")


def list_tables(db_path=DB_PATH):
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print("Tables in database:")
        for table in tables:
            print(table[0])
    finally:
        conn.close()


if __name__ == "__main__":
    list_tables()

