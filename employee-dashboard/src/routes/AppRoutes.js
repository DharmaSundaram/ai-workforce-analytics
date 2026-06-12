import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import AuditLogPage from "../pages/AuditLogPage";
import Dashboard from "../pages/Dashboard";
import EmployeeHistoryPage from "../pages/EmployeeHistoryPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import HistoricalAnalyticsPage from "../pages/HistoricalAnalyticsPage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import RegisterPage from "../pages/RegisterPage";
import SettingsPage from "../pages/SettingsPage";
import ProtectedRoute from "./ProtectedRoute";


function ProtectedShell({ children }) {
  const { sidebarCollapsed } = useTheme();

  return (
    <ProtectedRoute>
      <Sidebar />
      <main
        className="aether-main-shell"
        style={{
          marginLeft: sidebarCollapsed ? 72 : 260,
        }}
      >
        {children}
      </main>
    </ProtectedRoute>
  );
}

function protectedPage(page) {
  return <ProtectedShell>{page}</ProtectedShell>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
      <Route path="/history" element={protectedPage(<EmployeeHistoryPage />)} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile" element={protectedPage(<ProfilePage />)} />
      <Route path="/settings" element={protectedPage(<SettingsPage />)} />
      <Route path="/audit-logs" element={protectedPage(<AuditLogPage />)} />
      <Route path="/analytics" element={protectedPage(<HistoricalAnalyticsPage />)} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
