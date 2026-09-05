import type { Agency, Sale, AppSettings } from '../types';

// ============================================================
// 初期データ
// 出典: Google スプレッドシート「石川決済（西河マネジメントセンター）」
//   - シート「2025.4～」の入金台帳から、「代理店」列に会社名が入っており
//     かつ「入金」がある行を抽出し、入金日の月をキーに転記
//   - 代理店ごとの手数料率(%)はこのシートには無いため、暫定値を設定
//     （実際の契約率は「代理店マスター」で登録・調整してください）
// ============================================================

export const settings: AppSettings = {
  companyName: '西河マネジメントセンター',
  taxRate: 0.1,
  transferFee: 770,
  trainingKeywords: ['研修', 'リスキリング', 'トレーニング', 'セミナー', '講座', 'スクール', '訓練'],
  paymentDay: 0, // 0 = 月末
};

export const agencies: Agency[] = [
  // ===== 一次代理店（「2025.4～」台帳の代理店列に登場） =====
  {
    id: 'ag_leap',
    code: 'A-001',
    name: 'Leap',
    tier: 'primary',
    parentId: null,
    feeRate: 15, // 暫定
    contactPerson: '—',
    email: 'contact@leap.example.jp',
    phone: '',
    bankName: 'みずほ銀行',
    bankBranch: '渋谷支店',
    accountType: '普通',
    accountNumber: '1234567',
    accountHolder: 'カ）リープ',
    active: true,
    note: '二次代理店：貞末、天満堂、SSC、猫の手',
  },
  {
    id: 'ag_comics',
    code: 'A-002',
    name: 'コミクス',
    tier: 'primary',
    parentId: null,
    feeRate: 10, // 暫定
    contactPerson: '—',
    email: '',
    phone: '',
    bankName: '',
    bankBranch: '',
    accountType: '普通',
    accountNumber: '',
    accountHolder: 'コミクス',
    active: true,
    note: '',
  },
  {
    id: 'ag_adh',
    code: 'A-003',
    name: 'ADH',
    tier: 'primary',
    parentId: null,
    feeRate: 12, // 暫定
    contactPerson: '—',
    email: '',
    phone: '',
    bankName: '',
    bankBranch: '',
    accountType: '普通',
    accountNumber: '',
    accountHolder: 'ADH',
    active: true,
    note: '',
  },
  {
    id: 'ag_keplanning',
    code: 'A-004',
    name: 'ｹｰﾌﾟﾗﾝﾆﾝｸﾞ',
    tier: 'primary',
    parentId: null,
    feeRate: 8, // 暫定
    contactPerson: '—',
    email: '',
    phone: '',
    bankName: '',
    bankBranch: '',
    accountType: '普通',
    accountNumber: '',
    accountHolder: 'ケープランニング',
    active: true,
    note: '',
  },
  {
    id: 'ag_mmh',
    code: 'A-005',
    name: 'MMH',
    tier: 'primary',
    parentId: null,
    feeRate: 10, // 暫定
    contactPerson: '中村大輔',
    email: 'contact@mmh.example.jp',
    phone: '',
    bankName: '三菱UFJ銀行',
    bankBranch: '新宿支店',
    accountType: '普通',
    accountNumber: '2345678',
    accountHolder: 'カ）エムエムエイチ',
    active: true,
    note: '',
  },
  // ===== 二次代理店（Leap配下：代理店マスターシートより） =====
  {
    id: 'ag_sadasue',
    code: 'B-101',
    name: '貞末',
    tier: 'secondary',
    parentId: 'ag_leap',
    feeRate: 10, // 暫定
    contactPerson: '貞末',
    email: '',
    phone: '',
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
    feeRate: 10, // 暫定
    contactPerson: '—',
    email: '',
    phone: '',
    bankName: '',
    bankBranch: '',
    accountType: '普通',
    accountNumber: '',
    accountHolder: 'エスエスシー',
    active: true,
    note: '',
  },
];

export const sales: Sale[] = [
  // ===== 2025-04（「2025.4～」台帳：代理店列に会社名＋入金あり） =====
  {
    id: 's001', month: '2025-04', date: '2025-04-01', agencyId: 'ag_comics',
    customerName: 'キャンプロモーション', productName: 'DX定額制＋GXeラーニング', category: 'DX・GX',
    amount: 1100000, isTraining: false, source: 'import',
  },
  {
    id: 's002', month: '2025-04', date: '2025-04-09', agencyId: 'ag_adh',
    customerName: 'かーきよ', productName: 'DX+GX定額制', category: 'DX・GX',
    amount: 3300000, isTraining: false, source: 'import',
  },
  {
    id: 's003', month: '2025-04', date: '2025-04-23', agencyId: 'ag_keplanning',
    customerName: '星野電業社', productName: '定額制', category: '定額制',
    amount: 330000, isTraining: false, source: 'import',
  },
  {
    id: 's004', month: '2025-04', date: '2025-04-23', agencyId: 'ag_mmh',
    customerName: '.関自動車', productName: 'DX定額制＋GXeラーニング', category: 'DX・GX',
    amount: 550000, isTraining: false, source: 'import',
  },
  {
    id: 's005', month: '2025-04', date: '2025-04-30', agencyId: 'ag_leap',
    customerName: '貞末', productName: 'DX+GX定額制', category: 'DX・GX',
    amount: 5280000, isTraining: false, source: 'import',
  },
];
