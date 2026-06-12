import React from 'react';
import { Row, Col, Card, Progress, Statistic } from 'antd';

const DashboardHero = ({ globalSummary, aiSummary, healthScore }) => {
  return (
    <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
      {/* LEFT: Circular Team Health Score */}
      <Col xs={24} md={6}>
        <Card className="glass-panel" bordered={false} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3 className="enterprise-card-title" style={{ marginBottom: 24 }}>Team Health Score</h3>
          <Progress 
            type="dashboard" 
            percent={healthScore || 0} 
            strokeColor={{ '0%': 'var(--accent-cyan)', '100%': 'var(--accent-blue)' }}
            format={percent => (
              <div style={{ color: '#fff', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700 }}>{percent}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Score</span>
              </div>
            )}
            size={160}
          />
        </Card>
      </Col>

      {/* CENTER: AI Synthesis */}
      <Col xs={24} md={10}>
        <Card className="glass-panel" bordered={false} style={{ height: '100%' }}>
          <h3 className="enterprise-card-title"><i className="fa-solid fa-robot"></i> AI Synthesis</h3>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Avg Productivity</span>
              <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>{aiSummary?.avg_productivity || 0}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Burnout Summary</span>
              <span style={{ color: 'var(--status-warning)', fontWeight: 600 }}>{aiSummary?.high_burnout_count || 0} High Risk</span>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ color: 'var(--accent-violet)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>TOP INSIGHTS</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {aiSummary?.top_insight || "Productivity remains stable across Engineering. Monitor QA team for spikes in workload."}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 }}>
              <div style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>RECOMMENDATION</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {aiSummary?.recommendation || "Redistribute 15% of Jira tickets from top performers to reduce overall overtime risk."}
              </div>
            </div>
          </div>
        </Card>
      </Col>

      {/* RIGHT: KPI CARDS */}
      <Col xs={24} md={8}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card className="glass-panel" bordered={false} bodyStyle={{ padding: '16px' }}>
              <Statistic 
                title={<span style={{ color: 'var(--text-secondary)' }}><i className="fa-solid fa-trophy" style={{ color: 'var(--status-success)', marginRight: 6 }}></i> Top Performers</span>} 
                value={globalSummary?.topPerformers || 0} 
                valueStyle={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 600 }} 
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card className="glass-panel" bordered={false} bodyStyle={{ padding: '16px' }}>
              <Statistic 
                title={<span style={{ color: 'var(--text-secondary)' }}><i className="fa-solid fa-life-ring" style={{ color: 'var(--status-danger)', marginRight: 6 }}></i> Need Help</span>} 
                value={globalSummary?.needHelp || 0} 
                valueStyle={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 600 }} 
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card className="glass-panel" bordered={false} bodyStyle={{ padding: '16px' }}>
              <Statistic 
                title={<span style={{ color: 'var(--text-secondary)' }}><i className="fa-solid fa-clock" style={{ color: 'var(--accent-cyan)', marginRight: 6 }}></i> Avg Hours</span>} 
                value={aiSummary?.avg_hours || 40} 
                suffix="h"
                valueStyle={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 600 }} 
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card className="glass-panel" bordered={false} bodyStyle={{ padding: '16px' }}>
              <Statistic 
                title={<span style={{ color: 'var(--text-secondary)' }}><i className="fa-solid fa-stopwatch" style={{ color: 'var(--status-warning)', marginRight: 6 }}></i> Overtime</span>} 
                value={aiSummary?.overtime_count || 0} 
                valueStyle={{ color: 'var(--text-primary)', fontSize: '1.8rem', fontWeight: 600 }} 
              />
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default DashboardHero;
