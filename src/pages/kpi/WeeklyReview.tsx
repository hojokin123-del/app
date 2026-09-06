import { Plus, Trash2 } from 'lucide-react';
import { useKpi } from '../../context/KpiContext';
import { achievement, fmtPct } from '../../kpi/kpiModel';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function WeeklyReview() {
  const { data, addWeekly, updateWeekly, deleteWeekly } = useKpi();

  const handleAdd = () => {
    addWeekly({
      weekStart: todayISO(),
      theme: '',
      target: null,
      actual: null,
      wins: '',
      learnings: '',
      improvement: '',
      direction: '',
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>週次進捗レビュー</h1>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}><Plus size={16} /> レビューを追加</button>
      </div>
      <p className="text-muted" style={{ marginBottom: 12, fontSize: 13 }}>
        週ごとの目標対比・学び・改善・方向性を記録します。達成率は自動計算・自動保存されます。
      </p>

      <div className="card">
        <div className="kpi-table-wrap">
          <table className="table daily-table">
            <thead>
              <tr>
                <th style={{ minWidth: 130 }}>週（開始日）</th>
                <th style={{ minWidth: 140 }}>重点テーマ</th>
                <th style={{ minWidth: 90 }}>目標</th>
                <th style={{ minWidth: 90 }}>実績</th>
                <th style={{ minWidth: 80 }}>達成率</th>
                <th style={{ minWidth: 170 }}>うまくいった事</th>
                <th style={{ minWidth: 170 }}>課題・学び</th>
                <th style={{ minWidth: 170 }}>来週の改善</th>
                <th style={{ minWidth: 150 }}>方向性メモ</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.weekly.length === 0 && (
                <tr><td colSpan={10} className="empty-row">まだレビューがありません。「レビューを追加」から始めましょう。</td></tr>
              )}
              {data.weekly.map((e) => {
                const ach = achievement(e.actual, e.target);
                return (
                  <tr key={e.id}>
                    <td><input type="date" className="cell-input" value={e.weekStart} onChange={(ev) => updateWeekly(e.id, { weekStart: ev.target.value })} /></td>
                    <td><input className="cell-input" value={e.theme} onChange={(ev) => updateWeekly(e.id, { theme: ev.target.value })} /></td>
                    <td><input type="number" className="cell-input" value={e.target ?? ''} onChange={(ev) => updateWeekly(e.id, { target: ev.target.value === '' ? null : Number(ev.target.value) })} /></td>
                    <td><input type="number" className="cell-input" value={e.actual ?? ''} onChange={(ev) => updateWeekly(e.id, { actual: ev.target.value === '' ? null : Number(ev.target.value) })} /></td>
                    <td className={`calc-cell ${ach == null ? '' : ach >= 1 ? 'ach-good' : ach >= 0.7 ? 'ach-mid' : 'ach-low'}`}>{fmtPct(ach)}</td>
                    <td><textarea className="cell-textarea" value={e.wins} onChange={(ev) => updateWeekly(e.id, { wins: ev.target.value })} /></td>
                    <td><textarea className="cell-textarea" value={e.learnings} onChange={(ev) => updateWeekly(e.id, { learnings: ev.target.value })} /></td>
                    <td><textarea className="cell-textarea" value={e.improvement} onChange={(ev) => updateWeekly(e.id, { improvement: ev.target.value })} /></td>
                    <td><textarea className="cell-textarea" value={e.direction} onChange={(ev) => updateWeekly(e.id, { direction: ev.target.value })} /></td>
                    <td><button className="icon-btn danger" onClick={() => deleteWeekly(e.id)} title="削除"><Trash2 size={15} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
