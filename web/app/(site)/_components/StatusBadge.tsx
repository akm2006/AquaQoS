import { environments, type Environment } from "../_lib/copy";

type Outcome = "allowed" | "constrained" | "rejected";
export type StatusKind = Outcome | Environment;

// Meaning is carried by the icon and text; color only reinforces it (DESIGN.md §25).
const badges: Record<StatusKind, { icon: string; label: string }> = {
  allowed: { icon: "✓", label: "Allowed" },
  constrained: { icon: "⚠︎", label: "Constrained" },
  rejected: { icon: "×", label: "Rejected" },
  recorded: { icon: "■", label: environments.recorded.label },
  live: { icon: "●", label: environments.live.label },
  fork: { icon: "◇", label: environments.fork.label },
  testnet: { icon: "◆", label: environments.testnet.label },
  planned: { icon: "○", label: environments.planned.label },
};

export function StatusBadge({
  kind,
  children,
}: {
  kind: StatusKind;
  children?: React.ReactNode;
}) {
  const { icon, label } = badges[kind];
  return (
    <span className={`status-badge status-${kind}`}>
      <span aria-hidden="true">{icon}</span>
      {children ?? label}
    </span>
  );
}
