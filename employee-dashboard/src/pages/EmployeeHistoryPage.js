import React, { useState, useEffect } from "react";
import { API_BASE_URL as BACKEND_URL } from '../services/api';
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Row,
  Col,
  DatePicker,
  Empty,
  Spin,
  Badge,
  notification,
  Typography,
} from "antd";

import { useTheme } from "../context/ThemeContext";
import "../App.css";

const { Header, Content } = Layout;
const { Text } = Typography;
const { Option } = Select;

function EmployeeHistoryPage() {
  const [history, setHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [jiraSyncLogs, setJiraSyncLogs] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const uniqueEmployees = [...new Set(history.map((h) => h.employee_name))].sort();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/employee-history?`;
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (employeeFilter) params.push(`employee=${encodeURIComponent(employeeFilter)}`);
      if (fromDate) params.push(`from_date=${fromDate.format("YYYY-MM-DD")}`);
      if (toDate) params.push(`to_date=${toDate.format("YYYY-MM-DD")}`);
      url += params.join("&");

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/upload-sessions`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  const fetchJiraSyncLogs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/jira-sync-logs`);
      const data = await res.json();
      if (data.success) setJiraSyncLogs(data.logs);
    } catch (err) {
      console.error('Failed to fetch Jira sync logs:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchSessions();
    fetchJiraSyncLogs();
    // eslint-disable-next-line
  }, []);

  const handleSearch = () => {
    fetchHistory();
  };

  const handleReset = () => {
    setSearch("");
    setEmployeeFilter("");
    setFromDate(null);
    setToDate(null);
    setTimeout(() => fetchHistory(), 100);
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/trigger-sync`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        api.success({
          message: "Sync Complete",
          description: data.message,
          placement: "topRight",
          duration: 3,
        });
        fetchHistory();
        fetchSessions();
      } else {
        api.error({
          message: "Sync Failed",
          description: data.error || "Unknown error",
          placement: "topRight",
          duration: 4,
        });
      }
    } catch (err) {
      api.error({
        message: "Sync Error",
        description: "Could not reach the backend server",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("sessionExpiresAt");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getBurnoutIcon = (risk) => {
    if (risk === "High")
      return (
        <Tag
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i> High
        </Tag>
      );
    if (risk === "Medium")
      return (
        <Tag
          style={{
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#fcd34d",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i> Medium
        </Tag>
      );
    return (
      <Tag
        style={{
          background: "rgba(16,185,129,0.12)",
          border: "1px solid rgba(16,185,129,0.3)",
          color: "#6ee7b7",
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i> Low
      </Tag>
    );
  };

  const historyColumns = [
    {
      title: "Employee",
      dataIndex: "employee_name",
      key: "employee_name",
      sorter: (a, b) => a.employee_name.localeCompare(b.employee_name),
      render: (name) => (
        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
          <i className="fa-solid fa-user" style={{ marginRight: 6, color: "#60a5fa" }} ></i>
          {name}
        </span>
      ),
    },
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      render: (v) => <span style={{ color: "#93c5fd" }}>{v}</span>,
    },
    {
      title: "Task",
      dataIndex: "task",
      key: "task",
      render: (v) => <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Productivity",
      dataIndex: "productivity",
      key: "productivity",
      sorter: (a, b) => a.productivity - b.productivity,
      render: (val) => (
        <span
          style={{
            color: val >= 80 ? "#10b981" : val >= 60 ? "#3b82f6" : val >= 40 ? "#f59e0b" : "#ef4444",
            fontWeight: 700,
          }}
        >
          {val}%
        </span>
      ),
    },
    {
      title: "Burnout",
      dataIndex: "burnout",
      key: "burnout",
      filters: [
        { text: "High", value: "High" },
        { text: "Medium", value: "Medium" },
        { text: "Low", value: "Low" },
      ],
      onFilter: (value, record) => record.burnout === value,
      render: (risk) => getBurnoutIcon(risk),
    },
    {
      title: "Working Hours",
      dataIndex: "working_hours",
      key: "working_hours",
      sorter: (a, b) => a.working_hours - b.working_hours,
      render: (v) => <span style={{ color: "var(--text-muted)" }}>{v}h</span>,
    },
    {
      title: "Overtime",
      dataIndex: "overtime_hours",
      key: "overtime_hours",
      render: (v) => (
        <span style={{ color: Number(v) > 0 ? "#fca5a5" : "var(--text-dim)" }}>
          {Number(v) > 0 ? `+${v}h` : `${v}h`}
        </span>
      ),
    },
    {
      title: "Upload Time",
      dataIndex: "upload_time",
      key: "upload_time",
      sorter: (a, b) => a.upload_time.localeCompare(b.upload_time),
      render: (v) => (
        <span style={{ color: "var(--text-dim)", fontSize: 12 }}>
          <i className="fa-solid fa-calendar" style={{ marginRight: 4 }} ></i>
          {v}
        </span>
      ),
    },
  ];

  return (
    <Layout className="app-layout">
      {contextHolder}

      <Header className="app-header">
        <div className="header-brand">
          <div className="header-logo-icon">
            <i className="fa-solid fa-chart-line" style={{ fontSize: 20, color: "#fff" }} ></i>
          </div>
          <div>
            <div className="header-title">Employee History</div>
            <div className="header-subtitle">Upload records and session tracking</div>
          </div>
        </div>
        <div className="header-badge-area">
          <Button
            icon={<i className="fa-solid fa-circle"></i>}
            onClick={() => navigate("/dashboard")}
            className="header-nav-btn"
          >
            Dashboard
          </Button>
          <Button
            icon={<i className="fa-solid fa-right-from-bracket"></i>}
            onClick={handleLogout}
            className="header-nav-btn"
            danger
          >
            Logout
          </Button>
        </div>
      </Header>

      <Content className="app-content">
        {/* Filters */}
        <Card className="filter-card glass-card" bordered={false} style={{ marginBottom: 24 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                prefix={<i className="fa-solid fa-magnifying-glass" style={{ color: "rgba(148,163,184,0.5)" }} ></i>}
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                className="dark-input"
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                value={employeeFilter || undefined}
                onChange={(val) => setEmployeeFilter(val || "")}
                className="dark-select"
                style={{ width: "100%" }}
                placeholder="All Employees"
                popupClassName="dark-select-dropdown"
                allowClear
              >
                {uniqueEmployees.map((emp, i) => (
                  <Option key={i} value={emp}>
                    {emp}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <DatePicker
                value={fromDate}
                onChange={(date) => setFromDate(date)}
                placeholder="From Date"
                className="dark-input"
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <DatePicker
                value={toDate}
                onChange={(date) => setToDate(date)}
                placeholder="To Date"
                className="dark-input"
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} sm={8} md={5} style={{ display: "flex", gap: 8 }}>
              <Button
                icon={<i className="fa-solid fa-filter"></i>}
                onClick={handleSearch}
                className="filter-btn"
                type="primary"
                style={{ flex: 1 }}
              >
                Filter
              </Button>
              <Button
                onClick={handleReset}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#94a3b8",
                  borderRadius: 8,
                  height: 36,
                }}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Upload Sessions + Sync */}
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <span style={{ color: "var(--text-secondary)" }}>
                  <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 8, color: "#60a5fa" }} ></i>
                  Upload Sessions
                  {sessions.length > 0 && (
                    <Tag
                      style={{
                        marginLeft: 10,
                        background: "rgba(37,99,235,0.15)",
                        border: "1px solid rgba(37,99,235,0.3)",
                        color: "#93c5fd",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    >
                      {sessions.length} sessions
                    </Tag>
                  )}
                </span>
              }
              className="chart-card glass-card"
              bordered={false}
            >
              {sessions.length === 0 ? (
                <Empty
                  description={
                    <span style={{ color: "rgba(148,163,184,0.6)" }}>
                      No upload sessions recorded yet
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "24px 0" }}
                />
              ) : (
                <div className="sessions-list">
                  {sessions.slice(0, 10).map((session, idx) => (
                    <div key={idx} className="session-item">
                      <div className="session-left">
                        <i className="fa-solid fa-cloud-arrow-up" style={{ color: "#60a5fa", fontSize: 18, marginRight: 12 }}
                        ></i>
                        <div>
                          <div style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: 13 }}>
                            Batch: {session.batch_id}
                          </div>
                          <div style={{ color: "var(--text-dim)", fontSize: 12 }}>
                            <i className="fa-solid fa-calendar" style={{ marginRight: 4 }} ></i>
                            {session.session_time}
                          </div>
                        </div>
                      </div>
                      <Badge
                        count={`${session.record_count} records`}
                        style={{
                          backgroundColor: "rgba(37,99,235,0.15)",
                          color: "#93c5fd",
                          border: "1px solid rgba(37,99,235,0.3)",
                          fontWeight: 600,
                          fontSize: 11,
                          borderRadius: 6,
                          padding: "0 8px",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="chart-card glass-card" bordered={false}>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <i className="fa-solid fa-arrows-rotate" style={{ fontSize: 36, color: "#60a5fa", marginBottom: 16 }}
                  spin={syncLoading}
                ></i>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: 8,
                  }}
                >
                  Auto Sync Scheduler
                </div>
                <div
                  style={{
                    color: "var(--text-dim)",
                    fontSize: 13,
                    marginBottom: 20,
                  }}
                >
                  <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i>
                  Next run: 09:00 AM daily
                </div>
                <Button
                  icon={<i className="fa-solid fa-arrows-rotate"></i>}
                  onClick={handleSync}
                  loading={syncLoading}
                  className="filter-btn"
                  type="primary"
                  size="large"
                  style={{ minWidth: 160 }}
                >
                  {syncLoading ? "Syncing..." : "Sync Now"}
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Jira Sync Logs */}
        <Card
          title={
            <span style={{ color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-arrows-rotate" style={{ marginRight: 8, color: '#a78bfa' }} ></i>
              Jira Sync Logs
              {jiraSyncLogs.length > 0 && (
                <Tag
                  style={{
                    marginLeft: 10,
                    background: 'rgba(167,139,250,0.15)',
                    border: '1px solid rgba(167,139,250,0.3)',
                    color: '#c4b5fd',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  {jiraSyncLogs.length} syncs
                </Tag>
              )}
            </span>
          }
          className="chart-card glass-card"
          bordered={false}
          style={{ marginBottom: 24 }}
        >
          {jiraSyncLogs.length === 0 ? (
            <Empty
              description={
                <span style={{ color: 'rgba(148,163,184,0.6)' }}>
                  No Jira sync logs yet
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '24px 0' }}
            />
          ) : (
            <div className="sessions-list">
              {jiraSyncLogs.slice(0, 15).map((log, idx) => (
                <div key={idx} className="session-item">
                  <div className="session-left">
                    <i className="fa-solid fa-arrows-rotate" style={{ color: log.status === 'success' ? '#10b981' : '#ef4444', fontSize: 18, marginRight: 12 }}
                    ></i>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>
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
                      </div>
                    </div>
                  </div>
                  <Tag
                    style={{
                      background: log.status === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                      border: `1px solid ${log.status === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      color: log.status === 'success' ? '#6ee7b7' : '#fca5a5',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  >
                    {log.status === 'success' ? (
                      <><i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i> Success</>
                    ) : (
                      <><i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i> Error</>
                    )}
                  </Tag>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* History Table */}
        <Card
          title={
            <span style={{ color: "var(--text-secondary)" }}>
              <i className="fa-solid fa-user-group" style={{ marginRight: 8, color: "#60a5fa" }} ></i>
              Employee Records
              <Tag
                style={{
                  marginLeft: 10,
                  background: "rgba(37,99,235,0.15)",
                  border: "1px solid rgba(37,99,235,0.3)",
                  color: "#93c5fd",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                {history.length} records
              </Tag>
            </span>
          }
          className="table-card glass-card"
          bordered={false}
        >
          <Spin spinning={loading}>
            {history.length === 0 && !loading ? (
              <div style={{ padding: "48px 0" }}>
                <Empty
                  description={
                    <span style={{ color: "rgba(148,163,184,0.6)" }}>
                      No history records found
                    </span>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <Table
                className="dark-table"
                dataSource={history.map((h, i) => ({ ...h, key: i }))}
                columns={historyColumns}
                pagination={{
                  pageSize: 15,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "15", "30", "50"],
                  showTotal: (total, range) => (
                    <span style={{ color: "#94a3b8" }}>
                      {range[0]}-{range[1]} of {total} records
                    </span>
                  ),
                }}
                scroll={{ x: 1100 }}
                size="middle"
              />
            )}
          </Spin>
        </Card>
      </Content>
    </Layout>
  );
}

export default EmployeeHistoryPage;
