import { num } from "./format";

// Reviewed UI copy only. Every claim must trace to docs/STATUS.md, a passing test or a
// retained report; see docs/product/APP_ARCHITECTURE.md §10.

export const siteDescription =
  "Explore protected-capacity scheduling for shared 1inch Aqua inventory. Compare recorded transactions and verify every outcome.";

export const productLine =
  "Aqua makes liquidity shareable. AquaQoS makes shared liquidity schedulable.";

export const heroTitle = "Shared liquidity, scheduled.";

// The four kinds of truth (guide §1). Evidence is never rendered without one of these.
export const environments = {
  recorded: {
    label: "Recorded",
    detail: "Retained local transaction evidence from the benchmark report",
  },
  live: {
    label: "Live local",
    detail: "A fresh isolated local EVM session with mock tokens",
  },
  testnet: {
    label: "Fork/testnet",
    detail: "A deployed environment with chain, block and address evidence",
  },
  planned: {
    label: "Planned",
    detail: "Not implemented and not evidence",
  },
} as const;
export type Environment = keyof typeof environments;

export const workspaceEnvironment =
  "Recorded benchmark evidence · no wallet transaction";

export const liveEnvironment =
  "Fresh isolated EVM · Test maker and taker accounts · Mock tokens with no market value";

// The guide's §1 sequence, worded against docs/CAPACITY_GUARD_SPEC.md.
export const schedule = [
  {
    label: "Independent Aqua strategies",
    detail: "Each strategy keeps its own virtual balance in Aqua.",
  },
  {
    label: "One shared real inventory",
    detail: "Every strategy settles against the same vault's ERC-20 balance.",
  },
  {
    label: "CAPACITY_GUARD schedules access",
    detail:
      "A custom SwapVM instruction admits or rejects each fill before settlement.",
  },
  {
    label: "Guaranteed capacity + controlled burst",
    detail: "Sibling entitlements stay covered; inventory above them can burst.",
  },
  {
    label: "Actual transfer receipt",
    detail: "The receipt shows which real balances changed.",
  },
];

// docs/BENCHMARK_RESULTS.md: eight strategies, low-contention successful swaps, median gas.
export const measuredGas = { strategies: 8, guarded: 210_099, raw: 113_715 };

// docs/BENCHMARK_RESULTS.md, same eight strategies under concentrated demand: rejecting
// early costs more than letting settlement fail. Both medians are cross-checked at build
// time in landing-evidence.ts.
export const measuredRejectionGas = {
  guard: 146_465,
  rawSettlementFailure: 126_779,
};

// README "Current state": the supported domain is one token pair and up to eight strategies.
export const maxStrategies = 8;

// Pinned identities only, each traceable: package.json (Aqua, SwapVM, Hardhat),
// hardhat.config.ts (Solidity), docs/CAPACITY_GUARD_SPEC.md (opcode),
// deployments/sepolia/report.json (network, Sourcify status) and web/package.json (Next).
export const builtOn = [
  "1inch Aqua",
  "SwapVM",
  "CAPACITY_GUARD 0x05",
  "Solidity 0.8.30",
  "Hardhat 3.8.0",
  "Ethereum Sepolia",
  "Sourcify exact match",
  "Next.js 16",
];

export const limitations = [
  "Smaller guarantees leave more inventory for burst. Higher fill volume at 50% protection is not an equal-protection efficiency claim.",
  `At eight strategies, low-contention guarded swaps measured ${num(measuredGas.guarded)} median gas versus ${num(measuredGas.raw)} raw. Guard rejection can cost more than failed settlement.`,
  "Transaction-scoped reservations can reject otherwise safe sequential fills in the same outer transaction.",
  "Fee-on-transfer, rebasing and malicious tokens are outside the supported domain. These tests do not establish general solvency or financial safety.",
];
