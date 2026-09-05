import type { Agency, Sale, FeeLine, PaymentStatement, AppSettings } from '../types';

/** テキストが研修関連キーワードを含むか判定 */
export function detectTraining(text: string, keywords: string[]): boolean {
  if (!text) return false;
  return keywords.some(k => k && text.includes(k));
}

/** 1代理店・1月分の集計結果 */
export type AgencyMonthlyFee = {
  agencyId: string;
  lines: FeeLine[];
  subtotal: number;
};

/**
 * オーバーライド型フィー計算。
 * - 二次代理店が販売 → 二次は自社%（secondary）、親の一次は同じ研修費用に対し一次%（override）
 * - 一次代理店が直販 → 一次%（direct）
 * 各代理店は「研修費用（売上ベース）」に対して自社の登録%を掛ける。
 */
export function computeMonthlyFees(
  agencies: Agency[],
  sales: Sale[],
  month: string,
): AgencyMonthlyFee[] {
  const byId = new Map(agencies.map(a => [a.id, a]));
  const linesByAgency = new Map<string, FeeLine[]>();

  const push = (agencyId: string, line: FeeLine) => {
    const arr = linesByAgency.get(agencyId);
    if (arr) arr.push(line);
    else linesByAgency.set(agencyId, [line]);
  };

  const monthSales = sales.filter(s => s.month === month && s.isTraining);

  for (const sale of monthSales) {
    const seller = byId.get(sale.agencyId);
    if (!seller || !seller.active) continue;

    const base = {
      saleId: sale.id,
      sellerAgencyId: seller.id,
      saleDate: sale.date,
      month: sale.month,
      customerName: sale.customerName,
      productName: sale.productName,
      saleAmount: sale.amount,
    };

    // 販売した代理店自身のフィー
    push(seller.id, {
      ...base,
      type: seller.tier === 'secondary' ? 'secondary' : 'direct',
      rate: seller.feeRate,
      feeAmount: Math.round((sale.amount * seller.feeRate) / 100),
    });

    // 二次販売の場合、親の一次代理店にオーバーライド
    if (seller.tier === 'secondary' && seller.parentId) {
      const parent = byId.get(seller.parentId);
      if (parent && parent.active) {
        push(parent.id, {
          ...base,
          type: 'override',
          rate: parent.feeRate,
          feeAmount: Math.round((sale.amount * parent.feeRate) / 100),
        });
      }
    }
  }

  return [...linesByAgency.entries()]
    .map(([agencyId, lines]) => ({
      agencyId,
      lines,
      subtotal: lines.reduce((s, l) => s + l.feeAmount, 0),
    }))
    .sort((a, b) => b.subtotal - a.subtotal);
}

/** 集計結果から支払明細書を生成 */
export function buildStatement(
  fee: AgencyMonthlyFee,
  month: string,
  settings: AppSettings,
  idSeed: number,
): PaymentStatement {
  const subtotal = fee.subtotal;
  const taxAmount = Math.round(subtotal * settings.taxRate);
  const transferFee = settings.transferFee;
  const total = subtotal + taxAmount - transferFee;
  return {
    id: `st${idSeed}`,
    agencyId: fee.agencyId,
    month,
    lines: fee.lines,
    subtotal,
    taxRate: settings.taxRate,
    taxAmount,
    transferFee,
    total,
    status: 'draft',
    generatedAt: new Date().toISOString(),
    confirmedAt: null,
  };
}
