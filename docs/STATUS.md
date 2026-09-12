# AquaQoS handoff

Updated 2026-09-12. Current phase: polished five-route Next.js and Fumadocs product surface
adapted for an evidence-first public Vercel deployment. Submission packaging remains deferred
until the owner accepts the product.

## Verified state

- Last protocol-proof commit: `576e12e` (`main`). Production contracts have not changed
  since the verified local, fork, and Sepolia runs.
- Solidity: 30 tests pass, including three 256-run fuzz properties. Coverage includes the
  shared-inventory failure, authorization, lifecycle boundaries, callbacks, rollback,
  allowance floors, numeric limits, and the `CAPACITY_GUARD` wrapper.
- Model/replay: 327,168 bounded model cases and a 239-transaction replay pass.
- Benchmark: 72 A/B/C/C100 fixtures, 616 swaps and 12 pushes across 2/4/8 strategies and
  concentrated, alternating, balanced, and shuffled demand. Twenty-four benchmark checker
  tests pass, including recorded-source authentication. Raw evidence remains in `benchmarks/raw/`.
- Rejection replay: 52 guarded candidates plus 12 controls; 35 capacity breaches and 17
  settlement failures were identified, with zero safe fills rejected in that bounded sample.
- Local release proof: 45 local transactions and 43 authenticated Ethereum-fork transactions,
  including 16 detailed traces. The fork uses official AquaRouter code plus actual DAI/WETH
  contracts on an isolated local fork; no upstream state is changed.
- Sepolia: 22 public transactions from clean source `17a6b99`; router, vault, and two demo
  tokens are exact Sourcify creation/runtime matches. Checked behavior includes protected
  rejection, successful sibling fills, Aqua replenishment, reverse direction, pause, dock,
  and withdrawal.
- Review: a bounded independent internal protocol review found no demonstrated v0-scope
  defect or Sepolia blocker. This is not an external audit or production certification.
- Public-release rehearsal: clean commit `8710918` installed with frozen dependencies, passed
  the complete protocol/evidence gates and production web build, and remained Git-clean. The
  staged release diff also passed Gitleaks 8.30.1 with zero findings.
- Product integration commit `7566c4b` repeated the frozen offline install, complete protocol,
  model, benchmark, rejection, release-evidence, bootstrap, typecheck and 19-page production
  build gates from a separate clean worktree.
- Public-deployment commit `cdbee90` passed CI run `34690598304`, including the complete
  protocol/evidence gate, TypeScript, and the exact portable production build used by Vercel.

## Product state

- `web/` is a Next.js 16.3.4 / React 19.2.8 App Router application with frozen dependencies.
- The recorded workspace supports all retained policies, workloads, and 2/4/8-strategy groups.
- `/live/` executes against a fresh isolated local EVM and checks actual receipts, transfers,
  configuration, replenishment, rejection, and maker exit paths.
- The landing, `/workspace/`, `/live/`, `/proof/`, and curated `/docs/` routes are implemented.
  The supplied logo remains byte-identical, and the public pages distinguish recorded, live-local,
  and Sepolia evidence.
- Public entry points lead to verified proof and recorded evidence. On static hosting, `/live/`
  treats the absent localhost-only API as expected and gives direct proof/workspace links; its
  real local-EVM controls remain unchanged under `scripts/serve-live.mjs`.
- Root `vercel.json` installs both frozen dependency sets and exports `web/out`. Its portable
  build rechecks all benchmark transactions and metrics without relying on Vercel's shallow Git
  history; canonical source-commit authentication remains in CI and normal local builds.
- The integrated browser checks pass 72 comparison selections, all eight proof records, static
  Fumadocs search/navigation, malformed-evidence recovery, real local fills/rejections/
  replenishment/exit, and 1440/390/320px layouts without console or HTTP errors. Production
  dependencies report no known vulnerabilities. The root review found no demonstrated release
  blocker; two separate reviewer attempts produced no report because their services were
  unavailable, so no independent frontend approval is claimed.

## Supported claim and limits

AquaQoS v0 protects configured capacity for at most eight canonical, fee-free XYC strategies
sharing one immutable standard-ERC-20 pair through a restricted maker vault. It does not claim
general solvency, hostile-token support, profitable execution, universal gas bounds, or
production safety.

Known limits: same-transaction reservations can reject a later safe fill; extreme input-ledger
values may quote and then revert atomically in upstream settlement; token behavior is restricted;
gas measurements are scenario bounds; broader prior art and external audit remain open.

## Current blockers and manual actions

- No protocol implementation blocker.
- Rotate the previously exposed Context7 credential; no secret value is needed in this repo.
- Confirm the permitted visual-reference boundary recorded in `THIRD_PARTY.md` before public
  product release; no reference files are committed or deployed.
- Repository visibility, GitHub security settings, release publication, wallet custody, video,
  and ETHGlobal dashboard actions require the owner. See
  [manual actions](archive/ethonline-2026/MANUAL_ACTIONS.md).

## Next three tasks

1. Create a Vercel preview deployment from the repository root.
2. Verify all five preview routes, response headers, evidence links and mobile layouts before
   promotion to the public production URL.
3. Obtain owner visual acceptance and confirm the visual-reference boundary before production
   promotion.

Historical milestone detail is retained in
[STATUS_HISTORY.md](archive/development/STATUS_HISTORY.md).
