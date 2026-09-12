// The guide §1 sequence. Each square is one liquidity unit; nothing here is decoration.
const stages = [
  {
    glyph: "lanes",
    label: "Independent Aqua strategies",
    detail: "Each strategy keeps its own virtual balance in Aqua.",
  },
  {
    glyph: "pool",
    label: "One shared real inventory",
    detail: "Every strategy settles against the same vault's ERC-20 balance.",
  },
  {
    glyph: "gate",
    label: "CAPACITY_GUARD schedules access",
    detail: "Opcode 0x05 admits or rejects each fill before settlement.",
  },
  {
    glyph: "split",
    label: "Guaranteed capacity + controlled burst",
    detail: "Sibling entitlements stay covered; inventory above them can burst.",
  },
  {
    glyph: "receipt",
    label: "Actual transfer receipt",
    detail: "Real balances change only in official Aqua settlement.",
  },
] as const;

type Glyph = (typeof stages)[number]["glyph"];

function Unit({ burst = false }: { burst?: boolean }) {
  return (
    <span
      className={
        burst ? "size-2.5 border border-dashed border-aq-line" : "size-2.5 bg-aq-fill"
      }
    />
  );
}

function Glyph({ kind }: { kind: Glyph }) {
  switch (kind) {
    case "lanes":
      return (
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2].map((lane) => (
            <div key={lane} className="flex items-center gap-1.5">
              <Unit />
              <span className="h-px w-10 bg-aq-line" />
            </div>
          ))}
        </div>
      );
    case "pool":
      return (
        <div className="grid grid-cols-5 gap-1 border border-aq-line p-1.5">
          {Array.from({ length: 10 }, (_, i) => (
            <Unit key={i} />
          ))}
        </div>
      );
    case "gate":
      return (
        <div className="flex items-center gap-1.5">
          <Unit />
          <Unit />
          <span className="h-9 w-0.5 bg-aq-fill" />
          <Unit burst />
        </div>
      );
    case "split":
      return (
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <Unit key={i} />
          ))}
          {[0, 1, 2].map((i) => (
            <Unit key={i} burst />
          ))}
        </div>
      );
    case "receipt":
      return (
        <div className="flex flex-col gap-1.5">
          <span className="h-0.5 w-12 bg-aq-line" />
          <span className="h-0.5 w-8 bg-aq-line" />
          <span className="h-0.5 w-14 bg-aq-line" />
        </div>
      );
  }
}

export function ScheduleFlow() {
  return (
    <ol
      className="doc-frame not-prose my-8"
      aria-label="How AquaQoS schedules one shared inventory"
    >
      {stages.map((stage, i) => (
        <li
          key={stage.label}
          className="grid grid-cols-[6.5rem_1fr] items-center gap-4 border-fd-border bg-fd-card px-4 py-4 not-last:border-b-2 sm:grid-cols-[8rem_1fr]"
        >
          <div className="flex h-12 items-center justify-center" aria-hidden="true">
            <Glyph kind={stage.glyph} />
          </div>
          <div>
            <p className="flex items-baseline gap-2 text-[13px] font-bold text-fd-foreground">
              <span className="text-[11px] tracking-[0.1em] text-aq-text">
                {String(i + 1).padStart(2, "0")}
              </span>
              {stage.label}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-fd-muted-foreground">
              {stage.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
