import React, { useState, useEffect, useRef, useMemo } from "react";
import { API_BASE_URL as BACKEND_URL } from '../services/api';
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import EmployeeModal from "../components/EmployeeModal";
import NotificationBell from "../components/NotificationBell";
import CopilotChat from "../components/CopilotChat";
import ExecutiveKPIs from "../components/ExecutiveKPIs";
import AIStrategicInsights from "../components/AIStrategicInsights";
import SystemHealthWidget from "../components/SystemHealthWidget";
import DepartmentRanking from "../components/DepartmentRanking";
import ExecutiveReportButton from "../components/ExecutiveReportButton";
import { SkeletonKPIs, SkeletonCharts, SkeletonTable } from "../components/SkeletonCards";
import { exportAnalyticsPDF } from "../utils/pdfExport";
import "../App.css";

// ---- Recharts ----
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

// ---- Ant Design Components ----
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Tooltip,
  Progress,
  Spin,
  notification,
  Empty,
  Badge,
  Typography,
  Switch,
  Dropdown,
  Avatar,
} from "antd";

// ---- Ant Design Icons (Material-style, no emojis) ----


const { Header, Content } = Layout;
const { Text } = Typography;
const { Option } = Select;

// =========================================
// BACKEND URL
// =========================================

function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // =====================================
  // STATES (all existing + new)
  // =====================================

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [backendKpis, setBackendKpis] = useState({});
  const [projectPerformanceOverview, setProjectPerformanceOverview] = useState([]);
  const [aggregatedEmployees, setAggregatedEmployees] = useState({});
  const [departmentRankings, setDepartmentRankings] = useState([]);
  const [connectedProjects, setConnectedProjects] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [burnoutFilter, setBurnoutFilter] = useState("All Burnout");
  const [predictionResult, setPredictionResult] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const modelAccuracy = null;
  const [jiraSyncStatus, setJiraSyncStatus] = useState({});
  const [isSyncingJira, setIsSyncingJira] = useState(false);

  // AI & Analytics state
  const [aiSummary, setAiSummary] = useState(null);
  const [featureImportance, setFeatureImportance] = useState({});
  const [productivityTrend, setProductivityTrend] = useState([]);
  const [jiraInsights, setJiraInsights] = useState({ done: 0, in_progress: 0, todo: 0, total: 0 });

  // New: Modal state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  const [predictionForm, setPredictionForm] = useState({
    total_hours: "",
    idle_time_minutes: "",
    overtime_hours: "",
    break_count: "",
    meeting_hours: "",
    tasks_completed: "",
    bugs_fixed: "",
    focus_score: "",
    weekly_target: "",
    target_completed: "",
    manager_rating: "",
  });

  // =====================================
  // DYNAMIC KPIs — computed from filteredEmployees
  // =====================================

  const highBurnout = filteredEmployees.filter(
    (e) => e.burnout_risk === "High"
  ).length;

  const avgProductivity =
    filteredEmployees.length > 0
      ? (
          filteredEmployees.reduce(
            (sum, emp) => sum + Number(emp.productivity || 0),
            0
          ) / filteredEmployees.length
        ).toFixed(1)
      : 0;

  const overtimeEmployees = filteredEmployees.filter(
    (e) => Number(e.overtime_hours) > 0
  ).length;

  const lowProdEmployees = filteredEmployees.filter(
    (e) => Number(e.productivity) < 50
  ).length;

  const topPerformersCount = filteredEmployees.filter(
    (e) => Number(e.productivity) >= 80
  ).length;

  const totalTasks = employees.length;
  const totalEmployees = backendKpis.total_employees || new Set(filteredEmployees.map(e => e.employee_name)).size;
  const projectsConnected = backendKpis.projects_connected || 0;
  const projectsSynced = backendKpis.projects_synced || 0;
  const completedTasks = backendKpis.completed_tasks || 0;
  const openTasks = backendKpis.open_tasks || 0;
  const totalWorklogs = backendKpis.total_worklogs || employees.length;
  const projectOptions = useMemo(() => {
    const names = new Set();
    connectedProjects.forEach((project) => {
      if (project.project_name) names.add(project.project_name);
      else if (project.project_key) names.add(project.project_key);
    });
    employees.forEach((employee) => {
      if (employee.project_name) names.add(employee.project_name);
    });
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [connectedProjects, employees]);

  // =====================================
  // BURNOUT PIE DATA — dynamic from filteredEmployees
  // =====================================

  const burnoutData = [
    {
      name: "High",
      value: filteredEmployees.filter((e) => e.burnout_risk === "High").length,
    },
    {
      name: "Medium",
      value: filteredEmployees.filter((e) => e.burnout_risk === "Medium").length,
    },
    {
      name: "Low",
      value: filteredEmployees.filter((e) => e.burnout_risk === "Low").length,
    },
  ];

  const projectProductivity = useMemo(() => {
    const projMap = {};
    filteredEmployees.forEach((emp) => {
      const proj = emp.project_name || "Unknown";
      if (!projMap[proj]) projMap[proj] = { total: 0, count: 0 };
      projMap[proj].total += Number(emp.productivity || 0);
      projMap[proj].count += 1;
    });
    return Object.entries(projMap)
      .map(([project, data]) => ({
        project,
        avgProductivity: Math.round((data.total / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.avgProductivity - a.avgProductivity);
  }, [filteredEmployees]);

  const projectBurnout = useMemo(() => {
    const projMap = {};
    filteredEmployees.forEach((emp) => {
      const proj = emp.project_name || "Unknown";
      if (!projMap[proj]) projMap[proj] = { High: 0, Medium: 0, Low: 0 };
      if (emp.burnout_risk === "High") projMap[proj].High += 1;
      else if (emp.burnout_risk === "Medium") projMap[proj].Medium += 1;
      else projMap[proj].Low += 1;
    });
    return Object.entries(projMap)
      .map(([project, data]) => ({
        project,
        High: data.High,
        Medium: data.Medium,
        Low: data.Low,
      }));
  }, [filteredEmployees]);

  const departmentProductivity = useMemo(() => {
    const deptMap = {};
    filteredEmployees.forEach((emp) => {
      const dept = emp.department || "Unknown";
      if (!deptMap[dept]) deptMap[dept] = { total: 0, count: 0 };
      deptMap[dept].total += Number(emp.productivity || 0);
      deptMap[dept].count += 1;
    });
    return Object.entries(deptMap)
      .map(([department, data]) => ({
        department,
        avgProductivity: Math.round((data.total / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.avgProductivity - a.avgProductivity);
  }, [filteredEmployees]);

  const departmentBurnout = useMemo(() => {
    const deptMap = {};
    filteredEmployees.forEach((emp) => {
      const dept = emp.department || "Unknown";
      if (!deptMap[dept]) deptMap[dept] = { High: 0, Medium: 0, Low: 0 };
      if (emp.burnout_risk === "High") deptMap[dept].High += 1;
      else if (emp.burnout_risk === "Medium") deptMap[dept].Medium += 1;
      else deptMap[dept].Low += 1;
    });
    return Object.entries(deptMap)
      .map(([department, data]) => ({
        department,
        High: data.High,
        Medium: data.Medium,
        Low: data.Low,
      }));
  }, [filteredEmployees]);

  // =====================================
  // LEADERBOARD — composite ranked from filteredEmployees
  // =====================================

  const leaderboard = [...filteredEmployees]
    .sort((a, b) => {
      const burnoutPenalty = (e) =>
        e.burnout_risk === "High" ? 30 : e.burnout_risk === "Medium" ? 10 : 0;
      const scoreA =
        a.productivity * 0.5 +
        (a.focus_score || 0) * 0.3 +
        (a.tasks_completed || 0) * 0.2 -
        burnoutPenalty(a);
      const scoreB =
        b.productivity * 0.5 +
        (b.focus_score || 0) * 0.3 +
        (b.tasks_completed || 0) * 0.2 -
        burnoutPenalty(b);
      return scoreB - scoreA;
    })
    .slice(0, 5);


  // Fetch employee history
  const fetchHistory = () => {
    fetch(`${BACKEND_URL}/employee-history`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEmployeeHistory(data.history);
        }
      })
      .catch((err) => console.log(err));
  };

  // Load dashboard data from DB on page load (persists across refreshes)
  const loadDashboardData = () => {
    fetch(`${BACKEND_URL}/api/dashboard-data`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const rows = data.employees || [];
          setEmployees(rows);
          setFilteredEmployees(rows);
          setBackendKpis(data.kpis || {});
          setProjectPerformanceOverview(data.project_performance_overview || []);
          setAggregatedEmployees(data.aggregated_employees || {});
          setDepartmentRankings(data.department_rankings || []);
          setConnectedProjects(data.connected_projects || []);
          setForecastData(data.forecast || []);
          if (data.feature_importance) setFeatureImportance(data.feature_importance);
          if (data.productivity_trend) setProductivityTrend(data.productivity_trend);
          if (data.jira_insights) setJiraInsights(data.jira_insights);
        }
      })
      .catch((err) => console.log("Dashboard data load:", err));
  };

  // Fetch AI workforce summary
  const fetchAiSummary = () => {
    fetch(`${BACKEND_URL}/api/ai-summary`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.summary) {
          setAiSummary(data.summary);
        }
      })
      .catch((err) => console.log("AI summary load:", err));
  };

  useEffect(() => {
    fetchHistory();
    loadDashboardData();
    fetchAiSummary();
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/jira-sync-status`)
      .then(res => res.json())
      .then(data => { if (data.success) setJiraSyncStatus(data); })
      .catch(() => {});
  }, []);

  // =====================================
  // FILTERS
  // =====================================

  const applyFilters = () => {
    let filtered = employees;

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter((emp) =>
        [
          emp.employee_name,
          emp.project_name,
          emp.project_key,
          emp.department,
          emp.task_name,
          emp.status_name,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      );
    }

    if (projectFilter !== "All Projects") {
      filtered = filtered.filter(
        (emp) => emp.project_name === projectFilter
      );
    }

    if (burnoutFilter !== "All Burnout") {
      filtered = filtered.filter(
        (emp) => emp.burnout_risk === burnoutFilter
      );
    }

    setFilteredEmployees(filtered);
  };

  const resetFilters = () => {
    setSearch("");
    setProjectFilter("All Projects");
    setBurnoutFilter("All Burnout");
    setFilteredEmployees(employees);
  };

  // =====================================
  // FORM CHANGE
  // =====================================

  const handlePredictionChange = (name, value) => {
    setPredictionForm({ ...predictionForm, [name]: value });
  };

  // =====================================
  // AI PRODUCTIVITY PREDICTION
  // =====================================

  const predictBurnout = async () => {
    setIsPredicting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/predict-productivity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          working_hours: predictionForm.total_hours,
          total_hours: predictionForm.total_hours,
          lunch_time: 1,
          break_time: 0.5,
          lunch_break: 1.5,
          total_leave: 0,
          permission: 0,
          leave_permission: 0,
          net_productive_hours: predictionForm.total_hours,
          overtime_hours: predictionForm.overtime_hours,
        }),
      });

      const result = await response.json();
      setPredictionResult(result.predicted_productivity);
      api.success({
        message: "Prediction Complete",
        description: `ML Model Predicted Productivity: ${result.predicted_productivity}%`,
        placement: "topRight",
        duration: 3,
      });
    } catch (error) {
      api.error({
        message: "Prediction Failed",
        description:
          "Could not connect to the prediction API. Make sure the Flask server is running.",
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setIsPredicting(false);
    }
  };


  // =====================================
  // NEW: EXPORT PDF
  // =====================================

  const handleExportPDF = async () => {
    try {
      const kpiData = {
        total_employees: totalEmployees,
        avg_productivity: avgProductivity,
        high_burnout: highBurnout,
        medium_burnout: filteredEmployees.filter((e) => e.burnout_risk === "Medium").length,
        low_burnout: filteredEmployees.filter((e) => e.burnout_risk === "Low").length,
        overtime_employees: overtimeEmployees,
        top_performers_count: topPerformersCount,
      };
      await exportAnalyticsPDF(filteredEmployees, kpiData, forecastData);
      api.success({
        message: "PDF Exported",
        description: "Analytics report downloaded as PDF.",
        placement: "topRight",
        duration: 3,
      });
    } catch (err) {
      api.error({
        message: "PDF Export Failed",
        description: err.message || "Could not generate PDF report.",
        placement: "topRight",
        duration: 4,
      });
    }
  };

  // =====================================
  // NEW: Row click → modal
  // =====================================

  const handleRowClick = (record) => {
    setSelectedEmployee(record);
    setShowModal(true);
  };

  // =====================================
  // Logout
  // =====================================

  const handleLogout = () => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : {};
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("sessionExpiresAt");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    fetch(`${BACKEND_URL}/api/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, email: user.email }),
    }).catch(() => {});
    api.info({
      message: "Logged Out",
      description: "You have been signed out successfully.",
      placement: "topRight",
      duration: 2,
    });
    setTimeout(() => navigate("/login"), 300);
  };

  const handleJiraSync = async () => {
    setIsSyncingJira(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/sync-jira`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        api.success({
          message: 'Jira Sync Complete',
          description: `${data.synced_records} records synced from Jira`,
          placement: 'topRight',
          duration: 4,
        });
        const statusRes = await fetch(`${BACKEND_URL}/api/jira-sync-status`);
        const statusData = await statusRes.json();
        if (statusData.success) setJiraSyncStatus(statusData);
        loadDashboardData();
        fetchAiSummary();
        fetchHistory();
      } else {
        api.warning({
          message: 'Jira Sync',
          description: data.message || data.error || 'Sync completed with warnings',
          placement: 'topRight',
          duration: 4,
        });
      }
    } catch (err) {
      api.error({
        message: 'Jira Sync Failed',
        description: 'Could not connect to backend. Make sure the server is running.',
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setIsSyncingJira(false);
    }
  };

  // =====================================
  // PERFORMANCE BADGE HELPER
  // =====================================

  const getPerformanceBadge = (score) => {
    if (score >= 80)
      return {
        label: "Excellent",
        icon: <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i>,
        color: "#10b981",
        cls: "result-card-excellent",
        progressColor: "#10b981",
      };
    if (score >= 60)
      return {
        label: "Good",
        icon: <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i>,
        color: "#3b82f6",
        cls: "result-card-good",
        progressColor: "#3b82f6",
      };
    if (score >= 40)
      return {
        label: "Average",
        icon: <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i>,
        color: "#f59e0b",
        cls: "result-card-average",
        progressColor: "#f59e0b",
      };
    return {
      label: "Poor",
      icon: <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i>,
      color: "#ef4444",
      cls: "result-card-poor",
      progressColor: "#ef4444",
    };
  };

  // =====================================
  // BURNOUT TAG (Material icons, no emojis)
  // =====================================

  const getBurnoutTag = (risk) => {
    if (risk === "High")
      return (
        <Tag className="burnout-high">
          <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i> High
        </Tag>
      );
    if (risk === "Medium")
      return (
        <Tag className="burnout-medium">
          <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i> Medium
        </Tag>
      );
    return (
      <Tag className="burnout-low">
        <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i> Low
      </Tag>
    );
  };

  // =====================================
  // TABLE COLUMNS
  // =====================================

  const tableColumns = [
    {
      title: "Employee",
      dataIndex: "employee_name",
      key: "employee_name",
      sorter: (a, b) => a.employee_name.localeCompare(b.employee_name),
      render: (name, record) => (
        <span
          style={{
            fontWeight: 600,
            color: record.productivity >= 80 ? "#6ee7b7" : "var(--text-secondary)",
          }}
        >
          {record.productivity >= 80 && (
            <i className="fa-solid fa-circle" style={{ color: "#fbbf24", marginRight: 4 }} ></i>
          )}
          {name}
        </span>
      ),
    },
    {
      title: "Project",
      dataIndex: "project_name",
      key: "project_name",
      render: (v) => <span style={{ color: "#93c5fd" }}>{v}</span>,
    },
    {
      title: "Task",
      dataIndex: "task_name",
      key: "task_name",
      render: (v) => (
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{v}</span>
      ),
    },
    {
      title: "Actual %",
      dataIndex: "productivity",
      key: "productivity",
      sorter: (a, b) => a.productivity - b.productivity,
      defaultSortOrder: "descend",
      render: (val) => (
        <Tooltip title={`Actual productivity: ${val}%`}>
          <div style={{ minWidth: 100 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}
              >
                {val}%
              </span>
            </div>
            <Progress
              percent={val}
              size="small"
              showInfo={false}
              className="productivity-bar"
              strokeColor={
                val >= 80
                  ? "#10b981"
                  : val >= 60
                  ? "#3b82f6"
                  : val >= 40
                  ? "#f59e0b"
                  : "#ef4444"
              }
              trailColor="rgba(255,255,255,0.08)"
            />
          </div>
        </Tooltip>
      ),
    },
    {
      title: "ML Predicted %",
      dataIndex: "predicted_productivity",
      key: "predicted_productivity",
      sorter: (a, b) =>
        (a.predicted_productivity || 0) - (b.predicted_productivity || 0),
      render: (val) =>
        val !== undefined ? (
          <Tooltip title={`ML predicted: ${val}%`}>
            <span
              style={{
                color: "#a78bfa",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {val}%
            </span>
          </Tooltip>
        ) : (
          <span style={{ color: "#475569" }}>—</span>
        ),
    },
    {
      title: "Burnout",
      dataIndex: "burnout_risk",
      key: "burnout_risk",
      filters: [
        { text: "High", value: "High" },
        { text: "Medium", value: "Medium" },
        { text: "Low", value: "Low" },
      ],
      onFilter: (value, record) => record.burnout_risk === value,
      render: (risk) => getBurnoutTag(risk),
    },
    {
      title: "Hours",
      dataIndex: "total_hours",
      key: "total_hours",
      sorter: (a, b) => a.total_hours - b.total_hours,
      render: (v) => <span style={{ color: "#94a3b8" }}>{v}h</span>,
    },
    {
      title: "Overtime",
      dataIndex: "overtime_hours",
      key: "overtime_hours",
      sorter: (a, b) => a.overtime_hours - b.overtime_hours,
      render: (v) => (
        <span style={{ color: Number(v) > 0 ? "#fca5a5" : "#64748b" }}>
          {Number(v) > 0 ? `+${v}h` : `${v}h`}
        </span>
      ),
    },
    {
      title: "Focus",
      dataIndex: "focus_score",
      key: "focus_score",
      sorter: (a, b) => (a.focus_score || 0) - (b.focus_score || 0),
      render: (v) => (
        <span style={{ color: v > 70 ? "#34d399" : "#94a3b8" }}>
          {v || 0}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => (
        <Tag
          style={{
            background: "rgba(37,99,235,0.15)",
            border: "1px solid rgba(37,99,235,0.35)",
            color: "#93c5fd",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<i className="fa-solid fa-eye" style={{ color: "#60a5fa" }} ></i>}
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(record);
            }}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];

  // =====================================
  // RECHARTS TOOLTIP STYLE
  // =====================================

  const chartTooltipStyle = {
    backgroundColor: "#1a2d4a",
    border: "1px solid rgba(37,99,235,0.3)",
    borderRadius: 8,
    color: "#e2e8f0",
  };

  // =====================================
  // UI
  // =====================================

  return (
    <Layout className="app-layout">
      {contextHolder}

      {/* ===== HEADER ===== */}
      <Header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', height: '72px' }}>
        {/* Left Side */}
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="header-logo-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            <i className="fa-solid fa-brain" style={{ fontSize: 20, color: "#fff" }} ></i>
          </div>
          <div>
            <div className="header-title" style={{ color: '#f8fafc', fontSize: 18, fontWeight: 700, letterSpacing: '0.5px' }}>AI Workforce Analytics</div>
            <div className="header-subtitle" style={{ color: '#94a3b8', fontSize: 12 }}>
              Enterprise Intelligence & Insights
            </div>
          </div>
        </div>

        {/* Center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <i className="fa-solid fa-user-group" ></i>
              Total Employees
            </Tag>
          </Badge>

          <Switch
            checked={theme === "light"}
            onChange={toggleTheme}
            checkedChildren={<i className="fa-solid fa-circle"></i>}
            unCheckedChildren={<i className="fa-solid fa-lightbulb"></i>}
            className="theme-switch"
          />
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <NotificationBell />

          <Dropdown
            menu={{
              items: [
                {
                  key: "profile",
                  icon: <i className="fa-solid fa-user" style={{ width: 16, color: '#3b82f6' }}></i>,
                  label: "Profile",
                  onClick: () => navigate("/profile"),
                },
                {
                  key: "history",
                  icon: <i className="fa-solid fa-clock-rotate-left" style={{ width: 16, color: '#10b981' }}></i>,
                  label: "History",
                  onClick: () => navigate("/history"),
                },
                {
                  key: "settings",
                  icon: <i className="fa-solid fa-gear" style={{ width: 16, color: '#64748b' }}></i>,
                  label: "Settings",
                  onClick: () => navigate("/settings"),
                },
                {
                  key: "audit",
                  icon: <i className="fa-solid fa-shield-halved" style={{ width: 16, color: '#f59e0b' }}></i>,
                  label: "Audit",
                  onClick: () => navigate("/audit-logs"),
                },
                {
                  key: "analytics",
                  icon: <i className="fa-solid fa-chart-simple" style={{ width: 16, color: '#8b5cf6' }}></i>,
                  label: "Analytics",
                  onClick: () => navigate("/analytics"),
                },
                {
                  key: "report",
                  label: <ExecutiveReportButton asMenuItem={true} />,
                },
                { type: "divider" },
                {
                  key: "logout",
                  icon: <i className="fa-solid fa-right-from-bracket" style={{ width: 16, color: '#ef4444' }}></i>,
                  label: "Logout",
                  danger: true,
                  onClick: handleLogout,
                },
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
            overlayStyle={{ minWidth: 200 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: 24,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              <Avatar
                size={36}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  border: "2px solid #1e293b",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                <i className="fa-solid fa-user-tie"></i>
              </Avatar>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ color: "#f8fafc", fontWeight: 600, fontSize: 13, lineHeight: '1.2' }}>Administrator</span>
                <span style={{ color: "#94a3b8", fontSize: 11, lineHeight: '1.2' }}>Enterprise Admin</span>
              </div>
              <i className="fa-solid fa-chevron-down" style={{ color: "#64748b", fontSize: 12, marginLeft: 4 }}></i>
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* ===== CONTENT ===== */}
      <Content className="app-content">


        {/* ===== COMPACT JIRA SYNC STATUS BAR ===== */}
        <div style={{
          margin: '0 0 24px 0',
          padding: '12px 24px',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>Jira Status:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fa-solid fa-circle" style={{
                  fontSize: 10,
                  color: isSyncingJira ? '#f59e0b' : (jiraSyncStatus.last_status === 'success' ? '#10b981' : (jiraSyncStatus.last_status === 'error' ? '#ef4444' : '#94a3b8')),
                  filter: `drop-shadow(0 0 4px ${isSyncingJira ? '#f59e0b' : (jiraSyncStatus.last_status === 'success' ? '#10b981' : '#ef4444')})`
                }}></i>
                <span style={{
                  color: isSyncingJira ? '#fcd34d' : (jiraSyncStatus.last_status === 'success' ? '#6ee7b7' : (jiraSyncStatus.last_status === 'error' ? '#fca5a5' : '#94a3b8')),
                  fontWeight: 600,
                  fontSize: 13
                }}>
                  {isSyncingJira ? 'Syncing...' : (jiraSyncStatus.last_status === 'success' ? 'Connected' : (jiraSyncStatus.last_status === 'error' ? 'Error' : 'Idle'))}
                </span>
              </div>
            </div>

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }}></div>

            {/* Last Sync */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: '#60a5fa', fontSize: 13 }}></i>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Last Sync:</span>
              <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{jiraSyncStatus.last_sync || 'Never'}</span>
            </div>

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }}></div>

            {/* Next Sync */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-forward-step" style={{ color: '#a78bfa', fontSize: 13 }}></i>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Next Sync:</span>
              <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{jiraSyncStatus.next_sync || 'Not scheduled'}</span>
            </div>

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }}></div>

            {/* Records */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-database" style={{ color: '#34d399', fontSize: 13 }}></i>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>Records:</span>
              <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{jiraSyncStatus.last_records || 0}</span>
            </div>
          </div>

          <Button
            icon={<i className={`fa-solid fa-arrows-rotate ${isSyncingJira ? 'fa-spin' : ''}`}></i>}
            onClick={handleJiraSync}
            loading={isSyncingJira}
            type="primary"
            size="small"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              padding: '0 16px',
            }}
          >
            {isSyncingJira ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>

        {/* ===== AI WORKFORCE SUMMARY ===== */}
        {aiSummary && aiSummary.has_data && (
          <Card className="ai-summary-card glass-card" bordered={false} style={{ marginBottom: 24 }}>
            <div className="ai-summary-header">
              <i className="fa-solid fa-robot" style={{ fontSize: 24, color: '#8b5cf6' }} ></i>
              <h3>AI Workforce Intelligence</h3>
            </div>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={6}>
                <div
                  className="team-health-circle"
                  style={{
                    background: `conic-gradient(
                      ${aiSummary.team_health_score >= 70 ? '#10b981' : aiSummary.team_health_score >= 40 ? '#f59e0b' : '#ef4444'} ${aiSummary.team_health_score * 3.6}deg,
                      rgba(255,255,255,0.06) 0deg
                    )`,
                    margin: '0 auto',
                  }}
                >
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(20, 28, 58, 0.95)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="health-value">{Math.round(aiSummary.team_health_score)}</span>
                    <span className="health-label">Health</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <i className="fa-solid fa-circle" style={{ color: '#8b5cf6', marginRight: 6 }} ></i>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>Team Health Score</span>
                </div>
              </Col>
              <Col xs={24} md={10}>
                <div className="ai-summary-text">{aiSummary.text}</div>
                <ul className="ai-insights-list">
                  {(aiSummary.insights || []).map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </Col>
              <Col xs={24} md={8}>
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{aiSummary.top_performers || 0}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}><i className="fa-solid fa-trophy"></i> Top Performers</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{aiSummary.needs_improvement || 0}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}><i className="fa-solid fa-arrow-trend-up"></i> Need Help</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#60a5fa' }}>{aiSummary.avg_hours || 0}h</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Avg Hours</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#f87171' }}>{aiSummary.overtime_count || 0}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Overtime</div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        )}

        {/* ===== AI STRATEGIC INSIGHTS ===== */}
        {employees.length > 0 && (
          <AIStrategicInsights employees={filteredEmployees} aiSummary={aiSummary} productivityTrend={productivityTrend} />
        )}

        {/* ===== ANALYTICS ROW: Trend + Feature Importance + Jira Insights ===== */}
        {employees.length > 0 && (
          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
            {/* Productivity Trend */}
            {productivityTrend.length > 0 && (
              <Col xs={24} md={8}>
                <Card className="trend-card glass-card" bordered={false}
                  title={<span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}><i className="fa-solid fa-arrow-trend-up" style={{ marginRight: 8, color: '#10b981' }} ></i>Productivity Trend</span>}
                >
                  {productivityTrend.map((item, idx) => (
                    <div key={idx} className="trend-batch-item">
                      <span>{item.date}</span>
                      <span style={{ fontWeight: 600, color: item.avg_productivity >= 70 ? '#10b981' : item.avg_productivity >= 50 ? '#f59e0b' : '#f87171' }}>
                        {item.avg_productivity}%
                      </span>
                      <span className={`trend-source-badge ${item.source === 'Jira' ? 'jira' : 'upload'}`}>
                        {item.source}
                      </span>
                    </div>
                  ))}
                </Card>
              </Col>
            )}

            {/* Feature Importance */}
            {Object.keys(featureImportance).length > 0 && (
              <Col xs={24} md={8}>
                <Card className="feature-importance-card glass-card" bordered={false}
                  title={<span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}><i className="fa-solid fa-circle" style={{ marginRight: 8, color: '#06b6d4' }} ></i>Burnout Feature Importance</span>}
                >
                  {Object.entries(featureImportance)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([name, value]) => {
                      const maxVal = Math.max(...Object.values(featureImportance));
                      const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
                      return (
                        <div key={name} className="feature-bar-container">
                          <div className="feature-bar-label">
                            <span>{name.replace(/_/g, ' ')}</span>
                            <span>{(value * 100).toFixed(1)}%</span>
                          </div>
                          <div className="feature-bar-track">
                            <div className="feature-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </Card>
              </Col>
            )}

            {/* Jira Task Insights */}
            {jiraInsights.total > 0 && (
              <Col xs={24} md={8}>
                <Card className="jira-insights-card glass-card" bordered={false}
                  title={<span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}><i className="fa-solid fa-arrows-rotate" style={{ marginRight: 8, color: '#fb923c' }} ></i>Jira Task Insights</span>}
                >
                  <div className="jira-insight-row">
                    <span className="jira-insight-label">✅ Completed</span>
                    <span className="jira-insight-value done">{jiraInsights.done}</span>
                  </div>
                  <div className="jira-insight-row">
                    <span className="jira-insight-label">🔄 In Progress</span>
                    <span className="jira-insight-value in-progress">{jiraInsights.in_progress}</span>
                  </div>
                  <div className="jira-insight-row">
                    <span className="jira-insight-label">📋 To Do</span>
                    <span className="jira-insight-value todo">{jiraInsights.todo}</span>
                  </div>
                  <div className="jira-insight-row" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, paddingTop: 12 }}>
                    <span className="jira-insight-label" style={{ fontWeight: 600 }}>Total Jira Records</span>
                    <span className="jira-insight-value">{jiraInsights.total}</span>
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* ===== KPI CARDS ===== */}
        {employees.length === 0 ? (
          <SkeletonKPIs />
        ) : (
          <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-0 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-diagram-project" style={{ color: "#3b82f6" }} ></i>
                </span>
                <Statistic
                  title="Connected Projects"
                  value={projectsConnected}
                  valueStyle={{ color: "#60a5fa" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-1 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-arrows-rotate" style={{ color: "#10b981" }} ></i>
                </span>
                <Statistic
                  title="Projects Synced"
                  value={projectsSynced}
                  valueStyle={{ color: "#34d399" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-1 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-list-check" style={{ color: "#a78bfa" }} ></i>
                </span>
                <Statistic
                  title="Total Tasks"
                  value={totalTasks}
                  valueStyle={{ color: "#c4b5fd" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-1 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-user-group" style={{ color: "#60a5fa" }} ></i>
                </span>
                <Statistic
                  title="Total Employees"
                  value={totalEmployees}
                  valueStyle={{ color: "#ffffff" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-1 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-check-circle" style={{ color: "#10b981" }} ></i>
                </span>
                <Statistic
                  title="Completed Tasks"
                  value={completedTasks}
                  valueStyle={{ color: "#34d399" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-1 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-circle-notch" style={{ color: "#f59e0b" }} ></i>
                </span>
                <Statistic
                  title="Open Tasks"
                  value={openTasks}
                  valueStyle={{ color: "#fbbf24" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-1 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-clock-rotate-left" style={{ color: "#8b5cf6" }} ></i>
                </span>
                <Statistic
                  title="Total Worklogs"
                  value={totalWorklogs}
                  valueStyle={{ color: "#a78bfa" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-2 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-fire" style={{ color: "#f87171" }} ></i>
                </span>
                <Statistic
                  title="High Burnout"
                  value={highBurnout}
                  valueStyle={{ color: "#fca5a5" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-3 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-arrow-trend-up" style={{ color: "#34d399" }} ></i>
                </span>
                <Statistic
                  title="Avg Productivity"
                  value={avgProductivity}
                  suffix="%"
                  valueStyle={{ color: "#6ee7b7" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-4 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-circle" style={{ color: "#fbbf24" }} ></i>
                </span>
                <Statistic
                  title="Overtime Employees"
                  value={overtimeEmployees}
                  valueStyle={{ color: "#fcd34d" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-5 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: "#fb923c" }} ></i>
                </span>
                <Statistic
                  title="Low Productivity"
                  value={lowProdEmployees}
                  valueStyle={{ color: "#fdba74" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="kpi-card kpi-card-6 glass-card" bordered={false}>
                <span className="kpi-icon">
                  <i className="fa-solid fa-circle" style={{ color: "#a78bfa" }} ></i>
                </span>
                <Statistic
                  title="Top Performers"
                  value={topPerformersCount}
                  valueStyle={{ color: "#c4b5fd" }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* ===== PROJECT PERFORMANCE OVERVIEW ===== */}
        {projectPerformanceOverview.length > 0 && (
          <>
            <h3 style={{ color: "#f8fafc", marginBottom: 16 }}>Project Performance Overview</h3>
            <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
              {projectPerformanceOverview.map((proj, idx) => (
                <Col xs={24} sm={12} md={8} lg={8} key={idx}>
                  <Card className="glass-card" bordered={false}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 18, fontWeight: 600, color: "#93c5fd" }}>{proj.project_name}</span>
                      <Tag color={proj.health_score >= 80 ? "success" : proj.health_score >= 50 ? "warning" : "error"}>
                        Health: {proj.health_score}%
                      </Tag>
                    </div>
                    <Row gutter={8}>
                      <Col span={12} style={{ marginBottom: 8 }}>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>Employees</div>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>{proj.employee_count}</div>
                      </Col>
                      <Col span={12} style={{ marginBottom: 8 }}>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>Tasks</div>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>{proj.task_count}</div>
                      </Col>
                      <Col span={12}>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>Productivity</div>
                        <div style={{ fontSize: 16, fontWeight: 500, color: "#34d399" }}>{proj.productivity_score}%</div>
                      </Col>
                      <Col span={12}>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>High Burnout</div>
                        <div style={{ fontSize: 16, fontWeight: 500, color: "#f87171" }}>{proj.burnout_risk_count}</div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* ===== EXECUTIVE KPIs ===== */}
        {employees.length > 0 && (
          <ExecutiveKPIs
            employees={filteredEmployees}
            previousAvgProductivity={aiSummary?.avg_productivity || 0}
          />
        )}

        {/* ===== CHARTS ROW 1: Existing Pie + Line + Leaderboard/Accuracy ===== */}
        {employees.length === 0 ? (
          <SkeletonCharts />
        ) : (
          <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>

            {/* Burnout Pie Chart */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <span>
                    <i className="fa-solid fa-circle" style={{ marginRight: 8, color: "#60a5fa" }}
                    ></i>
                    ML Burnout Distribution
                  </span>
                }
                className="chart-card glass-card"
                bordered={false}
              >
                {filteredEmployees.length === 0 ? (
                  <Empty
                    description="Upload a dataset to view burnout distribution"
                    className="dark-empty"
                    style={{ padding: "40px 0" }}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={burnoutData}
                        dataKey="value"
                        outerRadius={100}
                        innerRadius={40}
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={{ stroke: "rgba(255,255,255,0.3)" }}
                      >
                        <Cell fill="#ef4444" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#10b981" />
                      </Pie>
                      <RechartsTooltip
                        contentStyle={chartTooltipStyle}
                        itemStyle={{ color: "#e2e8f0" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>

            {/* Weekly Forecast Line Chart */}
            <Col xs={24} lg={10}>
              <Card
                title={
                  <span>
                    <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: 8, color: "#34d399" }}
                    ></i>
                    Weekly Productivity Forecast
                  </span>
                }
                className="chart-card glass-card"
                bordered={false}
              >
                {forecastData.length === 0 ? (
                  <Empty
                    description="Upload a dataset to view weekly forecast"
                    className="dark-empty"
                    style={{ padding: "40px 0" }}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={forecastData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(37,99,235,0.1)"
                      />
                      <XAxis
                        dataKey="week"
                        stroke="#64748b"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#64748b"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <RechartsTooltip
                        contentStyle={chartTooltipStyle}
                        itemStyle={{ color: "#e2e8f0" }}
                      />
                      <Legend wrapperStyle={{ color: "#94a3b8" }} />
                      <Line
                        type="monotone"
                        dataKey="productivity"
                        name="Actual Avg"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "#93c5fd" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        name="ML Predicted"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#a78bfa", r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#c4b5fd" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>

            {/* Leaderboard + Accuracy stacked */}
            <Col xs={24} lg={6}>
              <Row gutter={[0, 20]}>
                {/* Accuracy Card */}
                <Col span={24}>
                  <Card className="accuracy-card glass-card" bordered={false}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <i className="fa-solid fa-lock" style={{ color: "#10b981", fontSize: 20 }}
                      ></i>
                      <Text
                        style={{
                          color: "var(--text-secondary)",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        Model Accuracy
                      </Text>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 36,
                          fontWeight: 800,
                          color:
                            modelAccuracy !== null ? "#10b981" : "#64748b",
                          lineHeight: 1.1,
                        }}
                      >
                        {modelAccuracy !== null
                          ? `${modelAccuracy}%`
                          : employees.length > 0
                          ? "N/A"
                          : "—"}
                      </div>

                      <div
                        style={{
                          color: "rgba(148,163,184,0.7)",
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        {modelAccuracy !== null
                          ? "R\u00B2 Score vs Actual Data"
                          : "Upload dataset to calculate"}
                      </div>

                      <Progress
                        percent={modelAccuracy !== null ? modelAccuracy : 0}
                        showInfo={false}
                        strokeColor={
                          modelAccuracy !== null && modelAccuracy >= 70
                            ? "#10b981"
                            : "#f59e0b"
                        }
                        trailColor="rgba(255,255,255,0.06)"
                        style={{ marginTop: 10 }}
                      />

                      <Tag
                        style={{
                          background: "rgba(16,185,129,0.12)",
                          border: "1px solid rgba(16,185,129,0.3)",
                          color: "#6ee7b7",
                          borderRadius: 6,
                          marginTop: 8,
                          fontSize: 11,
                        }}
                      >
                        <i className="fa-solid fa-circle" style={{ marginRight: 4 }} ></i>
                        Random Forest Model
                      </Tag>
                    </div>
                  </Card>
                </Col>

                {/* Leaderboard */}
                <Col span={24}>
                  <Card
                    title={
                      <span>
                        <i className="fa-solid fa-trophy" style={{ marginRight: 8, color: "#fbbf24" }}
                        ></i>
                        Top Performers
                      </span>
                    }
                    className="leaderboard-card glass-card"
                    bordered={false}
                  >
                    {leaderboard.length === 0 ? (
                      <Empty
                        description="No data yet"
                        className="dark-empty"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      leaderboard.map((emp, i) => (
                        <div key={i} className="leaderboard-row">
                          <div
                            className={`leaderboard-rank ${
                              i === 0
                                ? "rank-1"
                                : i === 1
                                ? "rank-2"
                                : i === 2
                                ? "rank-3"
                                : "rank-other"
                            }`}
                          >
                            {i + 1}
                          </div>
                          <Tooltip
                            title={`${emp.employee_name} | Focus: ${
                              emp.focus_score || 0
                            } | Tasks: ${emp.tasks_completed || 0}`}
                          >
                            <span className="leaderboard-name">
                              {emp.employee_name}
                            </span>
                          </Tooltip>
                          <span className="leaderboard-score">
                            {emp.productivity}%
                          </span>
                        </div>
                      ))
                    )}
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        )}

        {/* ===== CHARTS ROW 2: New charts ===== */}
        {filteredEmployees.length > 0 && (
          <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>

            {/* Project Productivity Bar Chart */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <span>
                    <i className="fa-solid fa-circle" style={{ marginRight: 8, color: "#a78bfa" }}
                    ></i>
                    Project Productivity
                  </span>
                }
                className="chart-card glass-card"
                bordered={false}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={projectProductivity}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(37,99,235,0.1)"
                    />
                    <XAxis
                      dataKey="project"
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <RechartsTooltip
                      contentStyle={chartTooltipStyle}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Bar
                      dataKey="avgProductivity"
                      name="Avg Productivity"
                      fill="#a78bfa"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Productivity Trend Area Chart */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <span>
                    <i className="fa-solid fa-circle" style={{ marginRight: 8, color: "#34d399" }}
                    ></i>
                    Productivity Trend
                  </span>
                }
                className="chart-card glass-card"
                bordered={false}
              >
                {forecastData.length === 0 ? (
                  <Empty
                    description="No trend data available"
                    className="dark-empty"
                    style={{ padding: "40px 0" }}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={forecastData}>
                      <defs>
                        <linearGradient
                          id="prodGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="predGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#a78bfa"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#a78bfa"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(37,99,235,0.1)"
                      />
                      <XAxis
                        dataKey="week"
                        stroke="#64748b"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#64748b"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <RechartsTooltip
                        contentStyle={chartTooltipStyle}
                        itemStyle={{ color: "#e2e8f0" }}
                      />
                      <Legend wrapperStyle={{ color: "#94a3b8" }} />
                      <Area
                        type="monotone"
                        dataKey="productivity"
                        name="Actual"
                        stroke="#3b82f6"
                        fill="url(#prodGradient)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="predicted"
                        name="ML Predicted"
                        stroke="#a78bfa"
                        fill="url(#predGradient)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>

            {/* Project Burnout Chart */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <span>
                    <i className="fa-solid fa-fire" style={{ marginRight: 8, color: "#f87171" }}
                    ></i>
                    Project Burnout
                  </span>
                }
                className="chart-card glass-card"
                bordered={false}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={projectBurnout}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="project"
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <RechartsTooltip
                      contentStyle={chartTooltipStyle}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend wrapperStyle={{ color: "#94a3b8" }} />
                    <Bar
                      dataKey="High"
                      stackId="burnout"
                      fill="#ef4444"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="Medium"
                      stackId="burnout"
                      fill="#f59e0b"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="Low"
                      stackId="burnout"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        )}

        {/* ===== CHARTS ROW 3: Department Charts ===== */}
        {employees.length > 0 && (
          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <i className="fa-solid fa-building" style={{ marginRight: 8, color: "#60a5fa" }}
                    ></i>
                    Department Productivity
                  </span>
                }
                className="chart-card glass-card"
                bordered={false}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentProductivity}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(37,99,235,0.1)"
                    />
                    <XAxis
                      dataKey="department"
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <RechartsTooltip
                      contentStyle={chartTooltipStyle}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Bar
                      dataKey="avgProductivity"
                      name="Avg Productivity"
                      fill="#60a5fa"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <i className="fa-solid fa-fire" style={{ marginRight: 8, color: "#f87171" }}
                    ></i>
                    Department Burnout
                  </span>
                }
                className="chart-card glass-card"
                bordered={false}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentBurnout}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="department"
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <RechartsTooltip
                      contentStyle={chartTooltipStyle}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Bar dataKey="High" stackId="a" fill="#ef4444" maxBarSize={40} />
                    <Bar dataKey="Medium" stackId="a" fill="#f59e0b" maxBarSize={40} />
                    <Bar dataKey="Low" stackId="a" fill="#10b981" maxBarSize={40} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        )}

        {/* ===== SYSTEM HEALTH + DEPARTMENT RANKING ===== */}
        {employees.length > 0 && (
          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={8}>
              <SystemHealthWidget />
            </Col>
            <Col xs={24} lg={16}>
              <DepartmentRanking employees={filteredEmployees} rankings={departmentRankings} />
            </Col>
          </Row>
        )}

        {/* ===== FILTERS ===== */}
        <Card
          className="filter-card glass-card"
          bordered={false}
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Input
                prefix={
                  <i className="fa-solid fa-magnifying-glass" style={{ color: "rgba(148,163,184,0.5)" }}
                  ></i>
                }
                placeholder="Search Employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={applyFilters}
                className="dark-input"
                allowClear
              />
            </Col>

            <Col xs={24} sm={8} md={6}>
              <Select
                value={projectFilter}
                onChange={(value) => setProjectFilter(value)}
                className="dark-select"
                style={{ width: "100%" }}
                placeholder="All Projects"
                popupClassName="dark-select-dropdown"
              >
                <Option value="All Projects">All Projects</Option>
                {projectOptions.map(
                  (project, index) => (
                    <Option key={index} value={project}>
                      {project}
                    </Option>
                  )
                )}
              </Select>
            </Col>

            <Col xs={24} sm={8} md={5}>
              <Select
                value={burnoutFilter}
                onChange={(value) => setBurnoutFilter(value)}
                className="dark-select"
                style={{ width: "100%" }}
                placeholder="All Burnout"
                popupClassName="dark-select-dropdown"
              >
                <Option value="All Burnout">All Burnout</Option>
                <Option value="High">High Risk</Option>
                <Option value="Medium">Medium Risk</Option>
                <Option value="Low">Low Risk</Option>
              </Select>
            </Col>

            <Col xs={24} sm={24} md={7} style={{ display: "flex", gap: 8 }}>
              <Button
                icon={<i className="fa-solid fa-filter"></i>}
                onClick={applyFilters}
                className="filter-btn"
                type="primary"
                style={{ flex: 1 }}
              >
                Apply Filters
              </Button>
              <Button
                onClick={resetFilters}
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
              <Button
                icon={<i className="fa-solid fa-file-export"></i>}
                
                className="export-btn"
                type="primary"
                disabled={filteredEmployees.length === 0}
              >
                CSV
              </Button>
              <Button
                icon={<i className="fa-solid fa-file-pdf"></i>}
                onClick={handleExportPDF}
                className="pdf-btn"
                type="primary"
                disabled={filteredEmployees.length === 0}
              >
                PDF
              </Button>
            </Col>
          </Row>
        </Card>

        {/* ===== EMPLOYEE TABLE ===== */}
        {employees.length === 0 ? (
          <SkeletonTable />
        ) : (
          <Card
            title={
              <span>
                <i className="fa-solid fa-user-group" style={{ marginRight: 8, color: "#60a5fa" }} ></i>
                Employee Analytics
                {filteredEmployees.length > 0 && (
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
                    {filteredEmployees.length} records
                  </Tag>
                )}
              </span>
            }
            className="table-card glass-card"
            bordered={false}
            style={{ marginBottom: 28 }}
            extra={
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  icon={<i className="fa-solid fa-file-export"></i>}
                  
                  className="export-btn"
                  size="small"
                  disabled={filteredEmployees.length === 0}
                >
                  Export CSV
                </Button>
                <Button
                  icon={<i className="fa-solid fa-file-pdf"></i>}
                  onClick={handleExportPDF}
                  className="pdf-btn"
                  size="small"
                  disabled={filteredEmployees.length === 0}
                >
                  Export PDF
                </Button>
              </div>
            }
          >
            {filteredEmployees.length === 0 ? (
              <div style={{ padding: "48px 0" }}>
                <Empty
                  description={
                    <span style={{ color: "rgba(148,163,184,0.6)" }}>
                      Upload a CSV or XLSX dataset to see employee analytics
                    </span>
                  }
                  className="dark-empty"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <Table
                className="dark-table"
                dataSource={filteredEmployees.map((emp, i) => ({
                  ...emp,
                  key: i,
                }))}
                columns={tableColumns}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showTotal: (total, range) => (
                    <span style={{ color: "#94a3b8" }}>
                      {range[0]}–{range[1]} of {total} employees
                    </span>
                  ),
                }}
                scroll={{ x: 1300 }}
                sticky={{ offsetHeader: 0 }}
                rowClassName={(record) =>
                  record.productivity >= 80 ? "top-performer" : ""
                }
                size="middle"
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  style: { cursor: "pointer" },
                })}
              />
            )}
          </Card>
        )}

        {/* ===== AI PREDICTION FORM ===== */}
        <Card
          title={
            <span>
              <i className="fa-solid fa-robot" style={{ marginRight: 8, color: "#a78bfa" }} ></i>
              AI Productivity Prediction
              <Tag
                style={{
                  marginLeft: 10,
                  background: "rgba(167,139,250,0.12)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  color: "#c4b5fd",
                  borderRadius: 6,
                  fontSize: 11,
                }}
              >
                Live ML Model
              </Tag>
            </span>
          }
          className="prediction-card glass-card"
          bordered={false}
          style={{ marginBottom: 28 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Total Working Hours</label>
                <Input
                  type="number"
                  value={predictionForm.total_hours}
                  onChange={(e) =>
                    handlePredictionChange("total_hours", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 8"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Idle Time Minutes</label>
                <Input
                  type="number"
                  value={predictionForm.idle_time_minutes}
                  onChange={(e) =>
                    handlePredictionChange("idle_time_minutes", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 30"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Overtime Hours</label>
                <Input
                  type="number"
                  value={predictionForm.overtime_hours}
                  onChange={(e) =>
                    handlePredictionChange("overtime_hours", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 2"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Break Count</label>
                <Input
                  type="number"
                  value={predictionForm.break_count}
                  onChange={(e) =>
                    handlePredictionChange("break_count", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 3"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Meeting Hours</label>
                <Input
                  type="number"
                  value={predictionForm.meeting_hours}
                  onChange={(e) =>
                    handlePredictionChange("meeting_hours", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 1.5"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Tasks Completed</label>
                <Input
                  type="number"
                  value={predictionForm.tasks_completed}
                  onChange={(e) =>
                    handlePredictionChange("tasks_completed", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 5"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Bugs Fixed</label>
                <Input
                  type="number"
                  value={predictionForm.bugs_fixed}
                  onChange={(e) =>
                    handlePredictionChange("bugs_fixed", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 2"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Focus Score</label>
                <Input
                  type="number"
                  value={predictionForm.focus_score}
                  onChange={(e) =>
                    handlePredictionChange("focus_score", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 85"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Weekly Target</label>
                <Input
                  type="number"
                  value={predictionForm.weekly_target}
                  onChange={(e) =>
                    handlePredictionChange("weekly_target", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 10"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Target Completed</label>
                <Input
                  type="number"
                  value={predictionForm.target_completed}
                  onChange={(e) =>
                    handlePredictionChange("target_completed", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 8"
                />
              </div>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="pred-form-item">
                <label className="pred-label">Manager Rating</label>
                <Input
                  type="number"
                  value={predictionForm.manager_rating}
                  onChange={(e) =>
                    handlePredictionChange("manager_rating", e.target.value)
                  }
                  className="pred-input"
                  placeholder="e.g. 4.5"
                />
              </div>
            </Col>
          </Row>

          {/* Predict Button */}
          <div style={{ marginTop: 20 }}>
            <Spin spinning={isPredicting} tip="Analyzing with ML model...">
              <Button
                icon={<i className="fa-solid fa-circle"></i>}
                onClick={predictBurnout}
                className="predict-btn"
                type="primary"
                loading={isPredicting}
                size="large"
              >
                {isPredicting ? "Predicting..." : "Predict Productivity"}
              </Button>
            </Spin>
          </div>

          {/* Prediction Result Card */}
          {predictionResult !== "" &&
            !isPredicting &&
            (() => {
              const score = Number(predictionResult);
              const badge = getPerformanceBadge(score);
              return (
                <Card
                  bordered={false}
                  className={`result-card ${badge.cls}`}
                >
                  <Row gutter={[24, 0]} align="middle">
                    <Col xs={24} md={10} style={{ textAlign: "center" }}>
                      <span className="result-score">{score}%</span>
                      <div className="result-label">
                        ML Predicted Productivity Score
                      </div>
                      <Tag
                        style={{
                          marginTop: 10,
                          background: "rgba(255,255,255,0.15)",
                          border: "1px solid rgba(255,255,255,0.25)",
                          color: "#ffffff",
                          borderRadius: 8,
                          padding: "4px 14px",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {badge.icon}
                        {badge.label}
                      </Tag>
                    </Col>

                    <Col xs={24} md={14}>
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.75)",
                              fontSize: 13,
                            }}
                          >
                            Productivity Level
                          </Text>
                          <Text
                            style={{ color: "#ffffff", fontWeight: 700 }}
                          >
                            {score}%
                          </Text>
                        </div>
                        <Progress
                          percent={score}
                          strokeColor={badge.progressColor}
                          trailColor="rgba(255,255,255,0.1)"
                          strokeWidth={10}
                          format={() => ""}
                        />
                      </div>

                      <div
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: 14,
                          lineHeight: 1.7,
                        }}
                      >
                        {score >= 80 &&
                          "Excellent Performance — Employee is highly productive and a top contributor."}
                        {score >= 60 &&
                          score < 80 &&
                          "Good Performance — Productivity is stable. Minor improvements possible."}
                        {score >= 40 &&
                          score < 60 &&
                          "Average Performance — Needs improvement. Review workload and support strategies."}
                        {score < 40 &&
                          "Poor Performance — High burnout risk detected. Immediate manager review recommended."}
                      </div>

                      {/* AI Recommendations in prediction result */}
                      <div style={{ marginTop: 12 }}>
                        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          <i className="fa-solid fa-lightbulb" style={{ marginRight: 4 }} ></i>
                          AI Recommendations
                        </Text>
                        <div style={{ marginTop: 6 }}>
                          {score >= 80 && (
                            <div className="pred-rec-item">
                              <i className="fa-solid fa-circle" style={{ color: "#a78bfa", marginRight: 8 }} ></i>
                              Consider for leadership development and mentoring roles
                            </div>
                          )}
                          {score >= 60 && score < 80 && (
                            <>
                              <div className="pred-rec-item">
                                <i className="fa-solid fa-circle" style={{ color: "#a78bfa", marginRight: 8 }} ></i>
                                Improve focus sessions with dedicated deep work blocks
                              </div>
                              <div className="pred-rec-item">
                                <i className="fa-solid fa-circle" style={{ color: "#a78bfa", marginRight: 8 }} ></i>
                                Monitor workload balance and ensure adequate rest
                              </div>
                            </>
                          )}
                          {score >= 40 && score < 60 && (
                            <>
                              <div className="pred-rec-item">
                                <i className="fa-solid fa-circle" style={{ color: "#a78bfa", marginRight: 8 }} ></i>
                                Schedule regular breaks and reduce overtime workload
                              </div>
                              <div className="pred-rec-item">
                                <i className="fa-solid fa-circle" style={{ color: "#a78bfa", marginRight: 8 }} ></i>
                                Assign fewer parallel tasks to improve completion rate
                              </div>
                            </>
                          )}
                          {score < 40 && (
                            <>
                              <div className="pred-rec-item">
                                <i className="fa-solid fa-circle" style={{ color: "#a78bfa", marginRight: 8 }} ></i>
                                Provide technical training and skill development resources
                              </div>
                              <div className="pred-rec-item">
                                <i className="fa-solid fa-circle" style={{ color: "#a78bfa", marginRight: 8 }} ></i>
                                Conduct one-on-one wellness check with manager
                              </div>
                              <div className="pred-rec-item">
                                <i className="fa-solid fa-circle" style={{ color: "#a78bfa", marginRight: 8 }} ></i>
                                Review task complexity and provide mentorship support
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              );
            })()}
        </Card>

        {/* ===== EMPLOYEE MODAL ===== */}
        <EmployeeModal
          visible={showModal}
          employee={selectedEmployee}
          aggregatedEmployee={selectedEmployee ? aggregatedEmployees[selectedEmployee.employee_name] : null}
          onClose={() => {
            setShowModal(false);
            setSelectedEmployee(null);
          }}
          employeeHistory={employeeHistory}
        />

      </Content>

      {/* AI Copilot Floating Chat */}
      <CopilotChat />

    </Layout>
  );
}

export default Dashboard;
