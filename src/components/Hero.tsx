import { Bot, ArrowRight, Bell, CheckCircle2 } from 'lucide-react';
import { CTA_LABEL } from './site';

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-lines" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="hero-badge">
            24時間365日休まない次世代のAI電話秘書
            <br />
            『<span className="brandname">Ai CALL</span>』
          </div>
          <h1>
            電話対応で<span className="q">「目の前のお客様」</span>と
            <br />
            <span className="mark">「売上」</span>を逃していませんか？
          </h1>
          <p className="hero-sub">
            かかってきた電話にAIが人のように応対し、要件をテキスト化。
            LINE・Slack・Chatworkへリアルタイム通知。あなたは手が空いた時に確認するだけ。
          </p>
          <div className="hero-cta">
            <a href="#contact" className="btn btn-primary btn-lg">
              {CTA_LABEL} <ArrowRight size={20} />
            </a>
            <a href="#how" className="btn btn-ghost btn-lg">
              仕組みを見る
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-float f1">
            <Bell size={18} className="ic" />
            新着の予約が入りました
          </div>
          <div className="hero-float f2">
            <CheckCircle2 size={18} className="ic" />
            営業電話をブロック済み
          </div>
          <div className="hero-phone" aria-hidden="true">
            <div className="hero-screen">
              <div className="avatar">
                <Bot size={30} />
              </div>
              <div className="screen-title">Ai CALL</div>
              <div className="screen-status">● AI 応対中</div>
              <div className="chat-bubble ai">お電話ありがとうございます。ご用件をお伺いします。</div>
              <div className="chat-bubble user">明日18時に3名で予約したいです</div>
              <div className="chat-bubble ai">
                かしこまりました。明日18時・3名様で承ります。担当へ通知しました。
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
