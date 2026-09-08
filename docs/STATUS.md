# AquaQoS handoff

Updated 2026-09-08. Phase: v0 protocol implementation, security review and measurement.
Guard/router/vault, integration tests and a matched-policy benchmark work locally; full
protocol acceptance remains open.

- Last milestone: `pnpm test` passes 30 tests, adding callback/nested rollback,
  canonical maker-trait and fee-recipe regressions. Supported fee/callback source
  paths are mapped in SECURITY_REVIEW_V0. No production contract changes.
  Bootstrap and both benchmark/rejection evidence checkers also pass; the rejection
  checker rejects 12 corrupted reports and the benchmark checker regenerates both seeds.
  No test failures remain.

- Previous benchmark milestone: clean C100 matched-guarantee replay from `337beeb` passed 32 fresh
  fixtures (216 swaps, 8 pushes). `pnpm check:benchmark` and 17 checker tests passed,
  including 16 corrupted-report cases. `pnpm test` passed all 24 Solidity tests again.
  Raw schema v2 replaces historical v1 numbers at the same path. No protocol code changed.
- Works: local Git initialized; requirements, protocol source map, candidate pins, phase gates,
  three domain skills and three read-only reviewer roles written. No public repository/remote.
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
  eligibility/provenance and publication actions remain in MANUAL_ACTIONS.
- Review: separate read-only review found M1 (allowance after permissionless replenishment);
  corrected output floor and follow-up review closed it. SECURITY_REVIEW_V0 records scope
  and limits; this is not an external audit or final security certification.
- Benchmark review: separate read-only auditor found no blocking C100/checker calculation
  issue; corrected custody wording and checked optimizer.enabled. Independent raw replay
  implementation review is now closed for retained receipts/calldata/logs and
  counterfactual classification. The checker now binds replay deployment identity and
  exact calldata; independent receipt-log reconstruction remains open.
- Local compiled byte sizes (solc 0.8.30, viaIR, optimizer 700, Cancun): router runtime
  21,072 / initcode 22,451; vault runtime 8,209 / initcode 9,192. Both below EVM limits.
  Solidity test harness exceeds deployment size limits; it is test-only. Compiler's
  transient-state composability warning corresponds to the documented v0 limitation.
- Eight-strategy lifecycle matrix passes in two isolated local EVMs. Highest observed
  charged gas: activation 518,103; late failed activation 518,883; registration
  248,911; guarantee update 80,388; pause 44,761; dock-all 182,846; partial
  withdrawal 59,748. These are matrix maxima, not universal upper bounds.

## Bootstrap verification

- `node scripts/check-bootstrap.mjs`: passed; brief byte hash, source identities and local links.
- Bundled skill-creator `quick_validate.py`: all three skills passed (WSL Python/PyYAML).
- Python `tomllib`: config and three role files parsed; required fields inspected.
- Installed CLI `codex debug prompt-input`: three project skills discovered. Agent tool schema
  is not in that output; confirm custom roles after relaunch, fallback documented.
- Approved host-context `codex --strict-config doctor --summary --ascii`: exit 0,
  config loaded; disk/thread warnings. Sandbox-context runs can report provisioning failure.
- `.gitignore` checks: env, dependencies, artifacts and research/uv scratch excluded.
- Root inspected staged role/skill/script/pin diffs; path/credential-pattern screening passed.
  New-file whitespace check passed; the preserved brief retains its original Markdown hard break.
- Independent `sol_auditor` review: status/diagnostic-context findings corrected; no remaining
  material bootstrap findings. This was operating-file review, not a protocol security audit.
- Dependency install/build/test: current pinned candidate pair resolves in the pnpm lockfile; peer-check reports only upstream optional Hardhat 2 / ethers 5 mismatches inside solidity-utils.
- Independent protocol/security reviews selected wrapper opcode `0x05` over Extruction and corrected fee undercounting, virtual-surplus deadlock, vault boundaries and lifecycle scope before implementation.
- `node scripts/check-capacity-model.mjs`: 327,168 bounded settlement cases passed,
  plus consumption, burst and replenishment examples. Model evidence only, not a contract proof.
- Baseline rollback snapshots cover both token balances and Aqua/router
  allowances across maker, taker, router and Aqua. Order-hash equality now asserts rather than assumes.

## Next three tasks

1. Expand the benchmark workload beyond the current 2/4-strategy TokenMock matrix.
2. Complete release-wide security review and document remaining supported-token limits.
3. Connect the proof page to a reproducible local transfer demo; keep wallet/UI scope minimal.

Current continuation: standalone rejection replay and checker recreate all 30
capacity-rejected pre-states plus eight successful controls. Clean replay from `d62d32a`
classified 11 settlement failures, 19 successful capacity breaches and zero safe fills.
`node scripts/check-rejections.mjs --self-test` passed, rejecting 12 corrupted reports;
it now binds deployment layout/build identity and exact maker/program/amount/direction
calldata. Scope is static fee-free TokenMock with maximum allowance; focused
same-transaction and finite-allowance controls follow below, while broader workload
diversity remains open. No production contract edits.

Sep 8 proof continuation: `proof/index.html` and `scripts/serve-proof.mjs` provide a
dependency-free local judge page linking measured tests, raw benchmark/replay evidence and
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

See EXECUTION_PLAN for later work, HACKATHON_REQUIREMENTS for deadline and hard gates,
CODEX_SETUP for relaunch/fallback. Next milestones must update this handoff and create real commits.
