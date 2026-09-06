# Sanitized implementation contract

Owner requested continued AquaQoS development with simple progress explanations.
The existing authorization and specification require the smallest reviewed guard,
tests, independent security review, reproducible evidence and local milestone commits.

Root implementation scope: immutable pair-specific vault, maximum eight registered
canonical strategies, first-in-program opcode 0x05 wrapping official XYC and salt,
fee-free final debit enforcement, static quote checks, transient per-strategy/token
reservations and transaction-touched lifecycle restriction. No frontend/deployment.

Worker scope: test/AquaQoS.t.sol only; real official Aqua settlement; exact boundaries,
quote/swap consistency, stale quotes, both directions, lifecycle authorization,
callback sibling attempts, and fuzz checks. No contract edits or nested agents.
Root inspected the test file and added allowance, rollback and activation regressions.

Read-only review scope: canonical execution, vault authority, transient reservations,
replenishment, external calls, token behavior, inherited simulator/rescue paths.
M1 correction contract: preserve full configured guarantee allowance after every
pending/output debit; test decrement-on-max token behavior and permissionless push.
Review outcome and residual gates are in SECURITY_REVIEW_V0.md.
