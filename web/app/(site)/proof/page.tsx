import type { Metadata } from "next";
import { KnownLimits } from "../_components/KnownLimits";
import { Reveal } from "../_components/Reveal";
import { SectionLabel } from "../_components/SectionLabel";
import { ButtonLink } from "../_components/Button";
import { sepolia, sourceCommit, totals } from "../_lib/landing-evidence";
import { num } from "../_lib/format";
import { evidence, routes } from "../_lib/routes";

export const metadata: Metadata = { title: "Proof" };

const records = [
  {
    n: "01",
    title: "Problem reproduction",
    description:
      "Independent virtual ledgers compete for shared real inventory. The baseline isolates inventory and allowance failures.",
    file: "PROBLEM_REPRODUCTION",
  },
  {
    n: "02",
    title: "Capacity specification",
    description:
      "The exact invariant, guarantee consumption, replenishment and restricted vault boundary.",
    file: "CAPACITY_GUARD_SPEC",
  },
  {
    n: "03",
    title: "Measured trade-offs",
    description:
      "Conservative Aqua, raw overcommitment and two protection policies across 2, 4 and 8 strategies.",
    file: "BENCHMARK_RESULTS",
  },
  {
    n: "04",
    title: "Benchmark methodology",
    description:
      "Shared demand, initial backing, seeds, receipt checks and limits of the comparisons.",
    file: "BENCHMARK_METHODOLOGY",
  },
  {
    n: "05",
    title: "Security review",
    description:
      "Internal review findings, the allowance correction, callback coverage and accepted prototype limits.",
    file: "SECURITY_REVIEW_V0",
  },
  {
    n: "06",
    title: "Sepolia deployment",
    description:
      "Twenty-two public transactions, exact-match source verification and live receipt rechecks.",
    file: "SEPOLIA_DEPLOYMENT",
  },
  {
    n: "07",
    title: "Threat model",
    description:
      "Trust boundaries, attacker capabilities, abuse paths, existing controls and residual risk.",
    file: "THREAT_MODEL",
  },
  {
    n: "08",
    title: "Source & attribution",
    description:
      "Pinned upstream components, custom source licenses and required notices.",
    file: "THIRD_PARTY",
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
              <span>DOMAIN.md</span>
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
              <span>SCOPE.md</span>
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
        <SectionLabel index="002">{"// SECTION: SOURCE_DOCUMENTS"}</SectionLabel>
        <h2 id="documents" className="section-title">
          Every claim has a document.
        </h2>
        <Reveal>
          <div className="proof-grid">
            {records.map(({ n, title, description, file }) => (
              <a key={n} className="frame proof-record" href={evidence.doc(file)}>
                <span className="frame-head">
                  <span>
                    {n} / SOURCE_DOCUMENT
                  </span>
                  <span>{file}.md</span>
                </span>
                <span className="proof-record-body">
                  <strong>{title}</strong>
                  <span className="proof-record-detail">{description}</span>
                  <span className="arrow-link">Read Markdown document</span>
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

      <section className="landing-section" aria-labelledby="reproduce">
        <SectionLabel index="004">{"// SECTION: REPRODUCE"}</SectionLabel>
        <h2 id="reproduce" className="section-title">
          Start from the recorded source.
        </h2>
        <div className="evidence-banner">
          <div>
            <span className="eyebrow">REPRODUCIBLE BY DESIGN</span>
            <p>
              The web build runs the existing benchmark checker before exporting
              its evidence. The manifest retains the original report hash and
              source commit.
            </p>
            <pre className="terminal-block">
              node scripts/check-benchmark.mjs{"\n"}pnpm test
            </pre>
          </div>
          <div className="download-links">
            <a className="button" href={evidence.report} download>
              Download raw report
            </a>
            <a className="button" href={evidence.manifest}>
              View provenance manifest
            </a>
            <a href={evidence.doc("AI_PROVENANCE")}>
              AI-assisted development record
            </a>
          </div>
        </div>
        <p className="source-line">
          Report source <code>{sourceCommit}</code> · authenticated recorded evidence
        </p>
      </section>
    </main>
  );
}
