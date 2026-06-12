import React from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import { useTheme } from '../context/ThemeContext';
import '../enterprise-theme.css';

const { Content } = Layout;

/**
 * Enterprise Dashboard Layout Wrapper
 * Provides consistent glassmorphism, spacing, and responsive design
 * All business logic is preserved in child components
 */
export const EnterpriseDashboardLayout = ({ 
  children, 
  title = 'Dashboard',
  showHeader = true,
  showSidebar = true,
  onSearch = null,
  headerActions = null 
}) => {
  const { sidebarCollapsed } = useTheme();

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary, #020617)',
        display: 'flex',
      }}
    >
      {showSidebar && <Sidebar />}

      <Layout
        style={{
          marginLeft: showSidebar ? (sidebarCollapsed ? 72 : 260) : 0,
          transition: 'margin-left 0.35s ease',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: 'var(--bg-primary, #020617)',
        }}
      >
        {showHeader && (
          <AppHeader 
            title={title}
            onSearch={onSearch}
            actions={headerActions}
          />
        )}

        <Content
          style={{
            padding: '28px 32px',
            flex: 1,
            background: 'var(--bg-primary, #020617)',
            overflowY: 'auto',
          }}
        >
          {/* Enterprise Grid Layout */}
          <div
            style={{
              maxWidth: '1600px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default EnterpriseDashboardLayout;
