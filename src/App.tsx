import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatsStrip } from './components/StatsStrip';
import { Problems } from './components/Problems';
import { Solution } from './components/Solution';
import { HowItWorks } from './components/HowItWorks';
import { UseCases } from './components/UseCases';
import { WhyChosen } from './components/WhyChosen';
import { Pricing } from './components/Pricing';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { useReveal } from './components/useReveal';

export default function App() {
  useReveal();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsStrip />
        <Problems />
        <Solution />
        <HowItWorks />
        <UseCases />
        <WhyChosen />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
