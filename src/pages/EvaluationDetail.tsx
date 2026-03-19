import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle, Clock, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORY_LABELS, PERIOD_LABELS, STATUS_LABELS, RATING_LABELS, type EvaluationCategory, type RatingScale, type Goal } from '../types';
import { STATUS_COLORS } from './Evaluations';

const RATING_OPTIONS: RatingScale[] = [1, 2, 3, 4, 5];
const RATING_SHORT = ['S', 'A', 'B', 'C', 'D'];

function RatingSelect({ value, onChange, disabled }: { value: RatingScale | null; onChange: (v: RatingScale) => void; disabled?: boolean }) {
  return (
    <div className="rating-select">
      {RATING_OPTIONS.map((r) => (
        <button
          key={r}
          type="button"
          disabled={disabled}
          className={`rating-btn ${value === r ? 'active' : ''}`}
          style={value === r ? { background: '#6366f1', color: '#fff', borderColor: '#6366f1' } : {}}
          onClick={() => onChange(r)}
          title={RATING_LABELS[r]}
        >
          {RATING_SHORT[r - 1]}
        </button>
      ))}
    </div>
  );
}

export function EvaluationDetail() {
  const { id } = useParams<{ id: string }>();
  const { evaluations, employees, criteria, updateItemRating, updateItemComment, updateOverallComment, updateSelfEvaluation, updateManagerEvaluation, addGoal, updateGoal, deleteGoal } = useApp();

  const ev = evaluations.find(e => e.id === id);
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id'> | null>(null);
  const [activeTab, setActiveTab] = useState<EvaluationCategory | 'goals' | 'summary'>('performance');

  if (!ev) return <div className="page"><div className="card">評価が見つかりません</div></div>;

  const emp = employees.find(e => e.id === ev.employeeId);
  if (!emp) return null;

  const isSelfPhase = ev.status === 'self_evaluation';
  const isManagerPhase = ev.status === 'manager_evaluation';
  const isCompleted = ev.status === 'completed';

  const categorizedCriteria = Object.keys(CATEGORY_LABELS) as EvaluationCategory[];

  const handleSubmitSelf = () => {
    if (confirm('自己評価を提出して上司評価フェーズに進みますか？')) {
      updateSelfEvaluation(ev.id, ev.items, ev.overallSelfComment);
    }
  };

  const handleSubmitManager = () => {
    if (confirm('上司評価を完了しますか？')) {
      updateManagerEvaluation(ev.id, ev.items, ev.overallManagerComment);
    }
  };

  const handleAddGoal = () => {
    if (!newGoal) return;
    addGoal(ev.id, newGoal);
    setNewGoal(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/evaluations" className="back-link"><ArrowLeft size={16} /> 評価一覧</Link>
        </div>
        <div className="header-actions">
          <span className="status-pill" style={{ background: `${STATUS_COLORS[ev.status]}22`, color: STATUS_COLORS[ev.status] }}>
            {ev.status === 'completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
            {STATUS_LABELS[ev.status]}
          </span>
        </div>
      </div>

      {/* Summary Header */}
      <div className="card eval-header-card">
        <div className="eval-emp-info">
          <div className="avatar avatar-lg">{emp.avatarInitials}</div>
          <div>
            <h2>{emp.name}</h2>
            <div className="text-muted">{emp.position}</div>
            <div className="eval-period-tag">{ev.year}年度 {PERIOD_LABELS[ev.period]}</div>
          </div>
        </div>
        <div className="eval-phase-info">
          <div className="phase-step" data-active={ev.status !== 'not_started'}>自己評価</div>
          <div className="phase-arrow">→</div>
          <div className="phase-step" data-active={ev.status === 'manager_evaluation' || ev.status === 'completed'}>上司評価</div>
          <div className="phase-arrow">→</div>
          <div className="phase-step" data-active={ev.status === 'completed'}>完了</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {categorizedCriteria.map(cat => (
          <button key={cat} className={`tab ${activeTab === cat ? 'active' : ''}`} onClick={() => setActiveTab(cat)}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
        <button className={`tab ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>目標管理</button>
        <button className={`tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>総合コメント</button>
      </div>

      {/* Category tabs */}
      {(categorizedCriteria as string[]).includes(activeTab) && (
        <div className="card">
          <div className="criteria-list">
            {criteria.filter(c => c.category === activeTab).map(c => {
              const item = ev.items.find(i => i.criteriaId === c.id);
              if (!item) return null;
              return (
                <div key={c.id} className="criteria-item">
                  <div className="criteria-header">
                    <div>
                      <div className="criteria-name">{c.name}</div>
                      <div className="criteria-desc text-muted">{c.description}</div>
                    </div>
                    <div className="criteria-weight">ウェイト: {c.weight}%</div>
                  </div>
                  <div className="eval-row">
                    <div className="eval-col">
                      <div className="eval-col-label">自己評価</div>
                      <RatingSelect
                        value={item.selfRating}
                        onChange={v => updateItemRating(ev.id, c.id, 'selfRating', v)}
                        disabled={!isSelfPhase}
                      />
                      <textarea
                        className="comment-input"
                        placeholder="自己評価コメント..."
                        value={item.selfComment}
                        disabled={!isSelfPhase}
                        onChange={e => updateItemComment(ev.id, c.id, 'selfComment', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="eval-col">
                      <div className="eval-col-label">上司評価</div>
                      <RatingSelect
                        value={item.managerRating}
                        onChange={v => updateItemRating(ev.id, c.id, 'managerRating', v)}
                        disabled={!isManagerPhase}
                      />
                      <textarea
                        className="comment-input"
                        placeholder="上司評価コメント..."
                        value={item.managerComment}
                        disabled={!isManagerPhase}
                        onChange={e => updateItemComment(ev.id, c.id, 'managerComment', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Goals tab */}
      {activeTab === 'goals' && (
        <div className="card">
          <div className="card-header">
            <h2>目標一覧</h2>
            {!isCompleted && (
              <button className="btn btn-secondary btn-sm" onClick={() => setNewGoal({ title: '', description: '', targetDate: '', progress: 0, achieved: false })}>
                <Plus size={14} /> 目標追加
              </button>
            )}
          </div>
          {newGoal && (
            <div className="new-goal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>目標タイトル *</label>
                  <input value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="例: 売上目標達成" />
                </div>
                <div className="form-group">
                  <label>期日</label>
                  <input type="date" value={newGoal.targetDate} onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>詳細説明</label>
                <textarea rows={2} value={newGoal.description} onChange={e => setNewGoal({ ...newGoal, description: e.target.value })} placeholder="目標の詳細..." />
              </div>
              <div className="form-row">
                <button className="btn btn-primary btn-sm" onClick={handleAddGoal} disabled={!newGoal.title}>追加</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setNewGoal(null)}>キャンセル</button>
              </div>
            </div>
          )}
          <div className="goals-list">
            {ev.goals.length === 0 && <div className="empty-state">目標が設定されていません</div>}
            {ev.goals.map(goal => (
              <div key={goal.id} className="goal-item">
                <div className="goal-header">
                  <div className="goal-title">{goal.title}</div>
                  <div className="goal-actions">
                    {goal.achieved ? <span className="badge badge-success">達成</span> : null}
                    {!isCompleted && (
                      <>
                        <button
                          className={`btn btn-xs ${goal.achieved ? 'btn-secondary' : 'btn-success'}`}
                          onClick={() => updateGoal(ev.id, goal.id, { achieved: !goal.achieved, progress: goal.achieved ? goal.progress : 100 })}
                        >
                          <CheckCircle size={12} /> {goal.achieved ? '未達成に戻す' : '達成'}
                        </button>
                        <button className="icon-btn danger" onClick={() => deleteGoal(ev.id, goal.id)}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {goal.description && <div className="goal-desc text-muted">{goal.description}</div>}
                <div className="goal-meta">
                  {goal.targetDate && <span>期日: {goal.targetDate}</span>}
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${goal.progress}%`, background: goal.achieved ? '#10b981' : '#6366f1' }} />
                  </div>
                  {!isCompleted ? (
                    <input
                      type="range" min={0} max={100} value={goal.progress}
                      onChange={e => updateGoal(ev.id, goal.id, { progress: Number(e.target.value) })}
                      className="progress-range"
                    />
                  ) : null}
                  <span className="progress-label">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary tab */}
      {activeTab === 'summary' && (
        <div className="card">
          <div className="criteria-list">
            <div className="criteria-item">
              <h3>自己評価（総合コメント）</h3>
              <textarea
                className="comment-input"
                rows={5}
                placeholder="今期の総合的な振り返りと来期への展望..."
                value={ev.overallSelfComment}
                disabled={!isSelfPhase}
                onChange={e => updateOverallComment(ev.id, 'overallSelfComment', e.target.value)}
              />
            </div>
            <div className="criteria-item">
              <h3>上司評価（総合コメント）</h3>
              <textarea
                className="comment-input"
                rows={5}
                placeholder="部下に対する総合的な評価と来期への期待..."
                value={ev.overallManagerComment}
                disabled={!isManagerPhase}
                onChange={e => updateOverallComment(ev.id, 'overallManagerComment', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isCompleted && (
        <div className="action-bar">
          {isSelfPhase && (
            <button className="btn btn-primary" onClick={handleSubmitSelf}>
              <Save size={16} /> 自己評価を提出する
            </button>
          )}
          {isManagerPhase && (
            <button className="btn btn-primary" onClick={handleSubmitManager}>
              <CheckCircle size={16} /> 上司評価を完了する
            </button>
          )}
        </div>
      )}
    </div>
  );
}
