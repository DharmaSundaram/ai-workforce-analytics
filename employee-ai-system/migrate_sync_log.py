import sqlite3

db_path = 'instance/employee_data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute('ALTER TABLE jira_sync_log ADD COLUMN project_name VARCHAR(255);')
    print('Added project_name column.')
except sqlite3.OperationalError as e:
    print('project_name column might already exist:', e)

try:
    cursor.execute('ALTER TABLE jira_sync_log ADD COLUMN project_key VARCHAR(100);')
    print('Added project_key column.')
except sqlite3.OperationalError as e:
    print('project_key column might already exist:', e)

cursor.execute("UPDATE jira_sync_log SET project_name = 'Unknown' WHERE project_name IS NULL;")
cursor.execute("UPDATE jira_sync_log SET project_key = 'Unknown' WHERE project_key IS NULL;")

conn.commit()
conn.close()
