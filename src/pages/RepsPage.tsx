import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useSales } from '../store/salesStore';
import { KPI_KEYS, KPI_LABELS, type SalesRep } from '../types/sales';
import { PageHeader } from './sales/PageHeader';
import { RateBadge } from './sales/RateBadge';
import { COLORS, aggregateByMonth, filterByRep, summarize, sumKpi, yen, rateOf } from './sales/salesUtils';

const TAB_PATHS = { summary: '/', budget: '/budget', reps: '/reps', initiatives: '/initiatives' } as const;

type RepDraft = Omit<SalesRep, 'id'>;

function RepForm({ initial, teams, onSave, onClose }: { initial: RepDraft; teams: string[]; onSave: (d: RepDraft) => void; onClose: () => void }) {
  const [d, setD] = useState<RepDraft>(initial);
  const [initialsTouched, setInitialsTouched] = useState(Boolean(initial.avatarInitials));
  const autoInitials = (name: string) => name.replace(/\s+/g, ' ').trim().split(' ').map(p => p[0] ?? '').join('').slice(0, 2);
  const valid = d.name.trim() && d.team.trim();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="担当者の編集">
        <div className="modal-header">
          <h2>{initial.name ? '担当者を編集' : '担当者を追加'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="閉じる"><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>氏名 *</label>
            <input
              value={d.name} placeholder="例：佐藤 花子" autoFocus
              onChange={e => setD(p => ({ ...p, name: e.target.value, avatarInitials: initialsTouched ? p.avatarInitials : autoInitials(e.target.value) }))}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>チーム *</label>
              <input list="team-options" value={d.team} placeholder="例：営業1課" onChange={e => setD(p => ({ ...p, team: e.target.value }))} />
              <datalist id="team-options">{teams.map(t => <option key={t} value={t} />)}</datalist>
            </div>
            <div className="form-group">
              <label>役職</label>
              <input value={d.role} placeholder="例：主任" onChange={e => setD(p => ({ ...p, role: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>アイコン表示（2文字まで）</label>
            <input value={d.avatarInitials} maxLength={2} onChange={e => { setInitialsTouched(true); setD(p => ({ ...p, avatarInitials: e.target.value })); }} />
          </div>
          {!initial.name && <p className="sales-footnote">追加後、「予実管理」で月別予算を、「KPI管理」でKPI目標を入力してください。</p>}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
            <button className="btn btn-primary" disabled={!valid} onClick={() => { onSave({ ...d, name: d.name.trim(), team: d.team.trim() }); onClose(); }}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RepsPage() {
  const { reps, records, initiatives, selectedRepId: repId, setSelectedRepId, addRep, updateRep, deleteRep } = useSales();
  const [editing, setEditing] = useState<SalesRep | 'new' | null>(null);
  const navigate = useNavigate();
  const onOpenTab = (tab: keyof typeof TAB_PATHS) => navigate(TAB_PATHS[tab]);

  const cards = useMemo(() => reps.map(rep => {
    const rs = filterByRep(records, rep.id);
    const months = aggregateByMonth(rs);
    return {
      rep,
      sum: summarize(months),
      months,
      kpi: sumKpi(rs, 'ytd'),
      openInitiatives: initiatives.filter(i => i.ownerId === rep.id && i.status !== 'done').length,
    };
  }), [reps, records, initiatives]);

  const teams = [...new Set(reps.map(r => r.team))];

  return (
    <div className="page">
      <PageHeader
        title="担当者"
        hideRepFilter
        actions={<button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}><Plus size={14} /> 担当者を追加</button>}
      />
      {reps.length === 0 && <div className="card empty-row" style={{ marginBottom: 16 }}>担当者が登録されていません。「担当者を追加」から登録してください。</div>}
      <div className="card">
        <div className="card-header"><h2>チーム別サマリー</h2></div>
        <table className="table sales-table">
          <thead>
            <tr><th>チーム</th><th className="num">人数</th><th className="num">年間予算</th><th className="num">累計実績</th><th className="num">累計達成率</th><th className="num">着地見込み</th><th className="num">着地達成率</th></tr>
          </thead>
          <tbody>
            {teams.map(team => {
              const members = cards.filter(c => c.rep.team === team);
              const sumOf = (f: (c: typeof members[number]) => number) => members.reduce((s, c) => s + f(c), 0);
              const budget = sumOf(c => c.sum.annualBudget);
              const ytdB = sumOf(c => c.sum.ytdBudget);
              const ytdA = sumOf(c => c.sum.ytdActual);
              const landing = sumOf(c => c.sum.landing);
              return (
                <tr key={team}>
                  <td>{team}</td>
                  <td className="num">{members.length}名</td>
                  <td className="num">{yen(budget)}</td>
                  <td className="num">{yen(ytdA)}</td>
                  <td className="num"><RateBadge rate={rateOf(ytdA, ytdB)} /></td>
                  <td className="num">{yen(landing)}</td>
                  <td className="num"><RateBadge rate={rateOf(landing, budget)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rep-grid">
        {cards.map(({ rep, sum, months, kpi, openInitiatives }) => {
          const maxV = Math.max(1, ...months.map(m => Math.max(m.budget, m.landing)));
          return (
            <div key={rep.id} className={`card rep-card ${repId === rep.id ? 'selected' : ''}`}>
              <div className="rep-card-head">
                <div className="avatar">{rep.avatarInitials}</div>
                <div style={{ flex: 1 }}>
                  <div className="rep-name">{rep.name}</div>
                  <div className="activity-meta">{rep.team} ・ {rep.role}</div>
                </div>
                <RateBadge rate={sum.landingRate} showLabel />
                <div className="action-btns">
                  <button className="icon-btn" onClick={() => setEditing(rep)} aria-label={`${rep.name}を編集`}><Pencil size={14} /></button>
                  <button
                    className="icon-btn danger" aria-label={`${rep.name}を削除`}
                    onClick={() => { if (confirm(`${rep.name} を削除しますか？\n予実・KPIデータも削除され、担当施策は「未割当」になります。`)) deleteRep(rep.id); }}
                  ><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="rep-metrics">
                <div><span>累計実績</span><strong>{yen(sum.ytdActual)}</strong><RateBadge rate={sum.ytdRate} /></div>
                <div><span>着地見込み</span><strong>{yen(sum.landing)}</strong><small>年間予算 {yen(sum.annualBudget)}</small></div>
              </div>

              <div className="rep-spark" aria-label="月別 予算（灰）と実績・見込み（紫）">
                {months.map(m => (
                  <div key={m.month} className="rep-spark-col" title={`${m.label}: ${yen(m.landing)} / 予算 ${yen(m.budget)}`}>
                    <div className="rep-spark-budget" style={{ height: `${(m.budget / maxV) * 100}%` }} />
                    <div className="rep-spark-actual" style={{ height: `${(m.landing / maxV) * 100}%`, background: m.state === 'closed' ? COLORS.actual : COLORS.forecast }} />
                  </div>
                ))}
              </div>

              <div className="rep-kpis">
                {KPI_KEYS.map(k => (
                  <div key={k}>
                    <span>{KPI_LABELS[k]}</span>
                    <strong>{kpi[k].actual}<small>/{kpi[k].target}</small></strong>
                    <RateBadge rate={rateOf(kpi[k].actual, kpi[k].target)} />
                  </div>
                ))}
              </div>

              <div className="rep-card-foot">
                <button className="btn btn-secondary btn-xs" onClick={() => { setSelectedRepId(rep.id); onOpenTab('initiatives'); }}>
                  <ListChecks size={12} /> 進行中の施策 {openInitiatives}件
                </button>
                <button className="btn btn-primary btn-xs" onClick={() => { setSelectedRepId(rep.id); onOpenTab('summary'); }}>
                  この担当者で表示
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <RepForm
          initial={editing === 'new' ? { name: '', team: teams[0] ?? '', role: '担当', avatarInitials: '' } : editing}
          teams={teams}
          onClose={() => setEditing(null)}
          onSave={d => (editing === 'new' ? addRep(d) : updateRep(editing.id, d))}
        />
      )}
    </div>
  );
}
