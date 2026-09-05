# AquaQoS operating contract

Start every session with `docs/STATUS.md`, then the relevant acceptance gates and decisions.
Mission: test and build protected-capacity scheduling for shared maker inventory using
official 1inch Aqua and SwapVM. Primary target: ETHOnline 2026 Classic / From Scratch,
1inch Build an Aqua App. The scheduling thesis is conditional, not a proven guarantee.

## Truth and scope

Resolve disagreements in this order: current official event/prize rules; current official
1inch docs/repositories/SDKs/whitepapers; source behavior proven by tests; validated project
decisions; the preserved winning package. Within technical sources, resolve documentation
drift against the exact source and executable behavior; record the discrepancy.
Prefer primary 1inch sources. Use Context7 for library/tool documentation, then inspect
current pinned official source. Never guess interfaces, fabricate results or claim novelty
from an incomplete search. Record URLs, refs, SHAs, checked dates and supported claims in
`docs/RESEARCH_SOURCES.md`; architecture changes require `docs/DECISIONS.md` entries.

## Engineering

Reproduce the problem before implementing CAPACITY_GUARD. Reuse official behavior and
installed tooling; minimize dependencies and contracts. Aqua/SwapVM must be load-bearing.
Avoid sponsor-integration soup, speculative abstractions and unrelated template features.
Keep frontend functional, accessible and minimal until protocol correctness, independent
review and reproducible benchmarks are stable. Follow `docs/EXECUTION_PLAN.md`.

All contract/accounting changes are high risk: define invariants and trace every caller;
distinguish virtual balances, actual inventory and ERC-20 allowance. Analyze authorization,
registration/lifecycle, unknown siblings, callbacks/reentrancy across orders, quote/swap
consistency, fees, rounding, token behavior, overconfiguration, maker exits and bounded gas.
Never silently weaken an invariant or change expected tests to accommodate broken code.
Prove a specification error and record the decision before changing a test expectation.
No mainnet spending, secrets, public publication or external messages without user authority.

## Verification and evidence

Ship tests with nontrivial logic: deterministic regression, negative/boundary/adversarial
cases and fuzz/invariants where valuable. A phase passes only with applicable acceptance
criteria, passing checks, resolved or explicitly accepted findings, updated docs and a commit.
Use a separate read-only security review before advancing high-risk protocol changes.
Root owns implementation and final review. Delegate bounded independent research/review
when useful; children never spawn agents. Use project reviewers; fallback: global
`sol_auditor` with the same role instructions, or a separate read-only root review pass.

Benchmarks compare conservative Aqua, raw overcommitment and AquaQoS on equal initial
inventory and shared workloads. Preserve seeds, commands, versions, raw machine-readable
results and limitations. Count guard rejections separately from settlement failures; report
all attempted demand so rejection cannot manufacture a zero-failure success claim.
Use precise tested-capacity language; no unconditional solvency, yield or safety claims.

## Continuity and release

Keep coherent local milestone commits; never rewrite published history. Inspect staged
diffs for secrets and generated files. Preserve the original brief and reused-source notices.
Track AI-assisted files and retain sanitized project prompts/specifications in
`docs/AI_PROVENANCE.md` and `docs/prompts/`. Human contribution and narration are event gates.
Update `docs/STATUS.md` after milestones and before ending long sessions; include actual
commands/results, risks and next three tasks. Keep claims traceable across README, proof
page, paper and demo. Use `docs/SUBMISSION_CHECKLIST.md` before release.
Record genuinely human-only actions in `docs/MANUAL_ACTIONS.md` with timing, steps and
required evidence. Continue independent work when one action is blocked; surface only
blocking choices. Do not modify global configuration, skills, agents or other repositories.
