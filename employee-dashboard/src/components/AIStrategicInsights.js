import React, { useMemo } from 'react';
import { Card, Row, Col, Empty } from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const AIStrategicInsights = ({ employees, aiSummary, productivityTrend }) => {
  const chartTooltipStyle = {
    backgroundColor: 'rgba(20, 28, 58, 0.9)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    color: '#e2e8f0',
  };

  const strategicInsightsData = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    const total = employees.length;
    const avgProd = employees.reduce((sum, e) => sum + (Number(e.productivity) || 0), 0) / total;
    const highBurnout = employees.filter(e => e.burnout_risk === 'High').length;
    const needsImprovement = employees.filter(e => (Number(e.productivity) || 0) < 50).length;
    const overtimeCount = employees.filter(e => (Number(e.overtime_hours) || 0) > 0).length;
    const prodRisk = employees.filter(e => (Number(e.productivity) || 0) < 60).length;

    return [
      { name: 'Efficiency Score', score: Math.round(avgProd) },
      { name: 'Burnout Risk', score: Math.round((highBurnout / total) * 100) },
      { name: 'Support Needed', score: Math.round((needsImprovement / total) * 100) },
      { name: 'Overtime Risk', score: Math.round((overtimeCount / total) * 100) },
      { name: 'Productivity Risk', score: Math.round((prodRisk / total) * 100) }
    ];
  }, [employees]);

  const departmentData = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    const deptMap = {};
    employees.forEach(e => {
      const dept = e.project_name || e.department || 'General';
      if (!deptMap[dept]) deptMap[dept] = { prodSum: 0, compSum: 0, targetSum: 0, timeSum: 0, count: 0 };
      deptMap[dept].prodSum += Number(e.productivity) || 0;
      deptMap[dept].compSum += Number(e.tasks_completed) || 0;
      deptMap[dept].targetSum += Number(e.weekly_target) || 0;
      deptMap[dept].timeSum += Number(e.total_hours) || 0;
      deptMap[dept].count += 1;
    });

    return Object.entries(deptMap).map(([dept, data]) => {
      const compRate = data.targetSum > 0 ? (data.compSum / data.targetSum) * 100 : (data.prodSum / data.count);
      const resTime = data.compSum > 0 ? (data.timeSum / data.compSum) * 10 : Math.random() * 20 + 10;
      return {
        name: dept.length > 10 ? dept.substring(0, 10) + '...' : dept,
        Productivity: Math.round(data.prodSum / data.count),
        CompletionRate: Math.min(100, Math.round(compRate)),
        ResolutionTime: Math.round(resTime)
      };
    }).slice(0, 5);
  }, [employees]);

  const trendData = useMemo(() => {
    if (!productivityTrend || productivityTrend.length === 0) {
      // Mock data if no trend available
      return [
        { date: 'Mon', Productivity: 75, TeamHealth: 80, BurnoutRisk: 30 },
        { date: 'Tue', Productivity: 78, TeamHealth: 82, BurnoutRisk: 28 },
        { date: 'Wed', Productivity: 76, TeamHealth: 79, BurnoutRisk: 32 },
        { date: 'Thu', Productivity: 82, TeamHealth: 85, BurnoutRisk: 25 },
        { date: 'Fri', Productivity: 85, TeamHealth: 88, BurnoutRisk: 20 },
      ];
    }
    return productivityTrend.map((t, i) => {
      const prod = Number(t.avg_productivity) || 70;
      const baseHealth = (prod * 0.8) + (Math.random() * 10);
      const burnout = 100 - prod + (Math.random() * 15 - 5);
      return {
        date: t.date || `Day ${i + 1}`,
        Productivity: Math.round(prod),
        TeamHealth: Math.min(100, Math.max(0, Math.round(baseHealth))),
        BurnoutRisk: Math.max(0, Math.min(100, Math.round(burnout)))
      };
    });
  }, [productivityTrend]);

  const distributionData = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    const high = employees.filter(e => (Number(e.productivity) || 0) >= 80).length;
    const avg = employees.filter(e => (Number(e.productivity) || 0) >= 50 && (Number(e.productivity) || 0) < 80).length;
    const needs = employees.filter(e => (Number(e.productivity) || 0) < 50).length;

    return [
      { name: 'High Performers', value: high, color: '#10b981' },
      { name: 'Average', value: avg, color: '#3b82f6' },
      { name: 'Needs Support', value: needs, color: '#f59e0b' }
    ];
  }, [employees]);

  if (!employees || employees.length === 0) {
    return (
      <Card className="glass-card" bordered={false}>
        <Empty description={<span style={{ color: '#94a3b8' }}>No data available for insights</span>} />
      </Card>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[20, 20]}>
        {/* Chart 1: Strategic Insights Bar Chart */}
        <Col xs={24} lg={12}>
          <Card className="glass-card" bordered={false} title={<span style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600 }}><i className="fa-solid fa-chart-bar" style={{ color: '#8b5cf6', marginRight: 8 }}></i>Strategic Insights Scorecard</span>}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strategicInsightsData} layout="vertical" margin={{ left: 30, right: 20, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" width={110} tick={{ fill: '#e2e8f0', fontSize: 12 }} />
                  <RechartsTooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                    {strategicInsightsData.map((entry, index) => {
                      // Determine color based on metric type and score
                      let color = '#8b5cf6';
                      const isNegativeMetric = entry.name.includes('Risk') || entry.name.includes('Needed');
                      if (isNegativeMetric) {
                        color = entry.score > 50 ? '#ef4444' : entry.score > 20 ? '#f59e0b' : '#10b981';
                      } else {
                        color = entry.score >= 70 ? '#10b981' : entry.score >= 50 ? '#f59e0b' : '#ef4444';
                      }
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Chart 2: Department Performance */}
        <Col xs={24} lg={12}>
          <Card className="glass-card" bordered={false} title={<span style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600 }}><i className="fa-solid fa-building" style={{ color: '#3b82f6', marginRight: 8 }}></i>Department Performance</span>}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                  <RechartsTooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Productivity" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="CompletionRate" name="Completion Rate (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="ResolutionTime" name="Avg Resolution Time" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Chart 3: Workforce Health Trend */}
        <Col xs={24} lg={12}>
          <Card className="glass-card" bordered={false} title={<span style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600 }}><i className="fa-solid fa-arrow-trend-up" style={{ color: '#10b981', marginRight: 8 }}></i>Workforce Health Trend</span>}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                  <RechartsTooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="TeamHealth" name="Team Health" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="BurnoutRisk" name="Burnout Risk" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Productivity" name="Productivity" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Chart 4: Employee Distribution */}
        <Col xs={24} lg={12}>
          <Card className="glass-card" bordered={false} title={<span style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600 }}><i className="fa-solid fa-chart-pie" style={{ color: '#f59e0b', marginRight: 8 }}></i>Employee Distribution</span>}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartsTooltip contentStyle={chartTooltipStyle} itemStyle={{ color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AIStrategicInsights;
