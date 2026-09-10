# AquaQoS handoff

Updated 2026-09-10. Phase: v0 protocol implementation, live local product and frontend
refactor planning. The supported protocol, benchmark evidence and local execution workspace
work; public deployment, testnet proof and submission packaging remain intentionally open.

The owner-approved `DESIGN.md` now locks the supplied `AquaQoS.svg` as the final logo and
defines the blue-led marketing / calm application split. `docs/APP_REFACTOR_GUIDE.md` records
the approved five-route structure, curated `/docs/` surface, dependency policy, logo motion
rules and frontend acceptance gates. No application refactor code has been changed yet.

Sep 10 milestone complete: 30 Solidity tests pass, including three 256-run fuzz properties;
the independent protocol review found no release-blocking defect in the documented v0 scope.
The clean comparative report has 72 fixtures (616 swaps, 12 pushes), balanced/shuffled demand,
and 22 checker tests pass. Rejection replay has 52 candidates plus 12 controls, with 35
capacity breaches, 17 settlement failures and zero safe fills in that bounded sample.

The live Next.js workspace now drives a fresh isolated Cancun EVM: setup, quote, successful
fills, guarded rejection, sibling fill, push, pause/guarantee updates, docking and withdrawal
all produce checked receipts and token-transfer evidence. API self-check and browser checks
are the current local product gate; this is not a wallet, testnet or public deployment.

Owner direction (2026-09-09): frontend must be a polished Next.js product. Submission
packaging, video, paper and dashboard work are on hold until product polish is complete.

- Current product milestone: `web/` is a Next.js 16.3.4 / React 19.2.8 App Router app
  with a separate frozen lockfile. Side-by-side A/B vs C/C100 comparison supports all
  2/4/8 strategy groups and four retained workloads. It displays real balances,
  remaining configured capacity, inventory trajectories, successful/reverted receipts
  and replenishment Transfer logs. `/proof/` serves protocol evidence links.
  Build-time export reuses the complete benchmark checker; numbers are retained local
  evidence. `/live/` is a separate local-EVM execution flow with maker configuration;
  no wallet, testnet or public deployment is implied.
  The original HTML frontend is replaced; `pnpm proof:serve` now starts Next.js locally.
  Validation: production static build, TypeScript check, production dependency audit
  (no known vulnerabilities), bootstrap links and all 72 retained benchmark fixtures pass.
  Playwright covers 72 comparison selections, real fill/rejection/push values, receipt
  logs, scenario boundaries, malformed-data retry and 1440/390/320px layouts. Root
  inspected rendered desktop/mobile screenshots and the evidence-to-display paths.
  The root `pnpm proof:serve` launcher passed the same browser suite on port 4173;
  fresh console had zero errors/warnings. Network inspection showed successful evidence
  loads and dev-mode effect-cleanup aborts followed by successful retries, not HTTP errors.
  The live API and browser checks cover authenticated local execution, actual receipts,
  rejected and successful fills, replenishment and the full exit path. Independent frontend
  review remains open; the protocol review is internal and is not an external audit.

- Previous milestone: a dependency-free transaction replay was linked from `proof/index.html`
  at `proof/demo.html`. It reads the retained clean A/B/C/C100 report and steps through
  actual local-EVM receipts, maker/taker balances, independent virtual balances and ERC-20
  `Transfer` logs. Browser checks passed at desktop and 390px mobile sizes; the first run
  exposed a missing `.mjs` MIME type in the local proof server, which is corrected. This is
  evidence replay, not a wallet flow or live deployment.
- Release review: root completed a focused read-only pass over router/vault authorization,
  canonical program enforcement, allowance floors, transient reservations and lifecycle
  exits. No new v0-scope blocker was found; `docs/SECURITY_REVIEW_RELEASE.md` records the
  conditions and explicitly leaves independent review and deployment verification open.

