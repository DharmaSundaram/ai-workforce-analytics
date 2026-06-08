import os
import sqlite3


DB_PATH = os.path.join("instance", "employee_data.db")

EMPLOYEE_HISTORY_COLUMNS = {
    "project_id": "VARCHAR(100)",
    "project_key": "VARCHAR(100)",
    "project_name": "VARCHAR(255)",
    "department": "VARCHAR(100)",
    "status": "VARCHAR(50)",
}

JIRA_SYNC_LOG_COLUMNS = {
    "project_name": "VARCHAR(255)",
    "project_key": "VARCHAR(100)",
}


def add_missing_columns(cursor, table_name, columns):
    cursor.execute(f"PRAGMA table_info({table_name})")
    existing = {row[1] for row in cursor.fetchall()}

    for column_name, data_type in columns.items():
        if column_name not in existing:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {data_type}")
            print(f"Added {column_name} to {table_name}")


def run_migrations(db_path=DB_PATH):
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()
        add_missing_columns(cursor, "employee_history", EMPLOYEE_HISTORY_COLUMNS)
        add_missing_columns(cursor, "jira_sync_log", JIRA_SYNC_LOG_COLUMNS)
        cursor.execute("UPDATE jira_sync_log SET project_name = 'Unknown' WHERE project_name IS NULL")
        cursor.execute("UPDATE jira_sync_log SET project_key = 'Unknown' WHERE project_key IS NULL")
        conn.commit()
        print("Enterprise migrations completed.")
    finally:
        conn.close()


if __name__ == "__main__":
    run_migrations()

