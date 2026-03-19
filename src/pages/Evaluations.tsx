import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_LABELS, PERIOD_LABELS, type EvaluationStatus } from '../types';

export const STATUS_COLORS: Record<EvaluationStatus, string> = {
  not_started: '#94a3b8',
  self_evaluation: '#f59e0b',
  manager_evaluation: '#3b82f6',
  completed: '#10b981',
};

export { STATUS_LABELS, PERIOD_LABELS };

export function Evaluations() {
  const { evaluations, employees, departments } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const years = [...new Set(evaluations.map(e => e.year))].sort((a, b) => b - a);

  const filtered = evaluations.filter(ev => {
    const emp = employees.find(e => e.id === ev.employeeId);
    if (!emp) return false;
    const matchSearch = !search || emp.name.includes(search) || emp.nameKana.includes(search);
    const matchStatus = !statusFilter || ev.status === statusFilter;
    const matchDept = !deptFilter || emp.departmentId === deptFilter;
    const matchYear = !yearFilter || ev.year.toString() === yearFilter;
    return matchSearch && matchStatus && matchDept && matchYear;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="page">
      <div className="page-header">
        <h1>評価管理</h1>
        <button className="btn btn-primary" onClick={() => navigate('/evaluations/new')}>
          <Plus size={16} /> 評価作成
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="従業員名で検索..." />
        </div>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="filter-select">
          <option value="">すべての年度</option>
          {years.map(y => <option key={y} value={y}>{y}年度</option>)}
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="filter-select">
          <option value="">すべての部署</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
          <option value="">すべてのステータス</option>
          {(Object.entries(STATUS_LABELS) as [EvaluationStatus, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>従業員</th>
              <th>部署</th>
              <th>年度・期</th>
              <th>目標数</th>
              <th>ステータス</th>
              <th>更新日</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ev => {
              const emp = employees.find(e => e.id === ev.employeeId);
              const dept = departments.find(d => d.id === emp?.departmentId);
              if (!emp) return null;
              return (
                <tr key={ev.id} className="clickable-row" onClick={() => navigate(`/evaluations/${ev.id}`)}>
                  <td>
                    <div className="emp-cell">
                      <div className="avatar">{emp.avatarInitials}</div>
                      <div>
                        <div className="emp-name">{emp.name}</div>
                        <div className="emp-email">{emp.position}</div>
                      </div>
                    </div>
                  </td>
                  <td>{dept?.name ?? '-'}</td>
                  <td>{ev.year}年度 {PERIOD_LABELS[ev.period]}</td>
                  <td>{ev.goals.length}件</td>
                  <td>
                    <span className="status-pill" style={{ background: `${STATUS_COLORS[ev.status]}22`, color: STATUS_COLORS[ev.status] }}>
                      {STATUS_LABELS[ev.status]}
                    </span>
                  </td>
                  <td className="text-muted">{ev.updatedAt.slice(0, 10)}</td>
                  <td><ChevronRight size={16} className="text-muted" /></td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="empty-row">評価が見つかりません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
