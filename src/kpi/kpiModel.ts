// KPI経営管理モジュールの定数・計算ロジック（Excelフォーマットの数式に対応）
import type {
  CashLineId,
  CashLines,
  DerivedId,
  KpiActuals,
  KpiData,
  MetricDef,
  MetricId,
} from '../types/kpi';

/** 会計年度は4月開始。表示用の月ラベル（4月〜翌3月） */
export const FISCAL_MONTHS = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'] as const;

export const zeros12 = (): number[] => Array<number>(12).fill(0);

export const METRIC_DEFS: MetricDef[] = [
  { id: 'sales', name: '売上高', unit: '円', group: '売上・利益' },
  { id: 'cogs', name: '売上原価', unit: '円', group: '売上・利益' },
  { id: 'sga', name: '販売管理費', unit: '円', group: '売上・利益' },
  { id: 'leads', name: '新規リード数', unit: '件', group: '活動KPI' },
  { id: 'meetings', name: '商談数', unit: '件', group: '活動KPI' },
  { id: 'deals', name: '成約数', unit: '件', group: '活動KPI' },
  { id: 'newCustomers', name: '新規顧客数', unit: '社', group: '顧客・継続' },
  { id: 'churn', name: '解約数', unit: '社', group: '顧客・継続' },
  { id: 'nps', name: '顧客満足度(NPS等)', unit: 'pt', group: '顧客・継続' },
];

export const DERIVED_DEFS: { id: DerivedId; name: string; unit: '円' | '%'; group: MetricDef['group'] }[] = [
  { id: 'grossProfit', name: '売上総利益', unit: '円', group: '売上・利益' },
  { id: 'opProfit', name: '営業利益', unit: '円', group: '売上・利益' },
  { id: 'opMargin', name: '営業利益率', unit: '%', group: '売上・利益' },
  { id: 'closeRate', name: '成約率', unit: '%', group: '活動KPI' },
  { id: 'arpu', name: '客単価', unit: '円', group: '活動KPI' },
];

export const CASH_INCOME_LINES: { id: CashLineId; name: string }[] = [
  { id: 'cashSales', name: '現金売上' },
  { id: 'receivables', name: '売掛金回収' },
  { id: 'otherIncome', name: 'その他営業収入' },
];

export const CASH_EXPENSE_LINES: { id: CashLineId; name: string }[] = [
  { id: 'purchases', name: '仕入・外注費' },
  { id: 'labor', name: '人件費' },
  { id: 'rent', name: '家賃・地代' },
  { id: 'otherExpense', name: 'その他経費' },
  { id: 'tax', name: '税金・社会保険' },
];

export const CASH_FINANCE_LINES: { id: CashLineId; name: string; sign: 1 | -1 }[] = [
  { id: 'loanIn', name: '借入金（入金）', sign: 1 },
  { id: 'loanRepay', name: '借入返済（出金）', sign: -1 },
  { id: 'capex', name: '設備投資等（出金）', sign: -1 },
];

export const ALL_CASH_LINE_IDS: CashLineId[] = [
  ...CASH_INCOME_LINES.map((l) => l.id),
  ...CASH_EXPENSE_LINES.map((l) => l.id),
  ...CASH_FINANCE_LINES.map((l) => l.id),
];

const sum = (arr: number[]): number => arr.reduce((a, b) => a + (b || 0), 0);
const safeDiv = (a: number, b: number): number | null => (b ? a / b : null);

// ---- KPI 計算 -----------------------------------------------------------

/** ある月の派生指標値 */
export function derivedMonthly(a: KpiActuals, id: DerivedId, m: number): number | null {
  const sales = a.sales[m] || 0;
  const cogs = a.cogs[m] || 0;
  const sga = a.sga[m] || 0;
  const meetings = a.meetings[m] || 0;
  const deals = a.deals[m] || 0;
  switch (id) {
    case 'grossProfit':
      return sales - cogs;
    case 'opProfit':
      return sales - cogs - sga;
    case 'opMargin':
      return safeDiv(sales - cogs - sga, sales);
    case 'closeRate':
      return safeDiv(deals, meetings);
    case 'arpu':
      return safeDiv(sales, deals);
  }
}

