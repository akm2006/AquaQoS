import { heroTitle, productLine } from "../../_lib/copy";
import { brandLogo, routes } from "../../_lib/routes";
import { ButtonLink } from "../Button";

// Orthogonal lanes, after the template's central workflow diagram. The packets are square
// liquidity units (DESIGN.md §13/§20) and only ever travel along the horizontal runs, so the
// motion is a plain transform; the template's pulsing ring around the mark is dropped.
const INPUTS = ["Strategy 1", "Strategy 2", "Strategy 3"];
const OUTPUTS = ["Guaranteed", "Burst", "Rejected"];
const ROWS = [37, 110, 183];

function SchedulingDiagram() {
  return (
    <>
      <div className="hero-diagram">
        <svg
          viewBox="0 0 800 220"
          role="img"
          aria-label="Three independent strategies feed one CAPACITY_GUARD block, which schedules each fill as guaranteed, burst or rejected."
        >
          {ROWS.map((y, i) => (
            <g key={`in-${i}`}>
              <rect x={0} y={y - 17} width={130} height={34} className="lane-box" />
              <text x={65} y={y + 4}>
                {INPUTS[i]}
              </text>
              <path d={`M130 ${y} H250 V110`} className="lane" />
              <rect
                x={130}
                y={y - 4}
                width={8}
                height={8}
                className="packet"
                style={{ animationDelay: `${i * 0.6}s` }}
              />
            </g>
          ))}
          <path d="M250 110 H330" className="lane" />

          <rect x={330} y={62} width={140} height={96} className="guard-box" />
          <image href={brandLogo} x={360} y={78} width={80} height={48} />
          <text x={400} y={144} className="guard-label">
            CAPACITY_GUARD
          </text>

          <path d="M470 110 H550" className="lane" />
          {ROWS.map((y, i) => (
            <g key={`out-${i}`}>
              <path d={`M550 110 V${y} H670`} className="lane" />
              <rect
                x={550}
                y={y - 4}
                width={8}
                height={8}
                className="packet packet-out"
                style={{ animationDelay: `${0.9 + i * 0.6}s` }}
              />
              <rect x={670} y={y - 17} width={130} height={34} className="lane-box" />
              <text x={735} y={y + 4}>
                {OUTPUTS[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div
        className="hero-diagram-mobile"
        role="img"
        aria-label="Strategies feed CAPACITY_GUARD, producing guaranteed, burst or rejected outcomes."
      >
        <span>STRATEGIES 1–3</span>
        <b>→</b>
        <strong>CAPACITY_GUARD</strong>
        <b>→</b>
        <span>GUARANTEED · BURST · REJECTED</span>
      </div>
    </>
  );
}

export function Hero() {
  return (
    <section className="hero">
      {/* The pixel lines are the visual headline; the accessible heading is the sentence. */}
      <h1 className="sr-only">{heroTitle}</h1>
      <p className="hero-line pixel" aria-hidden="true">
        Shared liquidity,
      </p>
      <SchedulingDiagram />
      <p className="hero-line pixel" aria-hidden="true">
        Scheduled.
      </p>
      <p className="hero-sub">{productLine}</p>
      <div className="button-row hero-actions">
        <ButtonLink href={routes.onchain} variant="primary">
          View onchain proof
        </ButtonLink>
        <ButtonLink href={routes.workspace}>Explore the workspace</ButtonLink>
      </div>
    </section>
  );
}
