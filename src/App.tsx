import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { KpiProvider } from './context/KpiContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { Evaluations } from './pages/Evaluations';
import { EvaluationDetail } from './pages/EvaluationDetail';
import { NewEvaluation } from './pages/NewEvaluation';
import { Criteria } from './pages/Criteria';
import { Settings } from './pages/Settings';
import { KpiDashboard } from './pages/kpi/KpiDashboard';
import { KpiTargets } from './pages/kpi/KpiTargets';
import { DailyLog } from './pages/kpi/DailyLog';
import { WeeklyReview } from './pages/kpi/WeeklyReview';
import { CashFlow } from './pages/kpi/CashFlow';
import { Systemize } from './pages/kpi/Systemize';
import './index.css';

export default function App() {
  return (
    <AppProvider>
      <KpiProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="evaluations" element={<Evaluations />} />
              <Route path="evaluations/new" element={<NewEvaluation />} />
              <Route path="evaluations/:id" element={<EvaluationDetail />} />
              <Route path="criteria" element={<Criteria />} />
              <Route path="settings" element={<Settings />} />
              <Route path="kpi" element={<KpiDashboard />} />
              <Route path="kpi/targets" element={<KpiTargets />} />
              <Route path="kpi/daily" element={<DailyLog />} />
              <Route path="kpi/weekly" element={<WeeklyReview />} />
              <Route path="kpi/cashflow" element={<CashFlow />} />
              <Route path="kpi/systemize" element={<Systemize />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </KpiProvider>
    </AppProvider>
  );
}
