import { num } from "./format";

// Reviewed UI copy only. Every claim must trace to docs/STATUS.md, a passing test or a
// retained report; see docs/APP_REFACTOR_GUIDE.md §10.

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

// docs/BENCHMARK_RESULTS.md: eight strategies, low-contention successful swaps, median gas.
export const measuredGas = { strategies: 8, guarded: 210_099, raw: 113_715 };

export const limitations = [
  "Smaller guarantees leave more inventory for burst. Higher fill volume at 50% protection is not an equal-protection efficiency claim.",
  `At eight strategies, low-contention guarded swaps measured ${num(measuredGas.guarded)} median gas versus ${num(measuredGas.raw)} raw. Guard rejection can cost more than failed settlement.`,
  "Transaction-scoped reservations can reject otherwise safe sequential fills in the same outer transaction.",
  "Fee-on-transfer, rebasing and malicious tokens are outside the supported domain. These tests do not establish general solvency or financial safety.",
];
