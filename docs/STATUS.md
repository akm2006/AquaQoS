# AquaQoS handoff

Updated 2026-09-06. Phase 1 problem reproduction is complete; no CAPACITY_GUARD implementation exists.

- Last milestone: pinned official packages installed and shared-inventory settlement failure reproduced.
- Works: local Git initialized; requirements, protocol source map, candidate pins, phase gates,
  three domain skills and three read-only reviewer roles written. No public repository/remote.
- Protocol tests: `pnpm test` passes 2 Solidity tests; exact reproduction is documented in `PROBLEM_REPRODUCTION.md`.
- Known risks: callback gap after VM program; per-order locking; final fees/wrapping;
  guarantee consumption undefined; incomplete membership/maker spend control; docs/ABI drift;
  limited prior-art search; source license mapping and human/provenance eligibility gates.
- Benchmark: no scripts or measurements yet. Brief numbers remain illustrative.
- Deployment: none. Target local fork for final transfer demo; chain/block not chosen yet.
- Blockers: none for the next protocol-specification milestone. Human eligibility/provenance and publication actions remain in MANUAL_ACTIONS.

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

## Next three tasks

1. Add the separate allowance-shortage reproduction and capture both failure preconditions.
2. Specify CAPACITY_GUARD units, protected-domain membership, consumption/replenishment and final-settlement invariant from the observed execution path.
3. Compare native Extruction with a custom dispatcher instruction, then obtain a read-only security review before implementing any guard.

See EXECUTION_PLAN for later work, HACKATHON_REQUIREMENTS for deadline and hard gates,
CODEX_SETUP for relaunch/fallback. Next milestones must update this handoff and create real commits.
