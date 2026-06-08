import React, { useMemo } from 'react';
import { Row, Col, Progress, Card, Empty } from 'antd';

const DepartmentRanking = ({ employees, rankings: providedRankings = [] }) => {
  const rankings = useMemo(() => {
    if (providedRankings && providedRankings.length > 0) {
      return providedRankings.map((dept, index) => ({
        name: dept.department_name || dept.department || 'Unknown',
        avgProductivity: Math.round(dept.average_productivity || 0),
        healthScore: Math.round(dept.health_score || 0),
        memberCount: dept.employee_count || 0,
        highBurnoutCount: dept.high_burnout_count || 0,
        burnoutRisk: dept.burnout_risk || 'Low',
        rank: dept.rank || index + 1,
      }));
    }

    if (!employees || employees.length === 0) return [];

    const groups = {};
    employees.forEach((emp) => {
      const dept = emp.department || 'Unknown';
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(emp);
    });

    const deptStats = Object.entries(groups).map(([name, members]) => {
      const recordCount = members.length || 1;
      const memberCount = new Set(members.map((m) => m.employee_name)).size;
      const avgProductivity =
        members.reduce((sum, m) => sum + (m.productivity || 0), 0) / recordCount;
      const highBurnoutCount = members.filter(
        (m) => m.burnout_risk === 'High'
      ).length;
      const highBurnoutPct = highBurnoutCount / recordCount;
      const avgFocusScore =
        members.reduce((sum, m) => sum + (m.focus_score || 0), 0) / recordCount;
      const healthScore =
        avgProductivity * 0.5 +
        (100 - highBurnoutPct * 100) * 0.3 +
        avgFocusScore * 0.2;

      return {
        name,
        avgProductivity: Math.round(avgProductivity),
        healthScore: Math.round(healthScore),
        memberCount,
        highBurnoutCount,
        burnoutRisk: highBurnoutCount > 0 ? 'High' : 'Low',
      };
    });

    deptStats.sort((a, b) => b.healthScore - a.healthScore);
    return deptStats.map((dept, index) => ({ ...dept, rank: index + 1 }));
  }, [employees, providedRankings]);

  const getBorderColor = (index) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return '#a855f7';
  };

  const getProgressColor = (score) => {
    if (score >= 70) return '#52c41a';
    if (score >= 50) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <Card
      className="glass-card"
      bordered={false}
      title={
        <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 600 }}>
          <i className="fa-solid fa-trophy" style={{ marginRight: 8, color: '#a855f7' }} ></i>
          Department Rankings
        </span>
      }
      style={{ background: 'transparent' }}
      styles={{ body: { padding: '16px' } }}
    >
      {rankings.length === 0 ? (
        <Empty
          description={
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>
              No employee data available
            </span>
          }
        />
      ) : (
        <Row gutter={[16, 16]}>
          {rankings.map((dept, index) => (
            <Col xs={24} md={12} lg={8} key={dept.name}>
              <div
                style={{
                  background: 'rgba(30,41,59,0.5)',
                  borderRadius: 8,
                  padding: 14,
                  borderLeft: `3px solid ${getBorderColor(index)}`,
                  height: '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 18, marginRight: 10, color: getBorderColor(index), fontWeight: 800 }}>
                    #{dept.rank || index + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {dept.name}
                  </span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: 4,
                      display: 'block',
                    }}
                  >
                    Health Score
                  </span>
                  <Progress
                    percent={dept.healthScore}
                    size="small"
                    strokeColor={getProgressColor(dept.healthScore)}
                    trailColor="rgba(255,255,255,0.1)"
                    format={(pct) => (
                      <span style={{ color: '#ffffff', fontSize: 12 }}>
                        {pct}%
                      </span>
                    )}
                  />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {dept.memberCount} members | {dept.highBurnoutCount} high burnout | {dept.avgProductivity}% avg prod | {dept.burnoutRisk} risk
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
};

export default DepartmentRanking;
