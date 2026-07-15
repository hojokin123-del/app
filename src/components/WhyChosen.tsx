const reasons = [
  {
    n: '1',
    title: '業界最安値クラス！圧倒的な安さ',
    desc: '初期費用0円・月額15,000円〜／1コール50円。有人の電話代行や自社採用と比べて、コストを大幅に削減できます。',
  },
  {
    n: '2',
    title: '工事不要で「最短即日」スタート',
    desc: '面倒な回線工事や機材の設置は一切不要。今の電話番号を「ボイスワープ」設定するだけで、すぐに使い始められます。',
  },
  {
    n: '3',
    title: '24時間365日、絶対に休まない',
    desc: '夜間、深夜、休日、お盆や年末年始でも文句一つ言わずにキャッチ。取りこぼしのない体制を、追加料金なしで実現します。',
  },
];

type Mark = 'o' | 't' | 'x';
const rows: { label: string; ours: string; agent: [Mark, string]; staff: [Mark, string] }[] = [
  {
    label: '① 圧倒的な安さ',
    ours: '初期費用0円・月額15,000円〜／1コール50円',
    agent: ['t', '月額3万円〜'],
    staff: ['x', '人件費高騰・採用難'],
  },
  {
    label: '② 導入スピード',
    ours: '工事不要。ボイスワープ設定だけで最短即日スタート',
    agent: ['t', '数週間の準備期間'],
    staff: ['x', 'マニュアル作成・教育が必要'],
  },
  {
    label: '③ 対応時間',
    ours: '24時間365日、夜間・休日・連休も自動対応',
    agent: ['t', '夜間休日は別料金・対応不可'],
    staff: ['x', '営業時間外は出られない'],
  },
];

const markSymbol: Record<Mark, string> = { o: '◎', t: '△', x: '✕' };
const markClass: Record<Mark, string> = { o: 'mk-o', t: 'mk-t', x: 'mk-x' };

export function WhyChosen() {
  return (
    <section className="section why" id="why">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">選ばれる理由</span>
          <h2 className="section-title">
            <span className="hl">Ai CALL</span>が選ばれる3つの理由
          </h2>
        </div>

        <div className="reason-list">
          {reasons.map((r) => (
            <div className="reason-row reveal" key={r.n}>
              <span className="rnum">{r.n}</span>
              <div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="compare reveal">
          <table>
            <thead>
              <tr>
                <th aria-hidden="true" />
                <th className="ours">Ai CALL</th>
                <th>有人の電話代行</th>
                <th>自社スタッフ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td className="ours">
                    <span className="mk mk-o">◎</span>
                    <span className="cell-note">{row.ours}</span>
                  </td>
                  <td>
                    <span className={`mk ${markClass[row.agent[0]]}`}>{markSymbol[row.agent[0]]}</span>
                    <span className="cell-note">{row.agent[1]}</span>
                  </td>
                  <td>
                    <span className={`mk ${markClass[row.staff[0]]}`}>{markSymbol[row.staff[0]]}</span>
                    <span className="cell-note">{row.staff[1]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
