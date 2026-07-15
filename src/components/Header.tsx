import { useEffect, useState } from 'react';
import { PhoneCall } from 'lucide-react';
import { BRAND, CTA_LABEL } from './site';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <div className="container header-inner">
        <a href="#top" className="brand brand-onhero">
          <span className="logo-mark">
            <PhoneCall size={22} />
          </span>
          <span>
            <span className="brand-sub">Ai</span> CALL
          </span>
        </a>
        <nav className="nav">
          <a href="#problems">課題</a>
          <a href="#how">仕組み</a>
          <a href="#usecases">活用例</a>
          <a href="#why">選ばれる理由</a>
          <a href="#pricing">料金</a>
        </nav>
        <a href="#contact" className="btn btn-primary" aria-label={`${BRAND}に${CTA_LABEL}`}>
          {CTA_LABEL}
        </a>
      </div>
    </header>
  );
}
