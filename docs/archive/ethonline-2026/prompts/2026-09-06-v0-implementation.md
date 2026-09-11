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

Continuation: owner requested continued work. Root implemented separate mined
transactions and representative group-size gas using pinned official contracts.
Read-only benchmark auditor scope: equal backing/demand, transaction isolation,
failure cause, all token/virtual changes, provenance and measured-versus-assumed
claims. Auditor recomputed the final raw swaps and closed assertion gaps after
root corrections; no A/B/C benefit or worst-case gas claim was authorized by evidence.

Stateful/numeric continuation: owner requested continued engineering. Root reused the
replay harness for three fixed-seed 64-trade sequences with a separately maintained
ledger; retain every attempt and direct deposit. Read-only auditor scope: regenerate
PRNG/calldata, independently check capacity, rounding, accounting and honest limitations.
Worker scope: five numeric tests in test/AquaQoS.t.sol only, using pinned Aqua/XYC
errors; no production/config edits or nested agents. Root reviewed the diff, corrected
test call ordering, added explicit quote-versus-saturated-ledger rollback evidence,
and reran the full suite. No arithmetic limits or invariants were silently weakened.
