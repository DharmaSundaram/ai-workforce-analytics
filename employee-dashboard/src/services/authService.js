import { apiFetch } from "./api";

export const login = (payload) =>
  apiFetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const register = (payload) =>
  apiFetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const logout = (options = {}) => apiFetch("/api/logout", { method: "POST", ...options });

