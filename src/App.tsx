import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { BudgetPage } from './pages/BudgetPage';
import { KpiPage } from './pages/KpiPage';
import { InitiativesPage } from './pages/InitiativesPage';
import { RepsPage } from './pages/RepsPage';
import { DataPage } from './pages/DataPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="kpi" element={<KpiPage />} />
          <Route path="initiatives" element={<InitiativesPage />} />
          <Route path="reps" element={<RepsPage />} />
          <Route path="data" element={<DataPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
