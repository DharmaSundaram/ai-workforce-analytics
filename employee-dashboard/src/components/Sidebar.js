import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Shield,
  Settings,
  User,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/history', icon: Users, label: 'Employees' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/audit-logs', icon: Shield, label: 'Audit Logs' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const bottomItems = [
  { path: '/profile', icon: User, label: 'Profile' },
  { path: null, icon: HelpCircle, label: 'Support' },
];

const navContainerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const collapsed = sidebarCollapsed;

  const toggleCollapse = () => {
    setSidebarCollapsed(!collapsed);
  };

  return (
    <motion.aside
      className={`aether-sidebar glass-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, overflow: 'hidden' }}
    >
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            className="sidebar-logo-icon"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #00DBE9 0%, #DCB8FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 20px rgba(0,219,233,0.3)',
            }}
          >
            <Zap size={20} color="#050816" strokeWidth={2.5} />
          </motion.div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="text-gradient"
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    lineHeight: 1.1,
                  }}
                >
                  Aether
                </div>
                <div
                  style={{
                    fontSize: 8,
                    letterSpacing: '3px',
                    color: 'var(--text-muted, #64748B)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginTop: 2,
                  }}
                >
                  INTELLIGENCE
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: 'var(--text-muted, #64748B)',
                    marginTop: 1,
                    opacity: 0.7,
                  }}
                >
                  AI Workforce Platform
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <motion.button
          className="sidebar-collapse-btn"
          onClick={toggleCollapse}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'absolute',
            right: collapsed ? '50%' : 12,
            transform: collapsed ? 'translateX(50%)' : 'none',
            top: 24,
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: '1px solid rgba(0,219,233,0.2)',
            background: 'rgba(0,219,233,0.06)',
            color: 'var(--cyan, #00DBE9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </motion.button>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)',
          margin: '0 16px',
        }}
      />

      {/* Navigation */}
      <motion.nav
        className="sidebar-nav"
        variants={navContainerVariants}
        initial="hidden"
        animate="show"
        style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}
      >
        {!collapsed && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '1.5px',
              color: 'var(--text-muted, #64748B)',
              textTransform: 'uppercase',
              padding: '8px 12px 6px',
            }}
          >
            Navigation
          </div>
        )}

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              variants={navItemVariants}
              className={`sidebar-nav-item ${isActive ? 'sidebar-active' : ''}`}
              onClick={() => navigate(item.path)}
              whileHover={{ x: 4, backgroundColor: 'rgba(0,219,233,0.06)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                margin: '2px 0',
                borderRadius: 10,
                cursor: 'pointer',
                position: 'relative',
                color: isActive
                  ? 'var(--cyan, #00DBE9)'
                  : 'var(--text-secondary, #94A3B8)',
                background: isActive ? 'rgba(0,219,233,0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--cyan, #00DBE9)' : '3px solid transparent',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                transition: 'color 0.2s, background 0.2s',
              }}
            >
              <item.icon size={20} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Active glow indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-glow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 10,
                    background: 'rgba(0,219,233,0.04)',
                    boxShadow: '0 0 15px rgba(0,219,233,0.08)',
                    pointerEvents: 'none',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.nav>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.15), transparent)',
          margin: '0 16px',
        }}
      />

      {/* Bottom Section */}
      <div className="sidebar-bottom" style={{ padding: '12px 8px' }}>
        {bottomItems.map((item) => {
          const isActive = item.path && location.pathname === item.path;
          return (
            <motion.div
              key={item.label}
              className={`sidebar-nav-item ${isActive ? 'sidebar-active' : ''}`}
              onClick={() => item.path && navigate(item.path)}
              whileHover={{ x: 4, backgroundColor: 'rgba(0,229,255,0.06)' }}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                margin: '2px 0',
                borderRadius: 10,
                cursor: item.path ? 'pointer' : 'default',
                color: isActive
                  ? 'var(--cyan, #00E5FF)'
                  : 'var(--text-muted, #64748B)',
                background: isActive ? 'rgba(0,229,255,0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--cyan, #00E5FF)' : '3px solid transparent',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <item.icon size={18} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* System Status */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                marginTop: 12,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(0,229,255,0.04)',
                border: '1px solid rgba(0,229,255,0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11,
                  color: 'var(--text-muted, #64748B)',
                }}
              >
                <span className="glow-dot green" />
                <span>System Healthy</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--text-muted, #64748B)',
                  opacity: 0.7,
                  marginTop: 4,
                  paddingLeft: 18,
                }}
              >
                Last Sync: 2 mins ago
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed status dot */}
        {collapsed && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 12,
            }}
            title="System Healthy • Last Sync: 2 mins ago"
          >
            <span className="glow-dot green" />
          </div>
        )}
      </div>
    </motion.aside>
  );
}

export default Sidebar;
