import { apiFetch } from "./api";

export const getDashboardData = () => apiFetch("/api/dashboard-data");
export const getAiSummary = () => apiFetch("/api/ai-summary");
export const getHistoricalAnalytics = (days) => apiFetch(`/api/historical-analytics?days=${days}`);
export const predictProductivity = (payload) =>
  apiFetch("/predict-productivity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

