# AquaQoS benchmark methodology (v1)

This document defines the comparison before benchmark code is written. Numbers are
not claims until a clean-source run produces the raw report.

## Question

Does a protected-capacity scheduler let several Aqua strategies use shared maker
inventory with fewer settlement failures than raw overcommitment, while preserving
the conservative allocation's protected capacity and making the utilization/price
trade-off visible?

## Systems under test

Every system uses the pinned Aqua/SwapVM sources, the same Cancun EVM, compiler,
optimizer settings, TokenMock pair, fee-free XYC program, exact-output demand, and
the same maker/taker accounts.

* **A — conservative Aqua:** official Aqua, no guard, virtual balances and real
  backing split evenly across strategies (`backing / N`). Aggregate virtual depth
  equals initial real backing, so this is the no-overcommit reference.
* **B — raw overcommitment:** official Aqua, no guard, every strategy advertises the
  full backing as its virtual balance. Real maker inventory is shared and unchanged.
  Settlement failures are expected when aggregate successful output exceeds it.
* **C — AquaQoS:** AquaQoS router/vault, every strategy advertises the full backing,
  and each strategy receives an equal guarantee (`backing / N`). The guard may use
  the remaining burst capacity only when sibling guarantees remain protected.

The A quotes are intentionally shallower. All systems still use the same XYC
formula, fee setting, rounding and offered output amounts; input required by each
quote is recorded rather than silently normalized. This makes the price/depth cost
of conservative allocation part of the result.

## Common starting state

For each strategy count `N` (at least 1, 2, 4 and 8), each fixture starts with:

* one maker pair and equal initial real inventory `B` of each token;
* zero reservations and the same taker balances, high enough for the largest quote;
* deterministic strategy salts, registration order and program bytes;
* A virtual/real per-strategy allocation `B/N`;
* B and C virtual balance `B` per strategy;
* C guarantees totaling `B` per token, with no initial burst consumption;
* the same XYC exact-output quote, token direction, fee and integer rounding rules.

No system receives a different initial inventory, extra replenishment or a different
failure budget. A replenishment is an explicit workload event and is replayed at the
same step in every system where the operation is supported.

## Workloads

The benchmark uses fixed seeds and preserves the full offered-demand sequence. Each
scenario is run independently against fresh EVM state, with every swap mined as its
own transaction so transient reservations cannot hide inter-order behavior.

1. **Low contention:** one active strategy at a time; checks that conservative
   allocation is not penalized by unrelated siblings.
2. **Balanced contention:** all strategies receive the same deterministic demand
   stream and both token directions.
3. **Concentrated demand:** one strategy consumes its guarantee and burst before
   siblings are offered demand.
4. **Replenishment:** fixed Aqua pushes restore output capacity at documented steps.
5. **Adversarial order:** the same demand multiset is replayed in forward, reverse
   and seeded-shuffle order.
6. **Overloaded demand:** offered output intentionally exceeds initial backing; this
   is the failure-discrimination case, not a success-rate target.

The exact sequence, seed, strategy index, direction and amount are written to the
raw JSON. Demand is never reduced after a rejection. Taker balances are replenished
only by the declared fixture setup, not opportunistically after failures.

## Outcome classification

Every offered swap has exactly one primary outcome:

* `success` — receipt succeeds and the expected ERC-20 and Aqua virtual deltas match;
* `quote_rejection` — the quote/program cannot admit the requested output before
  settlement (for example insufficient virtual depth);
* `guard_rejection` — AquaQoS rejects with its capacity error before token movement;
* `settlement_failure` — raw Aqua reaches settlement but real balance/allowance is
  insufficient and the transaction rolls back;
* `funding_failure` — the fixture cannot fund the declared taker or maker action;
  this is a harness failure, not a trading result;
* `other_revert` — any unexpected revert, which fails the benchmark run until
  explained.

Guard rejections and settlement failures are never counted as successful volume.
The report also records `protected_capacity_violation`: after a successful fill, any
configured sibling guarantee or the current strategy's tested entitlement is below
the declared invariant. `false_guard_rejection` is reserved for a guard rejection
that a replay without the guard proves could settle while all configured guarantees
remain intact; it should be zero for the validated fixture, not assumed to be zero.

## Metrics and denominators

Raw per-attempt records are the source of every aggregate:

* **successful output volume:** sum of maker output tokens transferred on `success`;
* **offered volume:** sum of all requested output amounts, including rejected ones;
* **shared-liquidity ratio:** successful output volume / offered volume;
* **settlement-failure rate:** settlement failures / offered attempts;
* **guard-rejection rate:** guard rejections / offered attempts;
* **protected-capacity violations:** count of successful attempts that break the
  configured invariant;
* **capital utilization:** successful output volume / initial maker output backing;
* **burst utilization:** output beyond each C guarantee / configured burst capacity;
* **quote input:** XYC input required for each offered amount, including rejected
  attempts where a quote exists;
* **gas:** transaction `gasUsed`, reported separately for success and each rejection
  class, with setup excluded from swap medians.

The report includes medians and totals only when the sample count supports them; it
does not invent a target threshold. Neutral or losing scenarios remain in the report.

## Reproducibility and review gates

The runner must record the source commit and dirty flag, file hashes, lockfile,
package-manager/compiler/EVM versions, build-info identity, seeds, scenario parameters,
initial/final snapshots, transaction receipts, decoded revert bytes and commands.
It must fail if an unexpected outcome, accounting mismatch, source-hash mismatch or
guarantee violation occurs. A clean-source replay and a separate read-only benchmark
audit are required before performance claims or frontend proof-page numbers.

This is a local-EVM protocol benchmark. It measures the tested fixture and cannot by
itself establish mainnet liquidity, economic profitability, universal solvency or
real-market value.
