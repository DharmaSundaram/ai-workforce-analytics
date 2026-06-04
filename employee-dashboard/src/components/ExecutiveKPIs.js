import React from "react";
import { Row, Col, Progress, Tooltip } from "antd";
import {
  HeartOutlined,
  RiseOutlined,
  ArrowDownOutlined,
  FireOutlined,
  WarningOutlined,
} from "@ant-design/icons";

function ExecutiveKPIs({ employees, previousAvgProductivity }) {
  if (!employees || employees.length === 0) return null;

  const total = employees.length;
  const avgProd = employees.reduce((s, e) => s + Number(e.productivity || 0), 0) / total;
  const highBurnout = employees.filter((e) => e.burnout_risk === "High").length;
  const overtimeEmp = employees.filter((e) => Number(e.overtime_hours) > 0).length;

  // 1. Workforce Health Score
  const burnoutPct = highBurnout / total;
  const overtimePct = overtimeEmp / total;
  const healthScore = Math.round(
    avgProd * 0.4 + (100 - burnoutPct * 100) * 0.3 + (100 - overtimePct * 100) * 0.3
  );
  const healthColor = healthScore >= 70 ? "#10b981" : healthScore >= 50 ? "#f59e0b" : "#ef4444";

  // 2. Productivity Growth
  const prevProd = Number(previousAvgProductivity || 0);
  const growth = prevProd > 0 ? ((avgProd - prevProd) / prevProd * 100) : 0;
  const growthPositive = growth >= 0;

  // 3. Burnout Trend
  const burnoutLabel = highBurnout === 0 ? "Stable" : highBurnout <= 3 ? "Concerning" : "Critical";
  const burnoutColor = highBurnout === 0 ? "#10b981" : highBurnout <= 3 ? "#f59e0b" : "#ef4444";

  // 4. Risk Count
  const riskCount = employees.filter(
    (e) => Number(e.productivity) < 40 && e.burnout_risk === "High"
  ).length;

  const cardStyle = {
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(139,92,246,0.15)",
    borderRadius: 16,
    padding: "20px",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
    position: "relative",
    overflow: "hidden",
  };

  const iconCircle = (bg) => ({
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    fontSize: 20,
  });

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {/* Health Score */}
      <Col xs={24} sm={12} md={6}>
        <Tooltip title="Composite score: Productivity (40%) + Burnout Safety (30%) + Work-Life Balance (30%)">
          <div style={cardStyle} className="exec-kpi-hover">
            <div style={iconCircle("linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.1))")}>
              <HeartOutlined style={{ color: healthColor }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Progress
                type="circle"
                percent={Math.min(healthScore, 100)}
                size={56}
                strokeColor={healthColor}
                trailColor="rgba(255,255,255,0.06)"
                format={() => <span style={{ color: healthColor, fontWeight: 700, fontSize: 16 }}>{healthScore}</span>}
              />
              <div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 2 }}>Workforce Health</div>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>
                  {healthScore >= 70 ? "Excellent" : healthScore >= 50 ? "Fair" : "Needs Attention"}
                </div>
              </div>
            </div>
          </div>
        </Tooltip>
      </Col>

      {/* Productivity Growth */}
      <Col xs={24} sm={12} md={6}>
        <div style={cardStyle} className="exec-kpi-hover">
          <div style={iconCircle(growthPositive
            ? "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.1))"
            : "linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))")}>
            {growthPositive
              ? <RiseOutlined style={{ color: "#10b981" }} />
              : <ArrowDownOutlined style={{ color: "#ef4444" }} />}
          </div>
          <div style={{ color: growthPositive ? "#10b981" : "#ef4444", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            {growthPositive ? "+" : ""}{growth.toFixed(1)}%
          </div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>Productivity Growth</div>
        </div>
      </Col>

      {/* Burnout Trend */}
      <Col xs={24} sm={12} md={6}>
        <div style={cardStyle} className="exec-kpi-hover">
          <div style={iconCircle(`linear-gradient(135deg, ${burnoutColor}44, ${burnoutColor}11)`)}>
            <FireOutlined style={{ color: burnoutColor }} />
          </div>
          <div style={{ color: burnoutColor, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            {burnoutLabel}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>
            Burnout Trend · {highBurnout} high risk
          </div>
        </div>
      </Col>

      {/* Risk Count */}
      <Col xs={24} sm={12} md={6}>
        <div style={cardStyle} className="exec-kpi-hover">
          <div style={iconCircle(riskCount > 0
            ? "linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))"
            : "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.1))")}>
            <WarningOutlined style={{ color: riskCount > 0 ? "#ef4444" : "#10b981" }} />
          </div>
          <div style={{ color: riskCount > 0 ? "#ef4444" : "#10b981", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            {riskCount}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>
            Employees at Risk
          </div>
          <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>
            Low productivity + High burnout
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default ExecutiveKPIs;
