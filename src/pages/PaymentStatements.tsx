import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATEMENT_STATUS_LABELS } from '../types';
import { formatYen, formatMonth, listMonths } from '../lib/format';

export function PaymentStatements() {
  const { statements, agencies, deleteStatement } = useApp();
  const months = useMemo(() => listMonths(statements), [statements]);
  const [monthFilter, setMonthFilter] = useState('');

  const filtered = useMemo(
    () => statements
      .filter(st => !monthFilter || st.month === monthFilter)
      .sort((a, b) => (a.month < b.month ? 1 : a.month > b.month ? -1 : b.total - a.total)),
    [statements, monthFilter],
  );

  const totalPay = filtered.reduce((s, st) => s + st.total, 0);

  const handleDelete = (id: string) => {
    if (confirm('この支払明細書を削除してもよいですか？')) deleteStatement(id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>支払明細書</h1>
        {months.length > 0 && (
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="filter-select">
            <option value="">すべての月</option>
            {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
          </select>
        )}
      </div>

      {statements.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FileText size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <p>支払明細書はまだありません。</p>
            <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
              「フィー計算」で対象月を選び、「支払明細書を作成」を押してください。
            </p>
            <Link to="/fees" className="btn btn-primary" style={{ marginTop: 16 }}>フィー計算へ</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-body">
                <div className="stat-value" style={{ fontSize: 22 }}>{filtered.length}件</div>
                <div className="stat-label">明細書数</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-body">
                <div className="stat-value" style={{ fontSize: 22, color: 'var(--primary)' }}>{formatYen(totalPay)}</div>
                <div className="stat-label">支払総額（振込金額）</div>
              </div>
            </div>
          </div>

          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>対象月</th><th>代理店</th>
                  <th style={{ textAlign: 'right' }}>手数料小計</th>
                  <th style={{ textAlign: 'right' }}>消費税</th>
                  <th style={{ textAlign: 'right' }}>差引支払額</th>
                  <th>状態</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(st => {
                  const agency = agencies.find(a => a.id === st.agencyId);
                  return (
                    <tr key={st.id}>
                      <td>{formatMonth(st.month)}</td>
                      <td>
                        <Link to={`/statements/${st.id}`} className="emp-cell">
                          <span className="emp-name">{agency?.name ?? '(削除済み)'}</span>
                        </Link>
                      </td>
                      <td style={{ textAlign: 'right' }}>{formatYen(st.subtotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatYen(st.taxAmount)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatYen(st.total)}</td>
                      <td>
                        {st.status === 'confirmed'
                          ? <span className="badge badge-success"><CheckCircle size={12} style={{ verticalAlign: 'middle' }} /> {STATEMENT_STATUS_LABELS.confirmed}</span>
                          : <span className="badge">{STATEMENT_STATUS_LABELS.draft}</span>}
                      </td>
                      <td>
                        <div className="action-btns">
                          <Link to={`/statements/${st.id}`} className="icon-btn" title="表示・印刷"><FileText size={16} /></Link>
                          <button className="icon-btn danger" title="削除" onClick={() => handleDelete(st.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
