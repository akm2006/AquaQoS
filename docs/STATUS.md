# AquaQoS handoff

Updated 2026-09-11. Current phase: public-repository cleanup, followed by the approved
five-route Next.js product refactor. Submission packaging remains deferred until the product
and full release rehearsal are complete.

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

## Product state

- `web/` is a Next.js 16.3.4 / React 19.2.8 App Router application with frozen dependencies.
- The recorded workspace supports all retained policies, workloads, and 2/4/8-strategy groups.
- `/live/` executes against a fresh isolated local EVM and checks actual receipts, transfers,
  configuration, replenishment, rejection, and maker exit paths.
- `/proof/` links protocol evidence. The approved refactor will add the final landing,
  `/workspace/`, `/live/`, `/proof/`, and curated `/docs/` product routes.
- Existing browser checks cover 72 comparison selections plus 1440/390/320px layouts. A new
  independent frontend evidence-path review is required after the refactor.

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
- Repository visibility, GitHub security settings, release publication, wallet custody, video,
  and ETHGlobal dashboard actions require the owner. See
  [manual actions](archive/ethonline-2026/MANUAL_ACTIONS.md).

## Next three tasks

1. Complete and browser-verify the five-route Next.js refactor with consistent local, recorded,
   fork, and Sepolia evidence labels.
2. Run a separate frontend evidence-path/accessibility review and resolve its findings.
3. Re-run protocol, evidence, benchmark, web, link, secret, and fresh-checkout release gates;
   then prepare the owner-approved public `v0.1.0` prerelease.

Historical milestone detail is retained in
[STATUS_HISTORY.md](archive/development/STATUS_HISTORY.md).
