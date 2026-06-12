import React, { useMemo, useState } from 'react';
import { Card, Select } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const { Option } = Select;

const DepartmentPerformanceChart = ({ employees }) => {
  const [selectedDept, setSelectedDept] = useState('All');

  const { data, allDepts } = useMemo(() => {
    if (!employees || employees.length === 0) return { data: [], allDepts: [] };

    const deptMap = {};
    employees.forEach(emp => {
      const dept = emp.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { totalProd: 0, empCount: 0 };
      }
      deptMap[dept].totalProd += Number(emp.productivity || 0);
      deptMap[dept].empCount += 1;
    });

    const depts = Object.keys(deptMap).sort();
    
    const chartData = Object.entries(deptMap)
      .filter(([dept]) => selectedDept === 'All' || dept === selectedDept)
      .map(([dept, metrics]) => {
        const avgProd = metrics.empCount > 0 ? metrics.totalProd / metrics.empCount : 0;
        return {
          name: dept,
          'Avg Productivity': Math.round(avgProd),
          'Employee Count': metrics.empCount,
          'Department Score': Math.round(avgProd * 0.8 + (metrics.empCount > 5 ? 20 : 10)) // Arbitrary mock for visual
        };
      })
      .sort((a, b) => b['Department Score'] - a['Department Score'])
      .slice(0, 5); // top 5 departments if 'All'

    return { data: chartData, allDepts: depts };
  }, [employees, selectedDept]);

  return (
    <Card 
      className="glass-panel" 
      bordered={false}
      style={{ height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 className="enterprise-card-title" style={{ margin: 0 }}>
          <i className="fa-solid fa-building"></i> Department Performance
        </h3>
        <Select 
          value={selectedDept} 
          onChange={setSelectedDept} 
          style={{ width: 140 }}
        >
          <Option value="All">All Departments</Option>
          {allDepts.map(d => <Option key={d} value={d}>{d}</Option>)}
        </Select>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
            <Bar dataKey="Department Score" fill="var(--accent-violet)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Avg Productivity" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Employee Count" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DepartmentPerformanceChart;
