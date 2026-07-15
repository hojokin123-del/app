import { ArrowRight, PhoneCall } from 'lucide-react';
import { CTA_LABEL } from './site';

export function FinalCTA() {
  return (
    <section className="section final-cta" id="contact">
      <div className="cta-lines" />
      <div className="container inner reveal">
        <h2>
          電話対応を、<span className="hl">AIにおまかせ</span>しませんか？
        </h2>
        <p>
          今の電話番号のまま、最短即日でスタート。まずはお気軽にご相談ください。
          あなたのビジネスに合わせた活用方法をご提案します。
        </p>
        <div className="cta-buttons">
          <a href="#contact" className="btn btn-primary btn-lg">
            {CTA_LABEL} <ArrowRight size={20} />
          </a>
          <a href="tel:0120-000-000" className="btn btn-ghost btn-lg">
            <PhoneCall size={20} /> 0120-000-000
          </a>
        </div>
        <p className="cta-note">受付時間：平日 10:00〜19:00 ／ フォームは24時間受付</p>
      </div>
    </section>
  );
}
