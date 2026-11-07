import { useMemo, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Wallet, PiggyBank, Percent, RotateCcw } from 'lucide-react';

/** シミュレーション前提条件（金額は円・月額） */
interface SimulationInputs {
  trainingRevenue: number;      // 研修売上
  trainingCostRate: number;     // 研修 経費率（%）
  subsidyRevenue: number;       // 補助金申請代行 売上
  subsidyCostRate: number;      // 補助金申請代行 経費率（%）
  aiVideoRevenue: number;       // AI動画作成 売上
  aiVideoCostRate: number;      // AI動画作成 経費率（%）
  trainingSga: number;          // 販管費（研修）
  subsidySga: number;           // 販管費（補助金業務）
  aiVideoSga: number;           // 販管費（AI動画作成業務）
}

const DEFAULT_INPUTS: SimulationInputs = {
  trainingRevenue: 30_000_000,
  trainingCostRate: 70,
  subsidyRevenue: 3_000_000,
  subsidyCostRate: 0,
  aiVideoRevenue: 0,
  aiVideoCostRate: 0,
  trainingSga: 3_600_000,
  subsidySga: 1_200_000,
  aiVideoSga: 1_200_000,
};

const MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);

interface MonthRow {
  month: string;
  trainingRevenue: number;
  trainingCost: number;
  trainingGross: number;
  subsidyRevenue: number;
  subsidyCost: number;
  subsidyGross: number;
  aiVideoRevenue: number;
  aiVideoCost: number;
  aiVideoGross: number;
  revenue: number;
  cost: number;
  gross: number;
  trainingSga: number;
  subsidySga: number;
  aiVideoSga: number;
  sga: number;
  operatingProfit: number;
  cumulativeProfit: number;
}

type NumericKey = Exclude<keyof MonthRow, 'month'>;

function simulate(inputs: SimulationInputs): MonthRow[] {
  let cumulative = 0;
  return MONTHS.map(month => {
    const trainingCost = Math.round(inputs.trainingRevenue * inputs.trainingCostRate / 100);
    const subsidyCost = Math.round(inputs.subsidyRevenue * inputs.subsidyCostRate / 100);
    const aiVideoCost = Math.round(inputs.aiVideoRevenue * inputs.aiVideoCostRate / 100);
    const trainingGross = inputs.trainingRevenue - trainingCost;
    const subsidyGross = inputs.subsidyRevenue - subsidyCost;
    const aiVideoGross = inputs.aiVideoRevenue - aiVideoCost;
    const revenue = inputs.trainingRevenue + inputs.subsidyRevenue + inputs.aiVideoRevenue;
    const cost = trainingCost + subsidyCost + aiVideoCost;
    const gross = revenue - cost;
    const sga = inputs.trainingSga + inputs.subsidySga + inputs.aiVideoSga;
    const operatingProfit = gross - sga;
    cumulative += operatingProfit;
    return {
      month,
      trainingRevenue: inputs.trainingRevenue, trainingCost, trainingGross,
      subsidyRevenue: inputs.subsidyRevenue, subsidyCost, subsidyGross,
      aiVideoRevenue: inputs.aiVideoRevenue, aiVideoCost, aiVideoGross,
      revenue, cost, gross,
      trainingSga: inputs.trainingSga, subsidySga: inputs.subsidySga, aiVideoSga: inputs.aiVideoSga,
      sga, operatingProfit, cumulativeProfit: cumulative,
    };
  });
}

