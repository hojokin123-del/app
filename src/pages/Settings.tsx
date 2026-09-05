import { useState } from 'react';
import { Save, X, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Settings() {
  const { settings, updateSettings } = useApp();
  const [form, setForm] = useState(settings);
  const [keyword, setKeyword] = useState('');
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setSaved(false);
  };

  const addKeyword = () => {
    const k = keyword.trim();
    if (k && !form.trainingKeywords.includes(k)) {
      set('trainingKeywords', [...form.trainingKeywords, k]);
    }
    setKeyword('');
  };

  const removeKeyword = (k: string) =>
    set('trainingKeywords', form.trainingKeywords.filter(x => x !== k));

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>設定</h1>
        <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> 保存</button>
      </div>

      {saved && <p style={{ color: 'var(--success)', fontSize: 14 }}>設定を保存しました。</p>}

      <div className="settings-grid">
        <div className="card">
          <div className="card-header"><h2>会社・支払設定</h2></div>
          <div style={{ padding: 20 }}>
            <div className="form-group">
              <label>自社名（支払明細書の発行元）</label>
              <input value={form.companyName} onChange={e => set('companyName', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>消費税率（％）</label>
                <input
                  type="number" min={0} max={100} step={0.1}
                  value={Math.round(form.taxRate * 1000) / 10}
                  onChange={e => set('taxRate', (parseFloat(e.target.value) || 0) / 100)}
                />
              </div>
              <div className="form-group">
                <label>標準振込手数料（円）</label>
                <input
                  type="number" min={0} step={1}
                  value={form.transferFee}
                  onChange={e => set('transferFee', parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>支払日</label>
              <select value={form.paymentDay} onChange={e => set('paymentDay', parseInt(e.target.value, 10))}>
                <option value={0}>月末</option>
                {[10, 15, 20, 25].map(d => <option key={d} value={d}>毎月{d}日</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2>研修判定キーワード</h2></div>
          <div style={{ padding: 20 }}>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
              スプレッドシート連携や売上登録の際、研修内容・区分にこれらの語を含む行を「研修」として自動判定します。
            </p>
            <div className="settings-add-row" style={{ padding: 0, border: 'none', marginBottom: 12 }}>
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                placeholder="キーワードを追加（例：研修）"
              />
              <button className="btn btn-secondary" onClick={addKeyword}><Plus size={16} /> 追加</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {form.trainingKeywords.map(k => (
                <span key={k} className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {k}
                  <button
                    className="icon-btn" style={{ width: 18, height: 18, border: 'none', background: 'transparent' }}
                    onClick={() => removeKeyword(k)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {form.trainingKeywords.length === 0 && <span className="text-muted">キーワードがありません</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>フィー計算方式</h2></div>
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>
            本システムは <strong>オーバーライド型</strong> で計算します。
          </p>
          <ul style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 20, color: 'var(--text-muted)' }}>
            <li>二次代理店が販売した売上に対し、<strong>二次代理店は自社率</strong>を計上</li>
            <li>同じ売上に対し、所属する<strong>一次代理店は一次率</strong>をオーバーライドとして計上</li>
            <li>一次代理店の直販は<strong>一次率のみ</strong>を計上</li>
          </ul>
          <p className="text-muted" style={{ fontSize: 13 }}>
            各代理店の率は「代理店マスター」で個別に登録します。
          </p>
        </div>
      </div>
    </div>
  );
}
