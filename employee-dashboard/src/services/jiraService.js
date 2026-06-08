import { apiFetch } from "./api";

export const syncJira = () => apiFetch("/api/sync-jira", { method: "POST" });
export const getJiraSyncLogs = () => apiFetch("/api/jira-sync-logs");
export const getJiraSyncStatus = () => apiFetch("/api/jira-sync-status");
export const testJiraConnection = (payload) =>
  apiFetch("/api/test-jira-connection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

