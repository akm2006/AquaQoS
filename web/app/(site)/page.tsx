import { KnownLimits } from "./_components/KnownLimits";
import { Reveal } from "./_components/Reveal";
import { SectionLabel } from "./_components/SectionLabel";
import { Hero } from "./_components/landing/Hero";
import { MechanismGrid } from "./_components/landing/MechanismGrid";
import { ProblemSection } from "./_components/landing/ProblemSection";
import { StackMarquee } from "./_components/landing/StackMarquee";
import { VerifyTiers } from "./_components/landing/VerifyTiers";

// Section order follows docs/APP_REFACTOR_GUIDE.md §4.1. Numbers come from
// _lib/landing-evidence.ts, which derives them from the checked report at build time.
export default function Page() {
  return (
    <main id="main" className="landing">
      <Hero />
      <ProblemSection />
      <MechanismGrid />
      <VerifyTiers />
      <section className="landing-section" aria-labelledby="limits">
        <SectionLabel index="004">{"// SECTION: KNOWN_LIMITS"}</SectionLabel>
        <h2 id="limits" className="section-title">
          Where the prototype stops.
        </h2>
        <Reveal>
          <KnownLimits />
        </Reveal>
      </section>
      <StackMarquee />
    </main>
  );
}
