import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, CalendarClock, ClipboardCheck, ListTodo, Target, UserPlus, PenLine, UserCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PERIOD_LABELS, STATUS_LABELS, type EvaluationPeriod, type EvaluationStatus } from '../types';

type TaskKind = 'create' | 'self' | 'manager' | 'goal';

type Task = {
  id: string;
  kind: TaskKind;
  employeeId: string;
  title: string;
  detail: string;
  assignee: string;
  dueDate: string;
  link: string;
};

const TASK_META: Record<TaskKind, { label: string; color: string; icon: typeof ListTodo }> = {
  create: { label: '評価作成', color: '#64748b', icon: UserPlus },
  self: { label: '自己評価', color: '#f59e0b', icon: PenLine },
  manager: { label: '上司評価', color: '#3b82f6', icon: UserCheck },
  goal: { label: '目標フォロー', color: '#8b5cf6', icon: Target },
};

const STATUS_COLORS: Record<EvaluationStatus, string> = {
  not_started: '#94a3b8',
  self_evaluation: '#f59e0b',
  manager_evaluation: '#3b82f6',
  completed: '#10b981',
};

const DAY_MS = 24 * 60 * 60 * 1000;
const GOAL_ALERT_DAYS = 30;

/** 評価期間ごとの締切（上期: 7月末/8月中旬、下期: 翌1月末/翌2月中旬） */
function getDeadlines(year: number, period: EvaluationPeriod) {
  return period === 'H1'
    ? { self: `${year}-07-31`, manager: `${year}-08-15` }
    : { self: `${year + 1}-01-31`, manager: `${year + 1}-02-15` };
}

function daysUntil(date: string, today: Date) {
  const target = new Date(`${date}T23:59:59`);
  return Math.ceil((target.getTime() - today.getTime()) / DAY_MS);
}

function DueLabel({ days }: { days: number }) {
  if (days < 0) return <span className="due-label overdue">{-days}日超過</span>;
  if (days <= 7) return <span className="due-label soon">あと{days}日</span>;
  return <span className="due-label">あと{days}日</span>;
}

