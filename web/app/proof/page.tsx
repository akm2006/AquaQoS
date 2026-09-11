import type { Metadata } from "next";
import Link from "next/link";
import { limitations } from "../_lib/copy";
import { routes } from "../_lib/routes";

export const metadata: Metadata = { title: "Proof" };

const records = [
  [
    "01",
    "Problem reproduction",
    "Independent virtual ledgers compete for shared real inventory. The baseline isolates inventory and allowance failures.",
    "PROBLEM_REPRODUCTION",
  ],
  [
    "02",
    "Capacity specification",
    "The exact invariant, guarantee consumption, replenishment and restricted vault boundary.",
    "CAPACITY_GUARD_SPEC",
  ],
  [
    "03",
    "Measured trade-offs",
    "Conservative Aqua, raw overcommitment and two protection policies across 2, 4 and 8 strategies.",
    "BENCHMARK_RESULTS",
  ],
  [
    "04",
    "Benchmark methodology",
    "Shared demand, initial backing, seeds, receipt checks and limits of the comparisons.",
    "BENCHMARK_METHODOLOGY",
  ],
  [
    "05",
    "Security review",
    "Internal review findings, the allowance correction, callback coverage and accepted prototype limits.",
    "SECURITY_REVIEW_V0",
  ],
  [
    "06",
    "Sepolia deployment",
    "Twenty-two public transactions, exact-match source verification and live receipt rechecks.",
    "SEPOLIA_DEPLOYMENT",
  ],
  [
    "07",
    "Threat model",
    "Trust boundaries, attacker capabilities, abuse paths, existing controls and residual risk.",
    "THREAT_MODEL",
  ],
  [
    "08",
    "Source & attribution",
    "Pinned upstream components, custom source licenses and required notices.",
    "THIRD_PARTY",
  ],
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
        <Link className="button primary" href={routes.workspace} prefetch={false}>
          Open workspace
        </Link>
      </div>
      <div className="proof-intro panel">
        <div>
          <span className="eyebrow">THE PROTECTED DOMAIN</span>
          <h2>
            One token pair.
            <br />
            Up to eight strategies.
            <br />
            <em>Explicit capacity rules.</em>
          </h2>
        </div>
        <div>
          <p>
            AquaQoS adds a custom SwapVM instruction and a restricted maker
            vault. Official Aqua still performs virtual accounting and ERC-20
            settlement.
          </p>
          <p>
            The current evidence uses pinned, fee-free XYC programs and honest
            TokenMocks on a local EVM. A separate public Sepolia deployment
            provides exact-match source verification and checked transaction
            receipts. This prototype has not received an external audit.
          </p>
          <div className="scope-chips">
            <span>CAPACITY_GUARD · 0x05</span>
            <span>Canonical XYC</span>
            <span>Local + Sepolia receipts</span>
          </div>
        </div>
      </div>
      <section className="proof-grid" aria-label="Protocol documentation">
        {records.map(([n, title, description, file]) => (
          <a
            key={n}
            className="panel proof-record"
            href={`/evidence/${file}.md`}
          >
            <span className="eyebrow">{n} / SOURCE DOCUMENT</span>
            <h2>
              {title}
            </h2>
            <p>{description}</p>
            <span className="record-format">Read Markdown document</span>
          </a>
        ))}
      </section>
      <section className="panel proof-limits">
        <span className="eyebrow">READ BEFORE INTERPRETING THE RESULTS</span>
        <h2>What the prototype does—and where it stops.</h2>
        <ul>
          {limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="evidence-banner">
        <div>
          <span className="eyebrow">REPRODUCIBLE BY DESIGN</span>
          <h2>Start from the recorded source.</h2>
          <p>
            The web build runs the existing benchmark checker before exporting
            its evidence. The manifest retains the original report hash and
            source commit.
          </p>
          <pre>node scripts/check-benchmark.mjs{"\n"}pnpm test</pre>
        </div>
        <div className="download-links">
          <a className="button" href="/evidence/report.json" download>
            Download raw report
          </a>
          <a className="button" href="/evidence/manifest.json">
            View provenance manifest
          </a>
          <a href="/evidence/AI_PROVENANCE.md">
            AI-assisted development record
          </a>
        </div>
      </section>
    </main>
  );
}
