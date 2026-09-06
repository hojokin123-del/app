import { Fragment } from 'react';
import { Download, RotateCcw, Eraser } from 'lucide-react';
import { useKpi } from '../../context/KpiContext';
import {
  DERIVED_DEFS,
  FISCAL_MONTHS,
  METRIC_DEFS,
  achievement,
  derivedCumulative,
  derivedMonthly,
  fmtPct,
  fmtUnit,
  metricCumulative,
} from '../../kpi/kpiModel';
import { downloadCsv } from '../../kpi/exportCsv';
import type { DerivedId, MetricId } from '../../types/kpi';

type Group = '売上・利益' | '活動KPI' | '顧客・継続';

// 表示順（入力指標と派生指標を混在させ、Excelフォーマットに合わせる）
const ROW_LAYOUT: { group: Group; rows: ({ kind: 'input'; id: MetricId } | { kind: 'derived'; id: DerivedId })[] }[] = [
  {
    group: '売上・利益',
    rows: [
      { kind: 'input', id: 'sales' },
      { kind: 'input', id: 'cogs' },
      { kind: 'derived', id: 'grossProfit' },
      { kind: 'input', id: 'sga' },
      { kind: 'derived', id: 'opProfit' },
      { kind: 'derived', id: 'opMargin' },
    ],
  },
  {
    group: '活動KPI',
    rows: [
      { kind: 'input', id: 'leads' },
      { kind: 'input', id: 'meetings' },
      { kind: 'input', id: 'deals' },
      { kind: 'derived', id: 'closeRate' },
      { kind: 'derived', id: 'arpu' },
    ],
  },
  {
    group: '顧客・継続',
    rows: [
      { kind: 'input', id: 'newCustomers' },
      { kind: 'input', id: 'churn' },
      { kind: 'input', id: 'nps' },
    ],
  },
];

const metricName = (id: MetricId) => METRIC_DEFS.find((m) => m.id === id)!.name;
const metricUnit = (id: MetricId) => METRIC_DEFS.find((m) => m.id === id)!.unit;
const derivedDef = (id: DerivedId) => DERIVED_DEFS.find((d) => d.id === id)!;

function achClass(v: number | null): string {
  if (v == null) return '';
  if (v >= 1) return 'ach-good';
  if (v >= 0.7) return 'ach-mid';
  return 'ach-low';
}

