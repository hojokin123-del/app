import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { KpiProvider } from './context/KpiContext';
import { Layout } from './components/Layout';
import { KpiDashboard } from './pages/kpi/KpiDashboard';
import { KpiTargets } from './pages/kpi/KpiTargets';
import { DailyLog } from './pages/kpi/DailyLog';
import { WeeklyReview } from './pages/kpi/WeeklyReview';
import { CashFlow } from './pages/kpi/CashFlow';
import { Systemize } from './pages/kpi/Systemize';
import './index.css';

export default function App() {
  return (
    <KpiProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<KpiDashboard />} />
            <Route path="targets" element={<KpiTargets />} />
            <Route path="daily" element={<DailyLog />} />
            <Route path="weekly" element={<WeeklyReview />} />
            <Route path="cashflow" element={<CashFlow />} />
            <Route path="systemize" element={<Systemize />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </KpiProvider>
  );
}
