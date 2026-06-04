import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Row,
  Col,
  Segmented,
  Spin,
  Empty,
  Statistic,
  Tag,
  notification,
} from "antd";
import {
  ArrowLeftOutlined,
  AreaChartOutlined,
  FireOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  TeamOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const { Header, Content } = Layout;
const BACKEND_URL = "http://127.0.0.1:5000";

function HistoricalAnalyticsPage() {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = useCallback((d) => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/historical-analytics?days=${d}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData(res);
        } else {
          api.error({ message: "Error", description: res.error });
        }
      })
      .catch((err) => api.error({ message: "Error", description: err.message }))
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  const tooltipStyle = {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: 8,
    color: "#e2e8f0",
  };

  const trends = data?.trends || {};
  const prodData = trends.productivity || [];
  const burnoutData = trends.burnout || [];
  const hoursData = trends.hours || [];

  // Compute growth %
  const prodGrowth = prodData.length >= 2
    ? ((prodData[prodData.length - 1].avg_productivity - prodData[0].avg_productivity) / (prodData[0].avg_productivity || 1) * 100).toFixed(1)
    : null;
  const hoursGrowth = hoursData.length >= 2
    ? ((hoursData[hoursData.length - 1].avg_hours - hoursData[0].avg_hours) / (hoursData[0].avg_hours || 1) * 100).toFixed(1)
    : null;

  // AI Trend Summary
  const trendInsights = [];
  if (prodData.length >= 2) {
    const first = prodData[0].avg_productivity;
    const last = prodData[prodData.length - 1].avg_productivity;
    if (last > first) trendInsights.push({ severity: "success", text: `Productivity improved from ${first}% to ${last}% over this period.` });
    else if (last < first) trendInsights.push({ severity: "danger", text: `Productivity declined from ${first}% to ${last}% — investigate root causes.` });
    else trendInsights.push({ severity: "info", text: `Productivity remained stable at ${last}%.` });
  }
  if (burnoutData.length > 0) {
    const lastBurnout = burnoutData[burnoutData.length - 1];
    if (lastBurnout.high > 0) trendInsights.push({ severity: "warning", text: `${lastBurnout.high} employees at high burnout risk in latest data point.` });
    else trendInsights.push({ severity: "success", text: "No high burnout risk detected in latest data point." });
  }
  if (hoursData.length >= 2) {
    const lastOT = hoursData[hoursData.length - 1].avg_overtime;
    if (lastOT > 1) trendInsights.push({ severity: "warning", text: `Average overtime is ${lastOT}h — consider workload rebalancing.` });
  }

  return (
    <Layout className="app-layout">
      {contextHolder}
      <Header className="app-header">
        <div className="header-left">
          <button className="header-nav-btn" onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <ArrowLeftOutlined /> Dashboard
          </button>
          <AreaChartOutlined style={{ fontSize: 22, color: "#8b5cf6", marginLeft: 16 }} />
          <span className="header-title" style={{ marginLeft: 10, color: "#e2e8f0", fontWeight: 600, fontSize: 18 }}>Historical Analytics</span>
        </div>
      </Header>

      <Content className="app-content">
        {/* Time Filter */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Segmented
            options={[
              { label: "7 Days", value: 7 },
              { label: "30 Days", value: 30 },
              { label: "90 Days", value: 90 },
            ]}
            value={days}
            onChange={(val) => setDays(val)}
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          {data && data.has_data && (
            <span style={{ color: "#94a3b8", fontSize: 13 }}>
              <TeamOutlined style={{ marginRight: 6 }} />
              {data.total_records} records
            </span>
          )}
        </div>

        <Spin spinning={loading}>
          {!data || !data.has_data ? (
            <Card className="glass-card" bordered={false}>
              <Empty description={<span style={{ color: "#64748b" }}>No data for the selected period</span>} />
            </Card>
          ) : (
            <>
              {/* Summary Stats */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={8}>
                  <Card className="glass-card" bordered={false} style={{ textAlign: "center" }}>
                    <Statistic
                      title={<span style={{ color: "#94a3b8" }}>Avg Productivity</span>}
                      value={prodData.length > 0 ? prodData[prodData.length - 1].avg_productivity : 0}
                      suffix="%"
                      valueStyle={{ color: "#10b981", fontSize: 32 }}
                      prefix={<RiseOutlined />}
                    />
                    {prodGrowth !== null && (
                      <Tag
                        color={Number(prodGrowth) >= 0 ? "green" : "red"}
                        style={{ marginTop: 8, fontSize: 12 }}
                      >
                        {Number(prodGrowth) >= 0 ? <RiseOutlined /> : <FallOutlined />}
                        {' '}{Number(prodGrowth) >= 0 ? '+' : ''}{prodGrowth}% vs start
                      </Tag>
                    )}
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card className="glass-card" bordered={false} style={{ textAlign: "center" }}>
                    <Statistic
                      title={<span style={{ color: "#94a3b8" }}>Data Points</span>}
                      value={prodData.length}
                      suffix="days"
                      valueStyle={{ color: "#3b82f6", fontSize: 32 }}
                      prefix={<AreaChartOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card className="glass-card" bordered={false} style={{ textAlign: "center" }}>
                    <Statistic
                      title={<span style={{ color: "#94a3b8" }}>Total Records</span>}
                      value={data.total_records}
                      valueStyle={{ color: "#a78bfa", fontSize: 32 }}
                      prefix={<TeamOutlined />}
                    />
                    {hoursGrowth !== null && (
                      <Tag
                        color={Number(hoursGrowth) <= 0 ? "green" : "orange"}
                        style={{ marginTop: 8, fontSize: 12 }}
                      >
                        <ClockCircleOutlined /> Hours {Number(hoursGrowth) >= 0 ? '+' : ''}{hoursGrowth}%
                      </Tag>
                    )}
                  </Card>
                </Col>
              </Row>

              {/* Productivity Trend */}
              <Card className="glass-card" bordered={false} style={{ marginBottom: 24 }}>
                <h3 style={{ color: "#e2e8f0", marginBottom: 20 }}>
                  <RiseOutlined style={{ marginRight: 8, color: "#10b981" }} />
                  Productivity Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={prodData}>
                    <defs>
                      <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="avg_productivity" stroke="#10b981" fillOpacity={1} fill="url(#prodGrad)" name="Avg Productivity %" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Burnout Trend */}
              <Card className="glass-card" bordered={false} style={{ marginBottom: 24 }}>
                <h3 style={{ color: "#e2e8f0", marginBottom: 20 }}>
                  <FireOutlined style={{ marginRight: 8, color: "#ef4444" }} />
                  Burnout Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={burnoutData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="high" stackId="a" fill="#ef4444" name="High" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium" />
                    <Bar dataKey="low" stackId="a" fill="#10b981" name="Low" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Working Hours Trend */}
              <Card className="glass-card" bordered={false} style={{ marginBottom: 24 }}>
                <h3 style={{ color: "#e2e8f0", marginBottom: 20 }}>
                  <ClockCircleOutlined style={{ marginRight: 8, color: "#3b82f6" }} />
                  Working Hours Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="avg_hours" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Avg Hours" />
                    <Line type="monotone" dataKey="avg_overtime" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Avg Overtime" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* AI Trend Summary */}
              {trendInsights.length > 0 && (
                <Card className="glass-card" bordered={false} style={{ marginBottom: 24 }}>
                  <h3 style={{ color: "#e2e8f0", marginBottom: 16 }}>
                    <BulbOutlined style={{ marginRight: 8, color: "#a78bfa" }} />
                    AI Trend Summary
                  </h3>
                  {trendInsights.map((insight, idx) => {
                    const dotColor = insight.severity === "success" ? "#10b981" : insight.severity === "warning" ? "#f59e0b" : insight.severity === "danger" ? "#ef4444" : "#3b82f6";
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: idx < trendInsights.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, marginTop: 6, flexShrink: 0 }} />
                        <span style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.6 }}>{insight.text}</span>
                      </div>
                    );
                  })}
                </Card>
              )}
            </>
          )}
        </Spin>
      </Content>
    </Layout>
  );
}

export default HistoricalAnalyticsPage;