export function KpiTargets() {
  const { data, setTarget, setActual, setFiscalYear, resetToSample, clearAll } = useKpi();
  const { actuals, targets } = data;

  const derivedTarget = (id: DerivedId): number | null => {
    switch (id) {
      case 'grossProfit':
        return targets.sales - targets.cogs;
      case 'opProfit':
        return targets.sales - targets.cogs - targets.sga;
      case 'opMargin':
        return targets.sales ? (targets.sales - targets.cogs - targets.sga) / targets.sales : null;
      case 'closeRate':
        return targets.meetings ? targets.deals / targets.meetings : null;
      case 'arpu':
        return targets.deals ? targets.sales / targets.deals : null;
    }
  };

  const handleExport = () => {
    const header = ['項目', '単位', '年間目標', ...FISCAL_MONTHS, '累計', '達成率'];
    const rows: (string | number)[][] = [header];
    for (const g of ROW_LAYOUT) {
      for (const r of g.rows) {
        if (r.kind === 'input') {
          const unit = metricUnit(r.id);
          const cum = metricCumulative(actuals, r.id);
          rows.push([
            metricName(r.id),
            unit,
            targets[r.id],
            ...actuals[r.id],
            cum,
            fmtPct(achievement(cum, targets[r.id])),
          ]);
        } else {
          const def = derivedDef(r.id);
          const cum = derivedCumulative(actuals, r.id);
          rows.push([
            def.name,
            def.unit,
            derivedTarget(r.id) ?? '',
            ...FISCAL_MONTHS.map((_, m) => derivedMonthly(actuals, r.id, m) ?? ''),
            cum ?? '',
            fmtPct(achievement(cum, derivedTarget(r.id))),
          ]);
        }
      }
    }
    downloadCsv(`KPI目標実績_${data.fiscalYear}年度.csv`, rows);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>KPI目標・実績</h1>
        <div className="header-actions">
          <select
            className="filter-select"
            value={data.fiscalYear}
            onChange={(e) => setFiscalYear(Number(e.target.value))}
          >
            {[data.fiscalYear - 1, data.fiscalYear, data.fiscalYear + 1].map((y) => (
              <option key={y} value={y}>{y}年度</option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={15} /> CSV</button>
        </div>
      </div>

      <p className="text-muted" style={{ marginBottom: 12, fontSize: 13 }}>
        年間目標と各月の実績を入力すると、累計と達成率が自動計算されます。グレー行（粗利・営業利益・利益率・成約率・客単価）は自動計算です。
      </p>

      <div className="card">
        <div className="kpi-table-wrap">
          <table className="table kpi-grid">
            <thead>
              <tr>
                <th className="sticky-col">項目</th>
                <th>年間目標</th>
                {FISCAL_MONTHS.map((m) => (
                  <th key={m} style={{ textAlign: 'right' }}>{m}</th>
                ))}
                <th style={{ textAlign: 'right' }}>累計</th>
                <th style={{ textAlign: 'right' }}>達成率</th>
              </tr>
            </thead>
            <tbody>
              {ROW_LAYOUT.map((g) => (
                <Fragment key={g.group}>
                  <tr className="group-row">
                    <td className="sticky-col" colSpan={16}>{g.group}</td>
                  </tr>
                  {g.rows.map((r) => {
                    if (r.kind === 'input') {
                      const unit = metricUnit(r.id);
                      const cum = metricCumulative(actuals, r.id);
                      const ach = achievement(cum, targets[r.id]);
                      return (
                        <tr key={r.id}>
                          <td className="sticky-col row-name">{metricName(r.id)} <span className="unit">({unit})</span></td>
                          <td>
                            <input
                              type="number"
                              className="cell-input target"
                              value={targets[r.id] || ''}
                              onChange={(e) => setTarget(r.id, Number(e.target.value) || 0)}
                            />
                          </td>
                          {actuals[r.id].map((v, m) => (
                            <td key={m}>
                              <input
                                type="number"
                                className="cell-input"
                                value={v || ''}
                                onChange={(e) => setActual(r.id, m, Number(e.target.value) || 0)}
                              />
                            </td>
                          ))}
                          <td className="calc-cell">{fmtUnit(cum, unit)}</td>
                          <td className={`calc-cell ${achClass(ach)}`}>{fmtPct(ach)}</td>
                        </tr>
                      );
                    }
                    const def = derivedDef(r.id);
                    const cum = derivedCumulative(actuals, r.id);
                    const ach = achievement(cum, derivedTarget(r.id));
                    return (
                      <tr key={r.id} className="derived-row">
                        <td className="sticky-col row-name">{def.name} <span className="unit">({def.unit})</span></td>
                        <td className="calc-cell">{fmtUnit(derivedTarget(r.id), def.unit)}</td>
                        {FISCAL_MONTHS.map((_, m) => (
                          <td key={m} className="calc-cell">{fmtUnit(derivedMonthly(actuals, r.id, m), def.unit)}</td>
                        ))}
                        <td className="calc-cell strong">{fmtUnit(cum, def.unit)}</td>
                        <td className={`calc-cell ${achClass(ach)}`}>{fmtPct(ach)}</td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="action-bar">
        <button className="btn btn-secondary btn-sm" onClick={resetToSample}><RotateCcw size={15} /> サンプルを読込</button>
        <button className="btn btn-secondary btn-sm" onClick={() => { if (confirm('入力データをすべて消去します。よろしいですか？')) clearAll(); }}>
          <Eraser size={15} /> 全データを消去
        </button>
      </div>
    </div>
  );
}
