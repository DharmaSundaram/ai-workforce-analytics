import sqlite3
import os

DB_PATH = 'instance/employee_data.db'

def migrate_db():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if project_name column exists in jira_sync_log
        cursor.execute("PRAGMA table_info(jira_sync_log)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'project_name' not in columns:
            cursor.execute("ALTER TABLE jira_sync_log ADD COLUMN project_name VARCHAR(100)")
            print("Added project_name to jira_sync_log")
            
        if 'project_key' not in columns:
            cursor.execute("ALTER TABLE jira_sync_log ADD COLUMN project_key VARCHAR(50)")
            print("Added project_key to jira_sync_log")
            
        conn.commit()
        print("Migration successful.")
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_db()
