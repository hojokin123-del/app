import type { Initiative, MonthlyRecord, SalesRep } from '../types/sales';
import { CURRENT_MONTH, FISCAL_MONTHS, TODAY, addDays } from './calendar';

/** サンプルデータ（初回起動時・「サンプルに戻す」で使用）。日付は今日を基準に生成。 */
export const sampleReps: SalesRep[] = [
  { id: 'r1', name: '伊藤 美咲', team: '営業1課', role: '課長', avatarInitials: '伊美' },
  { id: 'r2', name: '山田 健太', team: '営業1課', role: '主任', avatarInitials: '山健' },
  { id: 'r3', name: '小林 直樹', team: '営業1課', role: '担当', avatarInitials: '小直' },
  { id: 'r4', name: '加藤 由美', team: '営業2課', role: '課長', avatarInitials: '加由' },
  { id: 'r5', name: '吉田 翔', team: '営業2課', role: '担当', avatarInitials: '吉翔' },
  { id: 'r6', name: '渡辺 舞', team: '営業2課', role: '担当', avatarInitials: '渡舞' },
];

// 担当者ごとの生成パラメータ（基準予算・達成傾向・平均単価）
const PROFILE: Record<string, { base: number; skill: number; unit: number }> = {
  r1: { base: 900, skill: 1.06, unit: 120 },
  r2: { base: 700, skill: 1.02, unit: 90 },
  r3: { base: 500, skill: 0.84, unit: 60 },
  r4: { base: 850, skill: 0.97, unit: 110 },
  r5: { base: 550, skill: 1.1, unit: 70 },
  r6: { base: 450, skill: 0.91, unit: 50 },
};

// 月別の季節係数（4月〜3月）
const SEASON = [0.9, 0.95, 1.0, 0.85, 0.9, 1.15, 1.0, 1.0, 1.2, 0.9, 0.95, 1.3];

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildRecords(): MonthlyRecord[] {
  const rand = mulberry32(20261115);
  const records: MonthlyRecord[] = [];
  sampleReps.forEach(rep => {
    const p = PROFILE[rep.id];
    FISCAL_MONTHS.forEach((month, i) => {
      const budget = Math.round((p.base * SEASON[i]) / 10) * 10;
      const full = Math.round(budget * p.skill * (0.85 + rand() * 0.3));
      const dealsTarget = Math.max(1, Math.round(budget / p.unit));
      const target = {
        visits: dealsTarget * 8,
        meetings: dealsTarget * 4,
        proposals: Math.round(dealsTarget * 2.5),
        deals: dealsTarget,
      };
      const isPast = month < CURRENT_MONTH;
      const isCurrent = month === CURRENT_MONTH;
      const ratio = isCurrent ? 0.5 : 1;
      const deals = Math.max(1, Math.round(full / (p.unit * (0.9 + rand() * 0.2))));
      const kpiActual = {
        deals,
        proposals: Math.round(deals * (2.2 + rand() * 0.8)),
        meetings: Math.round(deals * (3.6 + rand() * 1.0)),
        visits: Math.round(deals * (7 + rand() * 2.5)),
      };
      const kpi = Object.fromEntries(
        (Object.keys(target) as (keyof typeof target)[]).map(k => [
          k,
          { target: target[k], actual: isPast || isCurrent ? Math.round(kpiActual[k] * ratio) : null },
        ]),
      ) as MonthlyRecord['kpi'];
      records.push({
        repId: rep.id,
        month,
        budget,
        actual: isPast ? full : isCurrent ? Math.round(full * ratio) : null,
        forecast: isPast ? null : isCurrent ? full : Math.round(budget * p.skill * (0.95 + rand() * 0.1)),
        kpi,
      });
    });
  });
  return records;
}

export const buildSampleRecords = buildRecords;

export const buildSampleInitiatives = (): Initiative[] => [
  {
    id: 'i1', title: '既存顧客への年末アップセル提案', description: '上位30社に上位プランの提案書を送付し、12月中に商談化する',
    ownerId: 'r1', kpi: 'proposals', status: 'in_progress', startDate: addDays(TODAY, -14), dueDate: addDays(TODAY, 35),
    progress: 40, expectedImpact: 600, note: '12社に提案済み',
  },
  {
    id: 'i2', title: '休眠顧客の掘り起こしコール', description: '過去2年取引のない顧客200社へ架電し、訪問アポを獲得する',
    ownerId: 'r3', kpi: 'visits', status: 'in_progress', startDate: addDays(TODAY, -45), dueDate: addDays(TODAY, 15),
    progress: 55, expectedImpact: 250, note: '架電110社・アポ14件',
  },
  {
    id: 'i3', title: '展示会リードのフォロー徹底', description: '10月展示会の名刺交換リード150件を48時間以内に一次フォロー',
    ownerId: 'r5', kpi: 'meetings', status: 'done', startDate: addDays(TODAY, -26), dueDate: addDays(TODAY, -5),
    progress: 100, expectedImpact: 400, note: '商談化22件',
  },
  {
    id: 'i4', title: '提案書テンプレートの刷新', description: '導入事例と費用対効果試算を標準化し、提案作成時間を半減する',
    ownerId: 'r4', kpi: 'proposals', status: 'in_progress', startDate: addDays(TODAY, -61), dueDate: addDays(TODAY, -1),
    progress: 80, expectedImpact: 150, note: '事例ページ作成中',
  },
  {
    id: 'i5', title: 'パートナー経由の共同提案', description: '販売代理店2社と共同キャンペーンを実施し、新規案件を獲得する',
    ownerId: 'r2', kpi: 'deals', status: 'planned', startDate: addDays(TODAY, 16), dueDate: addDays(TODAY, 105),
    progress: 0, expectedImpact: 800, note: '',
  },
  {
    id: 'i6', title: '失注分析と再提案', description: '上期の失注案件40件を分析し、条件見直しで再提案する',
    ownerId: 'r6', kpi: 'deals', status: 'on_hold', startDate: addDays(TODAY, -31), dueDate: addDays(TODAY, 30),
    progress: 20, expectedImpact: 300, note: '価格改定の決定待ち',
  },
  {
    id: 'i7', title: '年度末駆け込み需要の先行営業', description: '3月導入希望の案件を1月までに洗い出し、見積を前倒しする',
    ownerId: 'r4', kpi: 'revenue', status: 'planned', startDate: addDays(TODAY, 51), dueDate: addDays(TODAY, 125),
    progress: 0, expectedImpact: 1200, note: '',
  },
];
