# AquaQoS handoff

Updated 2026-09-06. Inventory/allowance reproductions and v0 specification review are implemented; fresh-checkout replay and retained trace remain open. No guard implementation exists.

- Last milestone: isolated allowance failure, strengthened rollback assertions, reviewed guard design and executable capacity model.
- Works: local Git initialized; requirements, protocol source map, candidate pins, phase gates,
  three domain skills and three read-only reviewer roles written. No public repository/remote.
- Protocol tests: `pnpm test` passes 3 Solidity tests; inventory and allowance failures are isolated and documented in `PROBLEM_REPRODUCTION.md`.
- Known risks: transient reservation implementation and same-transaction conservatism;
  bounded group gas; vault pause/dock code; unsupported token behavior; docs/ABI drift;
  limited prior-art search; source license mapping and human/provenance eligibility gates.
- Benchmark: no scripts or measurements yet. Brief numbers remain illustrative.
- Deployment: none. Target local fork for final transfer demo; chain/block not chosen yet.
- Blockers: none for the v0 implementation milestone. Human eligibility/provenance and publication actions remain in MANUAL_ACTIONS.

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
- Latest `pnpm test`: 3 passed; rollback snapshots cover both token balances and Aqua/router
  allowances across maker, taker, router and Aqua. Order-hash equality now asserts rather than assumes.

## Next three tasks

1. Implement the smallest XYC-only vault, wrapper opcode and custom router from the reviewed specification.
2. Add exact-boundary, one-unit-over, stale-quote, nested-sibling and pause/dock tests.
3. Run independent contract review and measure group-size gas before expanding beyond fee-free v0.

See EXECUTION_PLAN for later work, HACKATHON_REQUIREMENTS for deadline and hard gates,
CODEX_SETUP for relaunch/fallback. Next milestones must update this handoff and create real commits.
