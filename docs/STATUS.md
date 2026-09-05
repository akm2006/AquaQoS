# AquaQoS handoff

Updated 2026-09-05. Phase 0 complete: bootstrap validated and independently reviewed.
This handoff is included in the bootstrap milestone commit; identify it with `git log -1`.
Stop here for relaunch before core implementation, as requested by the owner.

- Last milestone: researched and validated local project operating system; original brief preserved.
- Works: local Git initialized; requirements, protocol source map, candidate pins, phase gates,
  three domain skills and three read-only reviewer roles written. No public repository/remote.
- Protocol tests: none implemented or run; no claims of protocol correctness.
- Known risks: callback gap after VM program; per-order locking; final fees/wrapping;
  guarantee consumption undefined; incomplete membership/maker spend control; docs/ABI drift;
  limited prior-art search; source license mapping and human/provenance eligibility gates.
- Benchmark: no scripts or measurements yet. Brief numbers are illustrative, not results.
- Deployment: none. Target local fork for final transfer demo; chain/block not chosen yet.
- Blockers: relaunch for new roles/skills before core implementation; no RPC/funds needed yet.
  Human eligibility/provenance and contribution confirmation tracked in MANUAL_ACTIONS.
  Disk headroom is 4.79 GiB; check before dependency installation.

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
- Dependency compatibility and protocol tests: deliberately pending phase 1; no package lock
  exists before installation. This is not a claim that current source candidates build together.

## Next three tasks

1. Relaunch, confirm local skills/roles; install exact candidate baseline with dependency
   lockfile and compile unmodified official Aqua/SwapVM using minimal Hardhat 3 harness.
2. Reproduce shared-inventory and allowance failures, sibling virtual independence and
   atomic rollback; retain deterministic command/trace. Do not implement guard yet.
3. Define invariant and guarantee lifecycle; compare native Extruction/custom instruction,
   resolve callback/fee bypass and Registry/Vault necessity through source/tests and review.

See EXECUTION_PLAN for later work, HACKATHON_REQUIREMENTS for deadline and hard gates,
CODEX_SETUP for relaunch/fallback. Next milestones must update this handoff and create real commits.
