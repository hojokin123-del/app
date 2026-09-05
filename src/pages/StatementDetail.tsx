import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FEE_TYPE_LABELS } from '../types';
import { formatYen, formatPercent, formatMonth, formatDate } from '../lib/format';

export function StatementDetail() {
  const { id } = useParams();
  const { statements, agencies, settings, confirmStatement } = useApp();
  const statement = statements.find(st => st.id === id);
  const agency = agencies.find(a => a.id === statement?.agencyId);

  if (!statement || !agency) {
    return (
      <div className="page">
        <p>支払明細書が見つかりません。</p>
        <Link to="/statements" className="back-link"><ArrowLeft size={16} /> 一覧へ戻る</Link>
      </div>
    );
  }

  const issueDate = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Link to="/statements" className="back-link"><ArrowLeft size={16} /> 支払明細書一覧</Link>
        <div className="header-actions">
          {statement.status !== 'confirmed' && (
            <button className="btn btn-secondary" onClick={() => confirmStatement(statement.id)}>
              <CheckCircle size={16} /> 確定する
            </button>
          )}
          <button className="btn btn-primary" onClick={() => window.print()}><Printer size={16} /> 印刷 / PDF</button>
        </div>
      </div>

      <div className="statement-sheet card">
        <div className="statement-head">
          <h1 className="statement-title">支 払 明 細 書</h1>
          <div className="statement-meta">
            <div>発行日：{issueDate}</div>
            <div>対象月：{formatMonth(statement.month)}</div>
            <div>明細番号：{statement.id.toUpperCase()}</div>
          </div>
        </div>

        <div className="statement-parties">
          <div className="statement-to">
            <div className="statement-to-name">{agency.name} 御中</div>
            {agency.contactPerson && <div className="text-muted">ご担当：{agency.contactPerson} 様</div>}
            <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
              代理店コード：{agency.code || '-'} ／ {agency.tier === 'primary' ? '一次代理店' : '二次代理店'}
            </div>
          </div>
          <div className="statement-from">
            <div style={{ fontWeight: 700 }}>{settings.companyName}</div>
            <div className="text-muted" style={{ fontSize: 13 }}>下記のとおりお支払い申し上げます。</div>
          </div>
        </div>

        <div className="statement-total-box">
          <span>今回お支払金額（税込・振込手数料差引後）</span>
          <span className="statement-total-amount">{formatYen(statement.total)}</span>
        </div>

        <table className="table statement-table">
          <thead>
            <tr>
              <th>種別</th><th>入金日</th><th>顧客先</th><th>内容</th>
              <th style={{ textAlign: 'right' }}>金額（入金）</th>
              <th style={{ textAlign: 'right' }}>率</th>
              <th style={{ textAlign: 'right' }}>フィー額</th>
            </tr>
          </thead>
          <tbody>
            {statement.lines.map((l, i) => {
              const seller = agencies.find(a => a.id === l.sellerAgencyId);
              return (
                <tr key={i}>
                  <td>
                    {FEE_TYPE_LABELS[l.type]}
                    {l.type === 'override' && seller && (
                      <span className="text-muted" style={{ fontSize: 11 }}>（{seller.name}）</span>
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

        <div className="statement-summary">
          <div className="statement-summary-row">
            <span>手数料小計</span><span>{formatYen(statement.subtotal)}</span>
          </div>
          <div className="statement-summary-row">
            <span>消費税（{formatPercent(statement.taxRate * 100)}）</span><span>{formatYen(statement.taxAmount)}</span>
          </div>
          <div className="statement-summary-row">
            <span>小計（税込）</span><span>{formatYen(statement.subtotal + statement.taxAmount)}</span>
          </div>
          <div className="statement-summary-row">
            <span>振込手数料</span><span>-{formatYen(statement.transferFee)}</span>
          </div>
          <div className="statement-summary-row statement-summary-total">
            <span>差引支払額</span><span>{formatYen(statement.total)}</span>
          </div>
        </div>

        <div className="statement-bank">
          <div style={{ fontWeight: 600, marginBottom: 6 }}>お振込先</div>
          <div className="text-muted" style={{ fontSize: 13 }}>
            {agency.bankName} {agency.bankBranch} ／ {agency.accountType} {agency.accountNumber}<br />
            口座名義：{agency.accountHolder || '-'}
          </div>
        </div>

        {statement.status === 'confirmed' && (
          <div className="statement-confirmed no-print">確定済み</div>
        )}
      </div>
    </div>
  );
}
