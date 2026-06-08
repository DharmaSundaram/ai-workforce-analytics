import React, { useState, useEffect } from "react";
import { API_BASE_URL as BACKEND_URL } from '../services/api';
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Row,
  Col,
  Input,
  Button,
  Table,
  Tag,
  notification,
  Spin,
} from "antd";

import "../App.css";

const { Header, Content } = Layout;


function ProfilePage() {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  // Profile data
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit profile form
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Get user from localStorage
  const getUser = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData);
      }
    } catch {
      return null;
    }
    return null;
  };

  const user = getUser();

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const userId = user?.id || user?.user_id || "";
        const response = await fetch(
          `${BACKEND_URL}/api/profile?user_id=${userId}`
        );
        const result = await response.json();

        if (result.success) {
          setProfileData(result);
          setEditName(result.user?.full_name || result.user?.name || "");
          setEditEmail(result.user?.email || "");
          setEditPhone(result.user?.phone || "");
        } else {
          api.error({
            message: "Failed to Load Profile",
            description: result.message || "Could not fetch profile data.",
            placement: "topRight",
            duration: 3,
          });
        }
      } catch (err) {
        api.error({
          message: "Connection Error",
          description: "Could not reach the backend server on port 5000",
          placement: "topRight",
          duration: 4,
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Save profile
  const handleSaveProfile = async () => {
    if (!editName || !editEmail) {
      api.warning({
        message: "Validation Error",
        description: "Name and Email are required.",
        placement: "topRight",
        duration: 3,
      });
      return;
    }

    setSavingProfile(true);
    try {
      const userId = user?.id || user?.user_id || "";
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          full_name: editName,
          email: editEmail,
          phone: editPhone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        api.success({
          message: "Profile Updated",
          description: "Your profile has been saved successfully.",
          placement: "topRight",
          duration: 3,
        });

        // Update localStorage
        const updatedUser = {
          ...user,
          full_name: editName,
          name: editName,
          email: editEmail,
          phone: editPhone,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        api.error({
          message: "Update Failed",
          description: result.message || "Could not update profile.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (err) {
      api.error({
        message: "Connection Error",
        description: "Could not reach the backend server on port 5000",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setPasswordError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      const userId = user?.id || user?.user_id || "";
      const response = await fetch(`${BACKEND_URL}/api/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        api.success({
          message: "Password Changed",
          description: "Your password has been updated successfully.",
          placement: "topRight",
          duration: 3,
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(
          result.message || "Failed to change password. Please try again."
        );
        api.error({
          message: "Password Change Failed",
          description: result.message || "Could not update password.",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (err) {
      setPasswordError(
        "Unable to connect to server. Make sure the backend is running."
      );
      api.error({
        message: "Connection Error",
        description: "Could not reach the backend server on port 5000",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("sessionExpiresAt");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    api.info({
      message: "Logged Out",
      description: "You have been signed out successfully.",
      placement: "topRight",
      duration: 2,
    });
    setTimeout(() => navigate("/login"), 300);
  };

  // Audit log table columns
  const auditColumns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action) => {
        const isLogin =
          action?.toLowerCase().includes("login") ||
          action?.toLowerCase().includes("sign in");
        return (
          <Tag
            style={{
              background: isLogin
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
              border: `1px solid ${
                isLogin
                  ? "rgba(16, 185, 129, 0.4)"
                  : "rgba(239, 68, 68, 0.4)"
              }`,
              color: isLogin ? "#6ee7b7" : "#fca5a5",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {isLogin ? (
              <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 4 }} ></i>
            ) : (
              <i className="fa-solid fa-right-from-bracket" style={{ marginRight: 4 }} ></i>
            )}
            {action}
          </Tag>
        );
      },
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (ts) => (
        <span style={{ color: "#94a3b8", fontSize: 13 }}>
          <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i>
          {ts ? new Date(ts).toLocaleString() : "—"}
        </span>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      render: (ip) => (
        <span style={{ color: "#93c5fd", fontSize: 13 }}>{ip || "—"}</span>
      ),
    },
    {
      title: "Device",
      dataIndex: "device",
      key: "device",
      render: (device) => (
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
          {device || "—"}
        </span>
      ),
    },
  ];

  const profileUser = profileData?.user || {};
  const auditLog = profileData?.audit_logs || profileData?.audit_log || profileData?.login_history || [];

  return (
    <Layout className="app-layout">
      {contextHolder}

      {/* ===== HEADER ===== */}
      <Header className="app-header">
        <div className="header-brand">
          <div className="header-logo-icon">
            <i className="fa-solid fa-chart-line" style={{ fontSize: 20, color: "#fff" }} ></i>
          </div>
          <div>
            <div className="header-title">Profile Settings</div>
            <div className="header-subtitle">
              Manage your account and security preferences
            </div>
          </div>
        </div>
        <div className="header-badge-area">
          <Button
            icon={<i className="fa-solid fa-circle"></i>}
            onClick={() => navigate("/dashboard")}
            className="header-nav-btn"
          >
            Dashboard
          </Button>
          <Button
            icon={<i className="fa-solid fa-right-from-bracket"></i>}
            onClick={handleLogout}
            className="header-nav-btn"
            danger
          >
            Logout
          </Button>
        </div>
      </Header>

      {/* ===== CONTENT ===== */}
      <Content className="app-content">
        {loadingProfile ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <Spin
              indicator={
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 36, color: "#2563eb" }}
                  spin
                ></i>
              }
              tip="Loading profile..."
            />
          </div>
        ) : (
          <>
            {/* ===== USER INFO CARD ===== */}
            <Card
              className="glass-card chart-card"
              bordered={false}
              style={{ marginBottom: 28 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  flexWrap: "wrap",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-user" style={{ fontSize: 36, color: "#ffffff" }} ></i>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2
                    style={{
                      color: "var(--text-primary)",
                      fontSize: 22,
                      fontWeight: 700,
                      margin: "0 0 4px",
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {profileUser.full_name ||
                      profileUser.name ||
                      profileUser.username ||
                      "User"}
                  </h2>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: 14,
                      margin: 0,
                    }}
                  >
                    {profileUser.email || "—"}
                  </p>
                </div>

                {/* Meta info badges */}
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {profileUser.phone && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--text-muted)",
                        fontSize: 13,
                      }}
                    >
                      <i className="fa-solid fa-phone" style={{ color: "#10b981" }} ></i>
                      {profileUser.phone}
                    </div>
                  )}
                  {(profileUser.created_at || profileUser.member_since) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--text-muted)",
                        fontSize: 13,
                      }}
                    >
                      <i className="fa-solid fa-calendar" style={{ color: "#f59e0b" }} ></i>
                      Member since{" "}
                      {new Date(
                        profileUser.created_at || profileUser.member_since
                      ).toLocaleDateString()}
                    </div>
                  )}
                  {(profileUser.last_login || profileUser.last_login_at) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--text-muted)",
                        fontSize: 13,
                      }}
                    >
                      <i className="fa-solid fa-circle" style={{ color: "#3b82f6" }} ></i>
                      Last login{" "}
                      {new Date(
                        profileUser.last_login || profileUser.last_login_at
                      ).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Row gutter={[24, 24]}>
              {/* ===== EDIT PROFILE ===== */}
              <Col xs={24} lg={12}>
                <Card
                  className="glass-card chart-card"
                  bordered={false}
                  title={
                    <span>
                      <i className="fa-solid fa-pen" style={{ marginRight: 8, color: "#3b82f6" }} ></i>
                      Edit Profile
                    </span>
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        <i className="fa-solid fa-user" style={{ marginRight: 6 }} ></i>
                        Full Name
                      </label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your full name"
                        size="large"
                        className="dark-input"
                        prefix={
                          <i className="fa-solid fa-user" style={{ color: "rgba(148,163,184,0.4)" }}
                          ></i>
                        }
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        <i className="fa-solid fa-envelope" style={{ marginRight: 6 }} ></i>
                        Email
                      </label>
                      <Input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="Enter your email"
                        size="large"
                        className="dark-input"
                        prefix={
                          <i className="fa-solid fa-envelope" style={{ color: "rgba(148,163,184,0.4)" }}
                          ></i>
                        }
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        <i className="fa-solid fa-phone" style={{ marginRight: 6 }} ></i>
                        Phone Number
                      </label>
                      <Input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        size="large"
                        className="dark-input"
                        prefix={
                          <i className="fa-solid fa-phone" style={{ color: "rgba(148,163,184,0.4)" }}
                          ></i>
                        }
                      />
                    </div>

                    <Button
                      type="primary"
                      icon={<i className="fa-solid fa-circle"></i>}
                      onClick={handleSaveProfile}
                      loading={savingProfile}
                      className="filter-btn"
                      size="large"
                      style={{
                        height: 44,
                        fontSize: 14,
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </Card>
              </Col>

              {/* ===== CHANGE PASSWORD ===== */}
              <Col xs={24} lg={12}>
                <Card
                  className="glass-card chart-card"
                  bordered={false}
                  title={
                    <span>
                      <i className="fa-solid fa-circle" style={{ marginRight: 8, color: "#f59e0b" }} ></i>
                      Change Password
                    </span>
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i>
                        Current Password
                      </label>
                      <Input.Password
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                        size="large"
                        className="dark-input"
                        prefix={
                          <i className="fa-solid fa-circle" style={{ color: "rgba(148,163,184,0.4)" }}
                          ></i>
                        }
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i>
                        New Password
                      </label>
                      <Input.Password
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        size="large"
                        className="dark-input"
                        prefix={
                          <i className="fa-solid fa-circle" style={{ color: "rgba(148,163,184,0.4)" }}
                          ></i>
                        }
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i>
                        Confirm New Password
                      </label>
                      <Input.Password
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        size="large"
                        className="dark-input"
                        prefix={
                          <i className="fa-solid fa-circle" style={{ color: "rgba(148,163,184,0.4)" }}
                          ></i>
                        }
                      />
                    </div>

                    {passwordError && (
                      <div
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          borderRadius: 8,
                          padding: "10px 14px",
                          color: "#fca5a5",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i>
                        {passwordError}
                      </div>
                    )}

                    <Button
                      type="primary"
                      icon={<i className="fa-solid fa-circle-check"></i>}
                      onClick={handleChangePassword}
                      loading={changingPassword}
                      className="filter-btn"
                      size="large"
                      style={{
                        height: 44,
                        fontSize: 14,
                        fontWeight: 600,
                        marginTop: 4,
                        background:
                          "linear-gradient(135deg, #f59e0b, #d97706)",
                        boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
                      }}
                    >
                      {changingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* ===== AUDIT LOG ===== */}
            <Card
              className="glass-card table-card"
              bordered={false}
              title={
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 8, color: "#8b5cf6" }}
                  ></i>
                  Login Activity
                </span>
              }
              style={{ marginTop: 24 }}
            >
              <div className="dark-table">
                <Table
                  columns={auditColumns}
                  dataSource={auditLog.map((item, idx) => ({
                    ...item,
                    key: item.id || idx,
                  }))}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showTotal: (total) => (
                      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        {total} records
                      </span>
                    ),
                  }}
                  locale={{
                    emptyText: (
                      <div
                        style={{
                          padding: 40,
                          textAlign: "center",
                          color: "var(--text-dim)",
                        }}
                      >
                        <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 36, marginBottom: 12 }}
                        ></i>
                        <div>No login activity recorded yet</div>
                      </div>
                    ),
                  }}
                />
              </div>
            </Card>
          </>
        )}
      </Content>
    </Layout>
  );
}

export default ProfilePage;
