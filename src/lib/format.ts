/** 金額を円表記に整形（¥1,234,567） */
export function formatYen(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}¥${Math.abs(Math.round(amount)).toLocaleString('ja-JP')}`;
}

/** 桁区切りのみ（1,234,567） */
export function formatNumber(amount: number): string {
  return Math.round(amount).toLocaleString('ja-JP');
}

/** 率を％表記（55% / 12.5%） */
export function formatPercent(rate: number): string {
  return `${Number.isInteger(rate) ? rate : rate.toFixed(1)}%`;
}

/** YYYY-MM を「2025年5月」表記に */
export function formatMonth(month: string): string {
  const [y, m] = month.split('-');
  if (!y || !m) return month;
  return `${y}年${parseInt(m, 10)}月`;
}

/** YYYY-MM-DD を「2025/5/22」表記に */
export function formatDate(date: string): string {
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return date;
  return `${y}/${parseInt(m, 10)}/${parseInt(d, 10)}`;
}

/** 現在月の一つ手前の月末など、YYYY-MM の一覧を生成（新しい順） */
export function listMonths(sales: { month: string }[]): string[] {
  const set = new Set(sales.map(s => s.month));
  return [...set].sort((a, b) => (a < b ? 1 : -1));
}
