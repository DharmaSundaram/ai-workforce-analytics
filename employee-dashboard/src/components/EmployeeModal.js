import React from "react";
import { Modal, Tag, Progress, Row, Col, Divider, Empty } from "antd";
import {
  UserOutlined,
  ProjectOutlined,
  FileTextOutlined,
  FireOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  WarningFilled,
  ExclamationCircleFilled,
  CheckCircleFilled,
  BulbOutlined,
  HistoryOutlined,
  AimOutlined,
  TeamOutlined,
} from "@ant-design/icons";

function EmployeeModal({ visible, employee, onClose, employeeHistory }) {
  if (!employee) return null;

  const prod = Number(employee.productivity || 0);
  const predicted = Number(employee.predicted_productivity || 0);
  const burnout = employee.burnout_risk || "Low";
  const recommendations = employee.recommendations || [];

  const getBurnoutConfig = (risk) => {
    if (risk === "High")
      return {
        color: "#ef4444",
        bg: "rgba(239,68,68,0.12)",
        border: "rgba(239,68,68,0.3)",
        icon: <WarningFilled />,
        label: "High Risk",
      };
    if (risk === "Medium")
      return {
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.12)",
        border: "rgba(245,158,11,0.3)",
        icon: <ExclamationCircleFilled />,
        label: "Medium Risk",
      };
    return {
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.3)",
      icon: <CheckCircleFilled />,
      label: "Low Risk",
    };
  };

  const getProdColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const burnoutCfg = getBurnoutConfig(burnout);

  const historyForEmployee = (employeeHistory || []).filter(
    (h) =>
      h.employee_name &&
      h.employee_name.toLowerCase() === (employee.employee_name || "").toLowerCase()
  );

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      className="employee-modal"
      title={null}
      destroyOnClose
    >
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header-section">
          <div className="modal-avatar">
            <UserOutlined style={{ fontSize: 28, color: "#60a5fa" }} />
          </div>
          <div>
            <h2 className="modal-employee-name">{employee.employee_name}</h2>
            <div className="modal-meta">
              <span>
                <ProjectOutlined style={{ marginRight: 4 }} />
                {employee.project_name}
              </span>
              <span>
                <FileTextOutlined style={{ marginRight: 4 }} />
                {employee.task_name}
              </span>
            </div>
          </div>
          <Tag
            style={{
              background: burnoutCfg.bg,
              border: `1px solid ${burnoutCfg.border}`,
              color: burnoutCfg.color,
              borderRadius: 8,
              padding: "4px 12px",
              fontSize: 13,
              fontWeight: 600,
              marginLeft: "auto",
            }}
          >
            {burnoutCfg.icon} {burnoutCfg.label}
          </Tag>
        </div>

        <Divider style={{ borderColor: "rgba(255,255,255,0.08)", margin: "16px 0" }} />

        {/* Performance Metrics */}
        <h3 className="modal-section-title">
          <RiseOutlined style={{ marginRight: 8, color: "#10b981" }} />
          Performance Metrics
        </h3>
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <div className="modal-metric-card">
              <div className="modal-metric-label">Actual Productivity</div>
              <div className="modal-metric-value" style={{ color: getProdColor(prod) }}>
                {prod}%
              </div>
              <Progress
                percent={prod}
                showInfo={false}
                strokeColor={getProdColor(prod)}
                trailColor="rgba(255,255,255,0.08)"
                size="small"
              />
            </div>
          </Col>
          <Col span={12}>
            <div className="modal-metric-card">
              <div className="modal-metric-label">ML Predicted</div>
              <div className="modal-metric-value" style={{ color: "#a78bfa" }}>
                {predicted}%
              </div>
              <Progress
                percent={predicted}
                showInfo={false}
                strokeColor="#a78bfa"
                trailColor="rgba(255,255,255,0.08)"
                size="small"
              />
            </div>
          </Col>
        </Row>

        {/* Workload Summary */}
        <h3 className="modal-section-title">
          <ClockCircleOutlined style={{ marginRight: 8, color: "#fbbf24" }} />
          Workload Summary
        </h3>
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <div className="modal-stat-box">
              <div className="modal-stat-value">{employee.total_hours || 0}h</div>
              <div className="modal-stat-label">Total Hours</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="modal-stat-box">
              <div
                className="modal-stat-value"
                style={{
                  color: Number(employee.overtime_hours) > 0 ? "#fca5a5" : "inherit",
                }}
              >
                {employee.overtime_hours || 0}h
              </div>
              <div className="modal-stat-label">Overtime</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="modal-stat-box">
              <div className="modal-stat-value">
                <AimOutlined style={{ marginRight: 4 }} />
                {employee.focus_score || 0}
              </div>
              <div className="modal-stat-label">Focus Score</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="modal-stat-box">
              <div className="modal-stat-value">{employee.tasks_completed || 0}</div>
              <div className="modal-stat-label">Tasks Done</div>
            </div>
          </Col>
        </Row>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <>
            <h3 className="modal-section-title">
              <BulbOutlined style={{ marginRight: 8, color: "#a78bfa" }} />
              AI Recommendations
            </h3>
            <div className="modal-recommendations">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="modal-rec-item">
                  <ThunderboltOutlined
                    style={{ color: "#a78bfa", marginRight: 10, fontSize: 14, flexShrink: 0 }}
                  />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Historical Uploads */}
        <Divider style={{ borderColor: "rgba(255,255,255,0.08)", margin: "16px 0" }} />
        <h3 className="modal-section-title">
          <HistoryOutlined style={{ marginRight: 8, color: "#60a5fa" }} />
          Upload History
        </h3>
        {historyForEmployee.length === 0 ? (
          <Empty
            description={<span style={{ color: "rgba(148,163,184,0.6)" }}>No history records found</span>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "12px 0" }}
          />
        ) : (
          <div className="modal-history-list">
            {historyForEmployee.slice(0, 8).map((h, idx) => (
              <div key={idx} className="modal-history-item">
                <div className="modal-history-left">
                  <span className="modal-history-project">
                    <TeamOutlined style={{ marginRight: 4 }} />
                    {h.project}
                  </span>
                  <span className="modal-history-task">{h.task}</span>
                </div>
                <div className="modal-history-right">
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    {h.productivity}%
                  </span>
                  <span className="modal-history-time">{h.upload_time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default EmployeeModal;
