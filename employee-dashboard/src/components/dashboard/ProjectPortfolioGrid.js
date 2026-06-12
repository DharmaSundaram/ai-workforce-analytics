import React from 'react';
import { Row, Col, Card, Tag, Tooltip } from 'antd';

const ProjectPortfolioGrid = ({ projectPerformanceOverview }) => {
  if (!projectPerformanceOverview || projectPerformanceOverview.length === 0) return null;

  return (
    <div style={{ marginTop: 24, marginBottom: 24 }}>
      <h3 className="enterprise-card-title" style={{ marginBottom: 16 }}>
        <i className="fa-solid fa-diagram-project"></i> Project Portfolio
      </h3>
      <Row gutter={[20, 20]}>
        {projectPerformanceOverview.map((proj, idx) => (
          <Col xs={24} sm={12} md={8} lg={6} key={idx}>
            <Card className="glass-panel" bordered={false}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                  {proj.project_name}
                </span>
                <Tooltip title="Project Health Score based on Jira + HR metrics">
                  <Tag color={proj.health_score >= 80 ? "success" : proj.health_score >= 50 ? "warning" : "error"} style={{ borderRadius: 12 }}>
                    Health: {proj.health_score}%
                  </Tag>
                </Tooltip>
              </div>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div style={{ color: "var(--text-secondary)", fontSize: '0.8rem', textTransform: 'uppercase' }}>Employees</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{proj.employee_count}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: "var(--text-secondary)", fontSize: '0.8rem', textTransform: 'uppercase' }}>Tasks</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{proj.task_count}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: "var(--text-secondary)", fontSize: '0.8rem', textTransform: 'uppercase' }}>Productivity</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: "var(--accent-cyan)" }}>{proj.productivity_score}%</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: "var(--text-secondary)", fontSize: '0.8rem', textTransform: 'uppercase' }}>Burnout Risk</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: "var(--status-danger)" }}>{proj.burnout_risk_count}</div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProjectPortfolioGrid;
