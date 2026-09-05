import type { Agency, Sale, AppSettings } from '../types';

// ============================================================
// 初期データ
// 出典: Google スプレッドシート「石川決済（西河マネジメントセンター）」
//   - シート「Leap代理店リスト」「MMH精算リスト」より研修（研修費用）行を転記
//   - 研修費用 3,000,000 → 代理店手数料(一次)1,650,000=55% / 2次代理店手数料 1,350,000=45%
//     という実データの配分から各代理店の手数料率を設定
// ============================================================

export const settings: AppSettings = {
  companyName: '西河マネジメントセンター',
  taxRate: 0.1,
  transferFee: 770,
  trainingKeywords: ['研修', 'リスキリング', 'トレーニング', 'セミナー', '講座', 'スクール', '訓練'],
  paymentDay: 0, // 0 = 月末
};

export const agencies: Agency[] = [
  // ===== 一次代理店 =====
  {
    id: 'ag_leap',
    code: 'A-001',
    name: 'Leap',
    tier: 'primary',
    parentId: null,
    feeRate: 55,
    contactPerson: '貞末',
    email: 'contact@leap.example.jp',
    phone: '03-1000-0001',
    bankName: 'みずほ銀行',
    bankBranch: '渋谷支店',
    accountType: '普通',
    accountNumber: '1234567',
    accountHolder: 'カ）リープ',
    active: true,
    note: '二次代理店：貞末、天馬堂、SSC',
  },
  {
    id: 'ag_mmh',
    code: 'A-002',
    name: 'MMH',
    tier: 'primary',
    parentId: null,
    feeRate: 10,
    contactPerson: '中村大輔',
    email: 'contact@mmh.example.jp',
    phone: '03-1000-0002',
    bankName: '三菱UFJ銀行',
    bankBranch: '新宿支店',
    accountType: '普通',
    accountNumber: '2345678',
    accountHolder: 'カ）エムエムエイチ',
    active: true,
    note: '二次代理店：ファンラボ',
  },
  // ===== 二次代理店（Leap配下） =====
  {
    id: 'ag_sadasue',
    code: 'B-101',
    name: '貞末',
    tier: 'secondary',
    parentId: 'ag_leap',
    feeRate: 45,
    contactPerson: '貞末',
    email: 'sadasue@example.jp',
    phone: '090-1000-0101',
    bankName: '福岡銀行',
    bankBranch: '博多支店',
    accountType: '普通',
    accountNumber: '3456789',
    accountHolder: 'サダスエ',
    active: true,
    note: '',
  },
  {
    id: 'ag_ssc',
    code: 'B-102',
    name: 'SSC',
    tier: 'secondary',
    parentId: 'ag_leap',
    feeRate: 45,
    contactPerson: '—',
    email: 'ssc@example.jp',
    phone: '090-1000-0102',
    bankName: '三井住友銀行',
    bankBranch: '本店営業部',
    accountType: '普通',
    accountNumber: '4567890',
    accountHolder: 'エスエスシー',
    active: true,
    note: '',
  },
  {
    id: 'ag_tenmado',
    code: 'B-103',
    name: '天馬堂',
    tier: 'secondary',
    parentId: 'ag_leap',
    feeRate: 45,
    contactPerson: '—',
    email: 'tenmado@example.jp',
    phone: '090-1000-0103',
    bankName: 'りそな銀行',
    bankBranch: '大阪支店',
    accountType: '普通',
    accountNumber: '5678901',
    accountHolder: 'テンマドウ',
    active: true,
    note: 'Leap天馬堂',
  },
  // ===== 二次代理店（MMH配下） =====
  {
    id: 'ag_funlab',
    code: 'B-201',
    name: 'ファンラボ',
    tier: 'secondary',
    parentId: 'ag_mmh',
    feeRate: 15,
    contactPerson: 'funlab',
    email: 'funlab@example.jp',
    phone: '090-1000-0201',
    bankName: 'GMOあおぞらネット銀行',
    bankBranch: '法人第一営業部',
    accountType: '普通',
    accountNumber: '6789012',
    accountHolder: 'ファンラボ',
    active: true,
    note: '',
  },
];

