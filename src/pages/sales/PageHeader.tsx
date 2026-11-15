import type { ReactNode } from 'react';
import { useSales, ALL } from '../../store/salesStore';
import { FISCAL_YEAR, TODAY } from '../../data/calendar';

/** 各ページ共通のヘッダー（タイトル・年度情報・担当者フィルタ） */
export function PageHeader({ title, actions, hideRepFilter }: { title: string; actions?: ReactNode; hideRepFilter?: boolean }) {
  const { reps, selectedRepId, setSelectedRepId } = useSales();
  const teams = [...new Set(reps.map(r => r.team))];
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <div className="activity-meta">{FISCAL_YEAR}年度（{FISCAL_YEAR}年4月〜{FISCAL_YEAR + 1}年3月） ・ 基準日 {TODAY} ・ 金額単位：万円</div>
      </div>
      <div className="page-header-actions">
        {actions}
        {!hideRepFilter && (
          <div className="sales-rep-filter">
            <label htmlFor="rep-filter">担当者</label>
            <select id="rep-filter" className="filter-select" value={selectedRepId} onChange={e => setSelectedRepId(e.target.value)}>
              <option value={ALL}>全員</option>
              {teams.map(team => (
                <optgroup key={team} label={team}>
                  {reps.filter(r => r.team === team).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
