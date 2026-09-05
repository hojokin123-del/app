import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wand2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Sale } from '../types';
import { detectTraining } from '../lib/feeCalc';
import { formatYen } from '../lib/format';

// スプレッドシート「石川決済（西河マネジメントセンター）」シート「Leap代理店リスト」より
const SAMPLE = `二次代理店,顧客先,入金日,研修費用,代理店手数料,2次代理店手数料
貞末,RELIFE,5月22日,3000000,1650000,1350000
SSC,successful,5月29日,6000000,3300000,2700000
Leap天馬堂,志力工業,6月12日,600000,330000,270000
Leap天馬堂,ROTT,6月25日,600000,330000,270000
SSC,アラタガーデン,6月30日,1800000,990000,810000
貞末,前田電業,6月30日,1200000,660000,540000
天馬堂,CAFUNE,6月30日,3564000,1960200,1603800`;

type ParsedRow = {
  key: number;
  sellerName: string;   // 販売代理店名（原文）
  customerName: string;
  productName: string;
  dateRaw: string;
  amount: number;
  isTraining: boolean;
  include: boolean;
  agencyId: string;     // 解決した代理店ID（未解決は空）
};

/** ヘッダ名 → 内部キー */
const COLUMN_ALIASES: Record<string, string[]> = {
  seller2: ['二次代理店', '2次代理店', '二次'],
  seller1: ['代理店', '一次代理店', '販売代理店', '会社名'],
  customer: ['顧客先', '顧客', 'クライアント', '会社名'],
  date: ['入金日', '日付', '売上日'],
  amount: ['研修費用', '金額', '入金', '売上', '売上金額'],
  product: ['内容', '研修内容', '商材', '種類', '商品'],
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
  const neg = /[()（）▲-]/.test(s.trim().charAt(0)) || s.includes('(');
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
  return neg ? -n : n;
}

/** "5月22日" / "2025/5/22" / "2025-05-22" を YYYY-MM-DD へ（年は補完） */
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
      match = s.match(/(\d{1,2})[/-](\d{1,2})/);
      if (match) { m = +match[1]; d = +match[2]; }
    }
  }
  if (!m) return `${y}-01-01`;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function SalesImport() {
  const { agencies, addSales, settings } = useApp();
  const [raw, setRaw] = useState('');
  const [year, setYear] = useState(2025);
  const [trainingOnly, setTrainingOnly] = useState(true);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(0);

  const matchAgency = (name: string): string => {
    if (!name) return '';
    const clean = name.trim();
    // 完全一致 → 部分一致（「Leap天馬堂」→「天馬堂」など）
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
      seller2: findColIndex(headers, COLUMN_ALIASES.seller2),
      seller1: findColIndex(headers, COLUMN_ALIASES.seller1),
      customer: findColIndex(headers, COLUMN_ALIASES.customer),
      date: findColIndex(headers, COLUMN_ALIASES.date),
      amount: findColIndex(headers, COLUMN_ALIASES.amount),
      product: findColIndex(headers, COLUMN_ALIASES.product),
    };

    if (idx.amount < 0) {
      setError('「研修費用」または「金額」列が見つかりません。ヘッダ行をご確認ください。');
      return;
    }

    const parsed: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(delimiter).map(c => c.trim());
      const amount = parseAmount(cells[idx.amount] ?? '');
      if (amount <= 0) continue; // 空行・支出行はスキップ

      const seller2 = idx.seller2 >= 0 ? cells[idx.seller2] : '';
      const seller1 = idx.seller1 >= 0 ? cells[idx.seller1] : '';
      const sellerName = seller2 || seller1 || '';
      const customerName = idx.customer >= 0 ? (cells[idx.customer] ?? '') : '';
      const productName = idx.product >= 0 ? (cells[idx.product] ?? '') : '研修費用';
      // 研修費用列があるデータ、または内容が研修キーワードを含む → 研修
      const isTraining =
        headers.some(h => COLUMN_ALIASES.amount.slice(0, 1).includes(h)) /* 「研修費用」列 */ ||
        detectTraining(`${productName} ${customerName}`, settings.trainingKeywords);

      parsed.push({
        key: i,
        sellerName,
        customerName: customerName || sellerName,
        productName: productName || '研修費用',
        dateRaw: idx.date >= 0 ? (cells[idx.date] ?? '') : '',
        amount,
        isTraining,
        include: isTraining, // 研修のみ既定でチェック
        agencyId: matchAgency(sellerName),
      });
    }

    if (parsed.length === 0) { setError('取り込めるデータ行が見つかりませんでした。'); return; }
    setRows(parsed);
  };

  const updateRow = (key: number, patch: Partial<ParsedRow>) =>
    setRows(prev => prev?.map(r => (r.key === key ? { ...r, ...patch } : r)) ?? null);

  const targetRows = rows?.filter(r => r.include && (!trainingOnly || r.isTraining)) ?? [];
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
        <h1>スプレッドシート連携（研修抽出・転記）</h1>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
          売上のベースとなるスプレッドシート（例：「Leap代理店リスト」「MMH精算リスト」）から、
          <strong>二次代理店・顧客先・入金日・研修費用</strong> を含む範囲をコピーして貼り付けてください。
          研修に関する行（研修費用・研修キーワードを含む行）を自動で抽出し、売上データへ転記します。
          カンマ区切り／タブ区切り（スプレッドシートから直接コピー）に対応しています。
        </p>
        <div className="form-row" style={{ marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>日付の年（「5月22日」形式の補完用）</label>
            <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value, 10) || 2025)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, justifyContent: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={trainingOnly} onChange={e => setTrainingOnly(e.target.checked)} />
              研修に関するもののみ転記する
            </label>
          </div>
        </div>
        <textarea
          className="comment-input"
          style={{ minHeight: 140, fontFamily: 'monospace', fontSize: 12 }}
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder={'二次代理店,顧客先,入金日,研修費用,代理店手数料,2次代理店手数料\n貞末,RELIFE,5月22日,3000000,1650000,1350000'}
        />
        <div className="action-bar">
          <button className="btn btn-secondary" onClick={() => setRaw(SAMPLE)}>サンプルを挿入</button>
          <button className="btn btn-primary" onClick={parse}><Wand2 size={16} /> 解析する</button>
        </div>
        {error && <p className="error-msg"><AlertTriangle size={14} style={{ verticalAlign: 'middle' }} /> {error}</p>}
        {done > 0 && (
          <p style={{ color: 'var(--success)', fontSize: 14 }}>
            <CheckCircle size={16} style={{ verticalAlign: 'middle' }} /> {done}件の研修売上を転記しました。
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
                {rows.length}件中 転記対象 {targetRows.length}件
                {unmatched.length > 0 && `（未解決 ${unmatched.length}件）`}
              </span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>転記</th><th>販売代理店（原文）</th><th>→ 代理店マスター</th>
                  <th>顧客先</th><th>研修内容</th><th>入金日</th>
                  <th style={{ textAlign: 'right' }}>研修費用</th><th>研修</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.key} style={{ opacity: r.include && (!trainingOnly || r.isTraining) ? 1 : 0.5 }}>
                    <td>
                      <input type="checkbox" checked={r.include} onChange={e => updateRow(r.key, { include: e.target.checked })} />
                    </td>
                    <td>{r.sellerName || '-'}</td>
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
                    <td>
                      {r.isTraining
                        ? <span className="badge badge-success">研修</span>
                        : <span className="badge">対象外</span>}
                    </td>
                  </tr>
                ))}
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
