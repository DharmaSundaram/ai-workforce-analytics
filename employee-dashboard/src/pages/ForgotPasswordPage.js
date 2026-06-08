import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, notification } from "antd";


const BACKEND_URL = "http://127.0.0.1:5000";

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  // Step 1: Find account by email or phone
  const handleFindAccount = async () => {
    if (!identifier) {
      setError("Please enter your email or phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const result = await response.json();

      if (result.account_found) {
        setResetToken(result.reset_token || "");
        setStep(2);
        api.success({
          message: "Account Found",
          description: "Reset verification created. Please set your new password.",
          placement: "topRight",
          duration: 3,
        });
      } else {
        setError(result.message || "No account found with this email or phone number.");
        api.error({
          message: "Account Not Found",
          description: result.message || "No account matches the provided information.",
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

  // Step 2: Reset password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!resetToken) {
      setError("Reset verification expired. Please restart password reset.");
      setStep(1);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          reset_token: resetToken,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        api.success({
          message: "Password Reset Successful",
          description: "Your password has been updated. Please sign in.",
          placement: "topRight",
          duration: 3,
        });
        setTimeout(() => navigate("/login"), 500);
      } else {
        setError(result.message || "Failed to reset password. Please try again.");
        api.error({
          message: "Reset Failed",
          description: result.message || "Could not reset password.",
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
    if (e.key === "Enter") {
      if (step === 1) handleFindAccount();
      else handleResetPassword();
    }
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
          <h1 className="login-title">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="login-subtitle">
            {step === 1
              ? "Enter your email or phone to find your account"
              : "Create a new password for your account"}
          </p>
        </div>

        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 32,
              height: 4,
              borderRadius: 2,
              background: "#2563eb",
              transition: "background 0.3s ease",
            }}
          />
          <div
            style={{
              width: 32,
              height: 4,
              borderRadius: 2,
              background: step === 2 ? "#2563eb" : "rgba(255,255,255,0.1)",
              transition: "background 0.3s ease",
            }}
          />
        </div>

        {/* Form */}
        <div className="login-form">
          {step === 1 ? (
            <>
              <div className="login-field">
                <label className="login-label">
                  <i className="fa-solid fa-envelope" style={{ marginRight: 6 }} ></i>
                  Email or Phone Number
                </label>
                <Input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your email or phone number"
                  size="large"
                  className="login-input"
                  prefix={
                    <i className="fa-solid fa-envelope" style={{ color: "rgba(148,163,184,0.4)" }} ></i>
                  }
                  autoFocus
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
                onClick={handleFindAccount}
                loading={loading}
                className="login-btn"
                size="large"
                block
                icon={loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-circle-check"></i>}
              >
                {loading ? "Searching..." : "Find My Account"}
              </Button>
            </>
          ) : (
            <>
              {/* Show the identifier in a disabled field */}
              <div className="login-field">
                <label className="login-label">
                  <i className="fa-solid fa-envelope" style={{ marginRight: 6 }} ></i>
                  Account
                </label>
                <Input
                  value={identifier}
                  disabled
                  size="large"
                  className="login-input"
                  prefix={
                    <i className="fa-solid fa-circle-check" style={{ color: "rgba(16,185,129,0.7)" }}
                    ></i>
                  }
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="login-field">
                <label className="login-label">
                  <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i>
                  New Password
                </label>
                <Input.Password
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Minimum 8 characters"
                  size="large"
                  className="login-input"
                  prefix={
                    <i className="fa-solid fa-circle" style={{ color: "rgba(148,163,184,0.4)" }} ></i>
                  }
                  autoFocus
                />
              </div>

              <div className="login-field">
                <label className="login-label">
                  <i className="fa-solid fa-circle" style={{ marginRight: 6 }} ></i>
                  Confirm New Password
                </label>
                <Input.Password
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Re-enter your new password"
                  size="large"
                  className="login-input"
                  prefix={
                    <i className="fa-solid fa-circle" style={{ color: "rgba(148,163,184,0.4)" }} ></i>
                  }
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
                onClick={handleResetPassword}
                loading={loading}
                className="login-btn"
                size="large"
                block
                icon={loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-circle"></i>}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="login-footer">
          <a
            onClick={() => navigate("/login")}
            style={{
              color: "#93c5fd",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <i className="fa-solid fa-circle"></i> Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
