export type SalesRep = {
  id: string;
  name: string;
  team: string;
  role: string;
  avatarInitials: string;
};

/** 行動KPI（訪問 → 商談 → 提案 → 受注） */
export type KpiKey = 'visits' | 'meetings' | 'proposals' | 'deals';

export type KpiValue = { target: number; actual: number | null };

/** 担当者×月の予実・KPIレコード（金額の単位は万円） */
export type MonthlyRecord = {
  repId: string;
  month: string; // YYYY-MM
  budget: number;
  actual: number | null; // 確定実績（当月は月初からの累計）
  forecast: number | null; // 当月・将来月の着地見込み
  kpi: Record<KpiKey, KpiValue>;
};

export type InitiativeStatus = 'planned' | 'in_progress' | 'done' | 'on_hold';

export type Initiative = {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  kpi: KpiKey | 'revenue';
  status: InitiativeStatus;
  startDate: string;
  dueDate: string;
  progress: number; // 0-100
  expectedImpact: number; // 想定効果（万円）
  note: string;
};

export const KPI_KEYS: KpiKey[] = ['visits', 'meetings', 'proposals', 'deals'];

export const KPI_LABELS: Record<KpiKey | 'revenue', string> = {
  visits: '訪問件数',
  meetings: '商談件数',
  proposals: '提案件数',
  deals: '受注件数',
  revenue: '売上',
};

export const INITIATIVE_STATUS_LABELS: Record<InitiativeStatus, string> = {
  planned: '計画中',
  in_progress: '実行中',
  done: '完了',
  on_hold: '保留',
};

export const INITIATIVE_STATUS_COLORS: Record<InitiativeStatus, string> = {
  planned: '#64748b',
  in_progress: '#3b82f6',
  done: '#059669',
  on_hold: '#d97706',
};