const yen = (v: number) => v.toLocaleString('ja-JP');
const man = (v: number) => `${(v / 10_000).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
const pct = (num: number, den: number) => (den === 0 ? '-' : `${((num / den) * 100).toFixed(1)}%`);

interface RowDef { key: NumericKey; label: string; level: 'section' | 'item' | 'total' | 'profit' }

const ROWS: RowDef[] = [
  { key: 'trainingRevenue', label: '研修 売上', level: 'item' },
  { key: 'subsidyRevenue', label: '補助金申請代行 売上', level: 'item' },
  { key: 'aiVideoRevenue', label: 'AI動画作成 売上', level: 'item' },
  { key: 'revenue', label: '売上高 合計', level: 'total' },
  { key: 'trainingCost', label: '研修 経費（原価）', level: 'item' },
  { key: 'subsidyCost', label: '補助金申請代行 経費', level: 'item' },
  { key: 'aiVideoCost', label: 'AI動画作成 経費', level: 'item' },
  { key: 'cost', label: '売上原価 合計', level: 'total' },
  { key: 'trainingGross', label: '研修 粗利', level: 'item' },
  { key: 'subsidyGross', label: '補助金申請代行 粗利', level: 'item' },
  { key: 'aiVideoGross', label: 'AI動画作成 粗利', level: 'item' },
  { key: 'gross', label: '売上総利益（粗利）', level: 'total' },
  { key: 'trainingSga', label: '販管費（研修）', level: 'item' },
  { key: 'subsidySga', label: '販管費（補助金業務）', level: 'item' },
  { key: 'aiVideoSga', label: '販管費（AI動画作成業務）', level: 'item' },
  { key: 'sga', label: '販売管理費 合計', level: 'total' },
  { key: 'operatingProfit', label: '営業利益', level: 'profit' },
  { key: 'cumulativeProfit', label: '営業利益 累計', level: 'item' },
];

const FIELDS: { key: keyof SimulationInputs; label: string; unit: '円' | '%'; group: string }[] = [
  { key: 'trainingRevenue', label: '研修 売上（月）', unit: '円', group: '売上・経費' },
  { key: 'trainingCostRate', label: '研修 経費率', unit: '%', group: '売上・経費' },
  { key: 'subsidyRevenue', label: '補助金申請代行 売上（月）', unit: '円', group: '売上・経費' },
  { key: 'subsidyCostRate', label: '補助金申請代行 経費率', unit: '%', group: '売上・経費' },
  { key: 'aiVideoRevenue', label: 'AI動画作成 売上（月）', unit: '円', group: '売上・経費' },
  { key: 'aiVideoCostRate', label: 'AI動画作成 経費率', unit: '%', group: '売上・経費' },
  { key: 'trainingSga', label: '販管費（研修）', unit: '円', group: '販売管理費（人件費等・月）' },
  { key: 'subsidySga', label: '販管費（補助金業務）', unit: '円', group: '販売管理費（人件費等・月）' },
  { key: 'aiVideoSga', label: '販管費（AI動画作成業務）', unit: '円', group: '販売管理費（人件費等・月）' },
];

export function SalesSimulation() {
  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_INPUTS);
  const rows = useMemo(() => simulate(inputs), [inputs]);

  const annual = useMemo(() => {
    const sum = {} as Record<NumericKey, number>;
    ROWS.forEach(({ key }) => {
      sum[key] = key === 'cumulativeProfit'
        ? rows[rows.length - 1].cumulativeProfit
        : rows.reduce((s, r) => s + r[key], 0);
    });
    return sum;
  }, [rows]);

  const chartData = rows.map(r => ({
    month: r.month,
    売上高: r.revenue / 10_000,
    粗利: r.gross / 10_000,
    販管費: r.sga / 10_000,
    営業利益累計: r.cumulativeProfit / 10_000,
  }));

  const update = (key: keyof SimulationInputs, raw: string) => {
    const v = Number(raw.replace(/,/g, ''));
    setInputs(prev => ({ ...prev, [key]: Number.isFinite(v) ? v : 0 }));
  };

  const groups = [...new Set(FIELDS.map(f => f.group))];

  const kpis = [
    { label: '年間売上高', value: man(annual.revenue), icon: TrendingUp, color: '#3b82f6', bg: '#eff6ff' },
    { label: '年間粗利', value: man(annual.gross), icon: Wallet, color: '#10b981', bg: '#f0fdf4' },
    { label: '年間営業利益', value: man(annual.operatingProfit), icon: PiggyBank, color: annual.operatingProfit >= 0 ? '#8b5cf6' : '#ef4444', bg: '#faf5ff' },
    { label: '営業利益率', value: pct(annual.operatingProfit, annual.revenue), icon: Percent, color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>営業販売シミュレーション</h1>
        <div className="header-actions">
          <div className="period-badge">1月〜12月</div>
          <button className="btn btn-secondary btn-sm" onClick={() => setInputs(DEFAULT_INPUTS)}>
            <RotateCcw size={14} /> 初期値に戻す
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: bg }}><Icon size={24} color={color} /></div>
            <div className="stat-body">
              <div className="stat-value sim-stat-value" style={{ color: label === '年間営業利益' ? color : undefined }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h2>前提条件（月額）</h2></div>
        <div className="sim-inputs">
          {groups.map(group => (
            <div key={group} className="sim-input-group">
              <h3>{group}</h3>
              <div className="sim-input-grid">
                {FIELDS.filter(f => f.group === group).map(f => (
                  <label key={f.key} className="form-group sim-field">
                    <span>{f.label}</span>
                    <div className="sim-input-wrap">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={f.unit === '円' ? yen(inputs[f.key]) : String(inputs[f.key])}
                        onChange={e => update(f.key, e.target.value)}
                      />
                      <span className="sim-unit">{f.unit}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>月次推移（万円）</h2></div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${Number(v).toLocaleString('ja-JP')}万円`} />
              <Legend />
              <Bar yAxisId="left" dataKey="売上高" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="粗利" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="販管費" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="営業利益累計" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>月次損益計算書（円）</h2></div>
        <div className="sim-table-wrap">
          <table className="table sim-table">
            <thead>
              <tr>
                <th>科目</th>
                {MONTHS.map(m => <th key={m}>{m}</th>)}
                <th>年間合計</th>
                <th>売上比</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ key, label, level }) => (
                <tr key={key} className={`sim-row-${level}`}>
                  <td>{label}</td>
                  {rows.map(r => (
                    <td key={r.month} className={r[key] < 0 ? 'sim-negative' : undefined}>{yen(r[key])}</td>
                  ))}
                  <td className={annual[key] < 0 ? 'sim-negative' : undefined}>{yen(annual[key])}</td>
                  <td>{key === 'cumulativeProfit' ? '' : pct(annual[key], annual.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
