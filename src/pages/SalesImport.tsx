import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wand2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Sale } from '../types';
import { detectTraining } from '../lib/feeCalc';
import { formatYen } from '../lib/format';

// スプレッドシート「石川決済（西河マネジメントセンター）」シート「2025.4～」の入金台帳の例。
// 「代理店」列（3列目）に会社名が入っており、かつ「入金」がある行だけを転記対象とします。
// AMEX等の経費行（入金なし）、代理店が空欄の行（例：アサユサイト）は自動的に対象外になります。
const SAMPLE = `ランク,,代理店,顧客名,種類,日付,入金,報酬分,預かり料,差し引き,振込手数料,残高
,,コミクス,キャンプロモーション,DX定額制＋GXeラーニング,4月1日,1100000,,,1100000,,8214126
,,,村上さん,業務委託,4月2日,,,,(54500),660,7114126
,,ADH,かーきよ,DX+GX定額制,4月9日,3300000,,,3300000,,10150060
,,AMEX,ChatGPT,,4月10日,,,,(3366),,9904254
,,,アサユサイト,DX+GX定額制,4月15日,660000,,,660000,,5956670
,,ｹｰﾌﾟﾗﾝﾆﾝｸﾞ,星野電業社,定額制,4月23日,330000,,,330000,,1181781
,,MMH,.関自動車,DX定額制＋GXeラーニング,4月23日,550000,,,550000,,1731231
,,Leap,貞末,DX+GX定額制,4月30日,5280000,,,5280000,,852441`;

type ParsedRow = {
  key: number;
  sellerName: string;   // 代理店列の原文
  customerName: string;
  productName: string;
  dateRaw: string;
  amount: number;
  isTraining: boolean;
  hasAgency: boolean;   // 代理店列に会社名が入っているか
  include: boolean;
  agencyId: string;     // 解決した代理店ID（未解決は空）
};

/** ヘッダ名 → 内部キー */
const COLUMN_ALIASES: Record<string, string[]> = {
  seller: ['代理店', '一次代理店', '販売代理店', '導線'],
  seller2: ['二次代理店', '2次代理店'],
  customer: ['顧客名', '顧客先', '顧客', 'クライアント', '会社名'],
  date: ['日付', '入金日', '売上日'],
  amount: ['入金', '研修費用', '金額', '売上', '売上金額'],
  product: ['種類', '内容', '研修内容', '商材', '商品'],
};

function findColIndex(headers: string[], keys: string[]): number {
  for (const k of keys) {
    const i = headers.findIndex(h => h === k);
    if (i >= 0) return i;
  }
  return -1;
}

function parseAmount(s: string): number {
  if (!s) return 0;
  const neg = s.includes('(') || s.includes('（') || s.trim().startsWith('-') || s.trim().startsWith('▲');
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
  return neg ? -n : n;
}

/** 代理店列の値が「会社名」か（空欄・日付・数値・カード名などを除外） */
function isCompanyName(s: string): boolean {
  const v = s.trim();
  if (!v) return false;
  if (/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(v)) return false; // 2025/03/31 のような日付
  if (/^[\d,.\s¥]+$/.test(v)) return false;                   // 数値のみ
  if (v.toUpperCase() === 'AMEX') return false;               // カード名（経費行）
  return true;
}

