import React from 'react';
import { Card, Row, Col } from 'antd';
import '../enterprise-theme.css';

/**
 * Enterprise Glass Card
 * Applies enterprise glassmorphism styling to Ant Design Card
 */
export const EnterpriseCard = ({
  title,
  children,
  className = '',
  style = {},
  bordered = false,
  hoverable = true,
  ...props
}) => {
  return (
    <Card
      title={title}
      className={`glass-card card-hover-glow ${className}`}
      bordered={bordered}
      hoverable={hoverable}
      style={{
        background: 'rgba(30,41,59,0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        ...style,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

/**
 * Enterprise KPI Row
 * Grid layout for KPI cards with enterprise styling
 */
export const EnterpriseKPIRow = ({ children, gutter = [16, 16] }) => {
  return (
    <Row gutter={gutter} style={{ marginBottom: '24px' }}>
      {React.Children.map(children, (child) => (
        <Col xs={24} sm={12} md={8} lg={6} style={{ marginBottom: '12px' }}>
          {child}
        </Col>
      ))}
    </Row>
  );
};

/**
 * Enterprise Chart Container
 * Container for Recharts with enterprise styling
 */
export const EnterpriseChartContainer = ({
  title,
  children,
  height = 300,
  className = '',
  ...props
}) => {
  return (
    <EnterpriseCard
      title={title}
      className={`chart-card ${className}`}
      style={{ marginBottom: '24px' }}
      {...props}
    >
      <div style={{ height, width: '100%' }}>
        {children}
      </div>
    </EnterpriseCard>
  );
};

/**
 * Enterprise Table Container
 * Container for Ant Design Table with enterprise styling
 */
export const EnterpriseTableContainer = ({
  title,
  children,
  className = '',
  ...props
}) => {
  return (
    <EnterpriseCard
      title={title}
      className={`table-card dark-table ${className}`}
      style={{ marginBottom: '24px' }}
      {...props}
    >
      {children}
    </EnterpriseCard>
  );
};

/**
 * Enterprise Section Title
 * Section header with enterprise styling
 */
export const EnterpriseSectionTitle = ({
  children,
  icon = null,
  level = 2,
  style = {},
}) => {
  const sizeMap = {
    1: '32px',
    2: '24px',
    3: '18px',
  };

  return (
    <div
      className="section-title"
      style={{
        fontSize: sizeMap[level] || '24px',
        fontWeight: 700,
        color: '#DAE2FD',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: '20px' }}>{icon}</span>}
      {children}
    </div>
  );
};

/**
 * Enterprise Status Pill
 * Status indicator with enterprise styling
 */
export const EnterpriseStatusPill = ({
  children,
  status = 'info', // 'success', 'warning', 'error', 'info'
  className = '',
  style = {},
}) => {
  const statusColorMap = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#10b981' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' },
    info: { bg: 'rgba(0, 219, 233, 0.15)', border: 'rgba(0, 219, 233, 0.3)', color: '#00DBE9' },
  };

  const colors = statusColorMap[status] || statusColorMap.info;

  return (
    <span
      className={`status-pill ${className}`}
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '600',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.color,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default EnterpriseCard;
