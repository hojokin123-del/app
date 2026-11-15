import { useMemo } from 'react';
import { ListChecks } from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import { KPI_KEYS, KPI_LABELS } from '../../types/sales';
import { RateBadge } from './RateBadge';
import { COLORS, aggregateByMonth, filterByRep, pct, summarize, sumKpi, yen } from './salesUtils';

type Props = { repId: string; onSelectRep: (id: string) => void; onOpenTab: (tab: string) => void };

export function RepsTab({ repId, onSelectRep, onOpenTab }: Props) {
  const { reps, records, initiatives } = useSales();

  const cards = useMemo(() => reps.map(rep => {
    const rs = filterByRep(records, rep.id);
    const months = aggregateByMonth(rs);
    return {
      rep,
      sum: summarize(months),
      months,
      kpi: sumKpi(rs, 'ytd'),
      openInitiatives: initiatives.filter(i => i.ownerId === rep.id && i.status !== 'done').length,
    };
  }), [reps, records, initiatives]);

  const teams = [...new Set(reps.map(r => r.team))];

  return (
    <>
      <div className="card">
        <div className="card-header"><h2>チーム別サマリー</h2></div>
        <table className="table sales-table">
          <thead>
            <tr><th>チーム</th><th className="num">人数</th><th className="num">年間予算</th><th className="num">累計実績</th><th className="num">累計達成率</th><th className="num">着地見込み</th><th className="num">着地達成率</th></tr>
          </thead>
          <tbody>
            {teams.map(team => {
              const members = cards.filter(c => c.rep.team === team);
              const sumOf = (f: (c: typeof members[number]) => number) => members.reduce((s, c) => s + f(c), 0);
              const budget = sumOf(c => c.sum.annualBudget);
              const ytdB = sumOf(c => c.sum.ytdBudget);
              const ytdA = sumOf(c => c.sum.ytdActual);
              const landing = sumOf(c => c.sum.landing);
              return (
                <tr key={team}>
                  <td>{team}</td>
                  <td className="num">{members.length}名</td>
                  <td className="num">{yen(budget)}</td>
                  <td className="num">{yen(ytdA)}</td>
                  <td className="num"><RateBadge rate={pct(ytdA, ytdB)} /></td>
                  <td className="num">{yen(landing)}</td>
                  <td className="num"><RateBadge rate={pct(landing, budget)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rep-grid">
        {cards.map(({ rep, sum, months, kpi, openInitiatives }) => {
          const maxV = Math.max(...months.map(m => Math.max(m.budget, m.landing)));
          return (
            <div key={rep.id} className={`card rep-card ${repId === rep.id ? 'selected' : ''}`}>
              <div className="rep-card-head">
                <div className="avatar">{rep.avatarInitials}</div>
                <div style={{ flex: 1 }}>
                  <div className="rep-name">{rep.name}</div>
                  <div className="activity-meta">{rep.team} ・ {rep.role}</div>
                </div>
                <RateBadge rate={sum.landingRate} showLabel />
              </div>

              <div className="rep-metrics">
                <div><span>累計実績</span><strong>{yen(sum.ytdActual)}</strong><RateBadge rate={sum.ytdRate} /></div>
                <div><span>着地見込み</span><strong>{yen(sum.landing)}</strong><small>年間予算 {yen(sum.annualBudget)}</small></div>
              </div>

              <div className="rep-spark" aria-label="月別 予算（灰）と実績・見込み（紫）">
                {months.map(m => (
                  <div key={m.month} className="rep-spark-col" title={`${m.label}: ${yen(m.landing)} / 予算 ${yen(m.budget)}`}>
                    <div className="rep-spark-budget" style={{ height: `${(m.budget / maxV) * 100}%` }} />
                    <div className="rep-spark-actual" style={{ height: `${(m.landing / maxV) * 100}%`, background: m.state === 'closed' ? COLORS.actual : COLORS.forecast }} />
                  </div>
                ))}
              </div>

              <div className="rep-kpis">
                {KPI_KEYS.map(k => (
                  <div key={k}>
                    <span>{KPI_LABELS[k]}</span>
                    <strong>{kpi[k].actual}<small>/{kpi[k].target}</small></strong>
                    <RateBadge rate={pct(kpi[k].actual, kpi[k].target)} />
                  </div>
                ))}
              </div>

              <div className="rep-card-foot">
                <button className="btn btn-secondary btn-xs" onClick={() => { onSelectRep(rep.id); onOpenTab('initiatives'); }}>
                  <ListChecks size={12} /> 進行中の施策 {openInitiatives}件
                </button>
                <button className="btn btn-primary btn-xs" onClick={() => { onSelectRep(rep.id); onOpenTab('summary'); }}>
                  この担当者で表示
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
