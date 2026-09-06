# AquaQoS handoff

Updated 2026-09-06. Phase: v0 protocol implementation and validation. Guard/router/vault
and first integration suite work locally; full protocol acceptance remains open.

- Last milestone: separate mined-transaction replay proves reservation clearing,
  sibling fills, replenishment and fresh-transaction maker exit; representative
  1/2/4/8-strategy gas retained with receipts in benchmarks/raw/transactions-v1.json.
- Works: local Git initialized; requirements, protocol source map, candidate pins, phase gates,
  three domain skills and three read-only reviewer roles written. No public repository/remote.
- Protocol tests: `pnpm test` passes 15 Solidity tests, including 256 fuzz runs in one
  property test. Three tests reproduce raw Aqua failures; twelve exercise the v0 guard.
  No currently failing tests. Test inventory: test/AquaQoS.t.sol and PROBLEM_REPRODUCTION.
- `pnpm test:transactions`: passed; exact failure bytes, full fill accounting, sibling
  isolation, aggregate backing, reservation events and transaction clearing asserted.
- Known risks: same-transaction conservatism; worst-case group gas unmeasured;
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

1. Close noncanonical-program/lifecycle/stateful-fuzz gaps in ACCEPTANCE_CRITERIA;
   expand gas evidence to callback/lifecycle extremes where relevant.
2. Rehearse a clean checkout install/build/test/replay; retain clean revision provenance.
3. Implement shared A/B/C benchmark workloads and independent methodology review.
   Frontend remains downstream of protocol/benchmark acceptance.

See EXECUTION_PLAN for later work, HACKATHON_REQUIREMENTS for deadline and hard gates,
CODEX_SETUP for relaunch/fallback. Next milestones must update this handoff and create real commits.
