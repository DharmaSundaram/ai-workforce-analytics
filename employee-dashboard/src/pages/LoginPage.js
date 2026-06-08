import React, { useState } from "react";
import { API_BASE_URL as BACKEND_URL } from '../services/api';
import { useNavigate } from "react-router-dom";
import AILogo from '../components/AILogo';
import { Input, Button, notification, Checkbox } from "antd";
import { motion } from "framer-motion";



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
        const sessionHours = rememberMe ? 24 * 30 : 8;
        const expiresAt = new Date(Date.now() + sessionHours * 60 * 60 * 1000).toISOString();
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("loginTime", new Date().toISOString());
        localStorage.setItem("sessionExpiresAt", expiresAt);
        localStorage.setItem("user", JSON.stringify(result.user));
        // Save JWT token if provided
        if (result.access_token) {
          localStorage.setItem("jwt_token", result.access_token);
        }
        
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#020617', // Deep futuristic dark
      position: 'relative',
      overflow: 'hidden'
    }}>
      {contextHolder}

      {/* Animated Digital Grid Background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: 0.5,
        zIndex: 0
      }} />
      
      {/* Floating Orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute', top: '10%', left: '15%', width: 300, height: 300,
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          zIndex: 0, borderRadius: '50%', filter: 'blur(40px)'
        }}
      />
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          position: 'absolute', bottom: '10%', right: '15%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          zIndex: 0, borderRadius: '50%', filter: 'blur(60px)'
        }}
      />

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '40px',
          zIndex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <AILogo size={64} glow={true} />
        
        <h1 style={{ 
          color: 'var(--text-primary)', 
          marginTop: 24, 
          marginBottom: 8,
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '-0.5px'
        }}>
          AI Workforce Analytics
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: 14,
          marginBottom: 32,
          textAlign: 'center'
        }}>
          Enterprise AI Workforce Intelligence Platform
        </p>

        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
              Email or Phone Number
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter credentials"
              size="large"
              prefix={<i className="fa-solid fa-user" style={{ color: "rgba(148,163,184,0.6)" }} ></i>}
              style={{ background: 'rgba(15, 23, 42, 0.5)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
              Password
            </label>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              size="large"
              prefix={<i className="fa-solid fa-lock" style={{ color: "rgba(148,163,184,0.6)" }} ></i>}
              style={{ background: 'rgba(15, 23, 42, 0.5)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Checkbox 
              checked={rememberMe} 
              onChange={e => setRememberMe(e.target.checked)} 
              style={{ color: 'var(--text-muted)' }}
            >
              Remember Me
            </Checkbox>
            <span
              onClick={() => navigate('/forgot-password')}
              style={{ color: 'var(--accent-color)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
            >
              Forgot Password?
            </span>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ 
                background: 'rgba(255, 0, 0, 0.1)', 
                color: '#FF0000', 
                padding: '10px 14px', 
                borderRadius: 8, 
                marginBottom: 20,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                border: '1px solid rgba(255, 0, 0, 0.2)'
              }}
            >
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} ></i>
              {error}
            </motion.div>
          )}

          <Button
            type="primary"
            onClick={handleLogin}
            loading={loading}
            size="large"
            block
            style={{ 
              background: 'var(--accent-gradient)', 
              border: 'none', 
              fontWeight: 600,
              height: 48,
              borderRadius: 8,
              boxShadow: '0 4px 14px var(--accent-glow)'
            }}
            icon={loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-right-to-bracket"></i>}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span
              onClick={() => navigate('/register')}
              style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}
            >
              Don't have an account? <span style={{ color: 'var(--accent-color)', fontWeight: 500 }}>Register</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
