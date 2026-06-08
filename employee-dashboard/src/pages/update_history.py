import re

filepath = r"c:\Users\DHARMA\inten_1\employee-dashboard\src\pages\EmployeeHistoryPage.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the Jira Sync Logs item rendering
old_log_content = """                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>
                        {log.total_records} records synced
                      </div>
                      <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                        <i className="fa-solid fa-calendar" style={{ marginRight: 4 }} ></i>
                        {log.sync_time}
                        {log.duration_seconds > 0 && (
                          <span style={{ marginLeft: 8 }}>
                            <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i>
                            {log.duration_seconds}s
                          </span>
                        )}
                      </div>"""

new_log_content = """                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>
                        {log.project_name || "All Projects"} <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>({log.project_key || "-"})</span>
                      </div>
                      <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
                        <i className="fa-solid fa-file-lines" style={{ marginRight: 4 }} ></i>
                        {log.total_records} records synced
                      </div>
                      <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 2 }}>
                        <i className="fa-solid fa-calendar" style={{ marginRight: 4 }} ></i>
                        {log.sync_time}
                        {log.duration_seconds > 0 && (
                          <span style={{ marginLeft: 8 }}>
                            <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i>
                            {log.duration_seconds}s
                          </span>
                        )}
                      </div>"""

content = content.replace(old_log_content, new_log_content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated EmployeeHistoryPage.js successfully.")
