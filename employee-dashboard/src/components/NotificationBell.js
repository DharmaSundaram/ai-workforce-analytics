import React, { useState, useEffect, useCallback } from "react";
import { Badge, Dropdown, List, Button, Empty } from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";

const BACKEND_URL = "http://127.0.0.1:5000";

const severityConfig = {
  success: { color: "#10b981", icon: <CheckCircleOutlined /> },
  warning: { color: "#f59e0b", icon: <WarningOutlined /> },
  error: { color: "#ef4444", icon: <WarningOutlined /> },
  info: { color: "#3b82f6", icon: <InfoCircleOutlined /> },
};

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(() => {
    fetch(`${BACKEND_URL}/api/notifications`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unread_count || 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = () => {
    fetch(`${BACKEND_URL}/api/notifications/mark-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then(() => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      })
      .catch(() => {});
  };

  const panelStyle = {
    background: "rgba(15, 23, 42, 0.98)",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    borderRadius: 12,
    width: 380,
    maxHeight: 440,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };

  const items = [
    {
      key: "panel",
      label: (
        <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
          <div style={headerStyle}>
            <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>
              <BellOutlined style={{ marginRight: 8, color: "#8b5cf6" }} />
              Notifications
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  type="text"
                  onClick={markAllRead}
                  style={{ color: "#8b5cf6", fontSize: 12 }}
                >
                  Mark all read
                </Button>
              )}
              <Button
                size="small"
                type="text"
                icon={<SyncOutlined />}
                onClick={fetchNotifications}
                style={{ color: "#64748b" }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 360, overflowY: "auto", padding: "4px 0" }}>
            {notifications.length === 0 ? (
              <Empty
                description={
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                      You're all caught up!
                    </div>
                    <div style={{ color: "#475569", fontSize: 12 }}>
                      No new notifications available.
                    </div>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: 40 }}
              />
            ) : (
              <List
                dataSource={notifications}
                renderItem={(item) => {
                  const cfg = severityConfig[item.severity] || severityConfig.info;
                  return (
                    <div
                      style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        background: item.read ? "transparent" : "rgba(139,92,246,0.04)",
                        cursor: "default",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ color: cfg.color, fontSize: 16, marginTop: 2 }}>
                          {cfg.icon}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: item.read ? 400 : 600 }}>
                            {item.title}
                          </div>
                          {item.message && (
                            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
                              {item.message}
                            </div>
                          )}
                          <div style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>
                            {item.created_at}
                          </div>
                        </div>
                        {!item.read && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#8b5cf6",
                              marginTop: 6,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          icon={<BellOutlined />}
          className="header-nav-btn"
          style={{ position: "relative" }}
        />
      </Badge>
    </Dropdown>
  );
}

export default NotificationBell;