/** "4月30日" / "2025/4/30" / "2025-04-30" を YYYY-MM-DD へ（年は補完） */
function parseDate(raw: string, defaultYear: number): string {
  const s = raw.trim();
  let y = defaultYear, m = 0, d = 1;
  let match = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (match) {
    y = +match[1]; m = +match[2]; d = +match[3];
  } else {
    match = s.match(/(\d{1,2})月(\d{1,2})日?/);
    if (match) { m = +match[1]; d = +match[2]; }
    else {
      match = s.match(/(\d{1,2})月/); // 「4月」など日なし
      if (match) { m = +match[1]; d = 1; }
      else {
        match = s.match(/(\d{1,2})[/-](\d{1,2})/);
        if (match) { m = +match[1]; d = +match[2]; }
      }
    }
  }
  if (!m) return `${y}-01-01`;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function SalesImport() {
  const { agencies, addSales, settings } = useApp();
  const [raw, setRaw] = useState('');
  const [year, setYear] = useState(2025);
  const [agencyOnly, setAgencyOnly] = useState(true);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(0);

  const matchAgency = (name: string): string => {
    if (!name) return '';
    const clean = name.trim();
    const exact = agencies.find(a => a.name === clean);
    if (exact) return exact.id;
    const partial = agencies.find(a => clean.includes(a.name) || a.name.includes(clean));
    return partial?.id ?? '';
  };

  const parse = () => {
    setError('');
    setDone(0);
    const text = raw.trim();
    if (!text) { setError('データを貼り付けてください。'); return; }

    const delimiter = text.includes('\t') ? '\t' : ',';
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) { setError('ヘッダ行とデータ行が必要です。'); return; }

    const headers = lines[0].split(delimiter).map(h => h.trim());
    const idx = {
      seller: findColIndex(headers, COLUMN_ALIASES.seller),
      seller2: findColIndex(headers, COLUMN_ALIASES.seller2),
      customer: findColIndex(headers, COLUMN_ALIASES.customer),
      date: findColIndex(headers, COLUMN_ALIASES.date),
      amount: findColIndex(headers, COLUMN_ALIASES.amount),
      product: findColIndex(headers, COLUMN_ALIASES.product),
    };

    if (idx.amount < 0) {
      setError('「入金」または「金額」列が見つかりません。ヘッダ行をご確認ください。');
      return;
    }
    if (idx.seller < 0 && idx.seller2 < 0) {
      setError('「代理店」列が見つかりません。ヘッダ行をご確認ください。');
      return;
    }

    const parsed: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(delimiter).map(c => c.trim());
      const amount = parseAmount(cells[idx.amount] ?? '');
      if (amount <= 0) continue; // 入金の無い行（経費・支出）はスキップ

      const seller2 = idx.seller2 >= 0 ? (cells[idx.seller2] ?? '') : '';
      const seller1 = idx.seller >= 0 ? (cells[idx.seller] ?? '') : '';
      const sellerName = seller2 || seller1 || '';
      const hasAgency = isCompanyName(sellerName);
      const customerName = idx.customer >= 0 ? (cells[idx.customer] ?? '') : '';
      const productName = idx.product >= 0 ? (cells[idx.product] ?? '') : '';

      parsed.push({
        key: i,
        sellerName,
        customerName: customerName || sellerName,
        productName: productName || '—',
        dateRaw: idx.date >= 0 ? (cells[idx.date] ?? '') : '',
        amount,
        isTraining: detectTraining(`${productName} ${customerName}`, settings.trainingKeywords),
        hasAgency,
        include: hasAgency, // 代理店が入っている行を既定でチェック
        agencyId: hasAgency ? matchAgency(sellerName) : '',
      });
    }

    if (parsed.length === 0) { setError('取り込めるデータ行（入金あり）が見つかりませんでした。'); return; }
    setRows(parsed);
  };

  const updateRow = (key: number, patch: Partial<ParsedRow>) =>
    setRows(prev => prev?.map(r => (r.key === key ? { ...r, ...patch } : r)) ?? null);

  const visibleRows = rows?.filter(r => !agencyOnly || r.hasAgency) ?? [];
  const targetRows = visibleRows.filter(r => r.include);
  const unmatched = targetRows.filter(r => !r.agencyId);

  const transfer = () => {
    if (!rows) return;
    if (unmatched.length > 0) {
      setError(`代理店が未解決の行が${unmatched.length}件あります。代理店を選択してください。`);
      return;
    }
    const items: Omit<Sale, 'id'>[] = targetRows.map(r => {
      const date = parseDate(r.dateRaw, year);
      return {
        month: date.slice(0, 7),
        date,
        agencyId: r.agencyId,
        customerName: r.customerName,
        productName: r.productName,
        category: r.isTraining ? '研修' : 'その他',
        amount: r.amount,
        isTraining: r.isTraining,
        source: 'import',
      };
    });
    addSales(items);
    setDone(items.length);
    setRows(null);
    setRaw('');
  };

  return (
    <div className="page">
      <div className="breadcrumb" style={{ marginBottom: 16 }}>
        <Link to="/sales" className="back-link"><ArrowLeft size={16} /> 売上データ</Link>
      </div>
      <div className="page-header">
        <h1>スプレッドシート連携（代理店売上の抽出・転記）</h1>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
          売上のベースとなるスプレッドシート（例：「2025.4～」の入金台帳）から、
          <strong>ランク〜残高</strong>を含む範囲をコピーして貼り付けてください。
          <strong>「代理店」列に会社名が入っており、かつ「入金」がある行</strong>を自動抽出し、
          <strong>入金日の月</strong>をキーに売上データへ転記します。
          経費行（入金なし・AMEX等）や代理店が空欄の行は対象外になります。
          カンマ区切り／タブ区切り（スプレッドシートから直接コピー）に対応しています。
        </p>
        <div className="form-row" style={{ marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>日付の年（「4月30日」形式の補完用）</label>
            <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value, 10) || 2025)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, justifyContent: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={agencyOnly} onChange={e => setAgencyOnly(e.target.checked)} />
              代理店が入っている行のみ転記する
            </label>
          </div>
        </div>
        <textarea
          className="comment-input"
          style={{ minHeight: 140, fontFamily: 'monospace', fontSize: 12 }}
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder={'ランク,,代理店,顧客名,種類,日付,入金,...\n,,コミクス,キャンプロモーション,DX定額制＋GXeラーニング,4月1日,1100000,...'}
        />
        <div className="action-bar">
          <button className="btn btn-secondary" onClick={() => setRaw(SAMPLE)}>サンプルを挿入</button>
          <button className="btn btn-primary" onClick={parse}><Wand2 size={16} /> 解析する</button>
        </div>
        {error && <p className="error-msg"><AlertTriangle size={14} style={{ verticalAlign: 'middle' }} /> {error}</p>}
        {done > 0 && (
          <p style={{ color: 'var(--success)', fontSize: 14 }}>
            <CheckCircle size={16} style={{ verticalAlign: 'middle' }} /> {done}件の売上を転記しました。
            <Link to="/sales" style={{ marginLeft: 8 }}>売上データを確認</Link>
          </p>
        )}
      </div>

      {rows && (
        <>
          <div className="card">
            <div className="card-header">
              <h2>取込プレビュー</h2>
              <span className="text-muted" style={{ fontSize: 13 }}>
                表示 {visibleRows.length}件 / 転記対象 {targetRows.length}件
                {unmatched.length > 0 && `（代理店未解決 ${unmatched.length}件）`}
              </span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>転記</th><th>代理店（原文）</th><th>→ 代理店マスター</th>
                  <th>顧客名</th><th>種類</th><th>入金日</th>
                  <th style={{ textAlign: 'right' }}>入金</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map(r => (
                  <tr key={r.key} style={{ opacity: r.include ? 1 : 0.5 }}>
                    <td>
                      <input type="checkbox" checked={r.include} onChange={e => updateRow(r.key, { include: e.target.checked })} />
                    </td>
                    <td>
                      {r.sellerName || '-'}
                      {!r.hasAgency && <span className="text-muted" style={{ fontSize: 11 }}>（代理店なし）</span>}
                    </td>
                    <td>
                      <select
                        className="filter-select" style={{ padding: '4px 8px', fontSize: 13 }}
                        value={r.agencyId}
                        onChange={e => updateRow(r.key, { agencyId: e.target.value })}
                      >
                        <option value="">未選択</option>
                        {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </td>
                    <td>{r.customerName}</td>
                    <td>{r.productName}</td>
                    <td>{r.dateRaw || '-'}</td>
                    <td style={{ textAlign: 'right' }}>{formatYen(r.amount)}</td>
                  </tr>
                ))}
                {visibleRows.length === 0 && (
                  <tr><td colSpan={7} className="empty-row">対象の行がありません</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="action-bar">
            <button className="btn btn-secondary" onClick={() => setRows(null)}>キャンセル</button>
            <button className="btn btn-primary" disabled={targetRows.length === 0} onClick={transfer}>
              {targetRows.length}件を売上データへ転記
            </button>
          </div>
        </>
      )}
    </div>
  );
}
