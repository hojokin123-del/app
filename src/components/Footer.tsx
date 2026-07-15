import { PhoneCall } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="brand">
              <span className="logo-mark">
                <PhoneCall size={22} />
              </span>
              <span>
                <span className="brand-sub">Ai</span> CALL
              </span>
            </div>
            <p className="footer-desc">
              24時間365日休まない、次世代のAI電話秘書。
              あなたの代わりに電話対応を完璧にこなします。
            </p>
            <p className="footer-company">
              運営会社：株式会社西河マネジメントセンター
              <br />
              所在地：京都府乙訓郡大山崎町円明寺北浦2-6
              <br />
              お問い合わせ：050-1720-7729
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>サービス</h4>
              <a href="#how">仕組み</a>
              <a href="#usecases">活用例</a>
              <a href="#why">選ばれる理由</a>
              <a href="#pricing">料金プラン</a>
            </div>
            <div className="footer-col">
              <h4>お問い合わせ</h4>
              <a href="#contact">無料相談</a>
              <a href="#contact">資料請求</a>
              <a href="#contact">導入の流れ</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} 株式会社西河マネジメントセンター All rights reserved.
        </div>
      </div>
    </footer>
  );
}
