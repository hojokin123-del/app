import { useEffect } from 'react';

/**
 * 画面内に入った要素に .visible を付与して、ふわっと表示させる。
 * .reveal クラスを持つ要素を監視する。
 */
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

    // JSが動いている時だけ隠す（=JS無効やSEOでは常に表示される）
    root.classList.add('reveal-ready');

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
