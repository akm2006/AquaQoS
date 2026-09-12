import type { Metadata } from "next";
import { KnownLimits } from "../_components/KnownLimits";
import { Reveal } from "../_components/Reveal";
import { SectionLabel } from "../_components/SectionLabel";
import { ButtonLink } from "../_components/Button";
import { sepolia, totals } from "../_lib/landing-evidence";
import { num } from "../_lib/format";
import { routes } from "../_lib/routes";

export const metadata: Metadata = { title: "Proof" };

const records = [
  {
    n: "01",
    title: "Problem and mechanism",
    description:
      "Why independent virtual ledgers can compete for one shared ERC-20 inventory, and where the guard enters the SwapVM path.",
    href: "/docs/problem/",
  },
  {
    n: "02",
    title: "Capacity model",
    description:
      "The admission invariant, allowance floor, protected entitlement and burst semantics.",
    href: "/docs/capacity/",
  },
  {
    n: "03",
    title: "Measured trade-offs",
    description:
      "Conservative Aqua, raw overcommitment and two protection policies across 2, 4 and 8 strategies.",
    href: "/docs/benchmarks/",
  },
  {
    n: "04",
    title: "Security model and limits",
    description:
      "Trust boundaries, internal review scope, remaining risks and explicit prototype limits.",
    href: "/docs/security/",
  },
  {
    n: "05",
    title: "Public Sepolia receipts",
    description:
      "Exact-match verified contracts and representative protected-capacity transactions.",
    href: routes.onchain,
  },
  {
    n: "06",
    title: "Sources and licenses",
    description:
      "Pinned official dependencies, retained notices and source material behind the product.",
    href: "/docs/sources/",
  },
] as const;

const scope = [
  "CAPACITY_GUARD · 0x05",
  "Canonical XYC",
  "Public Sepolia receipts",
  "Sourcify exact match",
];

export default function Proof() {
  return (
    <main id="main" className="workspace proof-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PROTOCOL EVIDENCE</p>
          <h1>Open the receipts.</h1>
          <p>
            A short path from the claim to the code, the test and the recorded
            result.
          </p>
        </div>
        <ButtonLink href={routes.onchain} variant="primary">
          View onchain proof
        </ButtonLink>
      </div>

      <section className="landing-section" aria-labelledby="domain">
        <SectionLabel index="001">{"// SECTION: PROTECTED_DOMAIN"}</SectionLabel>
        <div className="split-frame">
          <div className="split-body">
            <div className="frame-head">
              <span>SUPPORTED DOMAIN</span>
              <span>one token pair</span>
            </div>
            <div className="split-copy">
              <h2 id="domain">
                One token pair.
                <br />
                Up to eight strategies.
                <br />
                <span className="mark">Explicit capacity rules.</span>
              </h2>
              <div className="scope-chips">
                {scope.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="split-body proof-domain-body">
            <div className="frame-head">
              <span>EVIDENCE SCOPE</span>
              <span>{num(sepolia.transactions)} public txs</span>
            </div>
            <div className="split-copy">
              <p>
                AquaQoS adds a custom SwapVM instruction and a restricted maker
                vault. Official Aqua still performs virtual accounting and ERC-20
                settlement.
              </p>
              <p>
                The comparisons use pinned, fee-free XYC programs and retained
                receipts. A public Ethereum Sepolia deployment records exact-match
                verified contracts and{" "}
                {num(sepolia.transactions)} transactions. There is no external
                audit and no mainnet deployment.
              </p>
              <p className="rule-line">
                <span className="tiny-square" aria-hidden="true" />
                {num(totals.fixtures)} fixtures · {num(totals.swaps)} swaps ·{" "}
                {num(totals.pushes)} pushes
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="documents">
        <SectionLabel index="002">{"// SECTION: VERIFY"}</SectionLabel>
        <h2 id="documents" className="section-title">
          Follow the evidence path.
        </h2>
        <Reveal>
          <div className="proof-grid">
            {records.map(({ n, title, description, href }) => (
              <a key={n} className="frame proof-record" href={href}>
                <span className="frame-head">
                  <span>
                    {n} / CURATED_EVIDENCE
                  </span>
                  <span>OPEN</span>
                </span>
                <span className="proof-record-body">
                  <strong>{title}</strong>
                  <span className="proof-record-detail">{description}</span>
                  <span className="arrow-link">Open evidence</span>
                </span>
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="landing-section" aria-labelledby="limits">
        <SectionLabel index="003">{"// SECTION: KNOWN_LIMITS"}</SectionLabel>
        <h2 id="limits" className="section-title">
          What the prototype does—and where it stops.
        </h2>
        <Reveal>
          <KnownLimits />
        </Reveal>
      </section>
    </main>
  );
}
