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
    <figure className="not-prose my-6 rounded-xl border border-fd-border bg-fd-card p-4">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-fd-foreground">{label}</span>
        <span className="font-mono text-xs text-fd-muted-foreground">
          real backing {fmt(backing)}
        </span>
      </figcaption>
      <div
        className="mt-3 flex h-8 gap-0.5"
        role="img"
        aria-label={`${fmt(guaranteed)} guaranteed across ${guarantees.length} strategies and ${fmt(burst)} burst headroom, out of ${fmt(backing)} real backing`}
      >
        {guarantees.map((g, i) => (
          <div
            key={i}
            style={{ flex: `${g} 1 0` }}
            className={`flex items-center justify-center font-mono text-[10px] text-aq-ink ${
              i % 2 ? "bg-aq-cyan/70" : "bg-aq-cyan"
            }`}
          >
            S{i + 1}
          </div>
        ))}
        {burst > 0 && (
          <div
            style={{ flex: `${burst} 1 0` }}
            className="border border-dashed border-aq-sky/60"
          />
        )}
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-fd-muted-foreground">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 bg-aq-cyan" />
          <dt>Guaranteed</dt>
          <dd className="font-mono text-fd-foreground">{fmt(guaranteed)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 border border-dashed border-aq-sky/70" />
          <dt>Burst headroom</dt>
          <dd className="font-mono text-fd-foreground">{fmt(burst)}</dd>
        </div>
      </dl>
      {note && <p className="mt-2 text-xs text-fd-muted-foreground">{note}</p>}
    </figure>
  );
}
