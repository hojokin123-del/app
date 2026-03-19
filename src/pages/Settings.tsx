import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Settings() {
  const { departments, employees, addDepartment } = useApp();
  const [newDept, setNewDept] = useState('');

  const handleAddDept = () => {
    if (newDept.trim()) {
      addDepartment(newDept.trim());
      setNewDept('');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>設定</h1>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header">
            <h2><Building2 size={18} /> 部署管理</h2>
          </div>
          <div className="settings-add-row">
            <input
              value={newDept}
              onChange={e => setNewDept(e.target.value)}
              placeholder="部署名を入力..."
              onKeyDown={e => e.key === 'Enter' && handleAddDept()}
            />
            <button className="btn btn-primary btn-sm" onClick={handleAddDept} disabled={!newDept.trim()}>
              <Plus size={14} /> 追加
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>部署名</th>
                <th>従業員数</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(d => {
                const count = employees.filter(e => e.departmentId === d.id).length;
                return (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{count}名</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>評価サイクル設定</h2>
          </div>
          <div className="settings-info">
            <div className="info-item">
              <span className="info-label">評価期間</span>
              <span>半期（上期: 4月〜9月、下期: 10月〜3月）</span>
            </div>
            <div className="info-item">
              <span className="info-label">評価フロー</span>
              <span>自己評価 → 上司評価 → 完了</span>
            </div>
            <div className="info-item">
              <span className="info-label">評価スケール</span>
              <span>S / A / B / C / D（5段階）</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>システム情報</h2>
          </div>
          <div className="settings-info">
            <div className="info-item">
              <span className="info-label">バージョン</span>
              <span>1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">登録従業員数</span>
              <span>{employees.length}名</span>
            </div>
            <div className="info-item">
              <span className="info-label">部署数</span>
              <span>{departments.length}部署</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
