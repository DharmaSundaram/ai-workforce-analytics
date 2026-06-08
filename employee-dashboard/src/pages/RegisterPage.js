import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, notification } from "antd";


const BACKEND_URL = "http://127.0.0.1:5000";

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    // Client-side validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        api.success({
          message: "Registration Successful",
          description: "Your account has been created. Please sign in.",
          placement: "topRight",
          duration: 3,
        });
        setTimeout(() => navigate("/login"), 500);
      } else {
        setError(result.message || "Registration failed. Please try again.");
        api.error({
          message: "Registration Failed",
          description: result.message || "Could not create account.",
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
    if (e.key === "Enter") handleRegister();
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
            <i className="fa-solid fa-chart-line" style={{ fontSize: 28, color: "#ffffff" }} ></i>
          </div>
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">
            Join the AI Workforce Analytics platform
          </p>
        </div>

        {/* Form */}
        <div className="login-form">
          <div className="login-field">
            <label className="login-label">
              <i className="fa-solid fa-user" style={{ marginRight: 6 }} ></i>
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your full name"
              size="large"
              className="login-input"
              prefix={<i className="fa-solid fa-user" style={{ color: "rgba(148,163,184,0.4)" }} ></i>}
              autoFocus
            />
          </div>

          <div className="login-field">
            <label className="login-label">
              <i className="fa-solid fa-envelope" style={{ marginRight: 6 }} ></i>
              Email
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your email address"
              size="large"
              className="login-input"
              prefix={<i className="fa-solid fa-envelope" style={{ color: "rgba(148,163,184,0.4)" }} ></i>}
            />
          </div>

          <div className="login-field">
            <label className="login-label">
              <i className="fa-solid fa-phone" style={{ marginRight: 6 }} ></i>
              Phone Number (optional)
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your phone number"
              size="large"
              className="login-input"
              prefix={<i className="fa-solid fa-phone" style={{ color: "rgba(148,163,184,0.4)" }} ></i>}
            />
          </div>

          <div className="login-field">
            <label className="login-label">
              <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i>
              Password
            </label>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Minimum 8 characters"
              size="large"
              className="login-input"
              prefix={<i className="fa-solid fa-circle" style={{ color: "rgba(148,163,184,0.4)" }} ></i>}
            />
          </div>

          <div className="login-field">
            <label className="login-label">
              <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i>
              Confirm Password
            </label>
            <Input.Password
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Re-enter your password"
              size="large"
              className="login-input"
              prefix={<i className="fa-solid fa-circle" style={{ color: "rgba(148,163,184,0.4)" }} ></i>}
            />
          </div>

          {error && (
            <div className="login-error">
              <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i>
              {error}
            </div>
          )}

          <Button
            type="primary"
            onClick={handleRegister}
            loading={loading}
            className="login-btn"
            size="large"
            block
            icon={loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-circle"></i>}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <span>Already have an account?</span>
          <a
            onClick={() => navigate("/login")}
            style={{
              color: "#93c5fd",
              cursor: "pointer",
              fontWeight: 600,
              marginLeft: 4,
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
