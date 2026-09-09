export type Policy = "A" | "B" | "C" | "C100";
export const policies: Record<Policy, string> = {
  A: "Conservative Aqua",
  B: "Raw Aqua",
  C: "AquaQoS · 50% protected",
  C100: "AquaQoS · 100% protected",
};
export const workloads: Record<string, string> = {
  concentratedOverload: "Concentrated demand",
  replenishment: "Inventory replenishment",
  lowContention: "Low contention",
  adversarialOrder: "Reversed demand",
};
export type Snapshot = {
  maker: string;
  tokens: {
    balance: string;
    takerBalance: string;
    allowance: string;
    virtual: string[];
  }[];
};
export type Receipt = {
  status: string;
  transactionHash: string;
  gasUsed: string;
  blockNumber: string;
  logs: { address: string; topics: string[]; data: string }[];
};
export type Action = {
  actionIndex: number;
  type: "swap" | "push";
  strategy: number;
  amount: string | number;
  aToB?: boolean;
  token?: number;
  outcome?: string;
  before: Snapshot;
  after: Snapshot;
  receipt: Receipt;
  gasUsed: number;
  quoteInput?: string | null;
  quoteError?: { name: string; args: string[] };
  trace?: { name: string; args: string[] };
};
export type Scenario = {
  name: string;
  initialState: Snapshot;
  attempts: Action[];
  actions: Action[];
};
export type Run = {
  system: Policy;
  count: number;
  policy: {
    maker: string;
    taker: string;
    guarantee: string;
    backing: string;
    virtualDepth: string;
  };
  addresses: {
    aqua: string;
    router: string;
    vault: string | null;
    tokens: string[];
  };
  scenarios: Scenario[];
};
export type Report = {
  kind: string;
  sourceCommit: string;
  dirty: boolean;
  runs: Run[];
};
export const num = (n: string | number | bigint) =>
  BigInt(n).toLocaleString("en-US");
export const short = (s: string) => `${s.slice(0, 6)}…${s.slice(-4)}`;
export const actionsFor = (s: Scenario) =>
  [...s.attempts, ...s.actions].sort((a, b) => a.actionIndex - b.actionIndex);
export const outcome = (a?: Action) =>
  !a
    ? "Initial inventory"
    : a.type === "push"
      ? "Inventory replenished"
      : ({
          success: "Fill settled",
          guard_rejection: "Capacity protected",
          settlement_failure: "Settlement failed",
          quote_rejection: "Quote rejected",
        }[a.outcome ?? ""] ?? "Unknown outcome");
export const tone = (a?: Action) =>
  !a
    ? "neutral"
    : a.type === "push" || a.outcome === "success"
      ? "positive"
      : a.outcome === "settlement_failure"
        ? "negative"
        : "warning";
export function entitlements(
  run: Run,
  token: Snapshot["tokens"][number],
): bigint[] {
  if (!["C", "C100"].includes(run.system)) return token.virtual.map(() => 0n);
  const g = BigInt(run.policy.guarantee),
    base = BigInt(run.policy.virtualDepth) - g;
  return token.virtual.map((v) => {
    const available = BigInt(v) > base ? BigInt(v) - base : 0n;
    return available < g ? available : g;
  });
}
// Static reports are fully checked before the build; also fail closed on missing client data.
export function validateReport(value: unknown): asserts value is Report {
  const r = value as Report;
  if (
    r?.kind !== "local-a-b-c-benchmark-v2" ||
    r.dirty !== false ||
    !/^[a-f0-9]{40}$/.test(r.sourceCommit) ||
    !Array.isArray(r.runs)
  )
    throw Error("Invalid evidence identity.");
  const checkState = (s: Snapshot, count: number) => {
    if (!Array.isArray(s?.tokens) || s.tokens.length !== 2)
      throw Error("Missing token state.");
    for (const token of s.tokens) {
      if (
        !Array.isArray(token.virtual) ||
        token.virtual.length !== count ||
        ![
          token.balance,
          token.allowance,
          token.takerBalance,
          ...token.virtual,
        ].every((v) => typeof v === "string" && /^\d+$/.test(v))
      ) {
        throw Error("Invalid token balance evidence.");
      }
    }
  };
  for (const count of [2, 4, 8])
    for (const policy of Object.keys(policies)) {
      const runs = r.runs.filter(
        (x) => x.count === count && x.system === policy,
      );
      if (runs.length !== 1) throw Error("Missing policy evidence.");
      for (const name of Object.keys(workloads)) {
        const scenarios = runs[0].scenarios.filter((s) => s.name === name);
        if (scenarios.length !== 1 || !actionsFor(scenarios[0]).length)
          throw Error("Missing workload evidence.");
        checkState(scenarios[0].initialState, count);
        for (const a of actionsFor(scenarios[0])) {
          if (
            !a.before?.tokens ||
            !a.after?.tokens ||
            !a.receipt?.logs ||
            !["0x0", "0x1"].includes(a.receipt.status)
          )
            throw Error("Incomplete transaction evidence.");
          checkState(a.before, count);
          checkState(a.after, count);
        }
      }
    }
}
