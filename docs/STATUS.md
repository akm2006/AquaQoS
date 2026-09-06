# AquaQoS handoff

Updated 2026-09-07. Phase: v0 protocol implementation and validation. Guard/router/vault
and first integration suite work locally; full protocol acceptance remains open.

- Last milestone: 192 seeded model-versus-EVM swaps and 30 replenishments passed,
  plus numeric limits/rollback regressions. Independent auditor regenerated every
  seeded attempt; raw results remain in benchmarks/raw/transactions-v1.json.
- Works: local Git initialized; requirements, protocol source map, candidate pins, phase gates,
  three domain skills and three read-only reviewer roles written. No public repository/remote.
- Protocol tests: `pnpm test` passes 24 Solidity tests, including 256 fuzz runs in one
  property test. Three tests reproduce raw Aqua failures; twenty-one exercise v0.
  No currently failing tests. Test inventory: test/AquaQoS.t.sol and PROBLEM_REPRODUCTION.
- `pnpm test:transactions`: passed; exact failure bytes, full fill accounting, sibling
  isolation, aggregate backing, reservation events and transaction clearing asserted.
- Seeded sequences: seeds 1/42/12648430 on 2/4/8 strategies, 64 attempts each;
  137 fills admitted and 55 capacity rejections, all matching the independent model.
  Adaptive demand and supported mock tokens only; not A/B/C benchmark evidence.
- Benchmark method: [BENCHMARK_METHODOLOGY.md](BENCHMARK_METHODOLOGY.md) now fixes A/B/C
  allocations, identical offered demand, XYC pricing disclosure and outcome classes;
  implementation waits for independent audit.
- Clean-source replay at eeee95a: frozen offline install of 528 cached packages,
  build, 15 committed tests and replay passed; source/runtime hashes and gas match.
  Uncached downloads failed with error 23; network-only install remains unverified.
  Nine newer tests pass in main checkout (24 total). See TRANSACTION_VALIDATION.
- Known risks: same-transaction conservatism; worst-case group gas unmeasured;
  numeric input-ledger saturation can permit a quote then revert settlement atomically;
  unsupported token behavior; docs/ABI drift;
  limited prior-art search; source license mapping and human/provenance eligibility gates.
- Benchmark: representative full-swap gas 137265/146250/165475/210404 for 1/2/4/8
  strategies. Not guard overhead or A/B/C performance evidence. See TRANSACTION_VALIDATION.
- Deployment: none. Target local fork for final transfer demo; chain/block not chosen yet.
- Blockers: none for independent protocol validation. Human eligibility/provenance and publication actions remain in MANUAL_ACTIONS.
- Review: separate read-only review found M1 (allowance after permissionless replenishment);
  corrected output floor and follow-up review closed it. SECURITY_REVIEW_V0 records scope
  and limits; this is not an external audit or final security certification.
- Local compiled byte sizes (solc 0.8.30, viaIR, optimizer 700, Cancun): router runtime
  21,072 / initcode 22,451; vault runtime 8,209 / initcode 9,192. Both below EVM limits.
  Solidity test harness exceeds deployment size limits; it is test-only. Compiler's
  transient-state composability warning corresponds to the documented v0 limitation.

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

1. Implement the audited shared offered-demand A/B/C benchmark and retain raw failures.
2. Re-run the benchmark on a clean commit and independently recompute its metrics.
3. Retry uncached install when downloads work and resolve remaining acceptance gaps.
   Frontend remains downstream of protocol/benchmark acceptance.

See EXECUTION_PLAN for later work, HACKATHON_REQUIREMENTS for deadline and hard gates,
CODEX_SETUP for relaunch/fallback. Next milestones must update this handoff and create real commits.
