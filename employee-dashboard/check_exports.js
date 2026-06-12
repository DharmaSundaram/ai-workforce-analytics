require("@babel/register")({
  presets: ["@babel/preset-env", ["@babel/preset-react", {runtime: "automatic"}]]
});

const components = [
  { name: "AppRoutes", path: "./src/routes/AppRoutes.js" },
  { name: "Dashboard", path: "./src/pages/Dashboard.js" },
  { name: "AIStrategicInsights", path: "./src/components/AIStrategicInsights.js" },
  { name: "ProtectedRoute", path: "./src/routes/ProtectedRoute.js" },
  { name: "AnalyticsPage", path: "./src/pages/AnalyticsPage.js" },
  { name: "HistoricalAnalyticsPage", path: "./src/pages/HistoricalAnalyticsPage.js" },
];

for (const comp of components) {
  try {
    const mod = require(comp.path);
    console.log(`${comp.name} default export type:`, typeof mod.default);
  } catch (err) {
    console.error(`Failed to load ${comp.name}:`, err.message);
  }
}
