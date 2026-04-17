import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { Evaluations } from './pages/Evaluations';
import { EvaluationDetail } from './pages/EvaluationDetail';
import { NewEvaluation } from './pages/NewEvaluation';
import { Criteria } from './pages/Criteria';
import { Settings } from './pages/Settings';
import { Curriculum } from './pages/Curriculum';
import './index.css';

export default function App() {
  return (
    <AppProvider>
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
            <Route path="curriculum" element={<Curriculum />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
