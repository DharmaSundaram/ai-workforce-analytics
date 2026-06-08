import re

filepath = r"c:\Users\DHARMA\inten_1\employee-dashboard\src\pages\SettingsPage.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add connectedProjects state
content = content.replace(
    'const [jiraToken, setJiraToken] = useState("");\n  const [jiraProjectKey, setJiraProjectKey] = useState("");',
    'const [jiraToken, setJiraToken] = useState("");\n  const [connectedProjects, setConnectedProjects] = useState([]);'
)

# Load settings: remove setJiraProjectKey, add setConnectedProjects
old_load = """          setJiraEmail(s.jira_email || "");
          setJiraToken(s.jira_api_token_masked || "");
          setJiraProjectKey(s.jira_project_key || "");
          setAutoSyncInterval(s.auto_sync_interval || 60);"""
new_load = """          setJiraEmail(s.jira_email || "");
          setJiraToken(s.jira_api_token_masked || "");
          setConnectedProjects(s.connected_projects || []);
          setAutoSyncInterval(s.auto_sync_interval || 60);"""
content = content.replace(old_load, new_load)

# Save settings payload: remove jira_project_key
old_save_payload = """        body: JSON.stringify({
          jira_url: jiraUrl,
          jira_email: jiraEmail,
          jira_api_token: jiraToken,
          jira_project_key: jiraProjectKey,
          auto_sync_interval: autoSyncInterval,
        }),"""
new_save_payload = """        body: JSON.stringify({
          jira_url: jiraUrl,
          jira_email: jiraEmail,
          jira_api_token: jiraToken,
          auto_sync_interval: autoSyncInterval,
        }),"""
content = content.replace(old_save_payload, new_save_payload)

# Test connection payload: remove jira_project_key
old_test_payload = """        body: JSON.stringify({
          jira_url: jiraUrl,
          jira_email: jiraEmail,
          jira_api_token: jiraToken,
          jira_project_key: jiraProjectKey,
        }),"""
new_test_payload = """        body: JSON.stringify({
          jira_url: jiraUrl,
          jira_email: jiraEmail,
          jira_api_token: jiraToken,
        }),"""
content = content.replace(old_test_payload, new_test_payload)

# After test connection success, reload settings to get connected projects
old_test_success = """      if (data.connected) {
        setConnectionStatus("success");
        setConnectionMessage(data.message);
        api.success({ message: "Connected Successfully", description: data.message });
      } else {"""
new_test_success = """      if (data.connected) {
        setConnectionStatus("success");
        setConnectionMessage(data.message);
        api.success({ message: "Connected Successfully", description: data.message });
        loadSettings(); // Reload to fetch discovered projects
      } else {"""
content = content.replace(old_test_success, new_test_success)

# Replace the Project Key UI with Connected Projects UI
old_ui = """                  {/* Project Key */}
                  <Col xs={24} md={12}>
                    <label className="settings-label">
                      <i className="fa-solid fa-diagram-project" style={{ marginRight: 6 }} ></i> Project Key(s)
                    </label>
                    <Input
                      value={jiraProjectKey}
                      onChange={(e) => setJiraProjectKey(e.target.value.toUpperCase())}
                      placeholder="Leave blank to sync all projects"
                      size="large"
                      className="settings-input"
                    />
                    <Text style={{ color: "#64748b", fontSize: 11, marginTop: 4, display: "block" }}>
                      Comma-separated keys (e.g. PROJ, DEV). Leave blank to sync ALL projects.
                    </Text>
                  </Col>"""

new_ui = """                  {/* Connected Projects List */}
                  <Col xs={24} md={24}>
                    <label className="settings-label">
                      <i className="fa-solid fa-diagram-project" style={{ marginRight: 6 }} ></i> Connected Projects
                    </label>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 16, marginTop: 8 }}>
                      {connectedProjects.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                          {connectedProjects.map((p, idx) => (
                            <div key={idx} style={{ padding: 12, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, background: 'rgba(0,0,0,0.2)' }}>
                              <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{p.project_name}</div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>Key: {p.project_key}</div>
                              {p.last_sync && (
                                <div style={{ color: '#10b981', fontSize: 11, marginTop: 6 }}>
                                  <i className="fa-solid fa-check-circle" style={{ marginRight: 4 }}></i>Synced: {p.last_sync_records} records
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Text style={{ color: "#64748b" }}>No projects discovered. Click 'Test Connection' to fetch accessible projects automatically.</Text>
                      )}
                    </div>
                  </Col>"""

content = content.replace(old_ui, new_ui)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated SettingsPage.js successfully.")
