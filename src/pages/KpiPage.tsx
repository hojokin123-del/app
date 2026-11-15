import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChevronRight, Info } from 'lucide-react';
import { useSales } from '../store/salesStore';
import { CURRENT_MONTH, FISCAL_MONTHS } from '../data/calendar';
import { KPI_KEYS, KPI_LABELS, type KpiKey } from '../types/sales';
import { PageHeader } from './sales/PageHeader';
import { RateBadge } from './sales/RateBadge';
import { ALL, filterByRep, monthElapsedRate, monthLabel, pct, sumKpi, rateOf } from './sales/salesUtils';

const KPI_COLORS: Record<KpiKey, string> = {
  visits: '#2a78d6',
  meetings: '#eb6834',
  proposals: '#1baf7a',
  deals: '#eda100',
};

export function KpiPage() {
  const { reps, records, updateKpi, selectedRepId: repId } = useSales();
  const [period, setPeriod] = useState<string>('ytd');
  const editable = period !== 'ytd';
  const elapsed = monthElapsedRate();

  const repRecords = useMemo(() => filterByRep(records, repId), [records, repId]);
  const total = sumKpi(repRecords, period);

  const visibleReps = repId === ALL ? reps : reps.filter(r => r.id === repId);
  const perRep = useMemo(() => visibleReps.map(rep => ({
    rep,
    kpi: sumKpi(filterByRep(records, rep.id), period),
  })), [visibleReps, records, period]);

  const chartData = perRep.map(({ rep, kpi }) => ({
    name: rep.name,
    ...Object.fromEntries(KPI_KEYS.map(k => [KPI_LABELS[k], pct(kpi[k].actual, kpi[k].target)])),
  }));

  const periodLabel = period === 'ytd' ? '年度累計（確定月）' : `${monthLabel(period)}${period === CURRENT_MONTH ? '（進行中）' : ''}`;

  return (
    <div className="page">
      <PageHeader title="KPI管理" />
      <div className="sales-subbar">
        <label className="sales-subbar-label">集計期間</label>
        <select className="filter-select" value={period} onChange={e => setPeriod(e.target.value)} aria-label="集計期間">
          <option value="ytd">年度累計（確定月）</option>
          {FISCAL_MONTHS.filter(m => m <= CURRENT_MONTH).map(m => (
            <option key={m} value={m}>{monthLabel(m)}{m === CURRENT_MONTH ? '（当月）' : ''}</option>
          ))}
        </select>
      </div>

      {/* Funnel */}
      <div className="card">
        <div className="card-header">
          <h2>営業プロセスKPI ・ {periodLabel}</h2>
          {period === CURRENT_MONTH && <div className="sales-hint"><Info size={14} />月の経過率 {elapsed}%（達成率がこれを上回れば順調ペース）</div>}
        </div>
        <div className="kpi-funnel">
          {KPI_KEYS.map((k, i) => {
            const v = total[k];
            const rate = pct(v.actual, v.target);
            const next = KPI_KEYS[i + 1];
            return (
              <div key={k} className="kpi-funnel-step-wrap">
                <div className="kpi-funnel-step">
                  <div className="kpi-funnel-head">
                    <span className="ops-dot" style={{ background: KPI_COLORS[k] }} />
                    <span>{KPI_LABELS[k]}</span>
                  </div>
                  <div className="kpi-funnel-value">{v.actual.toLocaleString()}<small> / {v.target.toLocaleString()}件</small></div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(rate, 100)}%`, background: KPI_COLORS[k] }} /></div>
                    <RateBadge rate={rate} />
                  </div>
                </div>
                {next && (
                  <div className="kpi-funnel-conv" title={`${KPI_LABELS[k]}→${KPI_LABELS[next]}の転換率`}>
                    <ChevronRight size={16} />
                    <span>{pct(total[next].actual, v.actual)}%</span>
                    <small>目標 {pct(total[next].target, v.target)}%</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h2>担当者別 KPI達成率</h2></div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={Math.max(220, perRep.length * 56 + 60)}>
            <BarChart data={chartData} layout="vertical" barGap={2} margin={{ top: 16, left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" unit="%" tick={{ fontSize: 12 }} domain={[0, (max: number) => Math.max(120, Math.ceil(max / 20) * 20)]} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine x={100} stroke="#475569" strokeDasharray="4 4" label={{ value: '目標', fontSize: 11, fill: '#475569', position: 'top' }} />
              {KPI_KEYS.map(k => (
                <Bar key={k} dataKey={KPI_LABELS[k]} fill={KPI_COLORS[k]} radius={[0, 4, 4, 0]} barSize={8} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <h2>KPI 実績 / 目標</h2>
          <div className="sales-hint">
            <Info size={14} />
            {editable ? '月を選択中：実績・目標を直接編集できます' : '月を選ぶと実績・目標を編集できます'}
          </div>
        </div>
        <div className="table-scroll">
          <table className="table sales-table">
            <thead>
              <tr>
                <th>担当者</th>
                {KPI_KEYS.map(k => <th key={k} className="num">{KPI_LABELS[k]}</th>)}
                <th className="num">成約率</th>
              </tr>
            </thead>
            <tbody>
              {perRep.map(({ rep, kpi }) => (
                <tr key={rep.id}>
                  <td className="nowrap">{rep.name}<div className="activity-meta">{rep.team}</div></td>
                  {KPI_KEYS.map(k => (
                    <td key={k} className="num">
                      {editable ? (
                        <div className="kpi-edit">
                          <input
                            className="sales-num-input sm" type="number" min={0} aria-label={`${rep.name} ${KPI_LABELS[k]} 実績`}
                            value={kpi[k].actual}
                            onChange={e => updateKpi(rep.id, period, k, 'actual', e.target.value === '' ? null : Math.max(0, Number(e.target.value)))}
                          />
                          <span>/</span>
                          <input
                            className="sales-num-input sm muted" type="number" min={0} aria-label={`${rep.name} ${KPI_LABELS[k]} 目標`}
                            value={kpi[k].target}
                            onChange={e => updateKpi(rep.id, period, k, 'target', Math.max(0, Number(e.target.value)))}
                          />
                        </div>
                      ) : (
                        <span>{kpi[k].actual} / {kpi[k].target}</span>
                      )}
                      <div><RateBadge rate={rateOf(kpi[k].actual, kpi[k].target)} /></div>
                    </td>
                  ))}
                  <td className="num">{pct(kpi.deals.actual, kpi.meetings.actual)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="sales-footnote">※ 年度累計は実績確定月（基準月の前月まで）の合計です。当月は月途中の実績です。</p>
    </div>
  );
}
