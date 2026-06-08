import React, { useMemo } from 'react';
import { Card, Empty } from 'antd';


const severityColors = {
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

const AIStrategicInsights = ({ employees, aiSummary }) => {
  const insights = useMemo(() => {
    if (!employees || employees.length === 0) return [];

    const total = employees.length;
    const items = [];

    // --- Avg productivity ---
    const avgProductivity =
      aiSummary && aiSummary.avg_productivity != null
        ? aiSummary.avg_productivity
        : employees.reduce((sum, e) => sum + (e.productivity || 0), 0) / total;

    const rounded = Math.round(avgProductivity * 10) / 10;

    if (avgProductivity >= 70) {
      items.push({
        severity: 'success',
        icon: '✅',
        text: `✅ Team productivity is strong at ${rounded}%`,
      });
    } else if (avgProductivity < 50) {
      items.push({
        severity: 'danger',
        icon: '🔴',
        text: `🔴 Team productivity critically low at ${rounded}%`,
      });
    } else {
      items.push({
        severity: 'warning',
        icon: '🟡',
        text: `🟡 Team productivity moderate at ${rounded}%`,
      });
    }

    // --- Burnout risk ---
    const highBurnout = employees.filter(
      (e) => e.burnout_risk === 'High'
    ).length;
    const allLowBurnout = employees.every(
      (e) => e.burnout_risk === 'Low'
    );

    if (highBurnout > 0) {
      items.push({
        severity: highBurnout >= 5 ? 'danger' : 'warning',
        icon: '⚠️',
        text: `⚠️ ${highBurnout} employee${highBurnout > 1 ? 's' : ''} at high burnout risk`,
      });
    }

    if (allLowBurnout) {
      items.push({
        severity: 'success',
        icon: '✅',
        text: '✅ No significant burnout risk detected',
      });
    }

    // --- Overtime ---
    const overtimeEmployees = employees.filter(
      (e) => (e.overtime_hours || 0) > 0
    ).length;

    if (overtimeEmployees > total * 0.3) {
      const pct = Math.round((overtimeEmployees / total) * 100);
      items.push({
        severity: 'warning',
        icon: '⏰',
        text: `⏰ ${pct}% of workforce working overtime`,
      });
    }

    // --- Low productivity employees ---
    const lowProductivity = employees.filter(
      (e) => (e.productivity || 0) < 40
    ).length;

    if (lowProductivity > 3) {
      items.push({
        severity: 'danger',
        icon: '📉',
        text: `📉 ${lowProductivity} employees need performance support`,
      });
    }

    // --- Top performers ---
    const topPerformers = employees.filter(
      (e) => (e.productivity || 0) >= 80
    ).length;

    if (topPerformers > total * 0.5) {
      const pct = Math.round((topPerformers / total) * 100);
      items.push({
        severity: 'success',
        icon: '🌟',
        text: `🌟 ${pct}% are top performers`,
      });
    }

    // --- Per-department analysis ---
    const deptMap = {};
    employees.forEach((e) => {
      const dept = e.project_name || 'Unknown';
      if (!deptMap[dept]) deptMap[dept] = { sum: 0, count: 0 };
      deptMap[dept].sum += e.productivity || 0;
      deptMap[dept].count += 1;
    });

    Object.entries(deptMap).forEach(([dept, { sum, count }]) => {
      const avg = sum / count;
      if (avg < 50) {
        items.push({
          severity: 'warning',
          icon: '🟡',
          text: `🟡 ${dept} department averaging ${Math.round(avg)}% productivity`,
        });
      }
    });

    return items;
  }, [employees, aiSummary]);

  const titleNode = (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--text-primary)',
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      <i className="fa-solid fa-lightbulb" style={{ color: '#7c3aed', fontSize: 18 }} ></i>
      AI Strategic Insights
    </span>
  );

  return (
    <Card
      className="glass-card"
      bordered={false}
      title={titleNode}
      style={{
        background: 'var(--card-gradient)',
        borderRadius: 16,
        border: '1px solid var(--border-primary)',
      }}
      headStyle={{
        background: 'transparent',
        borderBottom: '1px solid rgba(37, 99, 235, 0.12)',
        padding: '0 24px',
        minHeight: 52,
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      {!employees || employees.length === 0 ? (
        <Empty
          description={
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Upload data to generate insights
            </span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '16px 0' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {insights.map((insight, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: severityColors[insight.severity] || '#000000',
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${severityColors[insight.severity] || '#000000'}55`,
                }}
              />
              <span
                style={{
                  color: '#e2e8f0',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {insight.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AIStrategicInsights;
