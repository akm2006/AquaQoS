const fmt = (n: number) => n.toLocaleString("en-US");

// Guaranteed capacity is solid, burst is outlined: structure, not hue (DESIGN.md §14).
export function CapacitySplit({
  label,
  backing,
  guarantees,
  note,
}: {
  label: string;
  backing: number;
  guarantees: number[];
  note?: string;
}) {
  const guaranteed = guarantees.reduce((sum, g) => sum + g, 0);
  const burst = Math.max(backing - guaranteed, 0);

  return (
    <figure className="doc-frame not-prose my-6">
      <figcaption className="doc-frame-head">
        <span>{label}</span>
        <span className="tabular-nums">real backing {fmt(backing)}</span>
      </figcaption>
      <div className="p-4">
        <div
          className="flex h-8 gap-0.5"
          role="img"
          aria-label={`${fmt(guaranteed)} guaranteed across ${guarantees.length} strategies and ${fmt(burst)} burst headroom, out of ${fmt(backing)} real backing`}
        >
          {guarantees.map((g, i) => (
            <div
              key={i}
              style={{ flex: `${g} 1 0` }}
              className={`flex items-center justify-center text-[10px] tracking-[0.1em] text-aq-on-fill ${
                i % 2 ? "bg-aq-fill-soft" : "bg-aq-fill"
              }`}
            >
              S{i + 1}
            </div>
          ))}
          {burst > 0 && (
            <div
              style={{ flex: `${burst} 1 0` }}
              className="border-2 border-dashed border-aq-line"
            />
          )}
        </div>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-fd-muted-foreground">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 bg-aq-fill" />
            <dt>Guaranteed</dt>
            <dd className="tabular-nums text-fd-foreground">{fmt(guaranteed)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 border border-dashed border-aq-line"
            />
            <dt>Burst headroom</dt>
            <dd className="tabular-nums text-fd-foreground">{fmt(burst)}</dd>
          </div>
        </dl>
        {note && <p className="mt-2 text-[11px] text-fd-muted-foreground">{note}</p>}
      </div>
    </figure>
  );
}