const T = '研修'; // 研修カテゴリ
const OTHER = 'DX・GX';

export const sales: Sale[] = [
  // ===== 2025-04 =====
  {
    id: 's001', month: '2025-04', date: '2025-04-23', agencyId: 'ag_funlab',
    customerName: '.関自動車', productName: 'リスキリング研修', category: T,
    amount: 500000, isTraining: true, source: 'import',
  },
  // 研修以外（フィー計算対象外）— 抽出フィルタの動作確認用
  {
    id: 's002', month: '2025-04', date: '2025-04-15', agencyId: 'ag_leap',
    customerName: 'アサユサイト', productName: 'DX+GX定額制', category: OTHER,
    amount: 660000, isTraining: false, source: 'import',
  },

  // ===== 2025-05 =====
  {
    id: 's010', month: '2025-05', date: '2025-05-22', agencyId: 'ag_sadasue',
    customerName: 'RELIFE', productName: 'リスキリング研修', category: T,
    amount: 3000000, isTraining: true, source: 'import',
  },
  {
    id: 's011', month: '2025-05', date: '2025-05-29', agencyId: 'ag_ssc',
    customerName: 'successful', productName: 'リスキリング研修', category: T,
    amount: 6000000, isTraining: true, source: 'import',
  },
  {
    id: 's012', month: '2025-05', date: '2025-05-30', agencyId: 'ag_leap',
    customerName: 'ネスル', productName: 'DX・GX研修', category: T,
    amount: 1800000, isTraining: true, source: 'import',
  },
  // 研修以外
  {
    id: 's013', month: '2025-05', date: '2025-05-09', agencyId: 'ag_mmh',
    customerName: 'コミクス', productName: 'DX定額制', category: OTHER,
    amount: 1100000, isTraining: false, source: 'import',
  },

  // ===== 2025-06 =====
  {
    id: 's020', month: '2025-06', date: '2025-06-12', agencyId: 'ag_tenmado',
    customerName: '志力工業', productName: 'DX・GX研修', category: T,
    amount: 600000, isTraining: true, source: 'import',
  },
  {
    id: 's021', month: '2025-06', date: '2025-06-25', agencyId: 'ag_tenmado',
    customerName: 'ROTT', productName: 'DX・GX研修', category: T,
    amount: 600000, isTraining: true, source: 'import',
  },
  {
    id: 's022', month: '2025-06', date: '2025-06-30', agencyId: 'ag_ssc',
    customerName: 'アラタガーデン', productName: 'リスキリング研修', category: T,
    amount: 1800000, isTraining: true, source: 'import',
  },
  {
    id: 's023', month: '2025-06', date: '2025-06-30', agencyId: 'ag_ssc',
    customerName: '三建設', productName: 'リスキリング研修', category: T,
    amount: 1200000, isTraining: true, source: 'import',
  },
  {
    id: 's024', month: '2025-06', date: '2025-06-30', agencyId: 'ag_ssc',
    customerName: 'ACR', productName: 'リスキリング研修', category: T,
    amount: 1200000, isTraining: true, source: 'import',
  },
  {
    id: 's025', month: '2025-06', date: '2025-06-30', agencyId: 'ag_sadasue',
    customerName: '前田電業', productName: 'リスキリング研修', category: T,
    amount: 1200000, isTraining: true, source: 'import',
  },
  {
    id: 's026', month: '2025-06', date: '2025-06-30', agencyId: 'ag_sadasue',
    customerName: '真浄葬祭', productName: 'リスキリング研修', category: T,
    amount: 3600000, isTraining: true, source: 'import',
  },
  {
    id: 's027', month: '2025-06', date: '2025-06-30', agencyId: 'ag_tenmado',
    customerName: 'COLOR', productName: 'DX・GX研修', category: T,
    amount: 3600000, isTraining: true, source: 'import',
  },
  {
    id: 's028', month: '2025-06', date: '2025-06-18', agencyId: 'ag_mmh',
    customerName: '横堀商事', productName: '医療サイバーセキュリティ対策研修', category: T,
    amount: 1000000, isTraining: true, source: 'import',
  },
];
