const stats = [
  { num: '60', unit: '%', label: '着信の約6割が営業電話などの非売上コール' },
  { num: '24', unit: '時間', label: '365日、夜間・休日も自動対応' },
  { num: '0', unit: '円', label: '初期費用・回線工事は一切不要' },
  { num: '50', unit: '円〜', label: '1コールあたりの業界最安値クラス' },
];

export function StatsStrip() {
  return (
    <section className="stats-strip">
      <div className="container stats-grid">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <div className="num">
              {s.num}
              <small>{s.unit}</small>
            </div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