- Last milestone: D017 eight-strategy comparative measurement and separate read-only
  benchmark audit passed. Clean source `0ae94ec` generated 48 fixtures with 392 swaps
  and 12 pushes; replay source `7a972af` covers 52 rejected candidates and 12 controls:
  17 settlement failures, 35 capacity breaches, zero safe fills in this bounded sample.
  All 20 benchmark checker tests, 12 replay corruption checks and 30 Solidity tests pass.
  Original 2/4 metrics are unchanged. Eight-strategy low-contention success median is
  210,099 gas guarded versus 113,715 raw; concentrated guard rejection costs more than
  raw settlement failure (146,465/147,137 versus 126,779). No protocol code changes.
  Proof page counts/limits and desktop/mobile browser checks are current; favicon 404
  corrected, no console errors after reload, benchmark documentation link returned 200.
- Public presentation cleanup: protocol-first README and verification page, event records
  archived under `docs/archive/ethonline-2026/`, and the original owner planning brief
  removed from the current tree and all reachable Git history. Main is pushed to the
  private `akm2006/AquaQoS` repository; use Git history for the latest milestone identity.

- Previous benchmark milestone: clean C100 matched-guarantee replay from `337beeb` passed 32 fresh
  fixtures (216 swaps, 8 pushes). `pnpm check:benchmark` and 17 checker tests passed,
  including 16 corrupted-report cases. `pnpm test` passed all 24 Solidity tests again.
  Raw schema v2 replaces historical v1 numbers at the same path. No protocol code changed.
- Works: local Git initialized; requirements, protocol source map, candidate pins, phase gates,
  three domain skills and three read-only reviewer roles written. GitHub remote is configured
  and currently private; no public deployment exists.
- Protocol tests: 30 passing, including 256 fuzz runs each in three properties.
  Three reproduce raw Aqua failures, twenty-one exercise v0, two compare guarded
  rejections with reference settlement and four cover fee/callback boundaries.
- `pnpm test:transactions`: passed; exact failure bytes, full fill accounting, sibling
  isolation, aggregate backing, reservation events and transaction clearing asserted.
- Seeded sequences: seeds 1/42/12648430 on 2/4/8 strategies, 64 attempts each;
  137 fills admitted and 55 capacity rejections, all matching the independent model.
  Adaptive demand and supported mock tokens only; not A/B/C benchmark evidence.
- Benchmark method: [BENCHMARK_METHODOLOGY.md](BENCHMARK_METHODOLOGY.md) defines A/B/C/C100,
  equal real backing and identical offered demand. C100 matches A's initial allocation;
  prices/custody still differ. V2 retains receipts/build identity and recomputes recorded
  transfers, sibling state, error bytes, capacity and metrics. D011 corrects the earlier
  overstated checker scope and virtual-surplus burst denominator. See method for limits.
- Clean-source replay at eeee95a: frozen offline install of 528 cached packages,
  build, 15 committed tests and replay passed; source/runtime hashes and gas match.
  The Sep 8 isolated uncached-download replay also installed all 528 packages,
  downloaded both compiler forms, built and passed 30 tests plus 239-transaction
  replay; executable code/ABI match, while full metadata differs as documented.
  See TRANSACTION_VALIDATION.
- Known risks: same-transaction conservatism; universal gas worst case unmeasured;
  numeric input-ledger saturation can permit a quote then revert settlement atomically;
  unsupported token behavior; docs/ABI drift;
  limited prior-art search; source license mapping and human/provenance eligibility gates.
- Benchmark: clean equal-guarantee C100 fills 6,000 output units in each concentrated
  case, matching A; C50 fills 9,000. This is policy/depth evidence, not a general
  efficiency improvement. Clean-source v2 evidence and corrected gas tables are in
  BENCHMARK_RESULTS; source/lock/method/checker hashes match.
