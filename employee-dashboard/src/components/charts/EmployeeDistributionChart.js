import React, { useMemo } from 'react';
import { Card } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['var(--accent-cyan)', 'var(--accent-violet)', 'var(--accent-blue)', 'var(--status-success)', 'var(--status-warning)', 'var(--status-danger)'];

const EmployeeDistributionChart = ({ aggregatedEmployees }) => {
  const { data, total } = useMemo(() => {
    if (!aggregatedEmployees) return { data: [], total: 0 };
    const aggVals = Object.values(aggregatedEmployees);
    if (aggVals.length === 0) return { data: [], total: 0 };

    const deptMap = {};
    aggVals.forEach(emp => {
      const dept = emp.department || 'Unknown';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    const chartData = Object.entries(deptMap).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    return { data: chartData, total: aggVals.length };
  }, [aggregatedEmployees]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--bg-dark)', padding: '10px', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ margin: 0, color: payload[0].payload.color }}>Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
      className="glass-panel" 
      bordered={false}
      style={{ height: '100%' }}
    >
      <h3 className="enterprise-card-title" style={{ marginBottom: 16 }}>
        <i className="fa-solid fa-chart-pie"></i> Employee Distribution
      </h3>

      <div style={{ width: '100%', height: 300, position: 'relative' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
        {total > 0 && (
          <div style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{total}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Employees</div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EmployeeDistributionChart;
