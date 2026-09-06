// KPI経営管理モジュールの初期サンプルデータ（Excelフォーマットの記入例に対応）
import type { KpiData } from '../types/kpi';
import { emptyKpiData } from './kpiModel';

export function seedKpiData(fiscalYear: number): KpiData {
  const base = emptyKpiData(fiscalYear);
  // 年間目標（例：売上1.2億円 など）
  base.targets = {
    sales: 120_000_000,
    cogs: 48_000_000,
    sga: 54_000_000,
    leads: 1200,
    meetings: 360,
    deals: 120,
    newCustomers: 100,
    churn: 10,
    nps: 40,
  };
  // 4〜6月に実績が入っている想定の例
  base.actuals.sales = [8_500_000, 9_200_000, 10_100_000, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.actuals.cogs = [3_400_000, 3_700_000, 4_000_000, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.actuals.sga = [4_400_000, 4_500_000, 4_600_000, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.actuals.leads = [95, 110, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.actuals.meetings = [28, 31, 34, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.actuals.deals = [9, 11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.actuals.newCustomers = [8, 10, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.actuals.churn = [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.actuals.nps = [38, 41, 43, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  base.openingBalance = 5_000_000;
  base.cash.cashSales = [3_000_000, 3_200_000, 3_500_000, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.cash.receivables = [5_500_000, 5_800_000, 6_000_000, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.cash.purchases = [2_500_000, 2_700_000, 2_900_000, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.cash.labor = [3_500_000, 3_500_000, 3_500_000, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.cash.rent = [600_000, 600_000, 600_000, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  base.cash.otherExpense = [800_000, 850_000, 900_000, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  base.daily = [
    {
      id: 'd1',
      date: `${fiscalYear}-04-01`,
      owner: '山田',
      activity: '新規リード20件へアプローチ／既存A社と面談',
      output: 'A社が次回デモ確約・見込み80万円',
      metricLabel: '架電件数',
      metricValue: 15,
      issue: 'B社からの返信が遅い',
      nextAction: 'B社へ再連絡・提案書を修正',
    },
  ];

  base.weekly = [
    {
      id: 'w1',
      weekStart: `${fiscalYear}-04-06`,
      theme: '新規開拓の強化',
      target: 50,
      actual: 42,
      wins: '面談数が過去最高',
      learnings: '提案の質にばらつきがある',
      improvement: 'トークスクリプトを整備',
      direction: '開拓チームへの権限委譲を検討',
    },
  ];

  base.systems = [
    { id: 's1', area: '営業', item: '営業トークスクリプト・提案書テンプレの標準化', owner: '山田', status: '進行中', progress: 0.4, deadline: `${fiscalYear}-06-30`, memo: '属人化の解消。まず売上上位者の型を言語化' },
    { id: 's2', area: '営業', item: '顧客管理・商談パイプラインの見える化', owner: '', status: '未着手', progress: 0, deadline: `${fiscalYear}-07-31`, memo: '' },
    { id: 's3', area: 'マーケ', item: 'リード獲得〜育成の仕組み化', owner: '', status: '未着手', progress: 0, deadline: `${fiscalYear}-09-30`, memo: '' },
    { id: 's4', area: '業務', item: '定型業務のマニュアル化・チェックリスト', owner: '佐藤', status: '進行中', progress: 0.3, deadline: `${fiscalYear}-08-31`, memo: '入社1週間で回せる状態が目標' },
    { id: 's5', area: '業務', item: '日次・週次の報告フォーマット統一', owner: '佐藤', status: '完了', progress: 1, deadline: `${fiscalYear}-04-30`, memo: '本ツールで運用開始' },
    { id: 's6', area: '組織', item: '役割分担・権限委譲ルールの明文化', owner: '', status: '未着手', progress: 0, deadline: `${fiscalYear}-10-31`, memo: '自走化の要。決裁範囲を定義' },
    { id: 's7', area: '組織', item: 'KPI連動の評価・振り返りの仕組み', owner: '', status: '進行中', progress: 0.2, deadline: `${fiscalYear}-09-30`, memo: '' },
    { id: 's8', area: '数値', item: '月次でKPI・資金繰りをレビューする会議体', owner: '経営', status: '進行中', progress: 0.5, deadline: `${fiscalYear}-05-31`, memo: '本ツールを用いた月次会議を定例化' },
  ];

  base.directionMemo = '・4〜6月は新規開拓を最優先（面談数を月35件へ）\n・仕組化を進め、下期に権限委譲を開始\n・資金は月末残高の下限を意識し、投資判断を行う';

  return base;
}
