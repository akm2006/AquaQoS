import {
  maxStrategies,
  measuredGas,
  measuredRejectionGas,
  schedule,
} from "../../_lib/copy";
import { num } from "../../_lib/format";
import { recordedStep } from "../../_lib/landing-evidence";
import { routes } from "../../_lib/routes";
import { FrameHead } from "../FrameCard";
import { Reveal } from "../Reveal";
import { Scramble } from "../Scramble";
import { SectionLabel } from "../SectionLabel";

// The template's terminal card. Every line is in the DOM from the first paint; the stagger is
// a CSS fade, so nothing is hidden from assistive technology and reduced motion shows it whole.
function ScheduleLog() {
  return (
    <div className="frame frame-invert bento-cell">
      <FrameHead label="schedule.log" meta={`${schedule.length} steps`} />
      <ol className="log">
        {schedule.map(({ label, detail }, i) => (
          <li key={label} style={{ "--log-index": i } as React.CSSProperties}>
            <strong>&gt; {label}</strong>
            <span>{detail}</span>
          </li>
        ))}
        <li className="log-cursor" aria-hidden="true" style={{ "--log-index": schedule.length } as React.CSSProperties}>
          <strong>_</strong>
        </li>
      </ol>
    </div>
  );
}

// Replaces the template's dither canvas. 100 cells of 100 units each: one strategy's
// guarantee, its sibling's reserved guarantee, and the burst inventory above both.
const CELLS = Array.from({ length: 100 }, (_, i) =>
  i < 25 ? "held" : i < 50 ? "reserved" : "burst",
);

function InventoryGrid() {
  return (
    <div className="frame bento-cell">
      <FrameHead label="inventory.grid" meta="10,000 units" />
      <div className="bento-body">
        <div className="unit-grid" aria-hidden="true">
          {CELLS.map((kind, i) => (
            <span key={i} className={`unit unit-${kind}`} />
          ))}
        </div>
        <ul className="grid-legend">
          <li>
            <span className="unit unit-held" aria-hidden="true" />
            2,500 guaranteed to this strategy
          </li>
          <li>
            <span className="unit unit-reserved" aria-hidden="true" />
            2,500 reserved for its sibling
          </li>
          <li>
            <span className="unit unit-burst" aria-hidden="true" />
            5,000 available to burst
          </li>
        </ul>
        <p className="caption">
          Worked example of the admission invariant, not measured data.
        </p>
      </div>
    </div>
  );
}

const gasRows = [
  { value: measuredGas.guarded, label: "AquaQoS guarded swap" },
  { value: measuredGas.raw, label: "Raw Aqua swap" },
  { value: measuredRejectionGas.guard, label: "Guard rejection" },
  { value: measuredRejectionGas.rawSettlementFailure, label: "Raw settlement failure" },
];

function GasMetrics() {
  return (
    <div className="frame bento-cell">
      <FrameHead label="benchmark.gas" meta="median" />
      <div className="bento-body gas-body">
        {gasRows.map(({ value, label }) => (
          <div key={label} className="gas-row">
            <strong>
              <Scramble value={num(value)} />
            </strong>
            <span>{label}</span>
          </div>
        ))}
        <p className="caption">
          Measured · recorded local EVM · {measuredGas.strategies} strategies.
          Guard rejection can cost more than failed settlement.
        </p>
      </div>
    </div>
  );
}

// The workspace's own default selection, replayed from the same checked report it reads.
function RecordedStep() {
  return (
    <div className="frame bento-cell">
      <FrameHead label="recorded.step" meta={`token ${recordedStep.token}`} />
      <div className="bento-body">
        <table className="step-table">
          <caption className="sr-only">
            Shared Token {recordedStep.token} remaining after each recorded step,
            with {recordedStep.strategies} strategies under concentrated demand
          </caption>
          <thead>
            <tr>
              <th scope="col">Step</th>
              <th scope="col">{recordedStep.baseline}</th>
              <th scope="col">{recordedStep.policy}</th>
            </tr>
          </thead>
          <tbody>
            {recordedStep.rows.map(({ step, raw, guarded }) => (
              <tr key={step}>
                <th scope="row">{step}</th>
                <td>
                  <strong>{num(raw.remaining)}</strong>
                  <span className={`outcome ${raw.tone}`}>{raw.outcome}</span>
                </td>
                <td>
                  <strong>{num(guarded.remaining)}</strong>
                  <span className={`outcome ${guarded.tone}`}>
                    {guarded.outcome}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <a className="arrow-link" href={routes.workspace}>
          Replay it in the workspace
        </a>
      </div>
    </div>
  );
}

export function MechanismGrid() {
  return (
    <section className="landing-section" aria-labelledby="mechanism">
      <SectionLabel index="002" live>
        {"// SECTION: MECHANISM"}
      </SectionLabel>
      <h2 id="mechanism" className="section-title">
        Guarantees protect siblings.
        <br />
        <span className="mark">Unused capacity can burst.</span>
      </h2>
      <p className="section-intro">
        Up to {maxStrategies} strategies share one real inventory. The guard decides
        each fill before any token moves.
      </p>
      <Reveal>
        <div className="bento">
          <ScheduleLog />
          <InventoryGrid />
          <GasMetrics />
          <RecordedStep />
        </div>
      </Reveal>
    </section>
  );
}
