import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
// Reuse the protocol's full checker before copying evidence into the web build.
execFileSync(process.execPath, ["scripts/check-benchmark.mjs"], {
  cwd: root,
  stdio: "inherit",
});
const output = new URL("../public/evidence/", import.meta.url);
mkdirSync(output, { recursive: true });
const source = readFileSync(
  new URL("../../benchmarks/raw/a-b-c-v1.json", import.meta.url),
);
const report = JSON.parse(source);
writeFileSync(new URL("report.json", output), JSON.stringify(report));
// Summarise the public deployment so the app can cite it without shipping the full receipts.
const sepolia = JSON.parse(
  readFileSync(new URL("../../deployments/sepolia/report.json", import.meta.url)),
);
writeFileSync(
  new URL("manifest.json", output),
  JSON.stringify(
    {
      sourceCommit: report.sourceCommit,
      originalReportSHA256: createHash("sha256").update(source).digest("hex"),
      kind: report.kind,
      verification: "check-benchmark.mjs passed before export",
      limitations: report.limitations,
      sepolia: {
        chainId: sepolia.chainId,
        transactions: sepolia.transactions.length,
      },
    },
    null,
    2,
  ),
);
for (const name of [
  "CAPACITY_GUARD_SPEC",
  "BENCHMARK_RESULTS",
  "BENCHMARK_METHODOLOGY",
  "PROBLEM_REPRODUCTION",
  "SECURITY_REVIEW_V0",
  "THIRD_PARTY",
  "AI_PROVENANCE",
  "DEMO",
]) {
  writeFileSync(
    new URL(`${name}.md`, output),
    readFileSync(new URL(`../../docs/${name}.md`, import.meta.url)),
  );
}
console.log("Prepared checked local evidence for the Next.js app.");
