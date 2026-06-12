import re

with open('c:/Users/DHARMA/inten_1/employee-dashboard/src/pages/Dashboard.js', 'r', encoding='utf-8') as f:
    dash_content = f.read()

header_regex = re.compile(r'\{\/\* ===== HEADER ===== \*\/\}.*?<\/Header>', re.DOTALL)
new_header = """{/* ===== HEADER ===== */}
      <Header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
        {/* Left Side: Modernized Branding */}
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="enterprise-logo-container">
            <i className="fa-solid fa-robot" style={{ fontSize: 22, color: "#60a5fa" }}></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="text-gradient-primary" style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.2 }}>
                AI Workforce Analytics
              </div>
              {/* Online Status Indicator */}
              <div className={`status-indicator ${isSyncingJira ? 'syncing' : jiraSyncStatus.last_status === 'error' ? 'error' : 'online'}`} title={isSyncingJira ? 'Syncing...' : jiraSyncStatus.last_status === 'error' ? 'Disconnected' : 'Online'}>
                <span className="status-dot"></span>
                <span className="status-text">{isSyncingJira ? 'Syncing' : jiraSyncStatus.last_status === 'error' ? 'Offline' : 'Online'}</span>
              </div>
            </div>
            <div className="header-subtitle-enterprise" style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Enterprise Employee Intelligence Platform
            </div>
          </div>
        </div>

        {/* Center Side: Live Counters */}
        <div className="header-center" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="live-counter-card">
            <div className="live-counter-label">
              <i className="fa-solid fa-user-group"></i> <span className="hidden-mobile">Total Employees</span>
            </div>
            <div className="live-counter-value" key={totalEmployees}>
              {totalEmployees}
            </div>
          </div>
          
          <div className="theme-toggle-wrap">
            <Switch
              checked={theme === "light"}
              onChange={toggleTheme}
              checkedChildren={<i className="fa-solid fa-circle"></i>}
              unCheckedChildren={<i className="fa-solid fa-lightbulb"></i>}
              className="theme-switch"
            />
          </div>
        </div>

        {/* Right Side: Notification & Profile */}
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <NotificationBell />
          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <i className="fa-solid fa-user"></i>, label: 'Profile', onClick: () => navigate('/profile') },
                { key: 'history', icon: <i className="fa-solid fa-clock-rotate-left"></i>, label: 'History', onClick: () => navigate('/history') },
                { key: 'settings', icon: <i className="fa-solid fa-gear"></i>, label: 'Settings', onClick: () => navigate('/settings') },
                { key: 'audit', icon: <i className="fa-solid fa-shield-halved"></i>, label: 'Audit', onClick: () => navigate('/audit-logs') },
                { key: 'analytics', icon: <i className="fa-solid fa-chart-pie"></i>, label: 'Analytics', onClick: () => navigate('/analytics') },
                { key: 'reports', label: <ExecutiveReportButton asMenuItem={true} /> },
                { type: 'divider' },
                { key: 'logout', icon: <i className="fa-solid fa-right-from-bracket"></i>, label: 'Logout', onClick: handleLogout, danger: true },
              ]
            }}
            placement="bottomRight"
            trigger={['click']}
            overlayClassName="enterprise-dropdown"
          >
            <Avatar size={40} style={{ backgroundColor: '#2563eb', cursor: 'pointer', border: '2px solid rgba(147, 197, 253, 0.5)' }}>
              <i className="fa-solid fa-user"></i>
            </Avatar>
          </Dropdown>
        </div>
      </Header>"""

dash_content = header_regex.sub(new_header, dash_content)

jira_regex = re.compile(r'\{\/\* ===== JIRA SYNC STATUS ===== \*\/\}.*?<\/Card>', re.DOTALL)
new_jira = """{/* ===== JIRA SYNC STATUS ===== */}
        <Card className="compact-sync-bar glass-card" bordered={false} style={{ marginBottom: 28, padding: '12px 24px', background: 'linear-gradient(135deg, rgba(15, 31, 61, 0.8) 0%, rgba(26, 52, 96, 0.8) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
              <div className="sync-bar-item">
                <span className="sync-bar-label">Jira Status:</span>
                <span style={{ color: isSyncingJira ? '#f59e0b' : jiraSyncStatus.last_status === 'success' ? '#10b981' : jiraSyncStatus.last_status === 'error' ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>
                  <i className="fa-solid fa-circle" style={{ fontSize: 10, marginRight: 6 }}></i>
                  {isSyncingJira ? 'Syncing...' : jiraSyncStatus.last_status === 'success' ? 'Connected' : jiraSyncStatus.last_status === 'error' ? 'Error' : 'Idle'}
                </span>
              </div>
              <div className="sync-bar-item">
                <span className="sync-bar-label">Last Sync:</span>
                <span className="sync-bar-value">{jiraSyncStatus.last_sync || 'Never'}</span>
              </div>
              <div className="sync-bar-item">
                <span className="sync-bar-label">Next Sync:</span>
                <span className="sync-bar-value">{jiraSyncStatus.next_sync || 'Not scheduled'}</span>
              </div>
              <div className="sync-bar-item">
                <span className="sync-bar-label">Records Synced:</span>
                <span className="sync-bar-value">{jiraSyncStatus.last_records || 0}</span>
              </div>
            </div>
            <Button
              icon={<i className="fa-solid fa-arrows-rotate"></i>}
              onClick={handleJiraSync}
              loading={isSyncingJira}
              type="primary"
              className="sync-now-btn"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
              }}
            >
              {isSyncingJira ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </Card>"""

dash_content = jira_regex.sub(new_jira, dash_content)

with open('c:/Users/DHARMA/inten_1/employee-dashboard/src/pages/Dashboard.js', 'w', encoding='utf-8') as f:
    f.write(dash_content)


css_addition = """

/* --- Enterprise Modernization CSS --- */

.enterprise-logo-container {
  width: 44px;
  height: 44px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(96, 165, 250, 0.2);
}

.text-gradient-primary {
  background: linear-gradient(to right, #60a5fa, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Status Indicator */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-indicator.online .status-dot {
  background-color: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.status-indicator.syncing .status-dot {
  background-color: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
  animation: pulse-orange 1.5s infinite;
}

.status-indicator.error .status-dot {
  background-color: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

.status-text {
  font-size: 11px;
  font-weight: 600;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@keyframes pulse-orange {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

/* Live Counter Card */
.live-counter-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.live-counter-card:hover {
  transform: translateY(-2px);
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(96, 165, 250, 0.4);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.live-counter-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.live-counter-label i {
  color: #60a5fa;
}

.live-counter-value {
  font-size: 18px;
  font-weight: 800;
  color: #f8fafc;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Sync Bar */
.sync-bar-label {
  color: #94a3b8;
  font-size: 13px;
  margin-right: 8px;
}

.sync-bar-value {
  color: #f8fafc;
  font-weight: 500;
}

.sync-now-btn:hover {
  box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.6) !important;
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .header-subtitle-enterprise {
    display: none;
  }
  .live-counter-card {
    padding: 4px 10px;
  }
  .live-counter-label {
    font-size: 11px;
  }
  .live-counter-value {
    font-size: 16px;
  }
  .status-text {
    display: none;
  }
}
@media (max-width: 768px) {
  .hidden-mobile { display: none; }
  .header-brand .text-gradient-primary {
    font-size: 16px !important;
  }
}
"""

with open('c:/Users/DHARMA/inten_1/employee-dashboard/src/App.css', 'a', encoding='utf-8') as f:
    f.write(css_addition)

print("Modernization applied.")
