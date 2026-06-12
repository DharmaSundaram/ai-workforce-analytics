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

if state_insertion in content and "const [globalSummary" not in content:
    content = content.replace(state_insertion, state_replacement)
else:
    print("Failed to find state_insertion or already exists")

# 2. Replace Header
header_start = """      {/* ===== HEADER ===== */}
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

          {/* Theme Toggle */}"""

header_replacement = """      {/* ===== HEADER ===== */}
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

if header_start in content:
    content = content.replace(header_start, header_replacement)
else:
    print("Failed to find header_start")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done.")
