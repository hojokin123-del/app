import { Bot } from 'lucide-react';

export function Solution() {
  return (
    <section className="section solution">
      <div className="solution-lines" />
      <div className="container solution-inner reveal">
        <div className="bot">
          <Bot size={64} />
        </div>
        <h2>
          そのお悩み、
          <br />
          <span className="white-hl">AI</span>がすべて解決します！
        </h2>
        <p>最新のAIが、あなたの代わりに電話対応を完璧にこなします。</p>
      </div>
    </section>
  );
}
