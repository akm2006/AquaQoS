import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  actionsFor,
  outcome,
  policies,
  tone,
  validateReport,
  type Policy,
} from "../evidence";
import { measuredGas, measuredRejectionGas } from "./copy";

// Server-only. Every landing number is derived here at build time from the same checked
// files the app serves, so nothing on `/` is transcribed by hand. A missing file, a failed
// validation or a drifted claim throws, which fails the build (docs/APP_REFACTOR_GUIDE.md §4).
const read = (name: string) =>
  JSON.parse(
    readFileSync(join(process.cwd(), "public", "evidence", name), "utf8"),
  );

const report: unknown = read("report.json");
validateReport(report);

type Manifest = {
  sourceCommit: string;
  originalReportSHA256: string;
  sepolia: { chainId: number; transactions: number };
};
const manifest = read("manifest.json") as Manifest;
if (
  manifest.sourceCommit !== report.sourceCommit ||
  !/^[a-f0-9]{64}$/.test(manifest.originalReportSHA256) ||
  !Number.isInteger(manifest.sepolia?.chainId) ||
  !(manifest.sepolia?.transactions > 0)
)
  throw Error("Evidence manifest does not match the checked report.");

const scenarios = report.runs.flatMap((run) => run.scenarios);
const actions = scenarios.flatMap(actionsFor);

export const totals = {
  runs: report.runs.length,
  fixtures: scenarios.length,
  swaps: actions.filter((a) => a.type === "swap").length,
  pushes: actions.filter((a) => a.type === "push").length,
};

export const sourceCommit = report.sourceCommit;
export const sepolia = manifest.sepolia;

const scenarioFor = (count: number, system: Policy, workload: string) => {
  const run = report.runs.find((r) => r.count === count && r.system === system);
  const scenario = run?.scenarios.find((s) => s.name === workload);
  // validateReport already guarantees both exist; this keeps the types honest.
  if (!scenario) throw Error(`Missing ${system}/${count}/${workload} evidence.`);
  return scenario;
};

// docs/BENCHMARK_RESULTS.md averages the middle two observations for an even sample.
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const medianGas = (
  count: number,
  system: Policy,
  workload: string,
  result: string,
) =>
  median(
    actionsFor(scenarioFor(count, system, workload))
      .filter((a) => a.type === "swap" && a.outcome === result)
      .map((a) => a.gasUsed),
  );

// The published gas claims must still be what the retained report measures.
const claims: [string, number, number][] = [
  [
    "guarded swap",
    measuredGas.guarded,
    medianGas(measuredGas.strategies, "C", "lowContention", "success"),
  ],
  [
    "raw swap",
    measuredGas.raw,
    medianGas(measuredGas.strategies, "B", "lowContention", "success"),
  ],
  [
    "guard rejection",
    measuredRejectionGas.guard,
    medianGas(
      measuredGas.strategies,
      "C",
      "concentratedOverload",
      "guard_rejection",
    ),
  ],
  [
    "raw settlement failure",
    measuredRejectionGas.rawSettlementFailure,
    medianGas(
      measuredGas.strategies,
      "B",
      "concentratedOverload",
      "settlement_failure",
    ),
  ],
];
for (const [label, claimed, derived] of claims)
  if (claimed !== derived)
    throw Error(`Gas claim for ${label} drifted: ${claimed} vs ${derived}.`);

// The workspace's own default selection, so "replay it" lands on exactly these rows:
// two strategies, concentrated demand, Raw Aqua against AquaQoS · 50% protected, Token 1.
const DEFAULT = {
  count: 2,
  workload: "concentratedOverload",
  baseline: "B",
  policy: "C",
  token: 1,
} as const;

const cell = (system: Policy, step: number) => {
  const action = actionsFor(scenarioFor(DEFAULT.count, system, DEFAULT.workload))[
    step - 1
  ];
  return {
    remaining: action.after.tokens[DEFAULT.token].balance,
    outcome: outcome(action),
    tone: tone(action),
  };
};

export const recordedStep = {
  strategies: DEFAULT.count,
  token: DEFAULT.token,
  baseline: policies[DEFAULT.baseline],
  policy: policies[DEFAULT.policy],
  rows: [3, 4].map((step) => ({
    step,
    raw: cell(DEFAULT.baseline, step),
    guarded: cell(DEFAULT.policy, step),
  })),
};
