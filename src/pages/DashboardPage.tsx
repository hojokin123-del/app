import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Wallet, TrendingUp, Flag, CalendarDays, Handshake, Percent } from 'lucide-react';
import { useSales } from '../store/salesStore';
import { TODAY } from '../data/calendar';
import { INITIATIVE_STATUS_COLORS, INITIATIVE_STATUS_LABELS, type InitiativeStatus } from '../types/sales';
import { PageHeader } from './sales/PageHeader';
import { RateBadge } from './sales/RateBadge';
import { ALL, COLORS, aggregateByMonth, filterByRep, monthLabel, pct, summarize, sumKpi, withCumulative, yen, rateOf } from './sales/salesUtils';

const TAB_PATHS = { summary: '/', budget: '/budget', reps: '/reps', initiatives: '/initiatives' } as const;

export function DashboardPage() {
  const { reps, records, initiatives, selectedRepId: repId, setSelectedRepId } = useSales();
  const navigate = useNavigate();
  const onOpenTab = (tab: keyof typeof TAB_PATHS) => navigate(TAB_PATHS[tab]);
  const repRecords = useMemo(() => filterByRep(records, repId), [records, repId]);
  const months = useMemo(() => aggregateByMonth(repRecords), [repRecords]);
  const s = summarize(months);
  const kpi = sumKpi(repRecords, 'ytd');
  const closeRate = pct(kpi.deals.actual, kpi.meetings.actual);

  const chartData = months.map(m => ({
    label: m.label,
    予算: m.budget,
    実績: m.actual ?? 0,
    見込み: m.state === 'closed' ? 0 : Math.max(0, (m.forecast ?? 0) - (m.actual ?? 0)),
  }));

  const cumulative = withCumulative(months).map(m => ({ label: m.label, 累計予算: m.cumBudget, '累計実績・見込み': m.cumLanding }));

  const ranking = useMemo(() => reps.map(rep => {
    const sm = summarize(aggregateByMonth(filterByRep(records, rep.id)));
    return { rep, ...sm };
  }).sort((a, b) => (b.ytdRate ?? -1) - (a.ytdRate ?? -1)), [reps, records]);

  const myInitiatives = repId === ALL ? initiatives : initiatives.filter(i => i.ownerId === repId);
  const statusCount = (Object.keys(INITIATIVE_STATUS_LABELS) as InitiativeStatus[]).map(st => ({
    status: st, count: myInitiatives.filter(i => i.status === st).length,
  }));
  const upcoming = myInitiatives
    .filter(i => i.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const tiles = [
    { icon: Wallet, bg: '#eef2ff', color: '#6366f1', label: '年間予算', value: yen(s.annualBudget), sub: null },
    { icon: TrendingUp, bg: '#f0fdf4', color: '#059669', label: `累計実績（〜${monthLabel(months.filter(m => m.state === 'closed').at(-1)?.month ?? '')}）`, value: yen(s.ytdActual), sub: <>予算 {yen(s.ytdBudget)} ・ <RateBadge rate={s.ytdRate} /></> },
    { icon: Flag, bg: '#faf5ff', color: '#8b5cf6', label: '年間着地見込み', value: yen(s.landing), sub: <>予算差 {s.gap >= 0 ? '+' : ''}{yen(s.gap)} ・ <RateBadge rate={s.landingRate} /></> },
    { icon: CalendarDays, bg: '#fffbeb', color: '#d97706', label: `今月（${s.current?.label}）進捗`, value: yen(s.current?.actual), sub: <>予算 {yen(s.current?.budget)} ・ 進捗 {pct(s.current?.actual ?? 0, s.current?.budget ?? 0)}%</> },
    { icon: Handshake, bg: '#f0f9ff', color: '#0284c7', label: '受注件数（確定月累計）', value: `${kpi.deals.actual}件`, sub: <>目標 {kpi.deals.target}件 ・ <RateBadge rate={rateOf(kpi.deals.actual, kpi.deals.target)} /></> },
    { icon: Percent, bg: '#fdf2f8', color: '#db2777', label: '成約率（受注÷商談）', value: `${closeRate}%`, sub: <>商談 {kpi.meetings.actual}件 → 受注 {kpi.deals.actual}件</> },
  ];

  return (
    <div className="page">
      <PageHeader title="ダッシュボード" />
      {reps.length === 0 && (
        <div className="card onboarding">
          <strong>まだ担当者が登録されていません</strong>
          <span>①「担当者」で営業担当を追加 → ②「予実管理」で月別予算を入力 → ③「KPI管理」でKPI目標を入力、の順に設定してください。</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/reps')}>担当者を追加する</button>
        </div>
      )}
      <div className="sales-tiles">
        {tiles.map(t => (
          <div className="stat-card" key={t.label}>
            <div className="stat-icon" style={{ background: t.bg }}><t.icon size={22} color={t.color} /></div>
            <div className="stat-body">
              <div className="stat-label" style={{ marginTop: 0, marginBottom: 4 }}>{t.label}</div>
              <div className="stat-value sales-stat-value">{t.value}</div>
              {t.sub && <div className="stat-sub">{t.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>月別 予実</h2>
            <button className="btn btn-secondary btn-xs" onClick={() => onOpenTab('budget')}>詳細</button>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => v.toLocaleString()} width={56} />
                <Tooltip formatter={(v) => yen(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="予算" fill={COLORS.budget} radius={[4, 4, 0, 0]} />
                <Bar dataKey="実績" stackId="a" fill={COLORS.actual} />
                <Bar dataKey="見込み" stackId="a" fill={COLORS.forecast} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>累計 予実（年度）</h2></div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={cumulative} margin={{ top: 20, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => v.toLocaleString()} width={64} />
                <Tooltip formatter={(v) => yen(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine x={s.current?.label} stroke="#cbd5e1" strokeDasharray="4 4" label={{ value: '今月', fontSize: 11, fill: '#64748b', position: 'top' }} />
                <Line type="monotone" dataKey="累計予算" stroke={COLORS.budget} strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="累計実績・見込み" stroke={COLORS.actual} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>担当者別 達成率（年度累計）</h2>
            <button className="btn btn-secondary btn-xs" onClick={() => onOpenTab('reps')}>担当者一覧</button>
          </div>
          <div className="activity-list">
            {ranking.map((r, i) => (
              <button
                key={r.rep.id}
                className={`activity-item sales-rank-row ${repId === r.rep.id ? 'selected' : ''}`}
                onClick={() => setSelectedRepId(repId === r.rep.id ? ALL : r.rep.id)}
              >
                <span className="sales-rank-no">{i + 1}</span>
                <div className="avatar avatar-sm">{r.rep.avatarInitials}</div>
                <div className="activity-body">
                  <div className="activity-name">{r.rep.name}</div>
                  <div className="activity-meta">{r.rep.team} ・ 実績 {yen(r.ytdActual)} / 予算 {yen(r.ytdBudget)}</div>
                </div>
                <div className="sales-rank-bar">
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(r.ytdRate ?? 0, 100)}%`, background: COLORS.actual }} /></div>
                </div>
                <RateBadge rate={r.ytdRate} />
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>施策の状況</h2>
            <button className="btn btn-secondary btn-xs" onClick={() => onOpenTab('initiatives')}>施策一覧</button>
          </div>
          <div className="sales-status-row">
            {statusCount.map(({ status, count }) => (
              <div key={status} className="sales-status-cell">
                <span className="ops-dot" style={{ background: INITIATIVE_STATUS_COLORS[status] }} />
                <span>{INITIATIVE_STATUS_LABELS[status]}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
          <div className="activity-list">
            {upcoming.length === 0 && <div className="empty-row">進行中の施策はありません</div>}
            {upcoming.map(i => {
              const owner = reps.find(r => r.id === i.ownerId);
              const overdue = i.dueDate < TODAY;
              return (
                <div key={i.id} className="activity-item">
                  <div className="activity-body">
                    <div className="activity-name">{i.title}</div>
                    <div className="activity-meta">{owner?.name} ・ 期限 {i.dueDate}{overdue && <span className="due-label overdue" style={{ marginLeft: 6 }}>期限超過</span>}</div>
                  </div>
                  <div className="sales-mini-progress">
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${i.progress}%`, background: INITIATIVE_STATUS_COLORS[i.status] }} /></div>
                    <span className="progress-label">{i.progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
