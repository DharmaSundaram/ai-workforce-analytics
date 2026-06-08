import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Row,
  Col,
  Input,
  Button,
  notification,
  Spin,
  Select,
  Tag,
  Typography,
  Switch,
  Divider,
  Tabs,
} from "antd";


const { Header, Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const BACKEND_URL = "http://127.0.0.1:5000";

function SettingsPage() {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const { colorTheme, setColorTheme, colorThemes, fontFamily, setFontFamily, fontOptions, glassEnabled, setGlassEnabled, animationsEnabled, setAnimationsEnabled, particlesEnabled, setParticlesEnabled, theme, toggleTheme } = useTheme();

  // Form state
  const [jiraUrl, setJiraUrl] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [connectedProjects, setConnectedProjects] = useState([]);
  const [autoSyncInterval, setAutoSyncInterval] = useState(60);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null | 'success' | 'error'
  const [connectionMessage, setConnectionMessage] = useState("");
  const [settingsSource, setSettingsSource] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load settings on mount
  const loadSettings = useCallback(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          const s = data.settings;
          setJiraUrl(s.jira_url || "");
          setJiraEmail(s.jira_email || "");
          setJiraToken(s.jira_api_token_masked || "");
          setConnectedProjects(s.connected_projects || []);
          setAutoSyncInterval(s.auto_sync_interval || 60);
          setSettingsSource(s.source || "");
          setLastUpdated(s.updated_at || null);
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        api.error({ message: "Failed to load settings", description: err.message });
      })
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save settings
  const handleSave = async () => {
    if (!jiraUrl.trim()) {
      api.warning({ message: "Jira URL is required" });
      return;
    }
    if (!jiraEmail.trim()) {
      api.warning({ message: "Jira Email is required" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jira_url: jiraUrl,
          jira_email: jiraEmail,
          jira_api_token: jiraToken,
          auto_sync_interval: autoSyncInterval,
        }),
      });
      const data = await res.json();
      if (data.success) {
        api.success({ message: "Settings Saved", description: "Jira configuration saved successfully." });
        loadSettings(); // Reload to get masked token
      } else {
        api.error({ message: "Save Failed", description: data.error || "Unknown error" });
      }
    } catch (err) {
      api.error({ message: "Save Failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);
    setConnectionMessage("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/test-jira-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jira_url: jiraUrl,
          jira_email: jiraEmail,
          jira_api_token: jiraToken,
        }),
      });
      const data = await res.json();

      if (data.connected) {
        setConnectionStatus("success");
        setConnectionMessage(data.message);
        api.success({ message: "Connected Successfully", description: data.message });
        loadSettings(); // Reload to fetch discovered projects
      } else {
        setConnectionStatus("error");
        setConnectionMessage(data.message);
        api.error({ message: "Connection Failed", description: data.message });
      }
    } catch (err) {
      setConnectionStatus("error");
      setConnectionMessage(err.message);
      api.error({ message: "Connection Error", description: err.message });
    } finally {
      setTesting(false);
    }
  };

  // Sync Now
  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings/sync-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success) {
        api.success({
          message: "Jira Sync Complete",
          description: `${data.synced_records || 0} records synced successfully.`,
        });
      } else {
        api.error({
          message: "Sync Failed",
          description: data.error || "Unknown error",
        });
      }
    } catch (err) {
      api.error({ message: "Sync Error", description: err.message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Layout className="app-layout">
      {contextHolder}

      <Header className="app-header">
        <div className="header-left">
          <Button
            icon={<i className="fa-solid fa-circle"></i>}
            onClick={() => navigate("/dashboard")}
            className="header-nav-btn"
          >
            Dashboard
          </Button>
          <i className="fa-solid fa-gear" style={{ fontSize: 22, color: "#8b5cf6", marginLeft: 16 }} ></i>
          <span className="header-title" style={{ marginLeft: 10 }}>Settings</span>
        </div>
      </Header>

      <Content className="app-content">
        <Spin spinning={loading} tip="Loading settings...">

          <Card className="glass-card settings-card" bordered={false} style={{ minHeight: '600px' }}>
            <Tabs defaultActiveKey="1" className="enterprise-settings-tabs">
              {/* TAB 1: JIRA INTEGRATION */}
              <Tabs.TabPane tab={<span><i className="fa-solid fa-circle"></i> Jira Integration</span>} key="1">
                <div className="settings-section-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <i className="fa-solid fa-circle" style={{ fontSize: 24, color: "#8b5cf6" }} ></i>
                    <Title level={4} style={{ margin: 0, color: "#e2e8f0" }}>
                      Jira Integration Settings
                    </Title>
                    {settingsSource && (
                      <Tag color={settingsSource === "database" ? "purple" : "orange"} style={{ marginLeft: 8 }}>
                        {settingsSource === "database" ? "Saved in Database" : "Using .env Fallback"}
                      </Tag>
                    )}
                  </div>
                  {lastUpdated && (
                    <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                      <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i>
                      Last updated: {new Date(lastUpdated).toLocaleString()}
                    </Text>
                  )}
                </div>

                <Row gutter={[24, 20]}>
                  {/* Jira URL */}
                  <Col xs={24} md={12}>
                    <label className="settings-label">
                      <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i> Jira URL
                    </label>
                    <Input
                      value={jiraUrl}
                      onChange={(e) => setJiraUrl(e.target.value)}
                      placeholder="https://your-domain.atlassian.net"
                      size="large"
                      className="settings-input"
                    />
                  </Col>

                  {/* Jira Email */}
                  <Col xs={24} md={12}>
                    <label className="settings-label">
                      <i className="fa-solid fa-envelope" style={{ marginRight: 6 }} ></i> Jira Email
                    </label>
                    <Input
                      value={jiraEmail}
                      onChange={(e) => setJiraEmail(e.target.value)}
                      placeholder="your-email@example.com"
                      size="large"
                      className="settings-input"
                    />
                  </Col>

                  {/* API Token */}
                  <Col xs={24} md={12}>
                    <label className="settings-label">
                      <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i> API Token
                    </label>
                    <Input.Password
                      value={jiraToken}
                      onChange={(e) => setJiraToken(e.target.value)}
                      placeholder="Enter your Jira API token"
                      size="large"
                      className="settings-input"
                    />
                    <Text style={{ color: "#64748b", fontSize: 11, marginTop: 4, display: "block" }}>
                      Generate from: Atlassian Account → Security → API Tokens
                    </Text>
                  </Col>

                  {/* Connected Projects List */}
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
                  </Col>

                  {/* Auto Sync Interval */}
                  <Col xs={24} md={12}>
                    <label className="settings-label">
                      <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i> Auto Sync Interval
                    </label>
                    <Select
                      value={autoSyncInterval}
                      onChange={(val) => setAutoSyncInterval(val)}
                      size="large"
                      style={{ width: "100%" }}
                      className="settings-select"
                    >
                      <Option value={15}>Every 15 minutes</Option>
                      <Option value={30}>Every 30 minutes</Option>
                      <Option value={60}>Every 1 hour</Option>
                      <Option value={120}>Every 2 hours</Option>
                      <Option value={360}>Every 6 hours</Option>
                      <Option value={720}>Every 12 hours</Option>
                      <Option value={1440}>Every 24 hours</Option>
                    </Select>
                  </Col>

                  {/* Connection Status */}
                  <Col xs={24} md={12}>
                    <label className="settings-label">Connection Status</label>
                    <div className="connection-status-box">
                      {connectionStatus === "success" && (
                        <div className="connection-result success">
                          <i className="fa-solid fa-circle-check" style={{ fontSize: 18, color: "#10b981" }} ></i>
                          <span>{connectionMessage}</span>
                        </div>
                      )}
                      {connectionStatus === "error" && (
                        <div className="connection-result error">
                          <i className="fa-solid fa-circle-xmark" style={{ fontSize: 18, color: "#ef4444" }} ></i>
                          <span>{connectionMessage}</span>
                        </div>
                      )}
                      {!connectionStatus && (
                        <div className="connection-result idle">
                          <span style={{ color: "#64748b" }}>Click "Test Connection" to verify</span>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Action Buttons */}
                <div className="settings-actions" style={{ marginTop: 24 }}>
                  <Button
                    icon={<i className="fa-solid fa-circle"></i>}
                    onClick={handleTestConnection}
                    loading={testing}
                    size="large"
                    className="settings-btn test-btn"
                  >
                    {testing ? "Testing..." : "Test Connection"}
                  </Button>

                  <Button
                    icon={<i className="fa-solid fa-circle"></i>}
                    onClick={handleSave}
                    loading={saving}
                    type="primary"
                    size="large"
                    className="settings-btn save-btn"
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>

                  <Button
                    icon={<i className="fa-solid fa-arrows-rotate" spin={syncing} ></i>}
                    onClick={handleSyncNow}
                    loading={syncing}
                    size="large"
                    className="settings-btn sync-btn"
                  >
                    {syncing ? "Syncing..." : "Sync Now"}
                  </Button>
                </div>
              </Tabs.TabPane>

              {/* TAB 2: APPEARANCE */}
              <Tabs.TabPane tab={<span><i className="fa-solid fa-palette"></i> Appearance & UI</span>} key="2">
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className="fa-solid fa-palette" style={{ color: 'var(--accent-blue)' }} ></i>
                    Appearance & Themes
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Customize the look and feel of your enterprise workspace</p>
                </div>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

                {/* Dark/Light Mode */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Mode</div>
                  <Switch
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                    checkedChildren='Dark'
                    unCheckedChildren='Light'
                  />
                </div>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

                {/* Color Theme */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                    <i className="fa-solid fa-palette" style={{ marginRight: 8 }} ></i>
                    Color Theme
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {Object.entries(colorThemes).map(([key, t]) => (
                      <div
                        key={key}
                        onClick={() => setColorTheme(key)}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: t.gradient,
                          cursor: 'pointer',
                          border: colorTheme === key ? '3px solid #fff' : '3px solid transparent',
                          boxShadow: colorTheme === key ? `0 0 16px ${t.swatch}66` : 'none',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                        title={t.label}
                      >
                        {colorTheme === key && (
                          <i className="fa-solid fa-circle-check" style={{ color: '#fff', fontSize: 16 }} ></i>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                    Active: {colorThemes[colorTheme]?.label || 'Cyber Blue'}
                  </div>
                </div>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

                {/* Font Selector */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                    <i className="fa-solid fa-font" style={{ marginRight: 8 }} ></i>
                    Typography
                  </div>
                  <Select
                    value={fontFamily}
                    onChange={setFontFamily}
                    style={{ width: 240 }}
                    className='dark-select'
                  >
                    {Object.keys(fontOptions).map((f) => (
                      <Option key={f} value={f}>
                        <span style={{ fontFamily: fontOptions[f] }}>{f}</span>
                      </Option>
                    ))}
                  </Select>
                </div>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

                {/* Icon Style Preview */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                    <i className="fa-solid fa-shapes" style={{ marginRight: 8 }} ></i>
                    Icon Style Preview
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 24, color: 'var(--accent-color)' }}>
                    <i className="fa-solid fa-chart-line"></i>
                    <i className="fa-solid fa-robot"></i>
                    <i className="fa-solid fa-users"></i>
                    <i className="fa-solid fa-shield-halved"></i>
                    <i className="fa-solid fa-bell"></i>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                    Using premium Font Awesome solid icons globally.
                  </div>
                </div>

                <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

                {/* Visual Effects */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                    <i className="fa-solid fa-eye" style={{ marginRight: 8 }} ></i>
                    Visual Effects
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Glassmorphism Effects</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Frosted glass blur on cards</div>
                      </div>
                      <Switch checked={glassEnabled} onChange={setGlassEnabled} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Animations</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Hover effects and transitions</div>
                      </div>
                      <Switch checked={animationsEnabled} onChange={setAnimationsEnabled} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Background Particles</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Ambient glow and grid effects</div>
                      </div>
                      <Switch checked={particlesEnabled} onChange={setParticlesEnabled} />
                    </div>
                  </div>
                </div>
              </Tabs.TabPane>
              
              {/* TAB 3: SECURITY & API */}
              <Tabs.TabPane tab={<span><i className="fa-solid fa-circle"></i> Security & API</span>} key="3">
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className="fa-solid fa-circle" style={{ color: 'var(--accent-blue)' }} ></i>
                    Security & API Keys
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Manage your enterprise API keys and security settings</p>
                </div>
                <Divider style={{ borderColor: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />
                
                <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>API Keys</div>
                <Button type="primary" style={{ background: 'var(--accent-blue)' }}>Generate New Key</Button>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 12 }}>
                  * Use these keys to programmatically interact with the AI Workforce Analytics platform.
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Card>

        </Spin>
      </Content>
    </Layout>
  );
}

export default SettingsPage;
