import { Plus, Trash2 } from 'lucide-react';
import { useKpi } from '../../context/KpiContext';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLog() {
  const { data, addDaily, updateDaily, deleteDaily } = useKpi();

  const handleAdd = () => {
    addDaily({
      date: todayISO(),
      owner: '',
      activity: '',
      output: '',
      metricLabel: '',
      metricValue: null,
      issue: '',
      nextAction: '',
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>日次活動記録</h1>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}><Plus size={16} /> 記録を追加</button>
      </div>
      <p className="text-muted" style={{ marginBottom: 12, fontSize: 13 }}>
        毎日の動き・成果・重要数値・課題・翌日アクションを記録します。入力内容は自動保存されます。
      </p>

      <div className="card">
        <div className="kpi-table-wrap">
          <table className="table daily-table">
            <thead>
              <tr>
                <th style={{ minWidth: 130 }}>日付</th>
                <th style={{ minWidth: 90 }}>担当</th>
                <th style={{ minWidth: 220 }}>主な活動・動き</th>
                <th style={{ minWidth: 200 }}>成果・アウトプット</th>
                <th style={{ minWidth: 150 }}>重要数値</th>
                <th style={{ minWidth: 180 }}>課題・つまづき</th>
                <th style={{ minWidth: 180 }}>明日のアクション</th>
                <th style={{ width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.daily.length === 0 && (
                <tr><td colSpan={8} className="empty-row">まだ記録がありません。「記録を追加」から始めましょう。</td></tr>
              )}
              {data.daily.map((e) => (
                <tr key={e.id}>
                  <td>
                    <input type="date" className="cell-input" value={e.date} onChange={(ev) => updateDaily(e.id, { date: ev.target.value })} />
                  </td>
                  <td>
                    <input className="cell-input" value={e.owner} onChange={(ev) => updateDaily(e.id, { owner: ev.target.value })} />
                  </td>
                  <td>
                    <textarea className="cell-textarea" value={e.activity} onChange={(ev) => updateDaily(e.id, { activity: ev.target.value })} />
                  </td>
                  <td>
                    <textarea className="cell-textarea" value={e.output} onChange={(ev) => updateDaily(e.id, { output: ev.target.value })} />
                  </td>
                  <td>
                    <input className="cell-input" placeholder="指標名" value={e.metricLabel} onChange={(ev) => updateDaily(e.id, { metricLabel: ev.target.value })} />
                    <input type="number" className="cell-input" placeholder="数値" value={e.metricValue ?? ''} onChange={(ev) => updateDaily(e.id, { metricValue: ev.target.value === '' ? null : Number(ev.target.value) })} />
                  </td>
                  <td>
                    <textarea className="cell-textarea" value={e.issue} onChange={(ev) => updateDaily(e.id, { issue: ev.target.value })} />
                  </td>
                  <td>
                    <textarea className="cell-textarea" value={e.nextAction} onChange={(ev) => updateDaily(e.id, { nextAction: ev.target.value })} />
                  </td>
                  <td>
                    <button className="icon-btn danger" onClick={() => deleteDaily(e.id)} title="削除"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
