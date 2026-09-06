import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { useKpi } from '../../context/KpiContext';
import {
  CASH_EXPENSE_LINES,
  CASH_FINANCE_LINES,
  CASH_INCOME_LINES,
  FISCAL_MONTHS,
  computeCashFlow,
  fmtYen,
} from '../../kpi/kpiModel';
import { downloadCsv } from '../../kpi/exportCsv';
import type { CashLineId } from '../../types/kpi';

export function CashFlow() {
  const { data, setCash, setOpeningBalance } = useKpi();
  const cf = useMemo(() => computeCashFlow(data.cash, data.openingBalance), [data.cash, data.openingBalance]);

  const total = (id: CashLineId) => data.cash[id].reduce((a, b) => a + (b || 0), 0);
  const sumRow = (nums: number[]) => nums.reduce((a, b) => a + b, 0);

  const inputRow = (id: CashLineId, name: string) => (
    <tr key={id}>
      <td className="sticky-col row-name indent">{name}</td>
      {data.cash[id].map((v, m) => (
        <td key={m}>
          <input type="number" className="cell-input" value={v || ''} onChange={(e) => setCash(id, m, Number(e.target.value) || 0)} />
        </td>
      ))}
      <td className="calc-cell">{fmtYen(total(id))}</td>
    </tr>
  );

  const calcRow = (label: string, values: number[], annual: number, cls = '') => (
    <tr className={`calc-row ${cls}`}>
      <td className="sticky-col row-name strong">{label}</td>
      {values.map((v, m) => (
        <td key={m} className={`calc-cell ${v < 0 ? 'neg' : ''}`}>{fmtYen(v)}</td>
      ))}
      <td className="calc-cell strong">{fmtYen(annual)}</td>
    </tr>
  );

  const handleExport = () => {
    const header = ['項目', ...FISCAL_MONTHS, '年間合計'];
    const rows: (string | number)[][] = [header];
    rows.push(['前月繰越', ...cf.map((c) => c.opening), cf[0].opening]);
    [...CASH_INCOME_LINES, ...CASH_EXPENSE_LINES].forEach((l) => rows.push([l.name, ...data.cash[l.id], total(l.id)]));
    CASH_FINANCE_LINES.forEach((l) => rows.push([l.name, ...data.cash[l.id], total(l.id)]));
    rows.push(['営業収支', ...cf.map((c) => c.opCF), sumRow(cf.map((c) => c.opCF))]);
    rows.push(['当月収支合計', ...cf.map((c) => c.net), sumRow(cf.map((c) => c.net))]);
    rows.push(['翌月繰越（月末残高）', ...cf.map((c) => c.closing), cf[11].closing]);
    downloadCsv(`資金繰り表_${data.fiscalYear}年度.csv`, rows);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>資金繰り表</h1>
        <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={15} /> CSV</button>
      </div>
      <p className="text-muted" style={{ marginBottom: 12, fontSize: 13 }}>
        月初残高・入出金を入力すると、営業収支・翌月繰越・月末残高が自動計算されます。前月の月末残高は翌月へ自動で引き継がれます。
      </p>

      <div className="card">
        <div className="kpi-table-wrap">
          <table className="table kpi-grid cash-grid">
            <thead>
              <tr>
                <th className="sticky-col">項目</th>
                {FISCAL_MONTHS.map((m) => (<th key={m} style={{ textAlign: 'right' }}>{m}</th>))}
                <th style={{ textAlign: 'right' }}>年間合計</th>
              </tr>
            </thead>
            <tbody>
              {/* 前月繰越（4月のみ入力、以降は自動） */}
              <tr>
                <td className="sticky-col row-name strong">前月繰越（月初資金）</td>
                {cf.map((c, m) => (
                  <td key={m}>
                    {m === 0 ? (
                      <input type="number" className="cell-input target" value={data.openingBalance || ''} onChange={(e) => setOpeningBalance(Number(e.target.value) || 0)} />
                    ) : (
                      <span className="calc-cell inline">{fmtYen(c.opening)}</span>
                    )}
                  </td>
                ))}
                <td className="calc-cell">{fmtYen(cf[0].opening)}</td>
              </tr>

              <tr className="group-row"><td className="sticky-col" colSpan={14}>営業収入</td></tr>
              {CASH_INCOME_LINES.map((l) => inputRow(l.id, l.name))}
              {calcRow('営業収入 合計', cf.map((c) => c.income), sumRow(cf.map((c) => c.income)))}

              <tr className="group-row"><td className="sticky-col" colSpan={14}>営業支出</td></tr>
              {CASH_EXPENSE_LINES.map((l) => inputRow(l.id, l.name))}
              {calcRow('営業支出 合計', cf.map((c) => c.expense), sumRow(cf.map((c) => c.expense)))}
              {calcRow('営業収支（収入−支出）', cf.map((c) => c.opCF), sumRow(cf.map((c) => c.opCF)))}

              <tr className="group-row"><td className="sticky-col" colSpan={14}>財務・投資</td></tr>
              {CASH_FINANCE_LINES.map((l) => inputRow(l.id, l.name))}
              {calcRow('財務・投資 収支', cf.map((c) => c.finCF), sumRow(cf.map((c) => c.finCF)))}

              {calcRow('当月収支合計', cf.map((c) => c.net), sumRow(cf.map((c) => c.net)))}
              {calcRow('翌月繰越（月末資金）', cf.map((c) => c.closing), cf[11].closing, 'closing-row')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
