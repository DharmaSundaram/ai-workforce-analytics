import { apiFetch } from "./api";

export const getExecutiveReport = () => apiFetch("/api/executive-report");

