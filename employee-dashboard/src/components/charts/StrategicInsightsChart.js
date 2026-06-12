import React, { useMemo } from 'react';
import { Card, Progress, Row, Col } from 'antd';

const StrategicInsightsChart = ({ employees, aggregatedEmployees }) => {
  const data = useMemo(() => {
    if (!employees || employees.length === 0) return { efficiency: 0, burnout: 0, productivity: 0 };
    
    let totalProd = 0;
    let highBurnoutCount = 0;
    
    employees.forEach(emp => {
      totalProd += Number(emp.productivity || 0);
      if (emp.burnout_risk === 'High') highBurnoutCount += 1;
    });
    
    const avgProd = totalProd / employees.length;
    const burnoutRiskScore = (highBurnoutCount / employees.length) * 100;
    const productivityRiskScore = Math.max(0, 100 - avgProd);

    return {
      efficiency: Math.round(avgProd),
      burnout: Math.round(burnoutRiskScore),
      productivity: Math.round(productivityRiskScore)
    };
  }, [employees, aggregatedEmployees]);

  return (
    <Card 
      className="glass-panel" 
      bordered={false}
      style={{ height: '100%' }}
    >
      <h3 className="enterprise-card-title" style={{ marginBottom: 24 }}>
        <i className="fa-solid fa-chart-column"></i> Strategic Insights
      </h3>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Team Efficiency</span>
            <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>{data.efficiency}%</span>
          </div>
          <Progress percent={data.efficiency} strokeColor="var(--status-success)" trailColor="rgba(255,255,255,0.1)" showInfo={false} />
        </Col>

        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Burnout Risk</span>
            <span style={{ color: 'var(--status-danger)', fontWeight: 600 }}>{data.burnout}%</span>
          </div>
          <Progress percent={data.burnout} strokeColor="var(--status-danger)" trailColor="rgba(255,255,255,0.1)" showInfo={false} />
        </Col>

        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Productivity Risk</span>
            <span style={{ color: 'var(--status-warning)', fontWeight: 600 }}>{data.productivity}%</span>
          </div>
          <Progress percent={data.productivity} strokeColor="var(--status-warning)" trailColor="rgba(255,255,255,0.1)" showInfo={false} />
        </Col>
      </Row>
    </Card>
  );
};

export default StrategicInsightsChart;
