import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PERIOD_LABELS } from '../types';

export function NewEvaluation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { employees, evaluations, createEvaluation } = useApp();

  const preselectedEmpId = searchParams.get('employeeId') ?? '';
  const [employeeId, setEmployeeId] = useState(preselectedEmpId);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [period, setPeriod] = useState<'H1' | 'H2'>('H1');
  const [error, setError] = useState('');

  const yearOptions = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

  const handleCreate = () => {
    if (!employeeId) { setError('従業員を選択してください'); return; }
    const exists = evaluations.find(e => e.employeeId === employeeId && e.year === Number(year) && e.period === period);
    if (exists) { setError('この従業員・期間の評価は既に存在します'); return; }
    const id = createEvaluation(employeeId, Number(year), period);
    navigate(`/evaluations/${id}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/evaluations" className="back-link"><ArrowLeft size={16} /> 評価一覧</Link>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-header">
          <h2>新規評価作成</h2>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>従業員 *</label>
            <select value={employeeId} onChange={e => { setEmployeeId(e.target.value); setError(''); }}>
              <option value="">選択してください</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}（{e.position}）</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>年度 *</label>
              <select value={year} onChange={e => setYear(e.target.value)}>
                {yearOptions.map(y => <option key={y} value={y}>{y}年度</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>期 *</label>
              <select value={period} onChange={e => setPeriod(e.target.value as 'H1' | 'H2')}>
                {(Object.entries(PERIOD_LABELS) as ['H1' | 'H2', string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <div className="modal-footer">
            <Link to="/evaluations" className="btn btn-secondary">キャンセル</Link>
            <button className="btn btn-primary" onClick={handleCreate}>評価を作成する</button>
          </div>
        </div>
      </div>
    </div>
  );
}
