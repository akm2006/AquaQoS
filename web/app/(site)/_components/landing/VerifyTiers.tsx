import { num } from "../../_lib/format";
import { sepolia, totals } from "../../_lib/landing-evidence";
import { routes } from "../../_lib/routes";
import { ArrowRight, Check, Minus } from "../icons";
import { Reveal } from "../Reveal";
import { SectionLabel } from "../SectionLabel";
import { StatusBadge, type StatusKind } from "../StatusBadge";

// The template's pricing tiers, carrying the three kinds of truth instead of prices. The
// struck-through lines are the honest scope limits, not withheld features.
type Tier = {
  id: string;
  name: string;
  kind: StatusKind;
  path: string;
  href: string;
  tag?: string;
  highlighted?: boolean;
  description: string;
  cta: string;
  features: { text: string; included: boolean }[];
};

const TIERS: Tier[] = [
  {
    id: "recorded",
    name: "RECORDED",
    kind: "recorded",
    path: routes.workspace,
    href: routes.workspace,
    description: "Step through retained transactions from the checked benchmark.",
    cta: "Open the workspace",
    features: [
      { text: `${num(totals.fixtures)} recorded fixtures`, included: true },
      {
        text: `${num(totals.swaps)} swaps and ${num(totals.pushes)} pushes`,
        included: true,
      },
      { text: "Transfer logs and revert traces", included: true },
      { text: "Wallet transaction", included: false },
      { text: "Live chain state", included: false },
    ],
  },
  {
    id: "live",
    name: "LIVE_LOCAL",
    kind: "live",
    path: routes.live,
    href: routes.live,
    tag: "RUN LOCALLY",
    highlighted: true,
    description: "Run a fresh isolated chain and trigger the guard yourself.",
    cta: "Run the live session",
    features: [
      { text: "Fresh isolated local EVM", included: true },
      { text: "Test maker and taker accounts", included: true },
      { text: "Real quotes, fills and receipts", included: true },
      { text: "Tokens with market value", included: false },
      { text: "Public chain", included: false },
    ],
  },
  {
    id: "proof",
    name: "PROOF",
    kind: "testnet",
    path: routes.proof,
    href: routes.proof,
    description: "Read the specification, the review and the public deployment.",
    cta: "Read the evidence",
    features: [
      { text: "Specification and security review", included: true },
      { text: "Benchmark methodology", included: true },
      { text: "Sourcify exact-match contracts", included: true },
      {
        text: `${num(sepolia.transactions)} public Sepolia transactions`,
        included: true,
      },
      { text: "External audit", included: false },
      { text: "Mainnet deployment", included: false },
    ],
  },
];

function TierCard({ tier, index }: { tier: Tier; index: number }) {
  return (
    <div className={`frame tier${tier.highlighted ? " frame-invert" : ""}`}>
      <div className="frame-head">
        <span>{tier.name}</span>
        <span className="tier-meta">
          {tier.tag && <span className="tier-tag">{tier.tag}</span>}
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="tier-body">
        <p className="tier-path">{tier.path}</p>
        <StatusBadge kind={tier.kind} />
        <p>{tier.description}</p>
        <ul className="tier-features">
          {tier.features.map(({ text, included }) => (
            <li key={text} className={included ? "" : "excluded"}>
              {included ? <Check size={12} /> : <Minus size={12} />}
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <a className="button primary tier-cta" href={tier.href}>
        {tier.cta}
      </a>
    </div>
  );
}

export function VerifyTiers() {
  return (
    <section className="landing-section" aria-labelledby="verify">
      <SectionLabel index="003" live>
        {"// SECTION: VERIFY"}
      </SectionLabel>
      <h2 id="verify" className="section-title">
        Pick how far you want to check.
      </h2>
      <p className="section-intro">
        Every surface states which kind of truth it shows, and what it does not.
      </p>
      <Reveal>
        <div className="tier-grid">
          {TIERS.map((tier, i) => (
            <TierCard key={tier.id} tier={tier} index={i} />
          ))}
        </div>
      </Reveal>
      <p className="tier-note">
        <ArrowRight size={12} />
        Recorded evidence is replayed, live sessions are executed, and the public
        proof is linked to its transactions.
      </p>
    </section>
  );
}
