import { UtensilsCrossed, Sparkles, Store, Briefcase } from 'lucide-react';

const cases = [
  {
    icon: <UtensilsCrossed size={26} />,
    title: '飲食店様',
    tag: 'ピーク時の「話し中」と「予約の取りこぼし」がゼロに！',
    text: '忙しい時間帯に何件同時に電話がかかってきても、AIがすべて同時に対応します（話し中になりません）。予約希望日時や人数をAIが聞き取るため、接客に集中しながら予約の取りこぼしを防ぎます。',
  },
  {
    icon: <Sparkles size={26} />,
    title: 'エステ・美容サロン様',
    tag: '施術の手を止めず、極上の空間を維持',
    text: '施術中に電話が鳴って、お客様をお待たせする必要はありません。AIが優しく丁寧に対応するため、お店のブランドイメージを損ないません。夜間の予約電話も自動で受付できます。',
  },
  {
    icon: <Store size={26} />,
    title: 'その他の実店舗様',
    tag: '道案内は自動で、緊急時だけスタッフへ',
    text: '「お店の場所がわからない」といった質問にはAIが自動でご案内。さらに「今、お店の前にいるんですが」といった本当に緊急の電話だけを、特定のスタッフのスマホに直接転送する「賢い振り分け」も可能です。',
  },
  {
    icon: <Briefcase size={26} />,
    title: '個人事業主・1人社長様',
    tag: 'うざい営業電話を完全ブロック！',
    text: '1日の大半を占める無駄な「営業電話」を、AIが営業目的だと見抜いて丁重にお断りします。あなたは価値ある商談や目の前の仕事にだけ、100%集中できる環境が手に入ります。',
  },
];

export function UseCases() {
  return (
    <section className="section usecases" id="usecases">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">活用例</span>
          <h2 className="section-title">
            どんなビジネスでも、<span className="mark">大きな効果</span>を発揮します。
          </h2>
        </div>

        <div className="uc-grid">
          {cases.map((c, i) => (
            <div className="uc-card reveal" key={i}>
              <div className="uc-head">
                <span className="uc-ic">{c.icon}</span>
                <h3>{c.title}</h3>
              </div>
              <span className="uc-tag">{c.tag}</span>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
