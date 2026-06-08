import React from "react";
import { Navigate } from "react-router-dom";


function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const expiresAt = localStorage.getItem("sessionExpiresAt");

  if (!isAuthenticated || (expiresAt && new Date(expiresAt).getTime() <= Date.now())) {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("sessionExpiresAt");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

