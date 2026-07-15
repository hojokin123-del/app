import { Check } from 'lucide-react';
import { CTA_LABEL } from './site';

const features = [
  '初期費用0円・回線工事不要',
  '1コール50円のシンプル従量課金',
  '24時間365日 自動対応',
  'LINE・Slack・Chatwork へ通知',
  '録音データ＋テキストで記録',
  '緊急時はスタッフへ賢く転送',
];

export function Pricing() {
  return (
    <section className="section pricing" id="pricing">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">料金プラン</span>
          <h2 className="section-title">
            始めやすい、<span className="hl">わかりやすい料金</span>
          </h2>
        </div>

        <div className="price-card reveal">
          <span className="ribbon">業界最安値クラス</span>
          <div className="plan-name">スタンダードプラン</div>
          <div className="amount">
            <span className="yen">月額</span>15,000<small>円〜</small>
          </div>
          <p className="price-caption">初期費用0円 ／ 1コール50円（従量課金）</p>
          <ul className="price-list">
            {features.map((f) => (
              <li key={f}>
                <Check size={20} className="ck" />
                {f}
              </li>
            ))}
          </ul>
          <a href="#contact" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            {CTA_LABEL}
          </a>
        </div>
      </div>
    </section>
  );
}
