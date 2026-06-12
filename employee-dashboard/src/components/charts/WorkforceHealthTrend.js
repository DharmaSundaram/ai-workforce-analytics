import React, { useState, useMemo } from 'react';
import { Card, Radio } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const WorkforceHealthTrend = ({ trendData }) => {
  const [timeFilter, setTimeFilter] = useState('30D');

  const filteredData = useMemo(() => {
    if (!trendData || trendData.length === 0) return [];
    
    // Reverse array if it comes oldest-first, or just slice
    // Assuming trendData is chronological oldest -> newest
    let limit = trendData.length;
    if (timeFilter === '7D') limit = Math.min(7, trendData.length);
    if (timeFilter === '30D') limit = Math.min(30, trendData.length);
    if (timeFilter === '90D') limit = Math.min(90, trendData.length);
    
    return trendData.slice(-limit);
  }, [trendData, timeFilter]);

  return (
    <Card 
      className="glass-panel" 
      bordered={false}
      style={{ height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 className="enterprise-card-title" style={{ margin: 0 }}>
          <i className="fa-solid fa-heart-pulse"></i> Workforce Health Trend
        </h3>
        <Radio.Group value={timeFilter} onChange={e => setTimeFilter(e.target.value)} size="small" buttonStyle="solid">
          <Radio.Button value="7D">7D</Radio.Button>
          <Radio.Button value="30D">30D</Radio.Button>
          <Radio.Button value="90D">90D</Radio.Button>
        </Radio.Group>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240} debounce={50}>
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis domain={[0, 100]} stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
              <Line 
                type="monotone" 
                dataKey="health_score" 
                name="Focus / Health"
                stroke="var(--accent-violet)" 
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--accent-violet)' }}
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="avg_productivity" 
                name="Productivity"
                stroke="var(--accent-cyan)" 
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--accent-cyan)' }}
              />
              <Line 
                type="monotone" 
                dataKey="burnout_score" 
                name="Burnout Risk"
                stroke="var(--status-danger)" 
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--status-danger)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No trend data available
          </div>
        )}
      </div>
    </Card>
  );
};

export default WorkforceHealthTrend;
