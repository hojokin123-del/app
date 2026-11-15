import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Trash2, FileSpreadsheet, HardDrive, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSales, isSalesData } from '../store/salesStore';
import { KPI_KEYS, KPI_LABELS } from '../types/sales';
import { PageHeader } from './sales/PageHeader';
import { TODAY } from '../data/calendar';

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function DataPage() {
  const { reps, records, initiatives, saveStatus, lastSavedAt, exportJson, replaceAll, resetToSample, clearAll } = useSales();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const exportCsv = () => {
    const head = ['担当者', 'チーム', '月', '予算(万円)', '実績(万円)', '見込み(万円)', ...KPI_KEYS.flatMap(k => [`${KPI_LABELS[k]}目標`, `${KPI_LABELS[k]}実績`])];
    const rows = records
      .slice()
      .sort((a, b) => a.repId.localeCompare(b.repId) || a.month.localeCompare(b.month))
      .map(r => {
        const rep = reps.find(x => x.id === r.repId);
        return [rep?.name ?? r.repId, rep?.team ?? '', r.month, r.budget, r.actual ?? '', r.forecast ?? '', ...KPI_KEYS.flatMap(k => [r.kpi[k].target, r.kpi[k].actual ?? ''])];
      });
    const csv = [head, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    download(`sales_budget_kpi_${TODAY}.csv`, '﻿' + csv, 'text/csv');
  };

  const onImport = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isSalesData(parsed)) throw new Error('形式が正しくありません');
      if (!confirm(`「${file.name}」の内容で現在のデータを置き換えます。よろしいですか？`)) return;
      replaceAll(parsed);
      setMessage({ ok: true, text: `読み込みました（担当者 ${parsed.reps.length}名・施策 ${parsed.initiatives.length}件）` });
    } catch (e) {
      setMessage({ ok: false, text: `読み込めませんでした：${e instanceof Error ? e.message : String(e)}` });
    }
  };

  return (
    <div className="page">
      <PageHeader title="データ管理" hideRepFilter />

      <div className="card data-status">
        {saveStatus === 'saved' ? (
          <><CheckCircle2 size={20} className="text-good" /><div><strong>自動保存されています</strong><div className="activity-meta">入力内容はこのブラウザに自動で保存され、再読み込みしても残ります。{lastSavedAt && ` 最終保存：${new Date(lastSavedAt).toLocaleString('ja-JP')}`}</div></div></>
        ) : (
          <><AlertTriangle size={20} className="text-critical" /><div><strong className="text-critical">保存できませんでした</strong><div className="activity-meta">ブラウザの保存領域が使えない状態です（プライベートモード・容量不足など）。バックアップをダウンロードしてください。</div></div></>
        )}
      </div>

      <div className="data-grid">
        <div className="card">
          <div className="card-header"><h2><HardDrive size={18} /> 現在のデータ</h2></div>
          <table className="table">
            <tbody>
              <tr><td>担当者</td><td className="num">{reps.length}名</td></tr>
              <tr><td>予実・KPIレコード</td><td className="num">{records.length}件</td></tr>
              <tr><td>施策</td><td className="num">{initiatives.length}件</td></tr>
            </tbody>
          </table>
          <p className="sales-footnote data-note">
            ※ 保存先はこのブラウザ内のみです。別のパソコンやブラウザとは共有されません。
            定期的にバックアップ（JSON）をダウンロードし、別の端末ではそのファイルを読み込んでください。
          </p>
        </div>

        <div className="card">
          <div className="card-header"><h2>バックアップ・書き出し</h2></div>
          <div className="data-actions">
            <div className="data-action">
              <div><strong>バックアップをダウンロード</strong><div className="activity-meta">すべてのデータをJSONファイルで保存します</div></div>
              <button className="btn btn-primary btn-sm" onClick={() => download(`sales_backup_${TODAY}.json`, exportJson(), 'application/json')}><Download size={14} /> ダウンロード</button>
            </div>
            <div className="data-action">
              <div><strong>バックアップから復元</strong><div className="activity-meta">JSONファイルを読み込み、現在のデータを置き換えます</div></div>
              <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> ファイルを選択</button>
              <input
                ref={fileRef} type="file" accept="application/json,.json" hidden
                onChange={e => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ''; }}
              />
            </div>
            <div className="data-action">
              <div><strong>予実・KPIをCSVで書き出し</strong><div className="activity-meta">Excelで開ける形式（担当者×月）</div></div>
              <button className="btn btn-secondary btn-sm" onClick={exportCsv}><FileSpreadsheet size={14} /> CSV出力</button>
            </div>
            {message && <div className={`data-message ${message.ok ? 'ok' : 'ng'}`}>{message.text}</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>リセット</h2></div>
          <div className="data-actions">
            <div className="data-action">
              <div><strong>サンプルデータに戻す</strong><div className="activity-meta">現在のデータを消去し、デモ用のサンプルを読み込みます</div></div>
              <button className="btn btn-secondary btn-sm" onClick={() => { if (confirm('現在のデータを消去してサンプルデータに戻します。よろしいですか？')) resetToSample(); }}><RotateCcw size={14} /> サンプルに戻す</button>
            </div>
            <div className="data-action">
              <div><strong>すべて削除して空から始める</strong><div className="activity-meta">担当者・予実・施策をすべて削除します（元に戻せません）</div></div>
              <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('すべてのデータを削除します。元に戻せません。よろしいですか？')) clearAll(); }}><Trash2 size={14} /> すべて削除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
