import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Cell as BarCell,
} from 'recharts';
import { PhoneOff, CalendarX, Wallet, MoonStar } from 'lucide-react';

const donutData = [
  { name: '営業電話など（非売上）', value: 60 },
  { name: '予約・問合せ', value: 40 },
];
const DONUT_COLORS = ['#ff6a00', '#d5d8de'];

const lossData = [
  { name: '平日営業時間内', value: 100 },
  { name: '平日夜間', value: 72 },
  { name: '土日祝日', value: 44 },
  { name: '大型連休', value: 20 },
];
const LOSS_COLORS = ['#3a3d44', '#54575f', '#8a8d95', '#c2c5cc'];

const pains = [
  {
    icon: <PhoneOff size={22} />,
    text: (
      <>
        <b>「営業電話ばかり」</b>で、スタッフの作業や集中力が途切れてしまう。
      </>
    ),
  },
  {
    icon: <CalendarX size={22} />,
    text: (
      <>
        ランチのピークや施術中で手が離せず、<b>「予約の電話」</b>を取り逃がしてしまっている。
      </>
    ),
  },
  {
    icon: <Wallet size={22} />,
    text: (
      <>
        電話代行サービスを使っているが、<b>「料金が高い」「対応がマニュアル通り」</b>で不満がある。
      </>
    ),
  },
  {
    icon: <MoonStar size={22} />,
    text: (
      <>
        営業時間外や休日の電話に出られず、<b>せっかくの見込み客</b>を逃している。
      </>
    ),
  },
];

export function Problems() {
  return (
    <section className="section problems" id="problems">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">こんな課題、ありませんか？</span>
          <h2 className="section-title">
            その電話、<span className="hl">本当に必要な1本</span>ですか？
          </h2>
          <p>お店や会社にかかってくる電話の多くは、売上につながらない営業電話。その裏で大切な機会を逃しています。</p>
        </div>

        <div className="problem-top">
          <div className="donut-card reveal">
            <span className="card-kicker">一般的な店舗の着信内訳</span>
            <div className="donut-wrap">
              <div style={{ width: 200, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={90}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      {donutData.map((_, i) => (
                        <Cell key={i} fill={DONUT_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="donut-callout">
                <span className="big">約60%</span>
                が『営業電話』などの非売上コール！
              </div>
            </div>
            <p style={{ marginTop: 16, color: 'var(--gray-500)', fontWeight: 600, fontSize: '0.9rem' }}>
              予約・問合せはわずか約40%。残りは対応する価値の低い電話に奪われています。
            </p>
          </div>

          <div className="loss-card reveal">
            <span className="card-kicker">営業時間外の対応モレによる機会損失</span>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lossData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#3a3d44' }}
                    axisLine={{ stroke: '#d5d8de' }}
                    tickLine={false}
                    interval={0}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {lossData.map((_, i) => (
                      <BarCell key={i} fill={LOSS_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ marginTop: 16, color: 'var(--gray-500)', fontWeight: 600, fontSize: '0.9rem' }}>
              高収益の機会があるのに、夜間・休日は電話に出られず<b style={{ color: 'var(--orange)' }}>大きな損失</b>に。
            </p>
          </div>
        </div>

        <div className="pain-grid">
          {pains.map((p, i) => (
            <div className="pain-card reveal" key={i}>
              <span className="pain-ic">{p.icon}</span>
              <p>{p.text}</p>
            </div>
          ))}
        </div>

        <div className="problem-banner reveal">
          <span className="arrow-down" />
          お店や会社の電話対応で、こんなストレスを抱えていませんか？
        </div>
      </div>
    </section>
  );
}
