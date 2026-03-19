import { useApp } from '../context/AppContext';
import { CATEGORY_LABELS, type EvaluationCategory } from '../types';

export function Criteria() {
  const { criteria } = useApp();

  const categories = Object.keys(CATEGORY_LABELS) as EvaluationCategory[];

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1>評価項目</h1>
        <div className="text-muted">合計ウェイト: <strong>{totalWeight}%</strong></div>
      </div>

      {categories.map(cat => {
        const catCriteria = criteria.filter(c => c.category === cat);
        const catWeight = catCriteria.reduce((sum, c) => sum + c.weight, 0);
        return (
          <div className="card" key={cat} style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div>
                <h2>{CATEGORY_LABELS[cat]}</h2>
                <div className="text-muted">カテゴリウェイト合計: {catWeight}%</div>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>評価項目</th>
                  <th>説明</th>
                  <th>ウェイト</th>
                </tr>
              </thead>
              <tbody>
                {catCriteria.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td className="text-muted">{c.description}</td>
                    <td>
                      <div className="weight-cell">
                        <div className="weight-bar" style={{ width: `${c.weight * 4}px`, background: cat === 'performance' ? '#6366f1' : cat === 'competency' ? '#0284c7' : '#10b981' }} />
                        <span>{c.weight}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      <div className="card">
        <div className="card-header"><h2>評価レーティング基準</h2></div>
        <table className="table">
          <thead>
            <tr>
              <th>評価</th>
              <th>説明</th>
            </tr>
          </thead>
          <tbody>
            {[
              { r: 'S', label: '期待を大きく超えている', color: '#059669' },
              { r: 'A', label: '期待を超えている', color: '#0284c7' },
              { r: 'B', label: '期待通り', color: '#6366f1' },
              { r: 'C', label: '期待をやや下回っている', color: '#f59e0b' },
              { r: 'D', label: '期待を大きく下回っている', color: '#ef4444' },
            ].map(({ r, label, color }) => (
              <tr key={r}>
                <td>
                  <span className="rating-badge" style={{ background: color, color: '#fff' }}>{r}</span>
                </td>
                <td>{label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
