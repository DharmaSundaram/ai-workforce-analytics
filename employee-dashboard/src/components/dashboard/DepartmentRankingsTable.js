import React, { useMemo } from 'react';
import { Table, Card, Tag } from 'antd';

const DepartmentRankingsTable = ({ employees }) => {
  const data = useMemo(() => {
    if (!employees || employees.length === 0) return [];

    const deptMap = {};
    employees.forEach(emp => {
      const dept = emp.department || 'Unknown';
      if (!deptMap[dept]) {
        deptMap[dept] = { dept, totalProd: 0, highBurnout: 0, empCount: 0 };
      }
      deptMap[dept].totalProd += Number(emp.productivity || 0);
      deptMap[dept].empCount += 1;
      if (emp.burnout_risk === 'High') {
        deptMap[dept].highBurnout += 1;
      }
    });

    return Object.values(deptMap).map(d => ({
      key: d.dept,
      department: d.dept,
      employeeCount: d.empCount,
      avgProductivity: Math.round(d.totalProd / d.empCount),
      burnoutRisk: Math.round((d.highBurnout / d.empCount) * 100)
    })).sort((a, b) => b.avgProductivity - a.avgProductivity);
  }, [employees]);

  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 80,
      render: (text, record, index) => <span style={{ color: 'var(--text-secondary)' }}>#{index + 1}</span>
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: text => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{text}</span>
    },
    {
      title: 'Employees',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
    },
    {
      title: 'Avg Productivity',
      dataIndex: 'avgProductivity',
      key: 'avgProductivity',
      render: val => <span style={{ color: val >= 70 ? 'var(--status-success)' : val >= 50 ? 'var(--status-warning)' : 'var(--status-danger)' }}>{val}%</span>
    },
    {
      title: 'Burnout Risk',
      dataIndex: 'burnoutRisk',
      key: 'burnoutRisk',
      render: val => (
        <Tag color={val >= 30 ? 'error' : val >= 15 ? 'warning' : 'success'} style={{ borderRadius: 12 }}>
          {val}% Risk
        </Tag>
      )
    }
  ];

  return (
    <Card 
      className="glass-panel" 
      bordered={false}
      style={{ height: '100%' }}
    >
      <h3 className="enterprise-card-title" style={{ marginBottom: 16 }}>
        <i className="fa-solid fa-ranking-star"></i> Department Rankings
      </h3>
      <Table 
        dataSource={data} 
        columns={columns} 
        pagination={false}
        size="middle"
      />
    </Card>
  );
};

export default DepartmentRankingsTable;
