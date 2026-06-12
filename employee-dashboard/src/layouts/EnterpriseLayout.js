import React, { useState } from 'react';
import { Layout, Menu, Input, Avatar, Dropdown, Badge, Tooltip } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const EnterpriseLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { key: '/dashboard', icon: <i className="fa-solid fa-chart-pie"></i>, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/employees', icon: <i className="fa-solid fa-users"></i>, label: <Link to="/history">Employees</Link> },
    { key: '/projects', icon: <i className="fa-solid fa-diagram-project"></i>, label: 'Projects' },
    { key: '/analytics', icon: <i className="fa-solid fa-chart-line"></i>, label: <Link to="/analytics">Analytics</Link> },
    { key: '/departments', icon: <i className="fa-solid fa-building"></i>, label: 'Departments' },
    { key: '/jira', icon: <i className="fa-brands fa-jira"></i>, label: 'Jira' },
    { key: '/reports', icon: <i className="fa-solid fa-file-invoice"></i>, label: 'Reports' },
    { key: '/settings', icon: <i className="fa-solid fa-gear"></i>, label: <Link to="/settings">Settings</Link> },
    { key: 'logout', icon: <i className="fa-solid fa-right-from-bracket"></i>, label: <span onClick={handleLogout}>Logout</span> },
  ];

  const profileMenuItems = [
    { key: '1', icon: <i className="fa-solid fa-user"></i>, label: <Link to="/profile">Profile</Link> },
    { key: '2', icon: <i className="fa-solid fa-clock-rotate-left"></i>, label: <Link to="/history">History</Link> },
    { key: '3', icon: <i className="fa-solid fa-gear"></i>, label: <Link to="/settings">Settings</Link> },
    { key: '4', icon: <i className="fa-solid fa-shield-halved"></i>, label: <Link to="/audit-logs">Audit</Link> },
    { key: '5', icon: <i className="fa-solid fa-chart-line"></i>, label: <Link to="/analytics">Analytics</Link> },
    { key: '6', icon: <i className="fa-solid fa-file-invoice"></i>, label: 'Reports' },
    { type: 'divider' },
    { key: '7', icon: <i className="fa-solid fa-right-from-bracket"></i>, onClick: handleLogout, label: 'Logout' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Sider */}
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        width={240}
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRight: '1px solid var(--border-glass)',
          backdropFilter: 'blur(16px)'
        }}
        breakpoint="lg"
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-glass)' }}>
          <i className="fa-solid fa-microchip" style={{ fontSize: 24, color: 'var(--accent-cyan)' }}></i>
          {!collapsed && <span style={{ marginLeft: 12, fontWeight: 700, color: '#fff', fontSize: '1rem' }}>AI Workforce</span>}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          style={{ marginTop: 16 }}
        />
      </Sider>

      {/* Main Content Area */}
      <Layout style={{ background: 'transparent' }}>
        {/* Header */}
        <Header style={{ 
          padding: '0 24px', 
          background: 'rgba(5, 20, 36, 0.8)', 
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          {/* Left: Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>
              AI Workforce Intelligence
            </span>
            <span className="live-badge">LIVE ANALYTICS</span>
          </div>

          {/* Center: Search */}
          <div style={{ flex: 1, maxWidth: 400, margin: '0 24px' }}>
            <Input 
              prefix={<i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--text-muted)' }}></i>} 
              placeholder="Search employees, projects, or metrics..." 
              style={{ borderRadius: 8 }}
            />
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Tooltip title="Jira Sync: Active">
              <span style={{ color: 'var(--status-success)', cursor: 'pointer' }}>
                <i className="fa-solid fa-rotate" style={{ marginRight: 6 }}></i> Syncing
              </span>
            </Tooltip>
            
            <Badge dot color="var(--accent-violet)">
              <i className="fa-regular fa-bell" style={{ fontSize: 18, color: 'var(--text-secondary)', cursor: 'pointer' }}></i>
            </Badge>

            <Dropdown menu={{ items: profileMenuItems }} trigger={['click']} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' }}>EX</Avatar>
                <i className="fa-solid fa-chevron-down" style={{ fontSize: 12, color: 'var(--text-secondary)' }}></i>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{ margin: '24px', position: 'relative' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default EnterpriseLayout;
