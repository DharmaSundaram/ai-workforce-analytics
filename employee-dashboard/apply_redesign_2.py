import os

file_path = "src/pages/Dashboard.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add globalSummary state
state_insertion = """  const [isSyncingJira, setIsSyncingJira] = useState(false);"""
state_replacement = """  const [isSyncingJira, setIsSyncingJira] = useState(false);
  const [globalSummary, setGlobalSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    topPerformers: 0,
    needHelp: 0
  });

  const fetchGlobalSummary = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/summary`);
      const data = await res.json();
      if (data.success) {
        setGlobalSummary({
          totalEmployees: data.totalEmployees,
          activeEmployees: data.activeEmployees,
          topPerformers: data.topPerformers,
          needHelp: data.needHelp
        });
      }
    } catch (err) {
      console.error("Error fetching global summary:", err);
    }
  };"""

if state_insertion in content:
    content = content.replace(state_insertion, state_replacement)
else:
    print("Failed to find state_insertion")

# 2. Call fetchGlobalSummary
fetch_insertion = """  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard-data`);"""
fetch_replacement = """  const loadDashboardData = async () => {
    setLoading(true);
    fetchGlobalSummary();
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard-data`);"""

if fetch_insertion in content:
    content = content.replace(fetch_insertion, fetch_replacement)
else:
    print("Failed to find fetch_insertion")

# 3. Replace Header
header_start = """      {/* ===== HEADER ===== */}
      <Header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        {/* Left Side */}"""
header_end = """          {/* Theme Toggle */}"""

start_idx = content.find(header_start)
end_idx = content.find(header_end, start_idx)

if start_idx != -1 and end_idx != -1:
    new_header = """      {/* ===== HEADER ===== */}
      <Header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        {/* Left Side */}
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="enterprise-brand-container">
            <div className="enterprise-logo">
              <i className="fa-solid fa-microchip" style={{ fontSize: 20, color: "#fff" }} ></i>
            </div>
            <div>
              <div className="enterprise-title">
                AI Workforce Analytics
                <div className="live-status-indicator">
                  <span className={`live-status-dot ${isBackendOnline ? 'online' : 'offline'}`}></span>
                  {isBackendOnline ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="enterprise-subtitle">
                Enterprise Employee Intelligence Platform
              </div>
            </div>
          </div>
        </div>

        {/* Center Side */}
        <div className="header-center-area" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="live-counter-card">
            <div className="counter-label">
              <i className="fa-solid fa-user-group"></i> Total Employees
            </div>
            <div className="counter-value counter-pulse">
              {globalSummary.totalEmployees}
            </div>
          </div>

          {/* Theme Toggle */}"""
    content = content[:start_idx] + new_header + content[end_idx + len(header_end):]
else:
    print("Failed to find header block")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done.")
