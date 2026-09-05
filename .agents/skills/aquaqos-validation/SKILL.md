---
name: aquaqos-validation
description: Test, fuzz, benchmark or security-review AquaQoS capacity invariants and official Aqua/SwapVM integration.
---

Read repository `docs/ACCEPTANCE_CRITERIA.md` and the tested specification/decisions. Prove
the raw official baseline before claiming a fix. Assert real ERC-20 and virtual balance
changes, failure cause and transaction rollback; a model-only simulation is insufficient.

Cover unknown/duplicate/docked strategies, unauthorized config, allowance shortage,
reserve overconfiguration, zero/max/rounding, exact-in/out, reverse replenishment, fees,
callback/nested sibling execution and stale quotes. Fuzz state transitions where valuable;
save failing seeds. Never change an invariant to accommodate a failing implementation.

Compare conservative Aqua, raw overcommitment and QoS with equal backing and identical
offered demand. Define units and denominators; separate guard rejection, settlement failure
and successful volume. Include neutral/losing workloads. Preserve machine-readable raw
attempts, seeds, source/build commits, compiler/EVM settings, gas and reproduction commands.
Never fabricate values or equate advertised virtual depth with realized capital efficiency.

Request a separate read-only review for high-risk changes and a benchmark audit before
publication. Update STATUS with actual commands/results and unresolved limitations.
