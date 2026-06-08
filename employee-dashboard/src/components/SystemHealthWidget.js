import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL as BACKEND_URL } from '../services/api';
import { Card } from "antd";



const SERVICE_LABELS = {
  backend: "Backend",
  database: "Database",
  ml_model: "ML Model",
  jira: "Jira",
  scheduler: "Scheduler",
};

function SystemHealthWidget() {
  const [services, setServices] = useState(null);
  const [healthy, setHealthy] = useState(null);

  const fetchHealth = useCallback(() => {
    fetch(`${BACKEND_URL}/api/system-health`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setServices(data.services);
          setHealthy(data.healthy);
        }
      })
      .catch(() => {
        setHealthy(false);
        setServices(null);
      });
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const statusDot = healthy === null
    ? "#64748b"
    : healthy ? "#10b981" : "#ef4444";

  return (
    <Card
      className="glass-card"
      bordered={false}
      style={{ marginBottom: 24 }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <i className="fa-solid fa-circle" style={{ color: "#8b5cf6", fontSize: 16 }} ></i>
          <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>System Health</span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: statusDot,
              display: "inline-block",
              marginLeft: 4,
              boxShadow: `0 0 6px ${statusDot}`,
            }}
          />
        </div>
      }
      headStyle={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 16px",
        minHeight: "auto",
      }}
      bodyStyle={{ padding: "8px 16px 12px" }}
    >
      {!services ? (
        <div style={{ color: "#64748b", fontSize: 13, padding: "8px 0" }}>
          Checking services...
        </div>
      ) : (
        Object.entries(SERVICE_LABELS).map(([key, label]) => {
          const svc = services[key];
          const ok = svc?.ok;
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 0",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
              }}
            >
              {ok ? (
                <i className="fa-solid fa-circle-check" style={{ color: "#10b981", fontSize: 14 }} ></i>
              ) : (
                <i className="fa-solid fa-circle-xmark" style={{ color: "#ef4444", fontSize: 14 }} ></i>
              )}
              <span style={{ color: "#e2e8f0", fontSize: 13, flex: 1 }}>{label}</span>
              <span style={{ color: "#64748b", fontSize: 11 }}>
                {svc?.status || "unknown"}
              </span>
            </div>
          );
        })
      )}
    </Card>
  );
}

export default SystemHealthWidget;
