import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Spin, Empty, Statistic, Tag } from 'antd';
import { API_BASE_URL as BACKEND_URL } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';

const { Content } = Layout;

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [globalSummary, setGlobalSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, sumRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/dashboard-data`),
          fetch(`${BACKEND_URL}/api/dashboard/summary`)
        ]);
        const dashData = await dashRes.json();
        const sumData = await sumRes.json();
        if (dashData.success) setDashboardData(dashData);
        if (sumData.success) setGlobalSummary(sumData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout className="app-layout" style={{ minHeight: '100vh', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Loading Enterprise Analytics..." />
      </Layout>
    );
  }

  if (!dashboardData || !dashboardData.has_data) {
    return (
      <Layout className="app-layout" style={{ minHeight: '100vh', padding: 24 }}>
        <Content>
          <Empty description={<span style={{ color: '#94a3b8' }}>No Jira data available for analytics. Sync with Jira first.</span>} />
        </Content>
      </Layout>
    );
  }

  const { productivity_trend, employees, aggregated_employees, jira_insights } = dashboardData;

  // 1. Productivity Trend Data
  const prodTrendData = (productivity_trend || []).map(t => ({
    name: t.date,
    Productivity: t.avg_productivity
  }));

  // 2. Burnout Prediction Data
  let high = 0, medium = 0, low = 0;
  employees.forEach(emp => {
    if (emp.burnout_risk === 'High') high++;
    else if (emp.burnout_risk === 'Medium') medium++;
    else low++;
  });
  const burnoutData = [
    { name: 'High Risk', value: high, color: '#ef4444' },
    { name: 'Medium Risk', value: medium, color: '#f59e0b' },
    { name: 'Low Risk', value: low, color: '#10b981' }
  ];

  // 3. Jira Completion Trend
  const jiraData = [
    { name: 'To Do', value: jira_insights?.todo || 0, color: '#64748b' },
    { name: 'In Progress', value: jira_insights?.in_progress || 0, color: '#3b82f6' },
    { name: 'Done', value: jira_insights?.done || 0, color: '#10b981' },
  ];

  // 4. Team Health Trend
  const healthTrendData = (productivity_trend || []).map(t => ({
    name: t.date,
    'Health Score': t.health_score || (t.avg_productivity ? t.avg_productivity * 0.9 : 0) // fallback if not available
  }));

  // 5. Workforce Distribution
  let top = 0, avg = 0, support = 0;
  Object.values(aggregated_employees || {}).forEach(emp => {
    if (emp.avg_productivity >= 80) top++;
    else if (emp.avg_productivity < 50 || emp.burnout_risk === 'High') support++;
    else avg++;
  });
  const distributionData = [
    { name: 'High Performers', value: top, color: '#10b981' },
    { name: 'Average Performers', value: avg, color: '#3b82f6' },
    { name: 'Needs Support', value: support, color: '#ef4444' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', padding: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>{label || payload[0].name}</p>
          {payload.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', margin: '4px 0', fontSize: '12px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color || p.payload.color, marginRight: 8 }}></span>
              <span style={{ color: '#cbd5e1', marginRight: 12 }}>{p.name}:</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Layout className="app-layout" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Content style={{ padding: '32px 24px', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 28, color: '#f8fafc', fontWeight: 700, letterSpacing: '-0.02em' }}>Enterprise Analytics</h2>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: 15 }}>Comprehensive workforce insights powered by ML</p>
          </div>
          <Tag color="#1d4ed8" style={{ border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-brands fa-jira"></i> Live Jira Sync
          </Tag>
        </div>

        {globalSummary && (
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            {[
              { title: 'Total Employees', value: globalSummary.totalEmployees, color: '#8b5cf6', icon: 'fa-users' },
              { title: 'Active Employees', value: globalSummary.activeEmployees, color: '#3b82f6', icon: 'fa-user-check' },
              { title: 'Top Performers', value: globalSummary.topPerformers, color: '#10b981', icon: 'fa-trophy' },
              { title: 'Need Support', value: globalSummary.needHelp, color: '#ef4444', icon: 'fa-life-ring' }
            ].map((stat, i) => (
              <Col xs={12} lg={6} key={i}>
                <Card className="glass-card" bordered={false} style={{ height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, fontSize: 20 }}>
                      <i className={`fa-solid ${stat.icon}`}></i>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{stat.title}</div>
                      <div style={{ color: '#f8fafc', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{stat.value}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="glass-card" bordered={false} title={<span style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600 }}>Productivity Trend</span>}>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prodTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area type="monotone" dataKey="Productivity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProd)" animationDuration={1500} activeDot={{ r: 6, strokeWidth: 0, fill: '#60a5fa' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="glass-card" bordered={false} title={<span style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600 }}>Burnout Risk Prediction</span>}>
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={burnoutData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" animationDuration={1500} stroke="none">
                      {burnoutData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="glass-card" bordered={false} title={<span style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600 }}>Jira Task Execution</span>}>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jiraData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1500} barSize={40}>
                      {jiraData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="glass-card" bordered={false} title={<span style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600 }}>Team Health Monitor</span>}>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthTrendData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area type="monotone" dataKey="Health Score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" animationDuration={1500} activeDot={{ r: 6, strokeWidth: 0, fill: '#34d399' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="glass-card" bordered={false} title={<span style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600 }}>Workforce Distribution</span>}>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" animationDuration={1500} stroke="none">
                      {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AnalyticsPage;
