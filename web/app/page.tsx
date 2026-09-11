import Link from "next/link";
import { BrandLogo } from "./_components/BrandLogo";
import { ButtonLink } from "./_components/Button";
import { CapacityBar } from "./_components/CapacityBar";
import { Metric } from "./_components/Metric";
import { SectionHeading } from "./_components/SectionHeading";
import { StatusBadge, type StatusKind } from "./_components/StatusBadge";
import { TransactionTimeline } from "./_components/TransactionTimeline";
import {
  environments,
  heroTitle,
  limitations,
  liveEnvironment,
  measuredGas,
  productLine,
} from "./_lib/copy";
import { num } from "./_lib/format";
import { evidence, routes } from "./_lib/routes";

// The app architecture's §1 sequence, worded against docs/CAPACITY_GUARD_SPEC.md.
const schedule = [
  {
    label: "Independent Aqua strategies",
    detail: "Each strategy keeps its own virtual balance in Aqua.",
  },
  {
    label: "One shared real inventory",
    detail: "Every strategy settles against the same vault's ERC-20 balance.",
  },
  {
    label: "CAPACITY_GUARD schedules access",
    detail:
      "A custom SwapVM instruction admits or rejects each fill before settlement.",
  },
  {
    label: "Guaranteed capacity + controlled burst",
    detail: "Sibling entitlements stay covered; inventory above them can burst.",
  },
  {
    label: "Actual transfer receipt",
    detail: "The receipt shows which real balances changed.",
  },
];

const surfaces: {
  kind?: StatusKind;
  title: string;
  detail: string;
  href: string;
}[] = [
  {
    kind: "recorded",
    title: "Recorded comparison",
    detail: environments.recorded.detail,
    href: routes.workspace,
  },
  {
    kind: "live",
    title: "Live local session",
    detail: environments.live.detail,
    href: routes.live,
  },
  {
    title: "Receipts and sources",
    detail:
      "Specification, benchmark report, security review and reproduction commands.",
    href: routes.proof,
  },
];

export default function Page() {
  return (
    <main id="main" className="landing">
      <section className="hero" aria-labelledby="hero-title">
        <div>
          <BrandLogo size="hero" />
          <h1 id="hero-title">{heroTitle}</h1>
          <p>{productLine}</p>
          <div className="button-row">
            <ButtonLink href={routes.live} variant="primary">
              Run live local demo
            </ButtonLink>
            <ButtonLink href={routes.proof}>Open the receipts</ButtonLink>
          </div>
        </div>
        <TransactionTimeline
          label="How AquaQoS schedules one shared inventory"
          steps={schedule}
        />
      </section>

      <section className="landing-section" aria-labelledby="problem">
        <SectionHeading
          id="problem"
          eyebrow="THE PROBLEM"
          title="Virtual balances are independent. Real inventory is shared."
        >
          Aqua lets one maker back several strategies with the same tokens. Each
          strategy&apos;s virtual balance is funded independently, so together
          they can commit more than the real ERC-20 inventory can settle.
        </SectionHeading>
        <ButtonLink href={evidence.doc("PROBLEM_REPRODUCTION")}>
          Read the reproduction
        </ButtonLink>
      </section>

      <section className="landing-section" aria-labelledby="mechanism">
        <SectionHeading
          id="mechanism"
          eyebrow="THE MECHANISM"
          title="Guarantees protect siblings. Unused capacity can burst."
        >
          CAPACITY_GUARD admits a fill only when the vault&apos;s transferable
          inventory covers that fill and every strategy&apos;s remaining
          entitlement. Inventory above those entitlements is available to
          whichever strategy is filling.
        </SectionHeading>
        <CapacityBar
          label="Strategy 1 of 2"
          backing={10_000n}
          guaranteed={2_500n}
          burst={5_000n}
        />
        <p className="caption">
          Worked example of the admission invariant: 10,000 units of
          transferable inventory, two strategies with 2,500-unit guarantees and a
          virtual balance large enough for the fill. Not measured data.
        </p>
        <ButtonLink href={evidence.doc("CAPACITY_GUARD_SPEC")}>
          Read the specification
        </ButtonLink>
      </section>

      <section className="landing-section" aria-labelledby="evidence">
        <SectionHeading
          id="evidence"
          eyebrow="EVIDENCE"
          title="Every surface says where its numbers come from."
        />
        <div className="evidence-strip">
          {surfaces.map((s) => (
            <Link
              key={s.href}
              className="panel evidence-card"
              href={s.href}
              prefetch={false}
            >
              {s.kind ? (
                <StatusBadge kind={s.kind} />
              ) : (
                <span className="eyebrow">VERIFY</span>
              )}
              <h3>{s.title}</h3>
              <p>{s.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-section" aria-labelledby="tradeoff">
        <SectionHeading
          id="tradeoff"
          eyebrow="MEASURED TRADE-OFF"
          title="Protection costs gas."
        >
          Median gas for successful low-contention swaps with{" "}
          {measuredGas.strategies} strategies in the recorded local benchmark.
        </SectionHeading>
        <div className="metric-row">
          <Metric
            label="AquaQoS guarded swap"
            value={num(measuredGas.guarded)}
            unit="gas"
            provenance="Measured · recorded local EVM"
          />
          <Metric
            label="Raw Aqua swap"
            value={num(measuredGas.raw)}
            unit="gas"
            provenance="Measured · recorded local EVM"
          />
        </div>
        <p className="caption">
          Guard rejection can cost more than failed settlement. Results cover the
          benchmark&apos;s workloads only.
        </p>
        <ButtonLink href={evidence.doc("BENCHMARK_RESULTS")}>
          Read the benchmark results
        </ButtonLink>
      </section>

      <section className="landing-section" aria-labelledby="live-cta">
        <div className="panel landing-cta">
          <div>
            <StatusBadge kind="live" />
            <h2 id="live-cta">Run it on a local chain.</h2>
            <p>{liveEnvironment}</p>
          </div>
          <ButtonLink href={routes.live} variant="primary">
            Run live local demo
          </ButtonLink>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="limits">
        <SectionHeading
          id="limits"
          eyebrow="LIMITATIONS"
          title="Where the prototype stops."
        />
        <ul className="limit-list">
          {limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="source-links">
          <a href={evidence.doc("SECURITY_REVIEW_V0")}>Security review</a>
          <a href={evidence.doc("BENCHMARK_METHODOLOGY")}>
            Benchmark methodology
          </a>
          <a href={evidence.doc("THIRD_PARTY")}>Sources and attribution</a>
        </div>
      </section>
    </main>
  );
}
