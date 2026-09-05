import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart, Line, Cell,
} from 'recharts';
import { Building2, Receipt, Calculator, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeMonthlyFees } from '../lib/feeCalc';
import { TIER_LABELS } from '../types';
import { formatYen, formatMonth, formatDate, listMonths } from '../lib/format';

const YEN_M = (v: number) => `${Math.round(v / 10000).toLocaleString('ja-JP')}万`;

export function Dashboard() {
  const { agencies, sales } = useApp();
  const months = useMemo(() => listMonths(sales), [sales]);
  const currentMonth = months[0] ?? '';

  const primaryCount = agencies.filter(a => a.tier === 'primary').length;
  const secondaryCount = agencies.filter(a => a.tier === 'secondary').length;

  // 当月
  const currentFees = useMemo(
    () => (currentMonth ? computeMonthlyFees(agencies, sales, currentMonth) : []),
    [agencies, sales, currentMonth],
  );
  const currentBase = sales.filter(s => s.month === currentMonth).reduce((s, x) => s + x.amount, 0);
  const currentFeeTotal = currentFees.reduce((s, f) => s + f.subtotal, 0);

  // 月別推移（古い順）
  const trend = useMemo(() => {
    return [...months].reverse().map(m => {
      const base = sales.filter(s => s.month === m).reduce((s, x) => s + x.amount, 0);
      const fee = computeMonthlyFees(agencies, sales, m).reduce((s, f) => s + f.subtotal, 0);
      return { month: formatMonth(m), 売上: base, フィー: fee };
    });
  }, [months, sales, agencies]);

  // 当月 代理店別フィー
  const byAgency = useMemo(
    () => currentFees.map(f => ({
      name: agencies.find(a => a.id === f.agencyId)?.name ?? '',
      fee: f.subtotal,
      tier: agencies.find(a => a.id === f.agencyId)?.tier ?? 'secondary',
    })),
    [currentFees, agencies],
  );

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6),
    [sales],
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>ダッシュボード</h1>
        {currentMonth && <div className="period-badge">{formatMonth(currentMonth)}</div>}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff' }}><Building2 size={24} color="#6366f1" /></div>
          <div className="stat-body">
            <div className="stat-value">{agencies.length}</div>
            <div className="stat-label">代理店数（一次{primaryCount}／二次{secondaryCount}）</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff' }}><Receipt size={24} color="#3b82f6" /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 24 }}>{formatYen(currentBase)}</div>
            <div className="stat-label">当月 売上</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4' }}><Calculator size={24} color="#10b981" /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 24 }}>{formatYen(currentFeeTotal)}</div>
            <div className="stat-label">当月 フィー総額</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#faf5ff' }}><TrendingUp size={24} color="#8b5cf6" /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: 24 }}>{currentFees.length}社</div>
            <div className="stat-label">当月 支払対象</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h2>売上・フィー 月別推移</h2></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={YEN_M} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatYen(Number(v))} />
                <Legend />
                <Bar dataKey="売上" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
                <Line dataKey="フィー" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>当月 代理店別フィー</h2></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byAgency} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={YEN_M} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatYen(Number(v))} />
                <Bar dataKey="fee" name="フィー" radius={[0, 4, 4, 0]}>
                  {byAgency.map((d, i) => (
                    <Cell key={i} fill={d.tier === 'primary' ? '#6366f1' : '#a5b4fc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>最近の売上</h2>
            <Link to="/sales" className="btn btn-secondary btn-sm">すべて見る</Link>
          </div>
          <div className="activity-list">
            {recentSales.map(s => {
              const agency = agencies.find(a => a.id === s.agencyId);
              return (
                <div key={s.id} className="activity-item">
                  <div className="avatar avatar-sm">{agency?.name.slice(0, 2) ?? '--'}</div>
                  <div className="activity-body">
                    <div className="activity-name">{s.customerName}｜{s.productName}</div>
                    <div className="activity-meta">{agency?.name}・{formatDate(s.date)}</div>
                  </div>
                  <div className="activity-status">{formatYen(s.amount)}</div>
                </div>
              );
            })}
            {recentSales.length === 0 && <div className="empty-state">売上がありません</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>代理店一覧</h2></div>
          <div className="activity-list">
            {agencies.map(a => {
              const parent = agencies.find(p => p.id === a.parentId);
              return (
                <Link key={a.id} to={`/agencies/${a.id}`} className="activity-item">
                  <div className="activity-body">
                    <div className="activity-name">{a.name}</div>
                    <div className="activity-meta">
                      {TIER_LABELS[a.tier]}{parent ? `・所属：${parent.name}` : ''}
                    </div>
                  </div>
                  <div className="activity-status" style={{ color: 'var(--primary)' }}>{a.feeRate}%</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
