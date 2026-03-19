import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Building2, Briefcase, Calendar, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_LABELS, PERIOD_LABELS, STATUS_COLORS } from './Evaluations';
import type { EvaluationStatus } from '../types';

export function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const { employees, departments, evaluations, criteria } = useApp();

  const emp = employees.find(e => e.id === id);
  if (!emp) return <div className="page"><div className="card">従業員が見つかりません</div></div>;

  const dept = departments.find(d => d.id === emp.departmentId);
  const manager = employees.find(e => e.id === emp.managerId);
  const empEvals = evaluations.filter(e => e.employeeId === id).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return a.period === 'H2' ? -1 : 1;
  });

  const latestCompleted = empEvals.find(e => e.status === 'completed');
  const avgRating = latestCompleted ? (() => {
    const ratings = latestCompleted.items.map(i => i.managerRating).filter(Boolean) as number[];
    if (!ratings.length) return null;
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return (6 - avg).toFixed(1); // inverted
  })() : null;

  return (
    <div className="page">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/employees" className="back-link"><ArrowLeft size={16} /> 従業員一覧</Link>
        </div>
      </div>

      <div className="detail-grid">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="profile-header">
            <div className="avatar avatar-lg">{emp.avatarInitials}</div>
            <div>
              <h2>{emp.name}</h2>
              <div className="text-muted">{emp.nameKana}</div>
              <span className="badge badge-primary">{emp.position}</span>
            </div>
          </div>
          <div className="info-list">
            <div className="info-item"><Mail size={16} /><span>{emp.email}</span></div>
            <div className="info-item"><Building2 size={16} /><span>{dept?.name ?? '-'}</span></div>
            <div className="info-item"><Briefcase size={16} /><span>{emp.position}</span></div>
            <div className="info-item"><Calendar size={16} /><span>入社: {emp.joinDate}</span></div>
            <div className="info-item"><User size={16} /><span>上司: {manager?.name ?? 'なし'}</span></div>
          </div>
          {avgRating && (
            <div className="avg-rating">
              <div className="avg-label">最新評価（総合）</div>
              <div className="avg-value">{avgRating} / 5.0</div>
            </div>
          )}
        </div>

        {/* Evaluations History */}
        <div className="card">
          <div className="card-header">
            <h2>評価履歴</h2>
            <Link to={`/evaluations/new?employeeId=${id}`} className="btn btn-primary btn-sm">+ 評価作成</Link>
          </div>
          {empEvals.length === 0 ? (
            <div className="empty-state">評価履歴がありません</div>
          ) : (
            <div className="eval-history">
              {empEvals.map(ev => {
                const statusColor = STATUS_COLORS[ev.status as EvaluationStatus] ?? '#94a3b8';
                return (
                  <Link to={`/evaluations/${ev.id}`} key={ev.id} className="eval-history-item">
                    <div className="eval-period">
                      <span className="eval-year">{ev.year}年度</span>
                      <span className="eval-half">{PERIOD_LABELS[ev.period]}</span>
                    </div>
                    <div className="eval-goals-count">{ev.goals.length}件の目標</div>
                    <div className="eval-status" style={{ color: statusColor }}>
                      {STATUS_LABELS[ev.status as EvaluationStatus]}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Goals (latest eval) */}
        {latestCompleted && latestCompleted.goals.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2>直近の目標（{latestCompleted.year}年度{PERIOD_LABELS[latestCompleted.period]}）</h2>
            </div>
            <div className="goals-list">
              {latestCompleted.goals.map(goal => (
                <div key={goal.id} className="goal-item">
                  <div className="goal-header">
                    <div className="goal-title">{goal.title}</div>
                    {goal.achieved && <span className="badge badge-success">達成</span>}
                  </div>
                  <div className="goal-desc text-muted">{goal.description}</div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${goal.progress}%`, background: goal.achieved ? '#10b981' : '#6366f1' }} />
                    </div>
                    <span className="progress-label">{goal.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Criteria breakdown */}
        {latestCompleted && (
          <div className="card">
            <div className="card-header">
              <h2>評価項目詳細（直近）</h2>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>評価項目</th>
                  <th>自己評価</th>
                  <th>上司評価</th>
                </tr>
              </thead>
              <tbody>
                {latestCompleted.items.map(item => {
                  const c = criteria.find(cr => cr.id === item.criteriaId);
                  if (!c) return null;
                  return (
                    <tr key={item.criteriaId}>
                      <td>{c.name}</td>
                      <td>{item.selfRating ? `${'SABCD'[item.selfRating - 1]}` : '-'}</td>
                      <td>{item.managerRating ? `${'SABCD'[item.managerRating - 1]}` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
