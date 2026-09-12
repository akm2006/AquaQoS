import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const output = new URL("../public/evidence/", import.meta.url);
mkdirSync(output, { recursive: true });
const source = readFileSync(
  new URL("../../benchmarks/raw/a-b-c-v1.json", import.meta.url),
);
const report = JSON.parse(source);
const portable = process.argv.includes("--portable");
if (portable) {
  // Vercel checks out only recent Git history. Recheck every retained transaction and
  // metric here; CI remains responsible for authenticating the historical source commit.
  const { checkBenchmark } = await import("../../scripts/check-benchmark.mjs");
  checkBenchmark(report);
} else {
  // Local and CI builds authenticate the report against its exact historical sources.
  execFileSync(process.execPath, ["scripts/check-benchmark.mjs"], {
    cwd: root,
    stdio: "inherit",
  });
}
writeFileSync(new URL("report.json", output), JSON.stringify(report));
// Summarise the public deployment so the app can cite it without shipping the full receipts.
const sepolia = JSON.parse(
  readFileSync(new URL("../../deployments/sepolia/report.json", import.meta.url)),
);
const publicTransactions = sepolia.transactions.filter(({ name }) =>
  [
    "reject 600 to protect sibling",
    "first protected 500",
    "reject sibling 501",
    "sibling protected 500",
    "replenish first strategy",
    "restored protected 500",
    "reverse replenishment 100",
  ].includes(name),
);
writeFileSync(
  new URL("manifest.json", output),
  JSON.stringify(
    {
      sourceCommit: report.sourceCommit,
      originalReportSHA256: createHash("sha256").update(source).digest("hex"),
      kind: report.kind,
      verification: portable
        ? "transaction and metric checks passed during export; historical source authentication is enforced by CI"
        : "full benchmark and historical source authentication passed before export",
      limitations: report.limitations,
      sepolia: {
        chainId: sepolia.chainId,
        transactions: sepolia.transactions.length,
        sourceCommit: sepolia.sourceCommit,
        officialAqua: sepolia.addresses.aqua,
        contracts: sepolia.deployments.map(({ name, address, explorer }) => ({
          name:
            name === "TokenMock"
              ? `Demo token ${address === sepolia.addresses.tokens[0] ? "aqA" : "aqB"}`
              : name,
          address,
          explorer,
          sourcify: `https://repo.sourcify.dev/${sepolia.chainId}/${address}`,
        })),
        actions: publicTransactions,
      },
    },
    null,
    2,
  ),
);
for (const [name, path] of [
  ["CAPACITY_GUARD_SPEC"],
  ["BENCHMARK_RESULTS"],
  ["BENCHMARK_METHODOLOGY"],
  ["PROBLEM_REPRODUCTION"],
  ["SECURITY_REVIEW_V0"],
  ["THREAT_MODEL"],
  ["SEPOLIA_DEPLOYMENT"],
  ["THIRD_PARTY"],
  ["AI_PROVENANCE", "../../docs/archive/ethonline-2026/AI_PROVENANCE.md"],
  ["DEMO", "../../docs/product/DEMO.md"],
]) {
  writeFileSync(
    new URL(`${name}.md`, output),
    readFileSync(new URL(path ?? `../../docs/${name}.md`, import.meta.url)),
  );
}
console.log("Prepared checked local evidence for the Next.js app.");
