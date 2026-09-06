import { Plus, Trash2 } from 'lucide-react';
import { useKpi } from '../../context/KpiContext';
import { fmtPct } from '../../kpi/kpiModel';
import type { SystemStatus } from '../../types/kpi';

const STATUSES: SystemStatus[] = ['未着手', '進行中', '完了', '保留'];
const STATUS_CLASS: Record<SystemStatus, string> = {
  未着手: 'st-todo',
  進行中: 'st-doing',
  完了: 'st-done',
  保留: 'st-hold',
};

export function Systemize() {
  const { data, addSystem, updateSystem, deleteSystem } = useKpi();
  const systems = data.systems;

  const avg = systems.length ? systems.reduce((s, x) => s + x.progress, 0) / systems.length : 0;
  const doneCount = systems.filter((s) => s.status === '完了').length;

  const handleAdd = () => {
    addSystem({ area: '', item: '', owner: '', status: '未着手', progress: 0, deadline: '', memo: '' });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>仕組化・自走化チェック</h1>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}><Plus size={16} /> 項目を追加</button>
      </div>
      <p className="text-muted" style={{ marginBottom: 12, fontSize: 13 }}>
        業務の標準化・マニュアル化・権限委譲の進捗を管理します。全体進捗は自動集計・自動保存されます。
      </p>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{fmtPct(avg)}</div>
            <div className="stat-label">全体進捗（平均）</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{doneCount} / {systems.length}</div>
            <div className="stat-label">完了項目</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{systems.filter((s) => s.status === '進行中').length}</div>
            <div className="stat-label">進行中</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="kpi-table-wrap">
          <table className="table daily-table">
            <thead>
              <tr>
                <th style={{ minWidth: 100 }}>領域</th>
                <th style={{ minWidth: 240 }}>仕組化する項目</th>
                <th style={{ minWidth: 90 }}>担当</th>
                <th style={{ minWidth: 110 }}>状態</th>
                <th style={{ minWidth: 160 }}>進捗率</th>
                <th style={{ minWidth: 140 }}>期限</th>
                <th style={{ minWidth: 200 }}>メモ・次の一手</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {systems.length === 0 && (
                <tr><td colSpan={8} className="empty-row">まだ項目がありません。「項目を追加」から始めましょう。</td></tr>
              )}
              {systems.map((s) => (
                <tr key={s.id}>
                  <td><input className="cell-input" value={s.area} onChange={(e) => updateSystem(s.id, { area: e.target.value })} /></td>
                  <td><textarea className="cell-textarea" value={s.item} onChange={(e) => updateSystem(s.id, { item: e.target.value })} /></td>
                  <td><input className="cell-input" value={s.owner} onChange={(e) => updateSystem(s.id, { owner: e.target.value })} /></td>
                  <td>
                    <select
                      className={`cell-select ${STATUS_CLASS[s.status]}`}
                      value={s.status}
                      onChange={(e) => {
                        const status = e.target.value as SystemStatus;
                        updateSystem(s.id, { status, ...(status === '完了' ? { progress: 1 } : {}) });
                      }}
                    >
                      {STATUSES.map((st) => (<option key={st} value={st}>{st}</option>))}
                    </select>
                  </td>
                  <td>
                    <div className="progress-bar-wrap">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={10}
                        className="progress-range"
                        value={Math.round(s.progress * 100)}
                        onChange={(e) => updateSystem(s.id, { progress: Number(e.target.value) / 100 })}
                      />
                      <span className="progress-label">{Math.round(s.progress * 100)}%</span>
                    </div>
                  </td>
                  <td><input type="date" className="cell-input" value={s.deadline} onChange={(e) => updateSystem(s.id, { deadline: e.target.value })} /></td>
                  <td><textarea className="cell-textarea" value={s.memo} onChange={(e) => updateSystem(s.id, { memo: e.target.value })} /></td>
                  <td><button className="icon-btn danger" onClick={() => deleteSystem(s.id)} title="削除"><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
