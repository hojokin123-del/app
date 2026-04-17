import { useState } from 'react';
import { BookOpen, Clock, ChevronDown, ChevronUp, Target, Lightbulb, Wrench } from 'lucide-react';
import { lectures } from '../data/curriculumData';
import { CLAUDE_TOOL_LABELS, CLAUDE_TOOL_COLORS } from '../types';
import type { ClaudeTool } from '../types';

function ToolBadge({ tool }: { tool: ClaudeTool }) {
  return (
    <span
      style={{
        background: CLAUDE_TOOL_COLORS[tool] + '1a',
        color: CLAUDE_TOOL_COLORS[tool],
        border: `1px solid ${CLAUDE_TOOL_COLORS[tool]}40`,
        padding: '2px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {CLAUDE_TOOL_LABELS[tool]}
    </span>
  );
}

export function Curriculum() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterTool, setFilterTool] = useState<ClaudeTool | 'all'>('all');

  const filtered = filterTool === 'all'
    ? lectures
    : lectures.filter(l => l.tools.includes(filterTool));

  const toolFilters: { value: ClaudeTool | 'all'; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'chat', label: 'Claude Chat' },
    { value: 'cowork', label: 'Claude Cowork' },
    { value: 'code', label: 'Claude Code' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>AIによる業務効率化研修</h1>
        <span className="period-badge">全10講義 × 1時間</span>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {(
          [
            { tool: 'chat' as ClaudeTool, count: lectures.filter(l => l.tools.includes('chat')).length, desc: '文書作成・分析・対話型AI活用' },
            { tool: 'cowork' as ClaudeTool, count: lectures.filter(l => l.tools.includes('cowork')).length, desc: 'チームコラボレーション・プロジェクト管理' },
            { tool: 'code' as ClaudeTool, count: lectures.filter(l => l.tools.includes('code')).length, desc: '自動化・スクリプト・データ処理' },
          ]
        ).map(({ tool, count, desc }) => (
          <div key={tool} className="card" style={{ padding: '20px', borderTop: `3px solid ${CLAUDE_TOOL_COLORS[tool]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, color: CLAUDE_TOOL_COLORS[tool], fontSize: '15px' }}>{CLAUDE_TOOL_LABELS[tool]}</span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: CLAUDE_TOOL_COLORS[tool] }}>{count}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {toolFilters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterTool(value)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              background: filterTool === value ? 'var(--primary)' : 'var(--card-bg)',
              color: filterTool === value ? '#fff' : 'var(--text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lecture list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(lecture => {
          const isOpen = expandedId === lecture.id;
          const totalDuration = lecture.sections.reduce((s, sec) => s + sec.duration, 0);

          return (
            <div
              key={lecture.id}
              className="card"
              style={{ overflow: 'hidden', border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border)' }}
            >
              {/* Header row */}
              <button
                onClick={() => setExpandedId(isOpen ? null : lecture.id)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                {/* Lecture number badge */}
                <div style={{
                  minWidth: '40px', height: '40px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                }}>
                  {String(lecture.number).padStart(2, '0')}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>{lecture.title}</span>
                    {lecture.tools.map(t => <ToolBadge key={t} tool={t} />)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lecture.subtitle}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', minWidth: '70px' }}>
                  <Clock size={14} />
                  <span>{totalDuration}分</span>
                </div>

                <div style={{ color: 'var(--text-muted)' }}>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>

                  {/* Objective */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px', padding: '12px', background: 'var(--primary-light)', borderRadius: '8px' }}>
                    <Target size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>学習目標</div>
                      <div style={{ fontSize: '13px', color: 'var(--text)' }}>{lecture.objective}</div>
                    </div>
                  </div>

                  {/* Sections */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={14} />
                      講義内容
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {lecture.sections.map((sec, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '12px', padding: '10px 12px', background: 'var(--bg)', borderRadius: '8px' }}>
                          <div style={{
                            minWidth: '36px', height: '36px',
                            background: '#fff',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                          }}>
                            {sec.duration}分
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{sec.title}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sec.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice */}
                  <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Wrench size={14} style={{ color: '#059669' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>ハンズオン演習</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{lecture.practiceTitle}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lecture.practiceDescription}</div>
                  </div>

                  {/* Key takeaways */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lightbulb size={14} />
                      この講義のポイント
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {lecture.keyTakeaways.map((kw, idx) => (
                        <li key={idx} style={{ fontSize: '13px', color: 'var(--text)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                          {kw}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
