import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import { TODAY } from '../../data/salesMockData';
import {
  INITIATIVE_STATUS_COLORS, INITIATIVE_STATUS_LABELS, KPI_LABELS,
  type Initiative, type InitiativeStatus, type KpiKey,
} from '../../types/sales';
import { ALL, yen } from './salesUtils';

type Draft = Omit<Initiative, 'id'>;

const STATUSES = Object.keys(INITIATIVE_STATUS_LABELS) as InitiativeStatus[];
const KPI_OPTIONS = Object.keys(KPI_LABELS) as (KpiKey | 'revenue')[];

function InitiativeForm({ initial, onSave, onClose }: { initial: Draft; onSave: (d: Draft) => void; onClose: () => void }) {
  const { reps } = useSales();
  const [d, setD] = useState<Draft>(initial);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD(prev => ({ ...prev, [k]: v }));
  const valid = d.title.trim() && d.ownerId && d.dueDate;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="施策の編集">
        <div className="modal-header">
          <h2>{initial.title ? '施策を編集' : '施策を追加'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="閉じる"><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>施策名 *</label>
            <input value={d.title} onChange={e => set('title', e.target.value)} placeholder="例：既存顧客へのアップセル提案" />
          </div>
          <div className="form-group">
            <label>内容・具体的アクション</label>
            <textarea rows={3} value={d.description} onChange={e => set('description', e.target.value)} placeholder="誰に・何を・いつまでに・どれだけ" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>担当者 *</label>
              <select value={d.ownerId} onChange={e => set('ownerId', e.target.value)}>
                <option value="">選択してください</option>
                {reps.map(r => <option key={r.id} value={r.id}>{r.name}（{r.team}）</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>対象KPI</label>
              <select value={d.kpi} onChange={e => set('kpi', e.target.value as Draft['kpi'])}>
                {KPI_OPTIONS.map(k => <option key={k} value={k}>{KPI_LABELS[k]}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>開始日</label>
              <input type="date" value={d.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label>期限 *</label>
              <input type="date" value={d.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>ステータス</label>
              <select value={d.status} onChange={e => set('status', e.target.value as InitiativeStatus)}>
                {STATUSES.map(s => <option key={s} value={s}>{INITIATIVE_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>想定効果（万円）</label>
              <input type="number" min={0} value={d.expectedImpact} onChange={e => set('expectedImpact', Math.max(0, Number(e.target.value)))} />
            </div>
          </div>
          <div className="form-group">
            <label>進捗 {d.progress}%</label>
            <input type="range" min={0} max={100} step={5} value={d.progress} className="progress-range" onChange={e => set('progress', Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>メモ・結果</label>
            <input value={d.note} onChange={e => set('note', e.target.value)} placeholder="例：12社に提案済み" />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>キャンセル</button>
            <button className="btn btn-primary" disabled={!valid} onClick={() => { onSave(d); onClose(); }}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InitiativesTab({ repId }: { repId: string }) {
  const { reps, initiatives, addInitiative, updateInitiative, deleteInitiative } = useSales();
  const [statusFilter, setStatusFilter] = useState<InitiativeStatus | 'all'>('all');
  const [editing, setEditing] = useState<Initiative | 'new' | null>(null);

  const byRep = repId === ALL ? initiatives : initiatives.filter(i => i.ownerId === repId);
  const list = (statusFilter === 'all' ? byRep : byRep.filter(i => i.status === statusFilter))
    .slice()
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done') || a.dueDate.localeCompare(b.dueDate));

  const active = byRep.filter(i => i.status !== 'done');
  const impact = active.reduce((s, i) => s + i.expectedImpact, 0);
  const overdue = active.filter(i => i.dueDate < TODAY).length;

  const emptyDraft: Draft = {
    title: '', description: '', ownerId: repId === ALL ? '' : repId, kpi: 'deals', status: 'planned',
    startDate: TODAY, dueDate: '', progress: 0, expectedImpact: 0, note: '',
  };

  return (
    <>
      <div className="sales-tiles three">
        <div className="stat-card"><div className="stat-body"><div className="stat-label">進行中・計画中の施策</div><div className="stat-value sales-stat-value">{active.length}件</div></div></div>
        <div className="stat-card"><div className="stat-body"><div className="stat-label">想定効果の合計（未完了）</div><div className="stat-value sales-stat-value">{yen(impact)}</div></div></div>
        <div className="stat-card"><div className="stat-body"><div className="stat-label">期限超過</div><div className={`stat-value sales-stat-value ${overdue > 0 ? 'text-critical' : ''}`}>{overdue}件</div></div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="ops-chips">
            {(['all', ...STATUSES] as const).map(s => (
              <button key={s} className={`ops-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'すべて' : INITIATIVE_STATUS_LABELS[s]}
                <span className="ops-chip-count">{s === 'all' ? byRep.length : byRep.filter(i => i.status === s).length}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}><Plus size={14} /> 施策を追加</button>
        </div>
        <div className="table-scroll">
          <table className="table sales-table">
            <thead>
              <tr>
                <th>施策</th><th>担当</th><th>対象KPI</th><th>期限</th><th>ステータス</th><th style={{ minWidth: 160 }}>進捗</th><th className="num">想定効果</th><th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={8} className="empty-row">該当する施策はありません</td></tr>}
              {list.map(i => {
                const owner = reps.find(r => r.id === i.ownerId);
                const isOverdue = i.status !== 'done' && i.dueDate < TODAY;
                return (
                  <tr key={i.id} className={i.status === 'done' ? 'is-done' : ''}>
                    <td style={{ maxWidth: 340 }}>
                      <div className="emp-name">{i.title}</div>
                      <div className="activity-meta">{i.description}</div>
                      {i.note && <div className="initiative-note">📝 {i.note}</div>}
                    </td>
                    <td className="nowrap">{owner?.name ?? '—'}</td>
                    <td className="nowrap"><span className="badge">{KPI_LABELS[i.kpi]}</span></td>
                    <td className="nowrap">
                      {i.dueDate}
                      {isOverdue && <div><span className="due-label overdue">期限超過</span></div>}
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={i.status}
                        style={{ color: INITIATIVE_STATUS_COLORS[i.status], borderColor: `${INITIATIVE_STATUS_COLORS[i.status]}66` }}
                        onChange={e => {
                          const status = e.target.value as InitiativeStatus;
                          updateInitiative(i.id, { status, progress: status === 'done' ? 100 : i.progress });
                        }}
                        aria-label="ステータス"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{INITIATIVE_STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="progress-bar-wrap">
                        <input
                          type="range" min={0} max={100} step={5} value={i.progress} className="progress-range"
                          aria-label="進捗"
                          onChange={e => updateInitiative(i.id, { progress: Number(e.target.value) })}
                        />
                        <span className="progress-label">{i.progress}%</span>
                      </div>
                    </td>
                    <td className="num nowrap">{yen(i.expectedImpact)}</td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" onClick={() => setEditing(i)} aria-label="編集"><Pencil size={14} /></button>
                        <button className="icon-btn danger" onClick={() => { if (confirm(`「${i.title}」を削除しますか？`)) deleteInitiative(i.id); }} aria-label="削除"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <InitiativeForm
          initial={editing === 'new' ? emptyDraft : editing}
          onClose={() => setEditing(null)}
          onSave={d => (editing === 'new' ? addInitiative(d) : updateInitiative(editing.id, d))}
        />
      )}
    </>
  );
}
