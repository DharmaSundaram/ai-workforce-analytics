require('@babel/register')({
  presets: ['@babel/preset-env', ['@babel/preset-react', {runtime: 'automatic'}]]
});

try {
  const AppRoutes = require('./src/routes/AppRoutes.js').default;
  console.log('AppRoutes loaded successfully:', typeof AppRoutes);
  
  const Dashboard = require('./src/pages/Dashboard.js').default;
  console.log('Dashboard loaded successfully:', typeof Dashboard);
  
  const AIStrategicInsights = require('./src/components/AIStrategicInsights.js').default;
  console.log('AIStrategicInsights loaded successfully:', typeof AIStrategicInsights);
  
} catch (err) {
  console.error("Error loading component:", err);
}
