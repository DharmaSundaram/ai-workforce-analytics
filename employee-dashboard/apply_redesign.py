import os

file_path = "src/pages/Dashboard.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Insert userMenuItems
insertion_point = """    setTimeout(() => navigate("/login"), 300);
  };

  const handleJiraSync = async () => {"""

replacement_1 = """    setTimeout(() => navigate("/login"), 300);
  };

  const userMenuItems = {
    items: [
      { key: 'profile', icon: <i className="fa-solid fa-user aether-menu-icon"></i>, label: 'Profile', onClick: () => navigate('/profile') },
      { key: 'history', icon: <i className="fa-solid fa-clock-rotate-left aether-menu-icon"></i>, label: 'History', onClick: () => navigate('/history') },
      { key: 'settings', icon: <i className="fa-solid fa-gear aether-menu-icon"></i>, label: 'Settings', onClick: () => navigate('/settings') },
      { key: 'audit', icon: <i className="fa-solid fa-shield-halved aether-menu-icon"></i>, label: 'Audit', onClick: () => navigate('/audit-logs') },
      { key: 'analytics', icon: <i className="fa-solid fa-chart-pie aether-menu-icon"></i>, label: 'Analytics', onClick: () => navigate('/analytics') },
      { key: 'reports', icon: <i className="fa-solid fa-file-signature aether-menu-icon"></i>, label: 'Reports', onClick: handleExportPDF },
      { type: 'divider' },
      { key: 'logout', danger: true, icon: <i className="fa-solid fa-right-from-bracket aether-menu-icon"></i>, label: 'Logout', onClick: handleLogout },
    ],
  };

  const handleJiraSync = async () => {"""

if insertion_point in content:
    content = content.replace(insertion_point, replacement_1)
else:
    print("Failed to find insertion point 1")

# 2. Replace Header
header_start = """      {/* ===== HEADER ===== */}
      <Header className="app-header">"""
header_end = """          </Button>
        </div>
      </Header>"""

start_idx = content.find(header_start)
end_idx = content.find(header_end, start_idx)

if start_idx != -1 and end_idx != -1:
    end_idx += len(header_end)
    new_header = """      {/* ===== HEADER ===== */}
      <Header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        {/* Left Side */}
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="header-logo-icon">
            <i className="fa-solid fa-chart-line" style={{ fontSize: 20, color: "#fff" }} ></i>
          </div>
          <div>
            <div className="header-title">AI Workforce Analytics</div>
            <div className="header-subtitle">
              Real-time ML-powered employee intelligence dashboard
            </div>
          </div>
        </div>

        {/* Center Side */}
        <div className="header-center-area" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Badge
            count={totalEmployees}
            showZero
            style={{ backgroundColor: "#2563eb" }}
            overflowCount={9999}
          >
            <Tag
              style={{
                background: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.35)",
                color: "#93c5fd",
                borderRadius: 8,
                padding: "4px 12px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <i className="fa-solid fa-user-group" style={{ marginRight: 6 }} ></i>
              Total Employees
            </Tag>
          </Badge>

          {/* Theme Toggle */}
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

        {/* Right Side */}
        <div className="header-right-area" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <NotificationBell />
          
          <Dropdown menu={userMenuItems} trigger={['click']} placement="bottomRight" overlayClassName="aether-dropdown-menu">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 10, transition: 'background 0.2s' }} className="aether-avatar-wrapper">
              <Avatar
                size={36}
                style={{
                  background: 'linear-gradient(135deg, #00E5FF, #4F8CFF)',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
                }}
              >
                A
              </Avatar>
              <i className="fa-solid fa-chevron-down" style={{ color: "var(--text-muted)", fontSize: 12 }}></i>
            </div>
          </Dropdown>
        </div>
      </Header>"""
    content = content[:start_idx] + new_header + content[end_idx:]
else:
    print("Failed to find header block")

# 3. Replace Jira Sync
sync_start = """        {/* ===== JIRA SYNC STATUS ===== */}
        <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>"""
sync_end = """            </Card>
          </Col>
        </Row>"""

s_idx = content.find(sync_start)
e_idx = content.find(sync_end, s_idx)

if s_idx != -1 and e_idx != -1:
    e_idx += len(sync_end)
    new_sync = """        {/* ===== COMPACT JIRA SYNC BAR ===== */}
        <div className="jira-sync-bar">
          <div className="jira-sync-info">
            <div className="sync-item">
              <span className={`sync-indicator ${isSyncingJira ? 'syncing' : jiraSyncStatus.last_status === 'success' ? 'connected' : jiraSyncStatus.last_status === 'error' ? 'error' : 'error'}`}></span>
              Jira Status: {isSyncingJira ? 'Syncing...' : jiraSyncStatus.last_status === 'success' ? 'Connected' : jiraSyncStatus.last_status === 'error' ? 'Error' : 'Idle'}
            </div>
            <div className="sync-item">
              <i className="fa-solid fa-clock"></i>
              Last Sync: {jiraSyncStatus.last_sync || 'Never'}
            </div>
            <div className="sync-item">
              <i className="fa-solid fa-calendar-check"></i>
              Next Sync: {jiraSyncStatus.next_sync || 'Not scheduled'}
            </div>
            <div className="sync-item">
              <i className="fa-solid fa-database"></i>
              Records: {jiraSyncStatus.last_records || 0}
            </div>
          </div>
          <Button
            type="primary"
            onClick={handleJiraSync}
            loading={isSyncingJira}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            {isSyncingJira ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>"""
    content = content[:s_idx] + new_sync + content[e_idx:]
else:
    print("Failed to find sync block")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done.")
