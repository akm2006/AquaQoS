import { StatusBadge, type StatusKind } from "./StatusBadge";

export type TimelineStep = {
  label: string;
  detail: string;
  status?: StatusKind;
};

// An ordered progression; each step states its result in text, not by position or color.
export function TransactionTimeline({
  label,
  steps,
}: {
  label: string;
  steps: TimelineStep[];
}) {
  return (
    <ol className="tx-timeline" aria-label={label}>
      {steps.map((step) => (
        <li key={step.label}>
          <strong>{step.label}</strong>
          <p>{step.detail}</p>
          {step.status && <StatusBadge kind={step.status} />}
        </li>
      ))}
    </ol>
  );
}
