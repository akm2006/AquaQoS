export function Stats({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-fd-border bg-fd-border md:grid-cols-4">
      {children}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-fd-card p-4">
      <div className="text-2xl font-semibold tracking-tight text-fd-foreground tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-xs leading-snug text-fd-muted-foreground">{label}</div>
    </div>
  );
}
