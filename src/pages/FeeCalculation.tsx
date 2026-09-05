import { useState, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeMonthlyFees } from '../lib/feeCalc';
import { TIER_LABELS, FEE_TYPE_LABELS, type FeeLineType } from '../types';
import { formatYen, formatPercent, formatMonth, formatDate, listMonths } from '../lib/format';

const FEE_TYPE_BADGE: Record<FeeLineType, string> = {
  direct: 'badge-primary',
  secondary: '',
  override: 'badge-success',
};

export function FeeCalculation() {
  const { agencies, sales, statements, generateStatements } = useApp();
  const navigate = useNavigate();
  const months = useMemo(() => listMonths(sales), [sales]);
  const [month, setMonth] = useState(months[0] ?? '');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fees = useMemo(
    () => (month ? computeMonthlyFees(agencies, sales, month) : []),
    [agencies, sales, month],
  );

  const monthSales = sales.filter(s => s.month === month && s.isTraining);
  const totalBase = monthSales.reduce((s, x) => s + x.amount, 0);
  const totalFee = fees.reduce((s, f) => s + f.subtotal, 0);
  const hasStatements = statements.some(st => st.month === month);

  const handleGenerate = () => {
    generateStatements(month);
    navigate('/statements');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>フィー計算</h1>
        <div className="header-actions">
          <select value={month} onChange={e => setMonth(e.target.value)} className="filter-select">
            {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
            {months.length === 0 && <option value="">売上データなし</option>}
          </select>
          <button className="btn btn-primary" disabled={fees.length === 0} onClick={handleGenerate}>
            <FileText size={16} /> {hasStatements ? '支払明細書を再作成' : '支払明細書を作成'}
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff' }}><Calculator size={24} color="#6366f1" /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 22 }}>{formatYen(totalBase)}</div>
            <div className="stat-label">研修売上（対象ベース）</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 22, color: 'var(--primary)' }}>{formatYen(totalFee)}</div>
            <div className="stat-label">フィー総額</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 22 }}>{fees.length}社</div>
            <div className="stat-label">支払対象代理店</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{formatMonth(month)} 代理店別フィー（オーバーライド型）</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th></th><th>代理店</th><th>区分</th>
              <th style={{ textAlign: 'center' }}>明細</th>
              <th style={{ textAlign: 'right' }}>フィー小計</th>
            </tr>
          </thead>
          <tbody>
            {fees.map(f => {
              const agency = agencies.find(a => a.id === f.agencyId);
              if (!agency) return null;
              const isOpen = expanded === f.agencyId;
              return (
                <Fragment key={f.agencyId}>
                  <tr className="clickable-row" onClick={() => setExpanded(isOpen ? null : f.agencyId)}>
                    <td>{isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                    <td style={{ fontWeight: 600 }}>{agency.name}</td>
                    <td><span className={`badge ${agency.tier === 'primary' ? 'badge-primary' : ''}`}>{TIER_LABELS[agency.tier]}</span></td>
                    <td style={{ textAlign: 'center' }}>{f.lines.length}件</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatYen(f.subtotal)}</td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={5} style={{ background: 'var(--bg)', padding: 0 }}>
                        <table className="table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th>種別</th><th>入金日</th><th>顧客先</th><th>研修内容</th>
                              <th style={{ textAlign: 'right' }}>研修費用</th>
                              <th style={{ textAlign: 'right' }}>率</th>
                              <th style={{ textAlign: 'right' }}>フィー</th>
                            </tr>
                          </thead>
                          <tbody>
                            {f.lines.map((l, i) => {
                              const seller = agencies.find(a => a.id === l.sellerAgencyId);
                              return (
                                <tr key={i}>
                                  <td>
                                    <span className={`badge ${FEE_TYPE_BADGE[l.type]}`}>{FEE_TYPE_LABELS[l.type]}</span>
                                    {l.type === 'override' && seller && (
                                      <span className="text-muted" style={{ fontSize: 11, marginLeft: 4 }}>（{seller.name}）</span>
                                    )}
                                  </td>
                                  <td>{formatDate(l.saleDate)}</td>
                                  <td>{l.customerName}</td>
                                  <td>{l.productName}</td>
                                  <td style={{ textAlign: 'right' }}>{formatYen(l.saleAmount)}</td>
                                  <td style={{ textAlign: 'right' }}>{formatPercent(l.rate)}</td>
                                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatYen(l.feeAmount)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {fees.length === 0 && (
              <tr><td colSpan={5} className="empty-row">この月の研修売上（フィー対象）はありません</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-muted" style={{ fontSize: 13 }}>
        オーバーライド型：二次代理店が販売した研修費用に対し、二次は自社率、所属する一次代理店は一次率をそれぞれ計上します。
        一次代理店の直販は一次率のみ計上します。各代理店の率は「代理店マスター」で登録します。
      </p>
    </div>
  );
}
