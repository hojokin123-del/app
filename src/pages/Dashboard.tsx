import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_LABELS, CATEGORY_LABELS, PERIOD_LABELS, type EvaluationStatus } from '../types';

const STATUS_ICONS: Record<EvaluationStatus, typeof CheckCircle> = {
  not_started: AlertCircle,
  self_evaluation: Clock,
  manager_evaluation: Clock,
  completed: CheckCircle,
};

const STATUS_COLORS: Record<EvaluationStatus, string> = {
  not_started: '#94a3b8',
  self_evaluation: '#f59e0b',
  manager_evaluation: '#3b82f6',
  completed: '#10b981',
};

export function Dashboard() {
  const { employees, evaluations, criteria, departments } = useApp();

  const currentYear = 2025;
  const currentPeriod = 'H2';

  const currentEvals = evaluations.filter(e => e.year === currentYear && e.period === currentPeriod);

  const stats = useMemo(() => {
    const statusCount = { not_started: 0, self_evaluation: 0, manager_evaluation: 0, completed: 0 };
    currentEvals.forEach(e => { statusCount[e.status]++; });
    return statusCount;
  }, [currentEvals]);

  const completedEvals = evaluations.filter(e => e.status === 'completed');

  const categoryAverages = useMemo(() => {
    const groups: Record<string, { sum: number; count: number }> = {};
    criteria.forEach(c => { groups[c.category] = { sum: 0, count: 0 }; });

    completedEvals.forEach(ev => {
      ev.items.forEach(item => {
        const c = criteria.find(cr => cr.id === item.criteriaId);
        if (c && item.managerRating) {
          groups[c.category].sum += (6 - item.managerRating); // invert so 5=best
          groups[c.category].count++;
        }
      });
    });

    return Object.entries(groups).map(([cat, { sum, count }]) => ({
      category: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS],
      value: count > 0 ? parseFloat((sum / count).toFixed(1)) : 0,
      fullMark: 5,
    }));
  }, [completedEvals, criteria]);

  const deptStats = useMemo(() => {
    return departments.map(dept => {
      const deptEmps = employees.filter(e => e.departmentId === dept.id);
      const deptEvals = currentEvals.filter(e => deptEmps.some(emp => emp.id === e.employeeId));
      const completed = deptEvals.filter(e => e.status === 'completed').length;
      return { name: dept.name.replace('部', ''), total: deptEmps.length, completed, progress: deptEmps.length > 0 ? Math.round((completed / deptEmps.length) * 100) : 0 };
    }).filter(d => d.total > 0);
  }, [departments, employees, currentEvals]);

  const recentEvals = [...evaluations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <h1>ダッシュボード</h1>
        <div className="period-badge">{currentYear}年度 {PERIOD_LABELS[currentPeriod as 'H1' | 'H2']}</div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff' }}>
            <Users size={24} color="#3b82f6" />
          </div>
          <div className="stat-body">
            <div className="stat-value">{employees.length}</div>
            <div className="stat-label">従業員数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4' }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">評価完了</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb' }}>
            <Clock size={24} color="#f59e0b" />
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.self_evaluation + stats.manager_evaluation}</div>
            <div className="stat-label">評価進行中</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#faf5ff' }}>
            <TrendingUp size={24} color="#8b5cf6" />
          </div>
          <div className="stat-body">
            <div className="stat-value">
              {employees.length > 0 ? Math.round((stats.completed / employees.length) * 100) : 0}%
            </div>
            <div className="stat-label">完了率</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Radar Chart */}
        <div className="card">
          <div className="card-header">
            <h2>評価カテゴリ別平均（完了済み）</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={categoryAverages}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                <Radar name="平均評価" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Progress */}
        <div className="card">
          <div className="card-header">
            <h2>部署別評価進捗</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="progress" fill="#6366f1" radius={[4, 4, 0, 0]} name="完了率" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Summary */}
        <div className="card">
          <div className="card-header">
            <h2>評価ステータス</h2>
          </div>
          <div className="status-list">
            {(Object.entries(stats) as [EvaluationStatus, number][]).map(([status, count]) => {
              const Icon = STATUS_ICONS[status];
              return (
                <div key={status} className="status-item">
                  <div className="status-icon-wrap" style={{ color: STATUS_COLORS[status] }}>
                    <Icon size={18} />
                  </div>
                  <div className="status-label">{STATUS_LABELS[status]}</div>
                  <div className="status-count" style={{ color: STATUS_COLORS[status] }}>{count}件</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2>最近の評価活動</h2>
          </div>
          <div className="activity-list">
            {recentEvals.map(ev => {
              const emp = employees.find(e => e.id === ev.employeeId);
              if (!emp) return null;
              const Icon = STATUS_ICONS[ev.status];
              return (
                <Link to={`/evaluations/${ev.id}`} key={ev.id} className="activity-item">
                  <div className="avatar avatar-sm">{emp.avatarInitials}</div>
                  <div className="activity-body">
                    <div className="activity-name">{emp.name}</div>
                    <div className="activity-meta">{ev.year}年度{PERIOD_LABELS[ev.period]}</div>
                  </div>
                  <div className="activity-status" style={{ color: STATUS_COLORS[ev.status] }}>
                    <Icon size={16} />
                    <span>{STATUS_LABELS[ev.status]}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
