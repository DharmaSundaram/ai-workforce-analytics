import React from 'react';
import { Card, Row, Col, Progress } from 'antd';

const JiraInsightsCard = ({ jiraInsights }) => {
  if (!jiraInsights || jiraInsights.total === 0) return null;

  const total = jiraInsights.total || 1; // prevent div by zero
  const donePct = Math.round((jiraInsights.done / total) * 100);
  const progPct = Math.round((jiraInsights.in_progress / total) * 100);
  const todoPct = Math.round((jiraInsights.todo / total) * 100);
  const blockedPct = Math.round(((jiraInsights.blocked || 0) / total) * 100);

  return (
    <Card 
      className="glass-panel" 
      bordered={false}
      style={{ height: '100%' }}
    >
      <h3 className="enterprise-card-title" style={{ marginBottom: 24 }}>
        <i className="fa-brands fa-jira" style={{ color: '#0052CC' }}></i> Jira Task Insights
      </h3>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Completed</span>
          <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>{jiraInsights.done}</span>
        </div>
        <Progress percent={donePct} strokeColor="var(--status-success)" trailColor="rgba(255,255,255,0.1)" showInfo={false} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>In Progress</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{jiraInsights.in_progress}</span>
        </div>
        <Progress percent={progPct} strokeColor="var(--accent-cyan)" trailColor="rgba(255,255,255,0.1)" showInfo={false} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>To Do</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{jiraInsights.todo}</span>
        </div>
        <Progress percent={todoPct} strokeColor="var(--text-secondary)" trailColor="rgba(255,255,255,0.1)" showInfo={false} />
      </div>
      
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Blocked</span>
          <span style={{ color: 'var(--status-danger)', fontWeight: 600 }}>{jiraInsights.blocked || 0}</span>
        </div>
        <Progress percent={blockedPct} strokeColor="var(--status-danger)" trailColor="rgba(255,255,255,0.1)" showInfo={false} />
      </div>

    </Card>
  );
};

export default JiraInsightsCard;
