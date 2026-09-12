import { environments } from "../../(site)/_lib/copy";

// The four environment labels (guide §1) plus the proof-page evidence badges (guide §4.4).
const labels = {
  recorded: environments.recorded.label,
  live: environments.live.label,
  testnet: environments.testnet.label,
  planned: environments.planned.label,
  pinned: "Source-pinned",
  measured: "Measured",
  receipt: "Local receipt",
  scope: "Scope limit",
} as const;

// The label text carries the meaning; color only groups evidence (DESIGN.md §25).
export function Truth({ kind }: { kind: keyof typeof labels }) {
  const quiet = kind === "planned" || kind === "scope";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-1.5 py-px align-middle font-mono text-[10px] uppercase tracking-[0.15em] ${
        quiet ? "border-rule text-fd-muted-foreground" : "border-aq-text text-aq-text"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 ${quiet ? "border border-current" : "bg-current"}`}
      />
      {labels[kind]}
    </span>
  );
}
