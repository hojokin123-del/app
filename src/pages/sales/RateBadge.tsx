import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { RATE_LEVEL_LABELS, rateLevel } from './salesUtils';

const ICONS = { good: CheckCircle2, warning: AlertTriangle, critical: XCircle };

/** 達成率を色＋アイコン＋ラベルで表示（色だけに頼らない） */
export function RateBadge({ rate, showLabel = false }: { rate: number | null; showLabel?: boolean }) {
  if (rate == null) return <span className="rate-badge rate-unset" title="目標・予算が未設定">未設定</span>;
  const level = rateLevel(rate);
  const Icon = ICONS[level];
  return (
    <span className={`rate-badge rate-${level}`} title={RATE_LEVEL_LABELS[level]}>
      <Icon size={12} />
      {rate}%{showLabel && <span className="rate-badge-label">{RATE_LEVEL_LABELS[level]}</span>}
    </span>
  );
}
