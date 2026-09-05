import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, User, Building2, Landmark } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TIER_LABELS, FEE_TYPE_LABELS } from '../types';
import { computeMonthlyFees } from '../lib/feeCalc';
import { formatYen, formatPercent, formatMonth, formatDate, listMonths } from '../lib/format';

export function AgencyDetail() {
  const { id } = useParams();
  const { agencies, sales } = useApp();
  const agency = agencies.find(a => a.id === id);

  const parent = agencies.find(a => a.id === agency?.parentId);
  const children = agencies.filter(a => a.parentId === id);

  // この代理店が販売した研修売上
  const ownSales = useMemo(
    () => sales.filter(s => s.agencyId === id).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [sales, id],
  );

  // 月別フィー（この代理店に計上される全明細＝自社販売＋オーバーライド）
  const monthlyFees = useMemo(() => {
    if (!agency) return [];
    return listMonths(sales).map(month => {
      const fees = computeMonthlyFees(agencies, sales, month);
      const mine = fees.find(f => f.agencyId === agency.id);
      return { month, subtotal: mine?.subtotal ?? 0, lines: mine?.lines ?? [] };
    }).filter(m => m.subtotal > 0);
  }, [agency, agencies, sales]);

  if (!agency) {
    return (
      <div className="page">
        <p>代理店が見つかりません。</p>
        <Link to="/agencies" className="back-link"><ArrowLeft size={16} /> 代理店マスターへ戻る</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="breadcrumb" style={{ marginBottom: 16 }}>
        <Link to="/agencies" className="back-link"><ArrowLeft size={16} /> 代理店マスター</Link>
      </div>

      <div className="detail-grid">
        {/* プロフィール */}
        <div className="card profile-card">
          <div className="profile-header">
            <div className="avatar avatar-lg">{agency.name.slice(0, 2)}</div>
            <div>
              <h2>{agency.name}</h2>
              <span className={`badge ${agency.tier === 'primary' ? 'badge-primary' : ''}`}>
                {TIER_LABELS[agency.tier]}
              </span>
            </div>
          </div>

          <div className="avg-rating" style={{ marginBottom: 20 }}>
            <div className="avg-label">手数料率</div>
            <div className="avg-value">{formatPercent(agency.feeRate)}</div>
          </div>

          <div className="info-list">
            <div className="info-item"><Building2 size={16} /> コード：{agency.code || '-'}</div>
            {parent && <div className="info-item"><Building2 size={16} /> 所属一次：{parent.name}</div>}
            <div className="info-item"><User size={16} /> {agency.contactPerson || '-'}</div>
            <div className="info-item"><Mail size={16} /> {agency.email || '-'}</div>
            <div className="info-item"><Phone size={16} /> {agency.phone || '-'}</div>
          </div>

          <div className="info-list">
            <div className="info-item" style={{ fontWeight: 600, color: 'var(--text)' }}>
              <Landmark size={16} /> 振込先
            </div>
            <div className="info-item" style={{ paddingLeft: 26 }}>
              {agency.bankName} {agency.bankBranch}<br />
              {agency.accountType} {agency.accountNumber}<br />
              {agency.accountHolder}
            </div>
          </div>

          {children.length > 0 && (
            <div className="info-list">
              <div className="info-item" style={{ fontWeight: 600, color: 'var(--text)' }}>配下の二次代理店</div>
              {children.map(c => (
                <div key={c.id} className="info-item" style={{ paddingLeft: 26 }}>
                  <Link to={`/agencies/${c.id}`}>{c.name}（{formatPercent(c.feeRate)}）</Link>
                </div>
              ))}
            </div>
          )}
          {agency.note && <p className="text-muted" style={{ fontSize: 13 }}>{agency.note}</p>}
        </div>

        {/* 右側 */}
        <div>
          <div className="card">
            <div className="card-header"><h2>月別フィー</h2></div>
            <table className="table">
              <thead>
                <tr><th>対象月</th><th>明細件数</th><th style={{ textAlign: 'right' }}>フィー小計</th></tr>
              </thead>
              <tbody>
                {monthlyFees.map(m => (
                  <tr key={m.month}>
                    <td>{formatMonth(m.month)}</td>
                    <td>{m.lines.length}件</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatYen(m.subtotal)}</td>
                  </tr>
                ))}
                {monthlyFees.length === 0 && (
                  <tr><td colSpan={3} className="empty-row">フィーの計上はありません</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header"><h2>販売した売上</h2></div>
            <table className="table">
              <thead>
                <tr>
                  <th>入金日</th><th>顧客先</th><th>内容</th>
                  <th style={{ textAlign: 'right' }}>金額（入金）</th><th>種別</th>
                </tr>
              </thead>
              <tbody>
                {ownSales.map(s => (
                  <tr key={s.id}>
                    <td>{formatDate(s.date)}</td>
                    <td>{s.customerName}</td>
                    <td>{s.productName}</td>
                    <td style={{ textAlign: 'right' }}>{formatYen(s.amount)}</td>
                    <td>
                      {s.isTraining
                        ? <span className="badge badge-success">研修</span>
                        : <span className="badge">対象外</span>}
                    </td>
                  </tr>
                ))}
                {ownSales.length === 0 && (
                  <tr><td colSpan={5} className="empty-row">売上データがありません</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {agency.tier === 'primary' && monthlyFees.some(m => m.lines.some(l => l.type === 'override')) && (
            <p className="text-muted" style={{ fontSize: 13 }}>
              ※「{FEE_TYPE_LABELS.override}」は配下の二次代理店が販売した売上に対する取り分です。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
