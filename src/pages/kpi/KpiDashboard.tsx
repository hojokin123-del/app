import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, Wallet, Target, Settings2, AlertTriangle } from 'lucide-react';
import { useKpi } from '../../context/KpiContext';
import {
  FISCAL_MONTHS,
  achievement,
  computeCashFlow,
  derivedCumulative,
  fmtPct,
  fmtYen,
  metricCumulative,
} from '../../kpi/kpiModel';

export function KpiDashboard() {
  const { data, setDirectionMemo } = useKpi();
  const { actuals, targets } = data;

  const salesCum = metricCumulative(actuals, 'sales');
  const salesAch = achievement(salesCum, targets.sales);
  const opProfitCum = derivedCumulative(actuals, 'opProfit');
  const dealsAch = achievement(metricCumulative(actuals, 'deals'), targets.deals);

  const cash = useMemo(() => computeCashFlow(data.cash, data.openingBalance), [data.cash, data.openingBalance]);
  const endBalance = cash[11].closing;
  const minBalance = Math.min(...cash.map((c) => c.closing));
  const shortfallMonths = cash
    .map((c, i) => ({ i, c }))
    .filter((x) => x.c.closing < 0)
    .map((x) => FISCAL_MONTHS[x.i]);

  const systemsAvg = data.systems.length
    ? data.systems.reduce((s, x) => s + x.progress, 0) / data.systems.length
    : 0;

  // 月次売上（実績）と年間目標の月割ライン
  const monthlyTargetLine = targets.sales ? targets.sales / 12 : 0;
  const salesChart = FISCAL_MONTHS.map((m, i) => ({ month: m, 実績: actuals.sales[i] || 0 }));

  const cashChart = FISCAL_MONTHS.map((m, i) => ({ month: m, 月末残高: cash[i].closing }));

  const achChart = [
    { name: '売上高', value: salesAch },
    { name: '粗利', value: achievement(derivedCumulative(actuals, 'grossProfit'), targets.sales - targets.cogs) },
    { name: '営業利益', value: achievement(opProfitCum, targets.sales - targets.cogs - targets.sga) },
    { name: '成約数', value: dealsAch },
    { name: '新規顧客', value: achievement(metricCumulative(actuals, 'newCustomers'), targets.newCustomers) },
  ].map((r) => ({ name: r.name, value: r.value == null ? 0 : Math.round(r.value * 1000) / 10 }));

  const achColor = (pct: number) => (pct >= 100 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444');

  return (
    <div className="page">
      <div className="page-header">
        <h1>経営ダッシュボード</h1>
        <div className="period-badge">{data.fiscalYear}年度（4月〜翌3月）</div>
      </div>

      {shortfallMonths.length > 0 && (
        <div className="kpi-alert">
          <AlertTriangle size={18} />
          <span>
            資金ショートの恐れ：{shortfallMonths.join('・')} の月末残高がマイナスです。
            <Link to="/cashflow"> 資金繰り表を確認</Link>
          </span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff' }}>
            <Target size={24} color="#3b82f6" />
          </div>
          <div className="stat-body">
            <div className="stat-value">{fmtPct(salesAch)}</div>
            <div className="stat-label">売上 達成率（累計）</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#faf5ff' }}>
            <TrendingUp size={24} color="#8b5cf6" />
          </div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 22 }}>{fmtYen(opProfitCum)}</div>
            <div className="stat-label">営業利益（累計）</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: minBalance < 0 ? '#fef2f2' : '#f0fdf4' }}>
            <Wallet size={24} color={minBalance < 0 ? '#ef4444' : '#10b981'} />
          </div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 22 }}>{fmtYen(endBalance)}</div>
            <div className="stat-label">期末予定 資金残高</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb' }}>
            <Settings2 size={24} color="#f59e0b" />
          </div>
          <div className="stat-body">
            <div className="stat-value">{fmtPct(systemsAvg)}</div>
            <div className="stat-label">仕組化 進捗（平均）</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h2>月次売上（実績）と目標ライン</h2></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 10000)}万`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmtYen(Number(v))} />
                <Bar dataKey="実績" fill="#6366f1" radius={[4, 4, 0, 0]} />
                {monthlyTargetLine > 0 && (
                  <ReferenceLine y={monthlyTargetLine} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '月次目標', fontSize: 10, fill: '#ef4444', position: 'insideTopRight' }} />
                )}
                <Line type="monotone" dataKey="実績" stroke="#4f46e5" dot={false} strokeWidth={0} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>資金残高の推移（月末）</h2></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={cashChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 10000)}万`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmtYen(Number(v))} />
                <ReferenceLine y={0} stroke="#ef4444" />
                <Line type="monotone" dataKey="月末残高" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>主要KPI 達成率（累計）</h2></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={achChart} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit="%" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                <Tooltip formatter={(v) => `${Number(v)}%`} />
                <ReferenceLine x={100} stroke="#94a3b8" strokeDasharray="4 4" />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {achChart.map((e, i) => (
                    <Cell key={i} fill={achColor(e.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>今後の方向性・重点アクション</h2></div>
          <div style={{ padding: 16 }}>
            <textarea
              className="comment-input"
              style={{ minHeight: 200 }}
              value={data.directionMemo}
              onChange={(e) => setDirectionMemo(e.target.value)}
              placeholder="・毎月の重点テーマや打ち手を記入（自動保存されます）"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
