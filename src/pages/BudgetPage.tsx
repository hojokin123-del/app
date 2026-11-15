import { useMemo } from 'react';
import { Info } from 'lucide-react';
import { useSales } from '../store/salesStore';
import { FISCAL_MONTHS } from '../data/calendar';
import { PageHeader } from './sales/PageHeader';
import { RateBadge } from './sales/RateBadge';
import { ALL, aggregateByMonth, filterByRep, monthLabel, monthState, rateLevel, summarize, withCumulative, yen, rateOf } from './sales/salesUtils';

function NumCell({ value, onChange, disabled }: { value: number | null; onChange: (v: number | null) => void; disabled?: boolean }) {
  if (disabled) return <span>{value == null ? '—' : value.toLocaleString()}</span>;
  return (
    <input
      className="sales-num-input"
      type="number"
      min={0}
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? null : Math.max(0, Number(e.target.value)))}
    />
  );
}

export function BudgetPage() {
  const { reps, records, updateRecord, selectedRepId: repId } = useSales();
  const editable = repId !== ALL;
  const months = useMemo(() => withCumulative(aggregateByMonth(filterByRep(records, repId))), [records, repId]);
  const s = summarize(months);

  const matrix = useMemo(() => reps.map(rep => ({
    rep,
    months: aggregateByMonth(filterByRep(records, rep.id)),
  })), [reps, records]);

  return (
    <div className="page">
      <PageHeader title="予実管理" />
      <div className="card">
        <div className="card-header">
          <h2>月別 予実表（単位：万円）</h2>
          <div className="sales-hint">
            <Info size={14} />
            {editable ? '数値を直接編集できます（実績＝確定月・当月、見込み＝当月以降）' : '担当者を選ぶと予算・実績・見込みを編集できます'}
          </div>
        </div>
        <div className="table-scroll">
          <table className="table sales-table">
            <thead>
              <tr>
                <th>月</th><th>状態</th><th className="num">予算</th><th className="num">実績</th><th className="num">見込み</th>
                <th className="num">差異（着地−予算）</th><th className="num">達成率</th><th className="num">累計予算</th><th className="num">累計実績・見込み</th><th className="num">累計達成率</th>
              </tr>
            </thead>
            <tbody>
              {months.map(m => {
                const diff = m.landing - m.budget;
                return (
                  <tr key={m.month} className={m.state === 'current' ? 'sales-current-row' : ''}>
                    <td>{m.label}</td>
                    <td><span className={`sales-state sales-state-${m.state}`}>{{ closed: '確定', current: '当月', future: '見込み' }[m.state]}</span></td>
                    <td className="num">
                      <NumCell value={m.budget} disabled={!editable} onChange={v => updateRecord(repId, m.month, 'budget', v ?? 0)} />
                    </td>
                    <td className="num">
                      <NumCell value={m.actual} disabled={!editable || m.state === 'future'} onChange={v => updateRecord(repId, m.month, 'actual', v)} />
                    </td>
                    <td className="num">
                      <NumCell value={m.forecast} disabled={!editable || m.state === 'closed'} onChange={v => updateRecord(repId, m.month, 'forecast', v)} />
                    </td>
                    <td className={`num ${diff < 0 ? 'text-critical' : 'text-good'}`}>{diff >= 0 ? '+' : ''}{diff.toLocaleString()}</td>
                    <td className="num"><RateBadge rate={rateOf(m.landing, m.budget)} /></td>
                    <td className="num">{m.cumBudget.toLocaleString()}</td>
                    <td className="num">{m.cumLanding.toLocaleString()}</td>
                    <td className="num"><RateBadge rate={rateOf(m.cumLanding, m.cumBudget)} /></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>年間合計</td>
                <td className="num">{s.annualBudget.toLocaleString()}</td>
                <td className="num">{months.reduce((a, m) => a + (m.actual ?? 0), 0).toLocaleString()}</td>
                <td className="num">—</td>
                <td className={`num ${s.gap < 0 ? 'text-critical' : 'text-good'}`}>{s.gap >= 0 ? '+' : ''}{s.gap.toLocaleString()}</td>
                <td className="num"><RateBadge rate={s.landingRate} /></td>
                <td className="num">{s.annualBudget.toLocaleString()}</td>
                <td className="num">{s.landing.toLocaleString()}</td>
                <td className="num"><RateBadge rate={s.landingRate} /></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <h2>担当者×月 達成率</h2>
          <div className="sales-legend">
            <span><i className="heat heat-good" />100%以上</span>
            <span><i className="heat heat-warning" />85〜99%</span>
            <span><i className="heat heat-critical" />85%未満</span>
            <span><i className="heat heat-forecast" />見込みベース</span>
          </div>
        </div>
        <div className="table-scroll">
          <table className="table sales-table sales-heat">
            <thead>
              <tr>
                <th>担当者</th>
                {FISCAL_MONTHS.map(m => <th key={m} className="num">{monthLabel(m)}</th>)}
                <th className="num">着地見込み</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map(({ rep, months: ms }) => {
                const sm = summarize(ms);
                return (
                  <tr key={rep.id} className={repId === rep.id ? 'sales-current-row' : ''}>
                    <td className="nowrap">{rep.name}</td>
                    {ms.map(m => {
                      const rate = rateOf(m.landing, m.budget);
                      return (
                        <td
                          key={m.month}
                          className={`num heat-cell heat-${rate == null ? 'unset' : rateLevel(rate)} ${monthState(m.month) !== 'closed' ? 'is-forecast' : ''}`}
                          title={`${rep.name} ${m.label}: ${yen(m.landing)} / 予算 ${yen(m.budget)}`}
                        >
                          {rate == null ? '—' : `${rate}%`}
                        </td>
                      );
                    })}
                    <td className="num"><RateBadge rate={sm.landingRate} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
