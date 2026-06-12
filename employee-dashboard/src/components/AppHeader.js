import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Zap,
  Settings as SettingsIcon,
  LogOut,
  User,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { Dropdown, Avatar } from 'antd';
import NotificationBell from './NotificationBell';
import { useTheme } from '../context/ThemeContext';

function AppHeader({ onSearch, children }) {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearch) onSearch(val);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('sessionExpiresAt');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const profileMenuItems = {
    items: [
      {
        key: 'profile',
        icon: <User size={14} />,
        label: 'Profile',
        onClick: () => navigate('/profile'),
      },
      {
        key: 'settings',
        icon: <SettingsIcon size={14} />,
        label: 'Settings',
        onClick: () => navigate('/settings'),
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogOut size={14} />,
        label: 'Logout',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <motion.header
      className="aether-header glass-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 90,
        gap: 16,
      }}
    >
      {/* Left: Environment badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span
          className="status-chip success"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.5px',
            padding: '4px 12px',
          }}
        >
          Production
        </span>
      </div>

      {/* Center: Search bar */}
      <div style={{ flex: 1, maxWidth: 480, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            borderRadius: 12,
            background: 'rgba(0,219,233,0.04)',
            border: '1px solid rgba(0,219,233,0.1)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted, #64748B)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search employees, projects, analytics..."
            value={searchValue}
            onChange={handleSearchChange}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary, #F0F4FF)',
              fontSize: 13,
              fontFamily: 'inherit',
            }}
          />
          <kbd
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(0,219,233,0.08)',
              border: '1px solid rgba(0,219,233,0.15)',
              color: 'var(--text-muted, #64748B)',
              fontFamily: 'monospace',
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {children}

        {/* AI Assistant Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="AI Assistant"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: '1px solid rgba(0,219,233,0.15)',
            background: 'rgba(0,219,233,0.06)',
            color: 'var(--cyan, #00DBE9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Zap size={16} />
        </motion.button>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: '1px solid rgba(0,219,233,0.15)',
            background: 'rgba(0,219,233,0.06)',
            color: 'var(--text-secondary, #94A3B8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </motion.button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 28,
            background: 'rgba(0,219,233,0.12)',
            margin: '0 4px',
          }}
        />

        {/* Profile Dropdown */}
        <Dropdown menu={profileMenuItems} trigger={['click']} placement="bottomRight">
          <motion.div
            whileHover={{ scale: 1.03 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 10,
              transition: 'background 0.2s',
            }}
          >
            <Avatar
              size={32}
              style={{
                background: 'linear-gradient(135deg, #00DBE9, #DCB8FF)',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              A
            </Avatar>
            <ChevronDown size={14} style={{ color: 'var(--text-muted, #64748B)' }} />
          </motion.div>
        </Dropdown>
      </div>
    </motion.header>
  );
}

export default AppHeader;
