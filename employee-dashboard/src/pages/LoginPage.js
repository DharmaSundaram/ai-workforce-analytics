import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, notification, Checkbox } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoadingOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

const BACKEND_URL = "http://127.0.0.1:5000";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: username, password, remember: rememberMe }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("loginTime", new Date().toISOString());
        localStorage.setItem("user", JSON.stringify(result.user));
        api.success({
          message: "Login Successful",
          description: "Welcome to AI Workforce Analytics",
          placement: "topRight",
          duration: 2,
        });
        setTimeout(() => navigate("/dashboard"), 300);
      } else {
        setError(result.message || "Invalid credentials");
        api.error({
          message: "Login Failed",
          description: result.message || "Invalid credentials",
          placement: "topRight",
          duration: 3,
        });
      }
    } catch (err) {
      setError("Unable to connect to server. Make sure the backend is running.");
      api.error({
        message: "Connection Error",
        description: "Could not reach the backend server on port 5000",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-container">
      {contextHolder}

      {/* Animated background elements */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className="login-card">
        {/* Logo Area */}
        <div className="login-logo-area">
          <div className="login-logo-icon">
            <DashboardOutlined style={{ fontSize: 28, color: "#ffffff" }} />
          </div>
          <h1 className="login-title">AI Workforce Analytics</h1>
          <p className="login-subtitle">
            ML-powered employee intelligence platform
          </p>
        </div>

        {/* Form */}
        <div className="login-form">
          <div className="login-field">
            <label className="login-label">
              <UserOutlined style={{ marginRight: 6 }} />
              Email or Phone Number
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter email or phone number"
              size="large"
              className="login-input"
              prefix={<UserOutlined style={{ color: "rgba(148,163,184,0.4)" }} />}
              autoFocus
            />
          </div>

          <div className="login-field">
            <label className="login-label">
              <LockOutlined style={{ marginRight: 6 }} />
              Password
            </label>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              size="large"
              className="login-input"
              prefix={<LockOutlined style={{ color: "rgba(148,163,184,0.4)" }} />}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{color: 'var(--text-muted)'}}>Remember Me</Checkbox>
          </div>

          {error && (
            <div className="login-error">
              <SafetyCertificateOutlined style={{ marginRight: 6 }} />
              {error}
            </div>
          )}

          <Button
            type="primary"
            onClick={handleLogin}
            loading={loading}
            className="login-btn"
            size="large"
            block
            icon={loading ? <LoadingOutlined /> : <LockOutlined />}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <span
              onClick={() => navigate('/forgot-password')}
              style={{ color: '#60a5fa', cursor: 'pointer', fontSize: 13 }}
            >
              Forgot Password?
            </span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <span
              onClick={() => navigate('/register')}
              style={{ color: '#60a5fa', cursor: 'pointer', fontSize: 13 }}
            >
              Don't have an account? Register
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <SafetyCertificateOutlined style={{ marginRight: 6, color: "#10b981" }} />
          <span>Secured with enterprise-grade authentication</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
