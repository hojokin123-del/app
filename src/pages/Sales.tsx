import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Sale } from '../types';
import { detectTraining } from '../lib/feeCalc';
import { formatYen, formatDate, formatMonth, listMonths } from '../lib/format';

type ModalProps = {
  sale?: Sale;
  onClose: () => void;
  onSave: (data: Omit<Sale, 'id'>) => void;
};

function SaleModal({ sale, onClose, onSave }: ModalProps) {
  const { agencies, settings } = useApp();
  const [form, setForm] = useState({
    date: sale?.date ?? new Date().toISOString().slice(0, 10),
    agencyId: sale?.agencyId ?? agencies[0]?.id ?? '',
    customerName: sale?.customerName ?? '',
    productName: sale?.productName ?? '',
    category: sale?.category ?? '売上',
    amount: sale?.amount ?? 0,
    isTraining: sale?.isTraining ?? true,
    isTrainingTouched: sale !== undefined,
  });

  const set = (patch: Partial<typeof form>) => setForm(prev => ({ ...prev, ...patch }));

  const handleProductChange = (v: string) => {
    // 未編集なら研修キーワードで自動判定
    const auto = detectTraining(`${v} ${form.category}`, settings.trainingKeywords);
    set({ productName: v, ...(form.isTrainingTouched ? {} : { isTraining: auto }) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const month = form.date.slice(0, 7);
    onSave({
      date: form.date,
      month,
      agencyId: form.agencyId,
      customerName: form.customerName,
      productName: form.productName,
      category: form.category,
      amount: form.amount,
      isTraining: form.isTraining,
      source: sale?.source ?? 'manual',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{sale ? '売上編集' : '売上追加'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>入金日 *</label>
              <input required type="date" value={form.date} onChange={e => set({ date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>販売代理店 *</label>
              <select required value={form.agencyId} onChange={e => set({ agencyId: e.target.value })}>
                {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>顧客先 *</label>
            <input required value={form.customerName} onChange={e => set({ customerName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>内容・商材 *</label>
            <input required value={form.productName} onChange={e => handleProductChange(e.target.value)} placeholder="DX+GX定額制" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>区分</label>
              <input value={form.category} onChange={e => set({ category: e.target.value })} />
            </div>
            <div className="form-group">
              <label>金額（入金・円）*</label>
              <input
                required type="number" min={0} step={1}
                value={form.amount}
                onChange={e => set({ amount: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <input
                type="checkbox" style={{ width: 'auto' }}
                checked={form.isTraining}
                onChange={e => set({ isTraining: e.target.checked, isTrainingTouched: true })}
              />
              研修に関する売上（区分フラグ）
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

export function Sales() {
  const { sales, agencies, addSale, updateSale, deleteSale } = useApp();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [trainingOnly, setTrainingOnly] = useState(false);
  const [editTarget, setEditTarget] = useState<Sale | null>(null);
  const [showModal, setShowModal] = useState(false);

  const months = useMemo(() => listMonths(sales), [sales]);

  const filtered = useMemo(() => sales
    .filter(s => {
      const agency = agencies.find(a => a.id === s.agencyId);
      const matchSearch = !search
        || s.customerName.includes(search)
        || s.productName.includes(search)
        || (agency?.name.includes(search) ?? false);
      const matchMonth = !monthFilter || s.month === monthFilter;
      const matchTraining = !trainingOnly || s.isTraining;
      return matchSearch && matchMonth && matchTraining;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1)),
  [sales, agencies, search, monthFilter, trainingOnly]);

  const totalAmount = filtered.reduce((s, x) => s + x.amount, 0);
  const trainingAmount = filtered.filter(s => s.isTraining).reduce((s, x) => s + x.amount, 0);

  const handleSave = (data: Omit<Sale, 'id'>) => {
    if (editTarget) updateSale(editTarget.id, data);
    else addSale(data);
    setShowModal(false);
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('この売上を削除してもよいですか？')) deleteSale(id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>売上データ</h1>
        <div className="header-actions">
          <Link to="/sales/import" className="btn btn-secondary"><Upload size={16} /> スプレッドシート連携</Link>
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
            <Plus size={16} /> 売上追加
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 22 }}>{filtered.length}件</div>
            <div className="stat-label">売上件数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 22 }}>{formatYen(totalAmount)}</div>
            <div className="stat-label">売上合計</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 22, color: 'var(--primary)' }}>{formatYen(trainingAmount)}</div>
            <div className="stat-label">うち研修</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="顧客先・内容・代理店で検索..." />
        </div>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="filter-select">
          <option value="">すべての月</option>
          {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
        </select>
        <label className="filter-select" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={trainingOnly} onChange={e => setTrainingOnly(e.target.checked)} />
          研修のみ
        </label>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>入金日</th><th>対象月</th><th>販売代理店</th><th>顧客先</th>
              <th>内容</th><th style={{ textAlign: 'right' }}>金額（入金）</th><th>種別</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const agency = agencies.find(a => a.id === s.agencyId);
              return (
                <tr key={s.id}>
                  <td>{formatDate(s.date)}</td>
                  <td className="text-muted">{formatMonth(s.month)}</td>
                  <td>{agency?.name ?? '-'}</td>
                  <td>{s.customerName}</td>
                  <td>{s.productName}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatYen(s.amount)}</td>
                  <td>
                    {s.isTraining
                      ? <span className="badge badge-success">研修</span>
                      : <span className="badge">対象外</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn" title="編集" onClick={() => { setEditTarget(s); setShowModal(true); }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn danger" title="削除" onClick={() => handleDelete(s.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="empty-row">売上データが見つかりません</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <SaleModal
          sale={editTarget ?? undefined}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
