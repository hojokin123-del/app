export type Department = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  name: string;
  nameKana: string;
  email: string;
  departmentId: string;
  position: string;
  managerId: string | null;
  joinDate: string;
  avatarInitials: string;
};

export type EvaluationCategory = 'performance' | 'competency' | 'attitude';

export type EvaluationCriteria = {
  id: string;
  category: EvaluationCategory;
  name: string;
  description: string;
  weight: number; // percentage
};

export type RatingScale = 1 | 2 | 3 | 4 | 5;

export type EvaluationItem = {
  criteriaId: string;
  selfRating: RatingScale | null;
  managerRating: RatingScale | null;
  selfComment: string;
  managerComment: string;
};

export type EvaluationStatus = 'not_started' | 'self_evaluation' | 'manager_evaluation' | 'completed';

export type EvaluationPeriod = 'H1' | 'H2'; // 上期・下期

export type Evaluation = {
  id: string;
  employeeId: string;
  year: number;
  period: EvaluationPeriod;
  status: EvaluationStatus;
  items: EvaluationItem[];
  goals: Goal[];
  overallSelfComment: string;
  overallManagerComment: string;
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number; // 0-100
  achieved: boolean;
};

export const CATEGORY_LABELS: Record<EvaluationCategory, string> = {
  performance: '業績評価',
  competency: '能力評価',
  attitude: '態度評価',
};

export const RATING_LABELS: Record<RatingScale, string> = {
  1: 'S - 期待を大きく超えている',
  2: 'A - 期待を超えている',
  3: 'B - 期待通り',
  4: 'C - 期待をやや下回っている',
  5: 'D - 期待を大きく下回っている',
};

export const RATING_COLORS: Record<RatingScale, string> = {
  1: '#059669',
  2: '#0284c7',
  3: '#6366f1',
  4: '#f59e0b',
  5: '#ef4444',
};

export const STATUS_LABELS: Record<EvaluationStatus, string> = {
  not_started: '未開始',
  self_evaluation: '自己評価中',
  manager_evaluation: '上司評価中',
  completed: '完了',
};

export const PERIOD_LABELS: Record<EvaluationPeriod, string> = {
  H1: '上期',
  H2: '下期',
};
