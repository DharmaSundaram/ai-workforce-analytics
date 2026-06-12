import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const StrategicInsightsBarChart = ({ employees, aiSummary }) => {
  const data = useMemo(() => {
    if (!employees || employees.length === 0) return [];

    const total = employees.length;

    // 1. Productivity Risk (Inversely proportional to avg productivity)
    const avgProductivity =
      aiSummary && aiSummary.avg_productivity != null
        ? aiSummary.avg_productivity
        : employees.reduce((sum, e) => sum + Number(e.productivity || 0), 0) / total;
    const productivityRisk = Math.max(0, 100 - avgProductivity);

    // 2. Burnout Risk (Percentage of high/medium burnout)
    const burnoutRiskCount = employees.filter(e => e.burnout_risk === 'High' || e.burnout_risk === 'Medium').length;
    const burnoutRiskScore = (burnoutRiskCount / total) * 100;

    // 3. Performance Support Needed (Percentage of employees with low productivity < 50)
    const needsSupportCount = employees.filter(e => Number(e.productivity || 0) < 50).length;
    const supportNeededScore = (needsSupportCount / total) * 100;

    // 4. Team Efficiency Score (Derived from avg focus score or overall productivity)
    const avgFocus = employees.reduce((sum, e) => sum + Number(e.focus_score || 0), 0) / total;
    const efficiencyScore = avgFocus || avgProductivity;

    // 5. Overtime Risk Score (Percentage of employees working overtime)
    const overtimeCount = employees.filter(e => Number(e.overtime_hours || 0) > 0).length;
    const overtimeRiskScore = (overtimeCount / total) * 100;

    return [
      { name: 'Productivity Risk', value: Math.round(productivityRisk), color: '#ef4444' },
      { name: 'Burnout Risk', value: Math.round(burnoutRiskScore), color: '#f97316' },
      { name: 'Support Needed', value: Math.round(supportNeededScore), color: '#f59e0b' },
      { name: 'Team Efficiency', value: Math.round(efficiencyScore), color: '#10b981' },
      { name: 'Overtime Risk', value: Math.round(overtimeRiskScore), color: '#8b5cf6' },
    ];
  }, [employees, aiSummary]);

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '8px',
    color: '#f8fafc'
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240} debounce={50}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#64748b" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(value) => [`${value}%`, 'Score']} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StrategicInsightsBarChart;
