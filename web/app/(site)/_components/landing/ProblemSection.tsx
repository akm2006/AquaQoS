import { maxStrategies } from "../../_lib/copy";
import { recordedStep, sepolia, totals } from "../../_lib/landing-evidence";
import { num } from "../../_lib/format";
import { FrameHead } from "../FrameCard";
import { Reveal } from "../Reveal";
import { Scramble } from "../Scramble";
import { SectionLabel } from "../SectionLabel";

// Replaces the template's isometric render. Two independently funded virtual balances sit
// above the one real balance that has to settle them both (DESIGN.md §29: no stock 3D art).
function VirtualVsReal() {
  return (
    <figure className="fig">
      <FrameHead label="FIG.01 virtual_vs_real" meta="worked example" />
      <div className="fig-body">
        <svg viewBox="0 0 320 190" role="img" aria-label="Two virtual balances of 10,000 units each sit above a single real inventory of 10,000 units.">
          <text x={0} y={14} className="fig-label">
            VIRTUAL
          </text>
          <rect x={0} y={24} width={300} height={30} className="fig-virtual" />
          <text x={150} y={44} className="fig-value">
            Strategy 1 · 10,000
          </text>
          <rect x={0} y={62} width={300} height={30} className="fig-virtual" />
          <text x={150} y={82} className="fig-value">
            Strategy 2 · 10,000
          </text>

          <text x={0} y={124} className="fig-label">
            REAL
          </text>
          <rect x={0} y={134} width={150} height={30} className="fig-real" />
          <text x={75} y={154} className="fig-value fig-value-invert">
            10,000
          </text>
          <text x={160} y={154} className="fig-label">
            20,000 COMMITTED
          </text>
        </svg>
      </div>
      <figcaption>
        Both strategies are funded independently, so together they can commit more
        than the shared ERC-20 inventory can settle. Worked example, not measured
        data.
      </figcaption>
    </figure>
  );
}

const stats = [
  { label: "FIXTURES", value: num(totals.fixtures), note: "recorded" },
  { label: "SWAPS", value: num(totals.swaps), note: "replayable" },
  { label: "SEPOLIA_TXS", value: num(sepolia.transactions), note: "public" },
  { label: "STRATEGIES", value: `${maxStrategies}`, note: "supported max" },
];

export function ProblemSection() {
  return (
    <section className="landing-section" aria-labelledby="problem">
      <SectionLabel index="001">{"// SECTION: THE_PROBLEM"}</SectionLabel>
      <Reveal>
        <div className="split-frame">
          <VirtualVsReal />
          <div className="split-body">
            <FrameHead
              label="THE PROBLEM"
              meta={`${recordedStep.strategies}-strategy example`}
            />
            <div className="split-copy">
              <h2 id="problem">
                Virtual balances are independent.
                <br />
                <span className="mark">Real inventory is shared.</span>
              </h2>
              <p>
                Aqua lets one maker back several strategies with the same tokens.
                Each strategy&apos;s virtual balance is funded independently, so
                together they can commit more than the real ERC-20 inventory can
                settle.
              </p>
              <p>
                CAPACITY_GUARD admits a fill only when the vault&apos;s
                transferable inventory covers that fill and every strategy&apos;s
                remaining entitlement. Inventory above those entitlements is
                available to whichever strategy is filling.
              </p>
              <p className="rule-line">
                <span className="tiny-square" aria-hidden="true" />
                CAPACITY_GUARD · SwapVM opcode 0x05
              </p>
              <div className="stat-grid">
                {stats.map(({ label, value, note }) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>
                      <Scramble value={value} />
                    </strong>
                    <small>{note}</small>
                  </div>
                ))}
              </div>
              <a className="arrow-link" href="/docs/problem/">
                Explore the problem
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
