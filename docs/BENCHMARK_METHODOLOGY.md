# AquaQoS benchmark methodology (v2)

The original method preceded the runner; D011 records the matched-policy and evidence
corrections. Numbers are not claims until a clean-source run produces the raw report.

## Question

Does a protected-capacity scheduler let several Aqua strategies use shared maker
inventory with fewer settlement failures than raw overcommitment, while preserving
the conservative allocation's protected capacity and making the utilization/price
trade-off visible?

## Systems under test

Every system uses the pinned Aqua/SwapVM sources, the same Cancun EVM, compiler,
optimizer settings, TokenMock pair, fee-free XYC program, exact-output demand, and
the same owner/taker accounts. A/B maker custody is an EOA; C/C100 maker custody
is the AquaQoS vault. This custody difference is not controlled away.

* **A — conservative Aqua:** official Aqua, no guard, virtual balances split evenly
  across strategies (`backing / N`). One maker holds the shared real backing; there
  is no separate custody account per strategy. Aggregate virtual depth
  equals initial real backing, so this is the no-overcommit reference.
* **B — raw overcommitment:** official Aqua, no guard, every strategy advertises the
  full backing as its virtual balance. Real maker inventory is shared and unchanged.
  Settlement failures are expected when aggregate successful output exceeds it.
* **C — AquaQoS:** AquaQoS router/vault, every strategy advertises the full backing,
  and each strategy receives an equal guarantee (`backing / (2N)`). Aggregate
  guarantees reserve half the backing; the other half is measurable burst capacity
  that can be used only while sibling guarantees remain protected.
* **C100 — matched-guarantee AquaQoS:** identical to C except each guarantee is
  `backing / N`. Aggregate configured guarantees equal all initial backing, matching
  A's initial virtual allocation. Initial unreserved backing is zero. This isolates
  guarantee-ratio sensitivity, not price/depth or custody implementation differences.

The A quotes are intentionally shallower. All systems still use the same XYC
formula, fee setting, rounding and offered output amounts; input required by each
quote is recorded rather than silently normalized. This makes the price/depth cost
of conservative allocation part of the result.

## Common starting state

For each strategy count `N` (at least 1, 2, 4 and 8), each fixture starts with:

* one maker pair and equal initial real inventory `B` of each token;
* zero reservations and the same taker balances, high enough for the largest quote;
* deterministic strategy salts, registration order and program bytes;
* A virtual per-strategy allocation `B/N` against the shared maker inventory;
* B, C and C100 virtual balance `B` per strategy;
* C guarantees totaling `B/2` per token, with no initial burst consumption;
* C100 guarantees totaling `B` per token; B has no configured guarantee;
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
2. **Balanced trading:** every strategy receives one offered swap per direction;
   fixed-seed amounts differ by strategy. Each policy receives the identical trace.
3. **Concentrated demand:** one strategy consumes its guarantee and burst before
   siblings are offered demand.
4. **Replenishment:** fixed Aqua pushes restore output capacity at documented steps.
5. **Ordering comparisons:** concentrated demand is run in forward and reverse order;
   the balanced trace is run in round-robin and one seeded-shuffle order per count.
   Each pair preserves its own demand multiset. This does not establish general ordering
   robustness or shuffled-overload behavior.
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
* **fill ratio (`successRatio`):** successful output volume / offered volume;
* **virtual backing ratio:** aggregate initial virtual depth / initial real backing;
* **settlement-failure rate:** settlement failures / offered attempts;
* **guard-rejection rate:** guard rejections / offered attempts;
* **protected-capacity violations:** count of successful attempts that break the
  configured invariant;
* **gross output turnover:** successful output / (initial two-token backing + pushes).
  This aggregates synthetic raw token units, not prices, economic value or capital efficiency;
* **initial unreserved backing:** for guarded policies, sum across the two tokens of
  `B - N*g`; not the sum of unspent virtual balances;
* **net burst outstanding:** sum of `max(initial virtual - final virtual - g, 0)`.
  Replenishment reduces it. It is a net ledger diagnostic, not cumulative physical
  burst use; no burst-utilization ratio is claimed;
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

## Implemented coverage and open gates

The runner defines 72 fresh fixtures: 2/4/8 strategies x A/B/C/C100 x six workloads.
The four retained workloads remain byte-for-byte unchanged; the appended workloads are
`balancedRoundRobin` and `shuffledPermutation`. The balanced trace visits every strategy
once in each direction, in round-robin order. Its per-count amount seeds are `0xb201`,
`0xb401`, and `0xb801`; its independently seeded Fisher-Yates permutations use `0xc201`,
`0xc401`, and `0xc801`. The checker regenerates both traces and proves that the shuffled
trace has exactly the balanced trace's offered-demand multiset. No action selection reacts
to any quote, rejection or receipt.

The original per-count seeds remain `0xa201`, `0xa401`, and `0xa801`. The eight-strategy
group uses the same 10,000 backing per token and existing demand generator, at the vault's
fixed maximum group size. Per-strategy demand scales with group size, so this measures the
declared workload at each size rather than holding trade amounts constant across sizes.
Count 1 and token diversity remain open. Counterfactual replay covers every guard rejection
in the generated report plus both-direction controls. Completed measurements and review
status are recorded in BENCHMARK_RESULTS.md.
The historical raw path `a-b-c-v1.json` now declares schema `local-a-b-c-benchmark-v2`.

The checker separately recomputes recorded maker/taker/router/Aqua balances, maker
allowance, every virtual balance, state continuity, XYC inputs, error selectors/arguments,
guarded entitlement backing and summary metrics. It does not authenticate a JSON file
against a live chain. It regenerates all seeded demand, verifies the balanced/shuffled
multiset, and reconstructs retained Transfer
logs. Exact saved swap calldata and reference deployment identity are checked by the
separate rejection-replay checker, not for every original benchmark transaction.
Full receipts/calldata and build identity are retained for replay/review.
TokenMock funding/approval setup is asserted by the runner; broader token
and allowance behavior is tested elsewhere, not established by this benchmark.
Owner: root technical lead. These limits and false-rejection replay remain release-open;
do not claim every rejected trade was unsafe or publish broad efficiency conclusions.