/** 派生指標の累計（率・客単価は累計ベースで再計算） */
export function derivedCumulative(a: KpiActuals, id: DerivedId): number | null {
  const sales = sum(a.sales);
  const cogs = sum(a.cogs);
  const sga = sum(a.sga);
  const meetings = sum(a.meetings);
  const deals = sum(a.deals);
  switch (id) {
    case 'grossProfit':
      return sales - cogs;
    case 'opProfit':
      return sales - cogs - sga;
    case 'opMargin':
      return safeDiv(sales - cogs - sga, sales);
    case 'closeRate':
      return safeDiv(deals, meetings);
    case 'arpu':
      return safeDiv(sales, deals);
  }
}

/** 入力系指標の累計実績（NPS等のスコアは合計ではなく直近月の値を採用） */
export const metricCumulative = (a: KpiActuals, id: MetricId): number => {
  if (id === 'nps') {
    const lastNonZero = [...a[id]].reverse().find((v) => v);
    return lastNonZero ?? 0;
  }
  return sum(a[id]);
};

/** 達成率（累計 / 年間目標）。目標が0または未設定ならnull */
export function achievement(cumulative: number | null, target: number | null): number | null {
  if (cumulative == null || !target) return null;
  return cumulative / target;
}

// ---- 資金繰り 計算 ------------------------------------------------------

export interface CashMonth {
  opening: number;
  income: number;
  expense: number;
  opCF: number;
  finCF: number;
  net: number;
  closing: number;
}

export function computeCashFlow(cash: CashLines, openingBalance: number): CashMonth[] {
  const result: CashMonth[] = [];
  for (let m = 0; m < 12; m++) {
    const income = CASH_INCOME_LINES.reduce((s, l) => s + (cash[l.id][m] || 0), 0);
    const expense = CASH_EXPENSE_LINES.reduce((s, l) => s + (cash[l.id][m] || 0), 0);
    const finCF = CASH_FINANCE_LINES.reduce((s, l) => s + l.sign * (cash[l.id][m] || 0), 0);
    const opCF = income - expense;
    const net = opCF + finCF;
    const opening = m === 0 ? openingBalance : result[m - 1].closing;
    result.push({ opening, income, expense, opCF, finCF, net, closing: opening + net });
  }
  return result;
}

// ---- フォーマット -------------------------------------------------------

export const fmtYen = (v: number | null | undefined): string =>
  v == null ? '—' : `¥${Math.round(v).toLocaleString('ja-JP')}`;

export const fmtNum = (v: number | null | undefined): string =>
  v == null ? '—' : Math.round(v).toLocaleString('ja-JP');

export const fmtPct = (v: number | null | undefined): string =>
  v == null ? '—' : `${(v * 100).toFixed(1)}%`;

export const fmtUnit = (v: number | null | undefined, unit: string): string => {
  if (v == null) return '—';
  if (unit === '円') return fmtYen(v);
  if (unit === '%') return fmtPct(v);
  return `${fmtNum(v)} ${unit}`;
};

// ---- 空データ生成 -------------------------------------------------------

export function emptyKpiData(fiscalYear: number): KpiData {
  const targets = METRIC_DEFS.reduce((acc, d) => ({ ...acc, [d.id]: 0 }), {} as KpiData['targets']);
  const actuals = METRIC_DEFS.reduce((acc, d) => ({ ...acc, [d.id]: zeros12() }), {} as KpiActuals);
  const cash = ALL_CASH_LINE_IDS.reduce((acc, id) => ({ ...acc, [id]: zeros12() }), {} as CashLines);
  return {
    fiscalYear,
    targets,
    actuals,
    daily: [],
    weekly: [],
    cash,
    openingBalance: 0,
    systems: [],
    directionMemo: '',
  };
}
