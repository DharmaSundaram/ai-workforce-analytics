import React, { useState, useEffect, useCallback } from "react";
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
} from "antd";
import {
  SettingOutlined,
  LinkOutlined,
  MailOutlined,
  KeyOutlined,
  ProjectOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const BACKEND_URL = "http://127.0.0.1:5000";

function SettingsPage() {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  // Form state
  const [jiraUrl, setJiraUrl] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraToken, setJiraToken] = useState("");
  const [jiraProjectKey, setJiraProjectKey] = useState("");
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
          setJiraProjectKey(s.jira_project_key || "");
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
          jira_project_key: jiraProjectKey,
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
          jira_project_key: jiraProjectKey,
        }),
      });
      const data = await res.json();

      if (data.connected) {
        setConnectionStatus("success");
        setConnectionMessage(data.message);
        api.success({ message: "Connected Successfully", description: data.message });
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
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
            className="header-nav-btn"
          >
            Dashboard
          </Button>
          <SettingOutlined style={{ fontSize: 22, color: "#8b5cf6", marginLeft: 16 }} />
          <span className="header-title" style={{ marginLeft: 10 }}>Settings</span>
        </div>
      </Header>

      <Content className="app-content">
        <Spin spinning={loading} tip="Loading settings...">

          {/* Jira Configuration Card */}
          <Card
            className="glass-card settings-card"
            bordered={false}
            style={{ marginBottom: 24 }}
          >
            <div className="settings-section-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <SafetyCertificateOutlined style={{ fontSize: 24, color: "#8b5cf6" }} />
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
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </Text>
              )}
            </div>

            <Row gutter={[24, 20]}>
              {/* Jira URL */}
              <Col xs={24} md={12}>
                <label className="settings-label">
                  <LinkOutlined style={{ marginRight: 6 }} /> Jira URL
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
                  <MailOutlined style={{ marginRight: 6 }} /> Jira Email
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
                  <KeyOutlined style={{ marginRight: 6 }} /> API Token
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

              {/* Project Key */}
              <Col xs={24} md={12}>
                <label className="settings-label">
                  <ProjectOutlined style={{ marginRight: 6 }} /> Project Key
                </label>
                <Input
                  value={jiraProjectKey}
                  onChange={(e) => setJiraProjectKey(e.target.value.toUpperCase())}
                  placeholder="e.g. PROJ, DEVOPS, SPRINT"
                  size="large"
                  className="settings-input"
                />
              </Col>

              {/* Auto Sync Interval */}
              <Col xs={24} md={12}>
                <label className="settings-label">
                  <ClockCircleOutlined style={{ marginRight: 6 }} /> Auto Sync Interval
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
                      <CheckCircleOutlined style={{ fontSize: 18, color: "#10b981" }} />
                      <span>{connectionMessage}</span>
                    </div>
                  )}
                  {connectionStatus === "error" && (
                    <div className="connection-result error">
                      <CloseCircleOutlined style={{ fontSize: 18, color: "#ef4444" }} />
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
            <div className="settings-actions">
              <Button
                icon={<ThunderboltOutlined />}
                onClick={handleTestConnection}
                loading={testing}
                size="large"
                className="settings-btn test-btn"
              >
                {testing ? "Testing..." : "Test Connection"}
              </Button>

              <Button
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
                type="primary"
                size="large"
                className="settings-btn save-btn"
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>

              <Button
                icon={<SyncOutlined spin={syncing} />}
                onClick={handleSyncNow}
                loading={syncing}
                size="large"
                className="settings-btn sync-btn"
              >
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </Card>

        </Spin>
      </Content>
    </Layout>
  );
}

export default SettingsPage;
