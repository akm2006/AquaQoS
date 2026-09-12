import type { Metadata } from "next";
import { ButtonLink } from "../_components/Button";
import { Reveal } from "../_components/Reveal";
import { SectionLabel } from "../_components/SectionLabel";
import { StatusBadge } from "../_components/StatusBadge";
import { num, short } from "../_lib/format";
import { sepolia } from "../_lib/landing-evidence";
import { routes } from "../_lib/routes";

export const metadata: Metadata = {
  title: "Onchain proof",
  description:
    "AquaQoS contracts and protected-capacity transactions deployed on Ethereum Sepolia.",
};

const resultFor = (name: string) => {
  if (name.startsWith("reject")) return "CAPACITY PROTECTED";
  if (name.startsWith("replenish")) return "CAPACITY RESTORED";
  return "TRANSFER SETTLED";
};

export default function OnchainPage() {
  return (
    <main id="main" className="workspace proof-page">
      <div className="page-heading">
        <div>
          <StatusBadge kind="testnet">
            Ethereum Sepolia · chain {sepolia.chainId}
          </StatusBadge>
          <p className="eyebrow">PUBLIC DEPLOYMENT</p>
          <h1>Proof onchain.</h1>
          <p>
            Inspect the deployed contracts, exact source matches, protected
            rejections, successful token transfers and replenishment directly on
            Sepolia.
          </p>
        </div>
        <ButtonLink href={routes.proof}>Read the full proof</ButtonLink>
      </div>

      <section className="landing-section" aria-labelledby="contracts">
        <SectionLabel index="001">{"// SECTION: CONTRACTS"}</SectionLabel>
        <h2 id="contracts" className="section-title">
          Source-matched deployment.
        </h2>
        <p className="section-intro">
          All four custom deployments are exact Sourcify creation and runtime
          matches. The router calls the official Aqua deployment at{" "}
          <a href={`https://sepolia.etherscan.io/address/${sepolia.officialAqua}`}>
            <code>{short(sepolia.officialAqua)}</code>
          </a>.
        </p>
        <Reveal>
          <div className="proof-grid onchain-grid">
            {sepolia.contracts.map((contract) => (
              <article className="frame onchain-card" key={contract.address}>
                <div className="frame-head">
                  <span>{contract.name}</span>
                  <span>EXACT MATCH</span>
                </div>
                <div className="proof-record-body">
                  <code>{contract.address}</code>
                  <div className="onchain-links">
                    <a className="arrow-link" href={contract.explorer}>
                      Open on Etherscan
                    </a>
                    <a className="arrow-link" href={contract.sourcify}>
                      Verify source on Sourcify
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="landing-section" aria-labelledby="transactions">
        <SectionLabel index="002">{"// SECTION: TRANSACTIONS"}</SectionLabel>
        <h2 id="transactions" className="section-title">
          The protected-capacity sequence.
        </h2>
        <p className="section-intro">
          Seven representative receipts from a {num(sepolia.transactions)}-transaction
          run. Rejected calls leave state and logs unchanged; admitted fills emit real
          ERC-20 transfers.
        </p>
        <div className="onchain-timeline">
          {sepolia.actions.map((action, index) => (
            <a
              className="onchain-action"
              href={action.explorer}
              key={action.hash}
            >
              <span className="onchain-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <strong>{action.name}</strong>
                <code>{short(action.hash)}</code>
              </span>
              <span className="onchain-result">{resultFor(action.name)}</span>
            </a>
          ))}
        </div>
        <p className="source-line">
          Deployment source <code>{sepolia.sourceCommit}</code> · public Ethereum
          Sepolia evidence
        </p>
      </section>
    </main>
  );
}
