import { CURRENT_MONTH, FISCAL_MONTHS, TODAY } from '../../data/calendar';
import { ALL } from '../../store/salesStore';
export { ALL };
import { KPI_KEYS, type KpiKey, type MonthlyRecord } from '../../types/sales';


export const COLORS = {
  budget: '#94a3b8',
  actual: '#6366f1',
  forecast: '#a5b4fc',
  good: '#059669',
  warning: '#d97706',
  critical: '#dc2626',
};

export const monthLabel = (m: string) => `${Number(m.slice(5))}月`;
export const yen = (v: number | null | undefined) => (v == null ? '—' : `${Math.round(v).toLocaleString()}万円`);
export const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);
/** 達成率。目標・予算が0（未設定）の場合は null */
export const rateOf = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : null);

export type MonthAgg = {
  month: string;
  label: string;
  budget: number;
  actual: number | null;
  forecast: number | null;
  /** 確定月は実績、当月・将来月は見込み */
  landing: number;
  state: 'closed' | 'current' | 'future';
};

export function monthState(month: string): MonthAgg['state'] {
  if (month < CURRENT_MONTH) return 'closed';
  return month === CURRENT_MONTH ? 'current' : 'future';
}

export function filterByRep(records: MonthlyRecord[], repId: string) {
  return repId === ALL ? records : records.filter(r => r.repId === repId);
}

export function aggregateByMonth(records: MonthlyRecord[]): MonthAgg[] {
  return FISCAL_MONTHS.map(month => {
    const rs = records.filter(r => r.month === month);
    const state = monthState(month);
    const sumOrNull = (vals: (number | null)[]) =>
      vals.every(v => v == null) ? null : vals.reduce<number>((s, v) => s + (v ?? 0), 0);
    const actual = sumOrNull(rs.map(r => r.actual));
    const forecast = sumOrNull(rs.map(r => r.forecast));
    const budget = rs.reduce((s, r) => s + r.budget, 0);
    const landing = state === 'closed' ? actual ?? 0 : Math.max(forecast ?? 0, actual ?? 0);
    return { month, label: monthLabel(month), budget, actual, forecast, landing, state };
  });
}

export function summarize(months: MonthAgg[]) {
  const closed = months.filter(m => m.state === 'closed');
  const current = months.find(m => m.state === 'current');
  const annualBudget = months.reduce((s, m) => s + m.budget, 0);
  const ytdBudget = closed.reduce((s, m) => s + m.budget, 0);
  const ytdActual = closed.reduce((s, m) => s + (m.actual ?? 0), 0);
  const landing = months.reduce((s, m) => s + m.landing, 0);
  return {
    annualBudget,
    ytdBudget,
    ytdActual,
    ytdRate: rateOf(ytdActual, ytdBudget),
    landing,
    landingRate: rateOf(landing, annualBudget),
    gap: landing - annualBudget,
    current,
  };
}

/** 期間（月 or 'ytd' = 確定月の累計）のKPI合計 */
export function sumKpi(records: MonthlyRecord[], period: string) {
  const rs = period === 'ytd' ? records.filter(r => r.month < CURRENT_MONTH) : records.filter(r => r.month === period);
  return Object.fromEntries(
    KPI_KEYS.map(k => [
      k,
      {
        target: rs.reduce((s, r) => s + r.kpi[k].target, 0),
        actual: rs.reduce((s, r) => s + (r.kpi[k].actual ?? 0), 0),
      },
    ]),
  ) as Record<KpiKey, { target: number; actual: number }>;
}

export type RateLevel = 'good' | 'warning' | 'critical';
export function rateLevel(rate: number): RateLevel {
  if (rate >= 100) return 'good';
  if (rate >= 85) return 'warning';
  return 'critical';
}
export const RATE_LEVEL_LABELS: Record<RateLevel, string> = { good: '達成', warning: '注意', critical: '未達' };

/** 月次集計に累計（予算・実績＋見込み）を付与 */
export function withCumulative(months: MonthAgg[]) {
  return months.reduce<(MonthAgg & { cumBudget: number; cumLanding: number })[]>((acc, m) => {
    const prev = acc.at(-1);
    acc.push({ ...m, cumBudget: (prev?.cumBudget ?? 0) + m.budget, cumLanding: (prev?.cumLanding ?? 0) + m.landing });
    return acc;
  }, []);
}

/** 当月の経過率（基準日ベース、%） */
export function monthElapsedRate() {
  const [y, m, d] = TODAY.split('-').map(Number);
  const days = new Date(y, m, 0).getDate();
  return Math.round((d / days) * 100);
}
