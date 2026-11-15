/** 基準日（今日）から年度・当月を求める。年度は4月始まり。 */
function localDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const now = new Date();
export const TODAY = localDate(now);
export const CURRENT_MONTH = TODAY.slice(0, 7);
export const FISCAL_YEAR = now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1;

export const FISCAL_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const m = ((i + 3) % 12) + 1;
  const y = m >= 4 ? FISCAL_YEAR : FISCAL_YEAR + 1;
  return `${y}-${String(m).padStart(2, '0')}`;
});

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localDate(d);
}