- Deployment: none. Target local fork for final transfer demo; chain/block not chosen yet.
- Blockers: no protocol-work blocker. Sandbox benchmark attempts hit the compiler-cache
  lock; approved host-context replay passed. Rotate the exposed Context7 key (M7);
  eligibility/provenance and publication actions remain in
  archive/ethonline-2026/MANUAL_ACTIONS.
- Review: separate read-only review found M1 (allowance after permissionless replenishment);
  corrected output floor and follow-up review closed it. SECURITY_REVIEW_V0 records scope
  and limits; this is not an external audit or final security certification.
- Benchmark review: D017 reviewer found no blocking defect in the 2/4/8 extension,
  verified earlier outcomes unchanged and checked both-direction controls. Original
  benchmark Transfer logs are reconstructed; rejection replay checks calldata, deployment
  identity and recorded states but does not reconstruct replay Transfer logs. Broader
  tokens, balanced/shuffled workloads and final release-wide security review remain open.
- Local compiled byte sizes (solc 0.8.30, viaIR, optimizer 700, Cancun): router runtime
  21,072 / initcode 22,451; vault runtime 8,209 / initcode 9,192. Both below EVM limits.
  Solidity test harness exceeds deployment size limits; it is test-only. Compiler's
  transient-state composability warning corresponds to the documented v0 limitation.
- Eight-strategy lifecycle matrix passes in two isolated local EVMs. Highest observed
  charged gas: activation 518,103; late failed activation 518,883; registration
  248,911; guarantee update 80,388; pause 44,761; dock-all 182,846; partial
  withdrawal 59,748. These are matrix maxima, not universal upper bounds.

## Bootstrap verification

- `node scripts/check-bootstrap.mjs`: passed; source identities, recursive documentation links
  and local skills.
- Bundled skill-creator `quick_validate.py`: all three skills passed (WSL Python/PyYAML).
- Python `tomllib`: config and three role files parsed; required fields inspected.
- Installed CLI `codex debug prompt-input`: three project skills discovered. Agent tool schema
  is not in that output; confirm custom roles after relaunch, fallback documented.
- Approved host-context `codex --strict-config doctor --summary --ascii`: exit 0,
  config loaded; disk/thread warnings. Sandbox-context runs can report provisioning failure.
- `.gitignore` checks: env, dependencies, artifacts and research/uv scratch excluded.
- Root inspected staged role/skill/script/pin diffs; path/credential-pattern screening passed.
  New-file whitespace check passed after the public documentation cleanup.
- Independent `sol_auditor` review: status/diagnostic-context findings corrected; no remaining
  material bootstrap findings. This was operating-file review, not a protocol security audit.
- Dependency install/build/test: current pinned candidate pair resolves in the pnpm lockfile; peer-check reports only upstream optional Hardhat 2 / ethers 5 mismatches inside solidity-utils.
- Independent protocol/security reviews selected wrapper opcode `0x05` over Extruction and corrected fee undercounting, virtual-surplus deadlock, vault boundaries and lifecycle scope before implementation.
- `node scripts/check-capacity-model.mjs`: 327,168 bounded settlement cases passed,
  plus consumption, burst and replenishment examples. Model evidence only, not a contract proof.
- Baseline rollback snapshots cover both token balances and Aqua/router
  allowances across maker, taker, router and Aqua. Order-hash equality now asserts rather than assumes.

## Next three tasks

1. Refactor the app shell: integrate the final logo, add `/` landing and move recorded
   comparison to `/workspace/` without changing evidence logic.
2. Build the curated `/docs/` page and refine `/proof/` into the two-minute judge path;
   add route loading/error states and run browser checks.
3. After frontend gates pass, complete fresh-checkout/release audit and choose the authorized
   local-fork or testnet demonstration target. Submission work remains deferred.

