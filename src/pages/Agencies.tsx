import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TIER_LABELS, type Agency, type AgencyTier } from '../types';
import { formatPercent } from '../lib/format';

type ModalProps = {
  agency?: Agency;
  onClose: () => void;
  onSave: (data: Omit<Agency, 'id'>) => void;
};

function AgencyModal({ agency, onClose, onSave }: ModalProps) {
  const { agencies } = useApp();
  const [form, setForm] = useState<Omit<Agency, 'id'>>({
    code: agency?.code ?? '',
    name: agency?.name ?? '',
    tier: agency?.tier ?? 'primary',
    parentId: agency?.parentId ?? null,
    feeRate: agency?.feeRate ?? 0,
    contactPerson: agency?.contactPerson ?? '',
    email: agency?.email ?? '',
    phone: agency?.phone ?? '',
    bankName: agency?.bankName ?? '',
    bankBranch: agency?.bankBranch ?? '',
    accountType: agency?.accountType ?? '普通',
    accountNumber: agency?.accountNumber ?? '',
    accountHolder: agency?.accountHolder ?? '',
    active: agency?.active ?? true,
    note: agency?.note ?? '',
  });

  const set = <K extends keyof Omit<Agency, 'id'>>(k: K, v: Omit<Agency, 'id'>[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const primaries = agencies.filter(a => a.tier === 'primary' && a.id !== agency?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      parentId: form.tier === 'secondary' ? form.parentId : null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{agency ? '代理店編集' : '代理店追加'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>代理店コード</label>
              <input value={form.code} onChange={e => set('code', e.target.value)} placeholder="A-001" />
            </div>
            <div className="form-group">
              <label>代理店名 *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="株式会社〇〇" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>区分 *</label>
              <select value={form.tier} onChange={e => set('tier', e.target.value as AgencyTier)}>
                <option value="primary">一次代理店</option>
                <option value="secondary">二次代理店</option>
              </select>
            </div>
            <div className="form-group">
              <label>手数料率（％）*</label>
              <input
                required type="number" min={0} max={100} step={0.1}
                value={form.feeRate}
                onChange={e => set('feeRate', parseFloat(e.target.value) || 0)}
                placeholder="55"
              />
            </div>
          </div>

          {form.tier === 'secondary' && (
            <div className="form-group">
              <label>所属する一次代理店 *</label>
              <select
                required
                value={form.parentId ?? ''}
                onChange={e => set('parentId', e.target.value || null)}
              >
                <option value="">選択してください</option>
                {primaries.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span className="text-muted" style={{ fontSize: 12 }}>
                二次が販売した売上に対し、この一次代理店へオーバーライドが計上されます。
              </span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>担当者</label>
              <input value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
            </div>
            <div className="form-group">
              <label>電話番号</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>メールアドレス</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>

          <h3 style={{ fontSize: 14, margin: '8px 0', color: 'var(--text-muted)' }}>振込先情報</h3>
          <div className="form-row">
            <div className="form-group">
              <label>銀行名</label>
              <input value={form.bankName} onChange={e => set('bankName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>支店名</label>
              <input value={form.bankBranch} onChange={e => set('bankBranch', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>種別</label>
              <select value={form.accountType} onChange={e => set('accountType', e.target.value as '普通' | '当座')}>
                <option value="普通">普通</option>
                <option value="当座">当座</option>
              </select>
            </div>
            <div className="form-group">
              <label>口座番号</label>
              <input value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>口座名義</label>
            <input value={form.accountHolder} onChange={e => set('accountHolder', e.target.value)} />
          </div>

          <div className="form-group">
            <label>備考</label>
            <textarea rows={2} value={form.note} onChange={e => set('note', e.target.value)} />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox" style={{ width: 'auto' }}
                checked={form.active}
                onChange={e => set('active', e.target.checked)}
              />
              有効（フィー計算の対象にする）
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Agencies() {
  const { agencies, addAgency, updateAgency, deleteAgency } = useApp();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [editTarget, setEditTarget] = useState<Agency | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = agencies.filter(a => {
    const matchSearch = !search || a.name.includes(search) || a.code.includes(search) || a.contactPerson.includes(search);
    const matchTier = !tierFilter || a.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const handleSave = (data: Omit<Agency, 'id'>) => {
    if (editTarget) updateAgency(editTarget.id, data);
    else addAgency(data);
    setShowModal(false);
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('この代理店を削除してもよいですか？')) deleteAgency(id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>代理店マスター</h1>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
          <Plus size={16} /> 代理店追加
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="代理店名・コード・担当者で検索..." />
        </div>
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="filter-select">
          <option value="">すべての区分</option>
          <option value="primary">一次代理店</option>
          <option value="secondary">二次代理店</option>
        </select>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>コード</th>
              <th>代理店名</th>
              <th>区分</th>
              <th>所属一次</th>
              <th style={{ textAlign: 'right' }}>手数料率</th>
              <th>担当者</th>
              <th>状態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const parent = agencies.find(p => p.id === a.parentId);
              return (
                <tr key={a.id}>
                  <td className="text-muted">{a.code || '-'}</td>
                  <td>
                    <Link to={`/agencies/${a.id}`} className="emp-cell">
                      <span className="emp-name">{a.name}</span>
                    </Link>
                  </td>
                  <td>
                    <span className={`badge ${a.tier === 'primary' ? 'badge-primary' : ''}`}>
                      {TIER_LABELS[a.tier]}
                    </span>
                  </td>
                  <td>{parent?.name ?? '-'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatPercent(a.feeRate)}</td>
                  <td>{a.contactPerson || '-'}</td>
                  <td>
                    {a.active
                      ? <span className="badge badge-success">有効</span>
                      : <span className="badge">停止</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn" title="編集" onClick={() => { setEditTarget(a); setShowModal(true); }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn danger" title="削除" onClick={() => handleDelete(a.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="empty-row">代理店が見つかりません</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AgencyModal
          agency={editTarget ?? undefined}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
