import { useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Wallet, Gauge, Users, ListChecks } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { FISCAL_YEAR, TODAY } from '../data/salesMockData';
import { ALL } from './sales/salesUtils';
import { SummaryTab } from './sales/SummaryTab';
import { BudgetTab } from './sales/BudgetTab';
import { KpiTab } from './sales/KpiTab';
import { RepsTab } from './sales/RepsTab';
import { InitiativesTab } from './sales/InitiativesTab';

const TABS = [
  { id: 'summary', label: 'サマリー', icon: LayoutDashboard },
  { id: 'budget', label: '予実管理', icon: Wallet },
  { id: 'kpi', label: 'KPI管理', icon: Gauge },
  { id: 'reps', label: '担当者', icon: Users },
  { id: 'initiatives', label: '施策', icon: ListChecks },
] as const;

export function SalesDashboard() {
  const { reps } = useSales();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'summary';
  const repId = params.get('rep') ?? ALL;

  const update = (key: 'tab' | 'rep', value: string) => {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      if ((key === 'rep' && value === ALL) || (key === 'tab' && value === 'summary')) next.delete(key);
      else next.set(key, value);
      return next;
    });
  };
  const selectRep = (id: string) => update('rep', id);
  const openTab = (id: string) => update('tab', id);

  const teams = [...new Set(reps.map(r => r.team))];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>営業ダッシュボード</h1>
          <div className="activity-meta">{FISCAL_YEAR}年度（{FISCAL_YEAR}年4月〜{FISCAL_YEAR + 1}年3月） ・ 基準日 {TODAY} ・ 金額単位：万円</div>
        </div>
        <div className="sales-rep-filter">
          <label htmlFor="rep-filter">担当者</label>
          <select id="rep-filter" className="filter-select" value={repId} onChange={e => selectRep(e.target.value)}>
            <option value={ALL}>全員</option>
            {teams.map(team => (
              <optgroup key={team} label={team}>
                {reps.filter(r => r.team === team).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="sales-tabs" role="tablist">
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`sales-tab ${tab === t.id ? 'active' : ''}`} onClick={() => openTab(t.id)}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && <SummaryTab repId={repId} onSelectRep={selectRep} onOpenTab={openTab} />}
      {tab === 'budget' && <BudgetTab repId={repId} />}
      {tab === 'kpi' && <KpiTab repId={repId} />}
      {tab === 'reps' && <RepsTab repId={repId} onSelectRep={selectRep} onOpenTab={openTab} />}
      {tab === 'initiatives' && <InitiativesTab repId={repId} />}
    </div>
  );
}
