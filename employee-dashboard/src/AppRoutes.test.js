jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Navigate: () => null,
  Routes: () => null,
  Route: () => null,
  BrowserRouter: () => null,
}));

import Dashboard from './pages/Dashboard';
import HistoricalAnalyticsPage from './pages/HistoricalAnalyticsPage';
import AIStrategicInsights from './components/AIStrategicInsights';
import AppRoutes from './routes/AppRoutes';

test('components are functions', () => {
  console.log('Dashboard type:', typeof Dashboard);
  console.log('HistoricalAnalyticsPage type:', typeof HistoricalAnalyticsPage);
  console.log('AIStrategicInsights type:', typeof AIStrategicInsights);
  console.log('AppRoutes type:', typeof AppRoutes);
  
  expect(typeof Dashboard).toBe('function');
});
