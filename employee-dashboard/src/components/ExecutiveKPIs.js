import React from "react";
import { Row, Col, Progress, Tooltip } from "antd";
import { motion } from "framer-motion";


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

  const iconCircle = (bg) => ({
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    fontSize: 24,
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Health Score */}
        <Col xs={24} sm={12} md={6}>
          <Tooltip title="Composite score: Productivity (40%) + Burnout Safety (30%) + Work-Life Balance (30%)">
            <motion.div variants={cardVariants} className="glass-card" style={{ padding: 24, cursor: 'pointer', height: '100%' }}>
              <div style={iconCircle("linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.1))")}>
                <i className="fa-solid fa-circle" style={{ color: healthColor }} ></i>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Progress
                  type="circle"
                  percent={Math.min(healthScore, 100)}
                  size={64}
                  strokeColor={healthColor}
                  trailColor="rgba(255,255,255,0.06)"
                  format={() => <span style={{ color: healthColor, fontWeight: 700, fontSize: 18 }}>{healthScore}</span>}
                />
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4, fontWeight: 500 }}>Workforce Health</div>
                  <div style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 600 }}>
                    {healthScore >= 70 ? "Excellent" : healthScore >= 50 ? "Fair" : "Needs Attention"}
                  </div>
                </div>
              </div>
            </motion.div>
          </Tooltip>
        </Col>

        {/* Productivity Growth */}
        <Col xs={24} sm={12} md={6}>
          <motion.div variants={cardVariants} className="glass-card" style={{ padding: 24, height: '100%' }}>
            <div style={iconCircle(growthPositive
              ? "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.1))"
              : "linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))")}>
              {growthPositive
                ? <i className="fa-solid fa-arrow-trend-up" style={{ color: "#10b981" }} ></i>
                : <i className="fa-solid fa-circle" style={{ color: "#ef4444" }} ></i>}
            </div>
            <div style={{ color: growthPositive ? "#10b981" : "#ef4444", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
              {growthPositive ? "+" : ""}{growth.toFixed(1)}%
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>Productivity Growth</div>
          </motion.div>
        </Col>

        {/* Burnout Trend */}
        <Col xs={24} sm={12} md={6}>
          <motion.div variants={cardVariants} className="glass-card" style={{ padding: 24, height: '100%' }}>
            <div style={iconCircle(`linear-gradient(135deg, ${burnoutColor}44, ${burnoutColor}11)`)}>
              <i className="fa-solid fa-fire" style={{ color: burnoutColor }} ></i>
            </div>
            <div style={{ color: burnoutColor, fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
              {burnoutLabel}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>
              Burnout Trend · {highBurnout} high risk
            </div>
          </motion.div>
        </Col>

        {/* Risk Count */}
        <Col xs={24} sm={12} md={6}>
          <motion.div variants={cardVariants} className="glass-card" style={{ padding: 24, height: '100%' }}>
            <div style={iconCircle(riskCount > 0
              ? "linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))"
              : "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.1))")}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: riskCount > 0 ? "#ef4444" : "#10b981" }}></i>
            </div>
            <div style={{ color: riskCount > 0 ? "#ef4444" : "#10b981", fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
              {riskCount}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500 }}>
              Employees at Risk
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>
              Low productivity + High burnout
            </div>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
}

export default ExecutiveKPIs;
