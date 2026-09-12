// Hairline grid: one shared border colour showing through a gap-px grid, radius 0.
export function Stats({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-px border-2 border-fd-border bg-fd-border md:grid-cols-4">
      {children}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-fd-card p-4">
      <div className="doc-display text-2xl font-bold tracking-tight text-fd-foreground tabular-nums">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] leading-snug text-fd-muted-foreground">{label}</div>
    </div>
  );
}
