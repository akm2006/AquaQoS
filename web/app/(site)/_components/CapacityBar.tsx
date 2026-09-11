import { num } from "../_lib/format";

// Guaranteed vs burst is carried by structure (solid vs outlined) and text, never by
// color alone (DESIGN.md §14). The unfilled remainder is reserved for sibling strategies.
export function CapacityBar({
  label,
  backing,
  guaranteed,
  burst,
  unit = "units",
}: {
  label: string;
  backing: bigint;
  guaranteed: bigint;
  burst: bigint;
  unit?: string;
}) {
  const share = (part: bigint) =>
    backing > 0n ? `${Number((part * 10_000n) / backing) / 100}%` : "0%";
  const reserved = backing - guaranteed - burst;
  return (
    <figure className="capacity-bar">
      <figcaption>
        <strong>{label}</strong>
        <span>
          {num(backing)} {unit} real inventory
        </span>
      </figcaption>
      <div className="capacity-track" aria-hidden="true">
        <span className="capacity-guaranteed" style={{ width: share(guaranteed) }} />
        <span className="capacity-burst" style={{ width: share(burst) }} />
      </div>
      <dl className="capacity-legend">
        <div className="legend-guaranteed">
          <dt>Guaranteed</dt>
          <dd>{num(guaranteed)}</dd>
        </div>
        <div className="legend-burst">
          <dt>Burst</dt>
          <dd>{num(burst)}</dd>
        </div>
        {reserved > 0n && (
          <div className="legend-reserved">
            <dt>Reserved for siblings</dt>
            <dd>{num(reserved)}</dd>
          </div>
        )}
      </dl>
    </figure>
  );
}
