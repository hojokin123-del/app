import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Agencies } from './pages/Agencies';
import { AgencyDetail } from './pages/AgencyDetail';
import { Sales } from './pages/Sales';
import { SalesImport } from './pages/SalesImport';
import { FeeCalculation } from './pages/FeeCalculation';
import { PaymentStatements } from './pages/PaymentStatements';
import { StatementDetail } from './pages/StatementDetail';
import { Settings } from './pages/Settings';
import './index.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="agencies" element={<Agencies />} />
            <Route path="agencies/:id" element={<AgencyDetail />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales/import" element={<SalesImport />} />
            <Route path="fees" element={<FeeCalculation />} />
            <Route path="statements" element={<PaymentStatements />} />
            <Route path="statements/:id" element={<StatementDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
