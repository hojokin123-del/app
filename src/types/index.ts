// ===== 代理店フィー計算システム 型定義 =====

/** 代理店の階層区分 */
export type AgencyTier = 'primary' | 'secondary';

/** 代理店マスター */
export type Agency = {
  id: string;
  code: string;              // 代理店コード
  name: string;              // 代理店名
  tier: AgencyTier;          // 一次 / 二次
  parentId: string | null;   // 二次の場合、所属する一次代理店ID
  feeRate: number;           // 手数料率（％）— 研修費用に対する自社取り分
  contactPerson: string;     // 担当者名
  email: string;
  phone: string;
  // 振込先情報
  bankName: string;
  bankBranch: string;
  accountType: '普通' | '当座';
  accountNumber: string;
  accountHolder: string;
  active: boolean;
  note: string;
};

/** 売上（研修）レコード */
export type Sale = {
  id: string;
  month: string;             // 対象月 (YYYY-MM)
  date: string;              // 入金日 (YYYY-MM-DD)
  agencyId: string;          // 販売した代理店（一次直販なら一次、二次経由なら二次）
  customerName: string;      // 顧客先
  productName: string;       // 商材・研修内容
  category: string;          // 区分
  amount: number;            // 研修費用（フィー計算のベース）
  isTraining: boolean;       // 研修に関するものか
  source: 'manual' | 'import'; // 登録元
};

/** フィー明細の種別 */
export type FeeLineType = 'direct' | 'secondary' | 'override';
// direct   = 一次代理店の直販フィー
// secondary= 二次代理店が販売した自社フィー
// override = 一次代理店が二次の販売に対して得るオーバーライド

/** フィー明細（1売上×1代理店の取り分） */
export type FeeLine = {
  type: FeeLineType;
  saleId: string;
  sellerAgencyId: string;    // 実際に販売した代理店
  saleDate: string;
  month: string;
  customerName: string;
  productName: string;
  saleAmount: number;        // 研修費用
  rate: number;              // 適用率（％）
  feeAmount: number;         // フィー額（円）
};

/** 支払明細書 */
export type StatementStatus = 'draft' | 'confirmed';

export type PaymentStatement = {
  id: string;
  agencyId: string;
  month: string;             // 対象月 (YYYY-MM)
  lines: FeeLine[];
  subtotal: number;          // 手数料小計
  taxRate: number;           // 消費税率（例: 0.1）
  taxAmount: number;         // 消費税額
  transferFee: number;       // 振込手数料
  total: number;             // 差引支払額（振込金額）
  status: StatementStatus;
  generatedAt: string;
  confirmedAt: string | null;
};

/** システム設定 */
export type AppSettings = {
  companyName: string;
  taxRate: number;           // 消費税率
  transferFee: number;       // 標準振込手数料
  trainingKeywords: string[];// 研修判定キーワード
  paymentDay: number;        // 支払日（毎月）
};

export const TIER_LABELS: Record<AgencyTier, string> = {
  primary: '一次代理店',
  secondary: '二次代理店',
};

export const FEE_TYPE_LABELS: Record<FeeLineType, string> = {
  direct: '直販フィー',
  secondary: '販売フィー',
  override: 'オーバーライド',
};

export const STATEMENT_STATUS_LABELS: Record<StatementStatus, string> = {
  draft: '未確定',
  confirmed: '確定済み',
};