Historical Sep 8 continuation (superseded by the 52-candidate report above):
standalone rejection replay and checker recreated all 30
capacity-rejected pre-states plus eight successful controls. Clean replay from `9d77eda`
classified 11 settlement failures, 19 successful capacity breaches and zero safe fills.
`node scripts/check-rejections.mjs --self-test` passed, rejecting 12 corrupted reports;
it now binds deployment layout/build identity and exact maker/program/amount/direction
calldata. Scope is static fee-free TokenMock with maximum allowance; focused
same-transaction and finite-allowance controls follow below, while broader workload
diversity remains open. No production contract edits.

Sep 8 proof continuation: `proof/index.html` and `scripts/serve-proof.mjs` provide a
dependency-free local verification page linking measured tests, raw benchmark/replay evidence and
reproduction commands. Desktop and 390px browser screenshots passed; it intentionally
does not claim a wallet flow or public deployment. Those remain release gates.

Sep 8 continuation: focused tests establish one safe sequential same-transaction
rejection (500 output units blocked by a settled 500-unit reservation) and a finite
allowance trade-off: an unguarded 500-unit fill leaves 999 allowance; a subsequent
500-unit push restores 1000 entitlement without replenishing that allowance. These are
deterministic examples, not generalized rejection rates. Independent reviewer hit its
usage limit; root fallback review performed and independent closure stays open.
Adding tests to the large existing harness hit solc's "Tag too large for reserved space"
internal error. A separate test contract resolved compilation without compiler/config
or production contract changes. Only test harnesses carry oversized-initcode warnings.

Sep 8 callback continuation: both taker callbacks tested with direction, payment-route
and transfer-order parameters; same-order reentry and all six owner lifecycle calls
reject. A nested sibling 501-unit output rejects, 500 succeeds, and missing outer
payment rolls back both fills. Eight fee-recipe insertions fail before execution;
canonical maker hooks/receiver and empty-fee settlement are source-mapped. Full suite
passes 30 tests after fixing a test-only nested expectRevert conflict. Root fallback
review completed; independent final review, broader adversarial sequences and token
coverage remain open. The new test-only initcode warning does not change deployment
bytecode. No benchmark regeneration or production/compiler changes were necessary.

Sep 8 lifecycle continuation: `pnpm exec hardhat run scripts/check-lifecycle-gas.mjs`
passed two eight-strategy fixtures (initial guarantees 1000 and 500). Registration,
ninth rejection, late token-B activation failure after all baseline writes, guarantee
cycles, pause, dock-all, empty dock and partial/full withdrawals assert exact failure
bytes or state deltas. Raw `benchmarks/raw/lifecycle-gas-v1.json` records 68 and 59
transactions, source/config/lock hashes, build settings, runtime hashes, calldata,
receipts and live `hashes[]` snapshots. Independent benchmark-auditor review found
no blocking issue; clean committed replay now records source `57a37a7` with
`dirty=false`. Maxima are charged receipt
gas within the declared matrix and exclude setup/deployment; swap/callback worst cases
and finite-allowance token writes remain outside its claim.

Sep 8 fresh verification: an isolated clone at source `0bf3447` downloaded all 528
packages into an empty local store, downloaded native/WASM solc into isolated Hardhat
caches, built nine Solidity entry files, passed 30 tests and replayed all 239 retained
transactions. Before/after states and gas matched; executable runtime/ABI matched,
while compiler metadata differed because the fresh checkout included newer tests and
an extra project remapping. Independent security review closed the recent callback/
conservatism tests; benchmark review closed rejection arithmetic, deployment identity,
calldata and retained Transfer-log inspection.
The lifecycle enumeration helper was tightened to reject RPC/ABI errors and now has
fresh fault-injection self-checks. A clean rerun after committing that helper now
records source `57a37a7` with `dirty=false`; gas and state results are unchanged.

See EXECUTION_PLAN for later work, archive/ethonline-2026/HACKATHON_REQUIREMENTS for
deadline and hard gates,
CODEX_SETUP for relaunch/fallback. Next milestones must update this handoff and create real commits.
