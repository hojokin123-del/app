// KPI経営管理モジュールの型定義

/** 入力系KPI指標のID（実績を直接入力する項目） */
export type MetricId =
  | 'sales' // 売上高
  | 'cogs' // 売上原価
  | 'sga' // 販売管理費
  | 'leads' // 新規リード数
  | 'meetings' // 商談数
  | 'deals' // 成約数
  | 'newCustomers' // 新規顧客数
  | 'churn' // 解約数
  | 'nps'; // 顧客満足度

export type MetricUnit = '円' | '件' | '社' | 'pt';

export interface MetricDef {
  id: MetricId;
  name: string;
  unit: MetricUnit;
  group: '売上・利益' | '活動KPI' | '顧客・継続';
}

/** 派生指標（自動計算：粗利・営業利益・利益率・成約率・客単価） */
export type DerivedId = 'grossProfit' | 'opProfit' | 'opMargin' | 'closeRate' | 'arpu';

/** 年間目標（入力系指標のみ） */
export type KpiTargets = Record<MetricId, number>;
/** 月次実績（4月〜翌3月の12ヶ月分） */
export type KpiActuals = Record<MetricId, number[]>;

/** 日次活動記録の1行 */
export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD
  owner: string;
  activity: string;
  output: string;
  metricLabel: string;
  metricValue: number | null;
  issue: string;
  nextAction: string;
}

/** 週次進捗レビューの1行 */
export interface WeeklyEntry {
  id: string;
  weekStart: string; // YYYY-MM-DD
  theme: string;
  target: number | null;
  actual: number | null;
  wins: string;
  learnings: string;
  improvement: string;
  direction: string;
}

/** 資金繰り表の入力ライン（すべて12ヶ月分の配列） */
export type CashLineId =
  | 'cashSales' // 現金売上
  | 'receivables' // 売掛金回収
  | 'otherIncome' // その他営業収入
  | 'purchases' // 仕入・外注費
  | 'labor' // 人件費
  | 'rent' // 家賃・地代
  | 'otherExpense' // その他経費
  | 'tax' // 税金・社会保険
  | 'loanIn' // 借入金（入金）
  | 'loanRepay' // 借入返済（出金）
  | 'capex'; // 設備投資等（出金）

export type CashLines = Record<CashLineId, number[]>;

export type SystemStatus = '未着手' | '進行中' | '完了' | '保留';

/** 仕組化チェックの1行 */
export interface SystemItem {
  id: string;
  area: string;
  item: string;
  owner: string;
  status: SystemStatus;
  progress: number; // 0..1
  deadline: string; // YYYY-MM-DD
  memo: string;
}

/** モジュール全体の永続化データ */
export interface KpiData {
  fiscalYear: number;
  targets: KpiTargets;
  actuals: KpiActuals;
  daily: DailyEntry[];
  weekly: WeeklyEntry[];
  cash: CashLines;
  openingBalance: number; // 期首（4月月初）資金残高
  systems: SystemItem[];
  directionMemo: string; // 今後の方向性・重点アクション
}