export function Operations() {
  const { employees, evaluations, departments } = useApp();
  const today = useMemo(() => new Date(), []);

  const periodOptions = useMemo(() => {
    const keys = new Set(evaluations.map(e => `${e.year}-${e.period}`));
    return [...keys].sort().reverse();
  }, [evaluations]);

  const [periodKey, setPeriodKey] = useState(periodOptions[0] ?? `${today.getFullYear()}-H1`);
  const [kindFilter, setKindFilter] = useState<TaskKind | 'all'>('all');
  const [year, period] = [Number(periodKey.split('-')[0]), periodKey.split('-')[1] as EvaluationPeriod];
  const deadlines = getDeadlines(year, period);

  const periodEvals = useMemo(
    () => evaluations.filter(e => e.year === year && e.period === period),
    [evaluations, year, period],
  );

  const tasks = useMemo<Task[]>(() => {
    const list: Task[] = [];
    employees.forEach(emp => {
      const ev = periodEvals.find(e => e.employeeId === emp.id);
      if (!ev || ev.status === 'not_started') {
        list.push({
          id: `create-${emp.id}`,
          kind: 'create',
          employeeId: emp.id,
          title: `${emp.name} の評価シート作成`,
          detail: emp.position,
          assignee: '人事担当',
          dueDate: deadlines.self,
          link: ev ? `/evaluations/${ev.id}` : `/evaluations/new?employeeId=${emp.id}`,
        });
      } else if (ev.status === 'self_evaluation') {
        list.push({
          id: `self-${ev.id}`,
          kind: 'self',
          employeeId: emp.id,
          title: `${emp.name} の自己評価`,
          detail: emp.position,
          assignee: emp.name,
          dueDate: deadlines.self,
          link: `/evaluations/${ev.id}`,
        });
      } else if (ev.status === 'manager_evaluation') {
        list.push({
          id: `mgr-${ev.id}`,
          kind: 'manager',
          employeeId: emp.id,
          title: `${emp.name} の上司評価`,
          detail: emp.position,
          assignee: employees.find(e => e.id === emp.managerId)?.name ?? '管理者',
          dueDate: deadlines.manager,
          link: `/evaluations/${ev.id}`,
        });
      }
      ev?.goals.forEach(goal => {
        if (goal.achieved) return;
        if (daysUntil(goal.targetDate, today) > GOAL_ALERT_DAYS) return;
        list.push({
          id: `goal-${goal.id}`,
          kind: 'goal',
          employeeId: emp.id,
          title: `目標「${goal.title}」(進捗${goal.progress}%)`,
          detail: emp.name,
          assignee: emp.name,
          dueDate: goal.targetDate,
          link: `/evaluations/${ev.id}`,
        });
      });
    });
    return list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [employees, periodEvals, deadlines.self, deadlines.manager, today]);

  const filteredTasks = kindFilter === 'all' ? tasks : tasks.filter(t => t.kind === kindFilter);
  const overdueCount = tasks.filter(t => daysUntil(t.dueDate, today) < 0).length;

  const completedCount = periodEvals.filter(e => e.status === 'completed').length;
  const completionRate = employees.length > 0 ? Math.round((completedCount / employees.length) * 100) : 0;

  const goals = periodEvals.flatMap(e => e.goals);
  const goalAvg = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
  const goalAchieved = goals.filter(g => g.achieved).length;

  const statusCounts = useMemo(() => {
    const counts: Record<EvaluationStatus, number> = { not_started: 0, self_evaluation: 0, manager_evaluation: 0, completed: 0 };
    employees.forEach(emp => {
      const ev = periodEvals.find(e => e.employeeId === emp.id);
      counts[ev?.status ?? 'not_started']++;
    });
    return counts;
  }, [employees, periodEvals]);

  const workload = useMemo(() => {
    const map: Record<string, Record<TaskKind, number>> = {};
    tasks.forEach(t => {
      map[t.assignee] ??= { create: 0, self: 0, manager: 0, goal: 0 };
      map[t.assignee][t.kind]++;
    });
    return Object.entries(map)
      .map(([name, c]) => ({ name, ...c, total: c.create + c.self + c.manager + c.goal }))
      .sort((a, b) => b.total - a.total);
  }, [tasks]);

  const deptRows = useMemo(() => departments.map(dept => {
    const deptEmps = employees.filter(e => e.departmentId === dept.id);
    const deptEvals = periodEvals.filter(ev => deptEmps.some(emp => emp.id === ev.employeeId));
    const completed = deptEvals.filter(e => e.status === 'completed').length;
    const pending = tasks.filter(t => t.kind !== 'goal' && deptEmps.some(emp => emp.id === t.employeeId)).length;
    return {
      id: dept.id,
      name: dept.name,
      total: deptEmps.length,
      completed,
      pending,
      progress: deptEmps.length > 0 ? Math.round((completed / deptEmps.length) * 100) : 0,
    };
  }).filter(d => d.total > 0), [departments, employees, periodEvals, tasks]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>業務ダッシュボード</h1>
        <select className="filter-select" value={periodKey} onChange={e => setPeriodKey(e.target.value)} aria-label="評価期間">
          {periodOptions.map(k => {
            const [y, p] = k.split('-');
            return <option key={k} value={k}>{y}年度 {PERIOD_LABELS[p as EvaluationPeriod]}</option>;
          })}
        </select>
      </div>

      {/* KPI */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eef2ff' }}><ListTodo size={24} color="#6366f1" /></div>
          <div className="stat-body">
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">未対応タスク</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2' }}><AlertTriangle size={24} color="#ef4444" /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ color: overdueCount > 0 ? '#ef4444' : undefined }}>{overdueCount}</div>
            <div className="stat-label">期限超過</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4' }}><ClipboardCheck size={24} color="#10b981" /></div>
          <div className="stat-body">
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">評価完了率（{completedCount}/{employees.length}名）</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#faf5ff' }}><Target size={24} color="#8b5cf6" /></div>
          <div className="stat-body">
            <div className="stat-value">{goalAvg}%</div>
            <div className="stat-label">目標平均進捗（達成 {goalAchieved}/{goals.length}件）</div>
          </div>
        </div>
      </div>

      {/* Pipeline + deadlines */}
      <div className="card ops-pipeline-card">
        <div className="card-header">
          <h2>評価プロセスの進行状況</h2>
          <div className="ops-deadlines">
            <span><CalendarClock size={14} /> 自己評価締切 {deadlines.self}（<DueLabel days={daysUntil(deadlines.self, today)} />）</span>
            <span><CalendarClock size={14} /> 上司評価締切 {deadlines.manager}（<DueLabel days={daysUntil(deadlines.manager, today)} />）</span>
          </div>
        </div>
        <div className="ops-pipeline">
          <div className="ops-pipeline-bar">
            {(Object.keys(statusCounts) as EvaluationStatus[]).map(s => statusCounts[s] > 0 && (
              <div
                key={s}
                className="ops-pipeline-seg"
                style={{ flex: statusCounts[s], background: STATUS_COLORS[s] }}
                title={`${STATUS_LABELS[s]}: ${statusCounts[s]}名`}
              />
            ))}
          </div>
          <div className="ops-pipeline-legend">
            {(Object.keys(statusCounts) as EvaluationStatus[]).map((s, i, arr) => (
              <div key={s} className="ops-pipeline-step">
                <span className="ops-dot" style={{ background: STATUS_COLORS[s] }} />
                <span>{STATUS_LABELS[s]}</span>
                <strong>{statusCounts[s]}名</strong>
                {i < arr.length - 1 && <ChevronRight size={14} className="ops-step-arrow" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Task list */}
        <div className="card ops-task-card">
          <div className="card-header">
            <h2>対応が必要なタスク</h2>
            <div className="ops-chips">
              {(['all', 'create', 'self', 'manager', 'goal'] as const).map(k => (
                <button
                  key={k}
                  className={`ops-chip ${kindFilter === k ? 'active' : ''}`}
                  onClick={() => setKindFilter(k)}
                >
                  {k === 'all' ? 'すべて' : TASK_META[k].label}
                  <span className="ops-chip-count">{k === 'all' ? tasks.length : tasks.filter(t => t.kind === k).length}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="activity-list">
            {filteredTasks.length === 0 && <div className="empty-row">対応が必要なタスクはありません 🎉</div>}
            {filteredTasks.map(t => {
              const meta = TASK_META[t.kind];
              const Icon = meta.icon;
              return (
                <Link to={t.link} key={t.id} className="activity-item">
                  <div className="ops-task-icon" style={{ background: `${meta.color}1a`, color: meta.color }}><Icon size={16} /></div>
                  <div className="activity-body">
                    <div className="activity-name">{t.title}</div>
                    <div className="activity-meta">担当: {t.assignee} ・ {t.detail}</div>
                  </div>
                  <div className="ops-task-due">
                    <div className="activity-meta">{t.dueDate}</div>
                    <DueLabel days={daysUntil(t.dueDate, today)} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Workload */}
        <div className="card">
          <div className="card-header"><h2>担当者別の未対応タスク</h2></div>
          <div className="chart-container">
            {workload.length === 0 ? (
              <div className="empty-row">未対応タスクはありません</div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(180, workload.length * 44 + 60)}>
                <BarChart data={workload} layout="vertical" margin={{ left: 16, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {(Object.keys(TASK_META) as TaskKind[]).map(k => (
                    <Bar key={k} dataKey={k} stackId="a" name={TASK_META[k].label} fill={TASK_META[k].color} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Department table */}
        <div className="card">
          <div className="card-header"><h2>部署別の進捗</h2></div>
          <table className="table">
            <thead>
              <tr><th>部署</th><th>完了</th><th>未対応</th><th style={{ width: '40%' }}>進捗</th></tr>
            </thead>
            <tbody>
              {deptRows.map(d => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.completed}/{d.total}名</td>
                  <td style={{ color: d.pending > 0 ? '#f59e0b' : undefined, fontWeight: 600 }}>{d.pending}件</td>
                  <td>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${d.progress}%`, background: d.progress === 100 ? '#10b981' : '#6366f1' }} />
                      </div>
                      <span className="progress-label">{d.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
