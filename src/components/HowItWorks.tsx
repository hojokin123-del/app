import { MessageSquareText, BrainCircuit, Smartphone } from 'lucide-react';

const steps = [
  {
    icon: <MessageSquareText size={30} />,
    title: '自然な会話で応対',
    text: '「1番を押してください」というような昔ながらの機械音ではありません。AIが人のように、自然な言葉でお客様をお迎えします。',
  },
  {
    icon: <BrainCircuit size={30} />,
    title: 'AIが要件をヒアリング',
    text: 'AIがまるで人間のように、自然な会話でお客様の要件を丁寧にヒアリング。予約日時や人数、問い合わせ内容を正確に聞き取ります。',
  },
  {
    icon: <Smartphone size={30} />,
    title: 'テキストで即時通知',
    text: '聞いた内容は即座にテキスト化され、録音データと一緒に普段お使いのスマホやパソコン（LINE・Slack・Chatworkなど）へリアルタイムで通知されます。',
  },
];

export function HowItWorks() {
  return (
    <section className="section how" id="how">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">仕組み</span>
          <h2 className="section-title">
            電話が鳴っても、<span className="hl">もう手を止めなくていい</span>
          </h2>
        </div>

        <div className="intro reveal">
          『<span className="brandname">Ai CALL</span>』は、あなたの代わりに最新のAIが
          電話対応を完璧にこなすサービスです。
        </div>

        <div className="steps">
          {steps.map((s, i) => (
            <div className="step-card reveal" key={i}>
              <span className="step-num">{i + 1}</span>
              <div className="step-ic">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>

        <div className="how-result reveal">
          あなたは、手が空いた時に<span className="hl">スマホの文字を見るだけでOK</span>です！
        </div>
      </div>
    </section>
  );
}
