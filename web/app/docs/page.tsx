import type { Metadata } from "next";
import { ButtonLink } from "../_components/Button";
import { SectionHeading } from "../_components/SectionHeading";
import { evidence, external, routes } from "../_lib/routes";

export const metadata: Metadata = { title: "Documentation" };

const contents = [
  ["overview", "Overview"],
  ["model", "System model"],
  ["invariant", "Admission invariant"],
  ["lifecycle", "Strategy lifecycle"],
  ["integration", "SwapVM integration"],
  ["verification", "Verification"],
  ["limits", "Supported domain"],
] as const;

export default function Documentation() {
  return (
    <main id="main" className="workspace docs-page">
      <div className="page-heading docs-heading">
        <div>
          <p className="eyebrow">PROTOCOL DOCUMENTATION</p>
          <h1>How AquaQoS protects shared capacity.</h1>
          <p>
            A concise guide to the v0 model, invariant, lifecycle, integration,
            evidence, and explicit limits.
          </p>
        </div>
        <ButtonLink href={routes.proof} variant="primary">
          Verify the claims
        </ButtonLink>
      </div>

      <section className="panel docs-summary" aria-labelledby="docs-thesis">
        <p className="eyebrow">THE THESIS</p>
        <h2 id="docs-thesis">Share inventory without treating it as reserved twice.</h2>
        <p>
          Aqua gives each strategy an independent virtual balance while settlement
          still draws from one real maker inventory. AquaQoS adds a restricted vault
          and the <code>CAPACITY_GUARD</code> SwapVM instruction so a fill cannot consume
          capacity still configured for sibling strategies.
        </p>
        <dl className="docs-facts">
          <div><dt>Instruction</dt><dd>0x05</dd></div>
          <div><dt>Strategies</dt><dd>1–8</dd></div>
          <div><dt>Recipe</dt><dd>Fee-free XYC</dd></div>
          <div><dt>Public proof</dt><dd>Sepolia</dd></div>
        </dl>
      </section>

      <div className="docs-layout">
        <aside className="panel docs-nav">
          <strong>On this page</strong>
          <nav aria-label="Documentation sections">
            {contents.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <a className="docs-source" href={external.github}>View source on GitHub</a>
        </aside>

        <article className="docs-content">
          <section id="overview">
            <SectionHeading eyebrow="01 / OVERVIEW" title="The problem is accounting versus inventory." />
            <p>
              Aqua virtual balances are isolated by maker, application, strategy, and
              token. They are accounting ledgers—not exclusive reservations of the
              maker&apos;s ERC-20 balance. Two individually funded strategies can therefore
              advertise more output than their shared real inventory can settle.
            </p>
            <p>
              AquaQoS schedules that shared backing. It protects a configured entitlement
              for every active sibling and allows inventory above those entitlements to be
              used as burst capacity.
            </p>
            <a href={evidence.doc("PROBLEM_REPRODUCTION")}>Read the deterministic reproduction</a>
          </section>

          <section id="model">
            <SectionHeading eyebrow="02 / SYSTEM MODEL" title="Four components, one narrow trust boundary." />
            <ol className="docs-flow">
              <li><strong>Maker vault</strong><span>Holds the real token pair, approves only Aqua, and owns strategy lifecycle changes.</span></li>
              <li><strong>1inch Aqua</strong><span>Maintains independent virtual balances and performs ERC-20 settlement.</span></li>
              <li><strong>AquaQoS router</strong><span>Executes the canonical SwapVM recipe and dispatches custom opcode 0x05.</span></li>
              <li><strong>Capacity state</strong><span>Tracks guarantees, activation baselines, and transaction-scoped reservations.</span></li>
            </ol>
            <p>
              The restricted vault is necessary because a normal wallet can spend or
              revoke approval outside the scheduler. The vault has no generic call,
              arbitrary approval, upgrade, or delegatecall entrypoint.
            </p>
            <a href={evidence.doc("THREAT_MODEL")}>Review the trust boundaries</a>
          </section>

          <section id="invariant">
            <SectionHeading eyebrow="03 / ADMISSION" title="A fill must cover itself and every remaining entitlement." />
            <p>
              For transferable inventory <code>I</code>, proposed output debit <code>d</code>,
              active strategies <code>S</code>, reservations <code>r</code>, and remaining
              entitlements, execution requires:
            </p>
            <pre className="docs-equation"><code>{`I ≥ Σ r[i] + d
    + Σ remaining(i, i = current ? d : 0)`}</code></pre>
            <p>
              Transferable inventory is the smaller of the vault&apos;s real balance and its
              allowance to Aqua. The guard also checks the strategy&apos;s current virtual
              balance and preserves the configured allowance floor. A quote is informative;
              execution always rechecks the latest state.
            </p>
            <a href={evidence.doc("CAPACITY_GUARD_SPEC")}>Read the complete specification</a>
          </section>

          <section id="lifecycle">
            <SectionHeading eyebrow="04 / LIFECYCLE" title="Configuration changes happen behind a pause boundary." />
            <div className="docs-state-row" aria-label="Strategy lifecycle">
              <span>Configure</span><span>Activate</span><span>Trade</span><span>Pause</span><span>Dock</span><span>Withdraw</span>
            </div>
            <p>
              Activation proves aggregate backing and resets every baseline together.
              Adding, removing, or changing guarantees requires the group to be paused.
              Withdrawal requires all strategies to be docked. Lifecycle operations reject
              during a transaction that has already reserved capacity.
            </p>
            <a href={evidence.doc("CAPACITY_GUARD_SPEC")}>Verify the lifecycle rules</a>
          </section>

          <section id="integration">
            <SectionHeading eyebrow="05 / SWAPVM" title="CAPACITY_GUARD wraps the official recipe." />
            <p>
              Opcode <code>0x05</code> is the first instruction in the protected program.
              It runs the remaining canonical XYC recipe, checks final registers and fee
              metadata, then reserves the output debit before Aqua settlement. Official
              opcodes continue through the inherited 1inch SwapVM router.
            </p>
            <p>
              v0 accepts one exact, fee-free recipe. Arbitrary maker bytecode and protocol
              fees are rejected, keeping the demonstrated claim smaller and auditable.
            </p>
            <a href={external.routerSource}>Inspect the router source</a>
          </section>

          <section id="verification">
            <SectionHeading eyebrow="06 / VERIFICATION" title="Claims are backed by executable and public evidence." />
            <div className="docs-proof-grid">
              <div className="panel"><strong>30 Solidity tests</strong><span>Regression, boundary, authorization, callback, rollback, and fuzz coverage.</span></div>
              <div className="panel"><strong>327,168 model cases</strong><span>Bounded settlement, burst, consumption, and replenishment checks.</span></div>
              <div className="panel"><strong>72 benchmark fixtures</strong><span>Equal-backing A/B/C comparisons across 2, 4, and 8 strategies.</span></div>
              <div className="panel"><strong>22 Sepolia transactions</strong><span>Exact-match custom deployments and checked transfer receipts.</span></div>
            </div>
            <pre className="docs-commands"><code>{`pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm test
node scripts/check-capacity-model.mjs
pnpm check:benchmark
node scripts/check-release-evidence.mjs --self-test`}</code></pre>
            <div className="source-links">
              <a href={evidence.doc("BENCHMARK_RESULTS")}>Benchmark results</a>
              <a href={evidence.doc("SEPOLIA_DEPLOYMENT")}>Sepolia proof</a>
              <a href={evidence.doc("THREAT_MODEL")}>Threat model</a>
            </div>
          </section>

          <section id="limits">
            <SectionHeading eyebrow="07 / SUPPORTED DOMAIN" title="A tested prototype, not a universal safety claim." />
            <ul className="limit-list">
              <li>One immutable standard-ERC-20 pair and at most eight active strategies.</li>
              <li>Canonical fee-free XYC only; arbitrary recipes and protocol fees are unsupported.</li>
              <li>Transaction-scoped reservations can conservatively reject a later safe fill.</li>
              <li>Fee-on-transfer, rebasing, callback-bearing, and malicious tokens are outside scope.</li>
              <li>No external audit, production certification, profitability, or general solvency claim.</li>
            </ul>
            <ButtonLink href={routes.proof}>Open all protocol evidence</ButtonLink>
          </section>
        </article>
      </div>
    </main>
  );
}
