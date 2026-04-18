import { useState } from 'react';
import { BookOpen, Lightbulb, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { lectures } from '../data/curriculumData';
import { CLAUDE_TOOL_LABELS, CLAUDE_TOOL_COLORS } from '../types';
import type { ClaudeTool } from '../types';

const PHASES = [
  { label: 'フェーズ1：基礎編', range: [1, 10], color: '#6366f1' },
  { label: 'フェーズ2：中級編', range: [11, 20], color: '#0284c7' },
  { label: 'フェーズ3：応用・実践編', range: [21, 30], color: '#059669' },
] as const;

function phaseOf(n: number) {
  return PHASES.find(p => n >= p.range[0] && n <= p.range[1])!;
}

function ToolBadge({ tool }: { tool: ClaudeTool }) {
  return (
    <span style={{
      background: CLAUDE_TOOL_COLORS[tool] + '1a',
      color: CLAUDE_TOOL_COLORS[tool],
      border: `1px solid ${CLAUDE_TOOL_COLORS[tool]}40`,
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
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

  const toolFilters: { value: ClaudeTool | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'すべて', color: 'var(--primary)' },
    { value: 'chat', label: 'Claude Chat', color: CLAUDE_TOOL_COLORS.chat },
    { value: 'cowork', label: 'Claude Cowork', color: CLAUDE_TOOL_COLORS.cowork },
    { value: 'code', label: 'Claude Code', color: CLAUDE_TOOL_COLORS.code },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>AIによる業務効率化研修カリキュラム</h1>
        <span className="period-badge">全30講義 × 1時間</span>
      </div>

      {/* Phase summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {PHASES.map(p => (
          <div key={p.label} className="card" style={{ padding: '16px', borderLeft: `4px solid ${p.color}` }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: p.color, marginBottom: '4px' }}>{p.label}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              第{p.range[0]}〜{p.range[1]}講義 ／ 計{p.range[1] - p.range[0] + 1}時間
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {toolFilters.map(({ value, label, color }) => (
          <button key={value} onClick={() => setFilterTool(value)} style={{
            padding: '5px 14px',
            borderRadius: '20px',
            border: `1px solid ${filterTool === value ? color : 'var(--border)'}`,
            background: filterTool === value ? color : 'var(--card-bg)',
            color: filterTool === value ? '#fff' : 'var(--text)',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center' }}>
          {filtered.length}講義表示中
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
              {['No.', 'フェーズ', 'タイトル', '使用ツール', '学習目標', 'ハンズオン演習', ''].map(h => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left',
                  fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(lecture => {
              const phase = phaseOf(lecture.number);
              const isOpen = expandedId === lecture.id;
              return (
                <>
                  <tr
                    key={lecture.id}
                    onClick={() => setExpandedId(isOpen ? null : lecture.id)}
                    style={{
                      borderBottom: isOpen ? 'none' : '1px solid var(--border)',
                      cursor: 'pointer',
                      background: isOpen ? 'var(--primary-light)' : 'var(--card-bg)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'var(--bg)'; }}
                    onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'var(--card-bg)'; }}
                  >
                    {/* No. */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{
                        width: '32px', height: '32px',
                        background: phase.color + '1a',
                        color: phase.color,
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '13px',
                      }}>
                        {String(lecture.number).padStart(2, '0')}
                      </div>
                    </td>

                    {/* Phase */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700,
                        color: phase.color,
                        background: phase.color + '15',
                        padding: '2px 8px', borderRadius: '4px',
                      }}>
                        {phase.label.split('：')[0]}
                      </span>
                    </td>

                    {/* Title */}
                    <td style={{ padding: '12px 14px', minWidth: '180px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', marginBottom: '2px' }}>
                        {lecture.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lecture.subtitle}</div>
                    </td>

                    {/* Tools */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {lecture.tools.map(t => <ToolBadge key={t} tool={t} />)}
                      </div>
                    </td>

                    {/* Objective */}
                    <td style={{ padding: '12px 14px', maxWidth: '260px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.6 }}>
                        {lecture.objective}
                      </div>
                    </td>

                    {/* Practice */}
                    <td style={{ padding: '12px 14px', maxWidth: '200px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', marginBottom: '2px' }}>
                        {lecture.practiceTitle}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {lecture.practiceDescription}
                      </div>
                    </td>

                    {/* Expand toggle */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {isOpen && (
                    <tr key={`${lecture.id}-detail`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td colSpan={7} style={{ padding: '0 14px 16px 60px', background: 'var(--primary-light)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '12px' }}>

                          {/* Sections */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                              <BookOpen size={13} /> 講義内容
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {lecture.sections.map((sec, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 10px', background: '#fff', borderRadius: '6px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', minWidth: '30px' }}>{sec.duration}分</span>
                                  <div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{sec.title}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sec.description}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Takeaways */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                              <Lightbulb size={13} /> この講義のポイント
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                              {lecture.keyTakeaways.map((kw, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text)', background: '#fff', padding: '8px 10px', borderRadius: '6px' }}>
                                  <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                                  {kw}
                                </div>
                              ))}
                            </div>
                            <div style={{ padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                <Wrench size={12} style={{ color: '#059669' }} />
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>ハンズオン：</span>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{lecture.practiceTitle}</span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lecture.practiceDescription}</div>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
