# Local comparative benchmark results (v2)

Measured local-EVM evidence, not a market, profitability or solvency claim. The
[raw report](../benchmarks/raw/a-b-c-v1.json) retains its historical filename but
declares schema v2. D011 supersedes the old virtual-surplus burst-utilization ratios.

## Reproduction and scope

From the repository root, with clean source for the generation step:

```text
pnpm benchmark:a-b-c
pnpm check:benchmark
node --test scripts/check-benchmark.test.mjs
```

To refresh the linked rejection report, first verify and commit the new comparative
report so the tree is clean, then run `pnpm exec hardhat run benchmarks/replay-rejections.mjs`.
Check it with `node scripts/check-rejections.mjs --self-test` and commit the new replay.
Running both generators consecutively without committing the first report correctly
produces dirty replay provenance, which the checker rejects.

The Sep 9 clean run records source commit `0ae94ec7edff4a29c924095782ebf707be8e062a`,
`dirty=false`, Node 22.16.0, pnpm 11.10.0, Hardhat 3.8.0, ethers 6.13.4,
solc 0.8.30, Cancun, viaIR, optimizer enabled with 700 runs. Build IDs and runtime
hashes are retained. There are **48 fresh EVM fixtures**, grouped into twelve policy/count
entries: 2/4/8 strategies x four policies x four workloads. All 392 offered swaps and
12 push actions are retained with receipts, calldata, states and gas.

Checker passed; 20 checker regression tests passed (valid evidence plus 19 corrupted
variants), including missing eight-strategy coverage, altered seed and eighth-sibling
mutation. The earlier 2/4 measurements are unchanged by this extension.
These are local test-token transactions only.

## Policy and results

Every fixture starts with 10,000 raw units of each token. A allocates virtual depth
`B/N`, with one EOA holding the shared real inventory. B advertises `B` per strategy
without configured guarantees. C (half-backing policy) advertises `B` and sets
`g=B/(2N)`; C100 uses the same vault/router and sets `g=B/N`, matching A's initial
virtual allocation. C/C100 custody and quote depth still differ from A.

Cells show successful/offered output, aggregated across synthetic raw token units.
`q`, `g`, `f` are quote-rejected, guard-rejected and settlement-failed output units.
No attempted demand is removed after failure.

| Strategies | Workload | A | B | C | C100 |
| ---: | --- | --- | --- | --- | --- |
| 2 | Low contention | 5,117/5,117 | 5,117/5,117 | 5,117/5,117 | 5,117/5,117 |
| 2 | Concentrated overload | 6,000/18,000 (q 12,000) | 9,000/18,000 (q 3,000; f 6,000) | 9,000/18,000 (g 9,000) | 6,000/18,000 (g 12,000) |
| 2 | Reverse overload | 6,000/18,000 (q 12,000) | 9,000/18,000 (f 9,000) | 9,000/18,000 (g 9,000) | 6,000/18,000 (g 12,000) |
| 2 | Replenishment | 7,500/10,000 (q 2,500) | 10,000/10,000 | 10,000/10,000 | 10,000/10,000 |
| 4 | Low contention | 2,467/2,467 | 2,467/2,467 | 2,467/2,467 | 2,467/2,467 |
| 4 | Concentrated overload | 6,000/13,500 (q 7,500) | 9,000/13,500 (f 4,500) | 9,000/13,500 (g 4,500) | 6,000/13,500 (g 7,500) |
| 4 | Reverse overload | 6,000/13,500 (q 7,500) | 9,000/13,500 (f 4,500) | 9,000/13,500 (g 4,500) | 6,000/13,500 (g 7,500) |
| 4 | Replenishment | 3,750/5,000 (q 1,250) | 5,000/5,000 | 5,000/5,000 | 5,000/5,000 |
| 8 | Low contention | 1,321/1,321 | 1,321/1,321 | 1,321/1,321 | 1,321/1,321 |
| 8 | Concentrated overload | 6,000/12,000 (q 6,000) | 9,750/12,000 (f 2,250) | 9,750/12,000 (g 2,250) | 6,000/12,000 (g 6,000) |
| 8 | Reverse overload | 6,000/12,000 (q 6,000) | 9,750/12,000 (f 2,250) | 9,750/12,000 (g 2,250) | 6,000/12,000 (g 6,000) |
| 8 | Replenishment | 1,875/2,500 (q 625) | 2,500/2,500 | 2,500/2,500 | 2,500/2,500 |

At equal initial protected allocation, C100 matches A's overload fill volume: 6,000.
C's 9,000 at 2/4 strategies and 9,750 at eight depend on its smaller configured guarantees; they are not evidence
that the guard alone improves volume at equal protection. The replenishment difference
also reflects shallower A pricing: exact-output demand can exhaust A's virtual output
depth. Per-attempt XYC inputs are retained; price/custody effects are not isolated.

No configured-capacity violation was found in recorded C/C100 post-action states.
Initial unreserved backing across both tokens is 10,000 for C and zero for C100.
`netBurstOutstanding` is a final virtual-ledger diagnostic, not cumulative physical
burst utilization. `virtualBackingRatio` measures advertised depth/backing (A: 1;
B/C/C100: N). `grossOutputTurnover` sums raw output divided by 20,000 plus push deposits;
it is not economic capital efficiency. See [methodology](BENCHMARK_METHODOLOGY.md).

## Representative median transaction gas

Setup gas is separate; push gas belongs to its action. These are fixture measurements,
not universal estimates. All outcome gas samples, including reverse/replenishment,
remain in the raw report.

| Strategies | Workload | A | B | C | C100 |
| ---: | --- | --- | --- | --- | --- |
| 2 | Low contention | success 113,708 | success 113,708 | success 146,260 | success 146,260 |
| 2 | Concentrated | success 113,708; quote 36,324 | success 113,708; quote 36,324; settle 126,779 | success 146,159; guard 79,604 | success 146,258; guard 79,774 |
| 4 | Low contention | success 113,708 | success 113,708 | success 165,475 | success 165,475 |
| 4 | Concentrated | success 113,708; quote 36,324 | success 113,708; settle 126,779 | success 165,313; guard 101,890 | success 165,481; guard 102,226 |
| 8 | Low contention | success 113,715 | success 113,715 | success 210,099 | success 210,099 |
| 8 | Concentrated | success 113,708; quote 36,324 | success 113,708; settle 126,779 | success 209,934; guard 146,465 | success 210,402; guard 147,137 |

Low contention is a neutral volume case where QoS adds gas. Guarded policies reject
overload before transfers; raw Aqua instead has actual inventory-shortage settlement
failures. Rejected trades remain unsuccessful demand in all summaries.

At eight strategies, rejection costs more gas than raw settlement failure: 146,465
for C and 147,137 for C100 versus 126,779 for B in concentrated demand. Low-contention
success costs 96,384 additional gas (210,099 versus 113,715), about 84.8% overhead.
This is a measured losing gas case. Earlier rejection does not imply cheaper rejection;
cross-strategy reads have a visible cost. Across group sizes, trade amounts also change
with per-strategy allocation, so these medians are not a controlled per-sibling gas slope.

## Review and release-open limits

Separate read-only benchmark review checked the C100 construction and recomputation
logic; custody wording and optimizer-enabled provenance assertions were corrected.
The reviewer then independently ran the clean-report checker and all 17 regression
tests, and verified C100/A volume, guarantee totals and the gas medians above; no
blocking discrepancy was found. This is internal read-only review, not external audit.
The checker validates recorded data consistency, regenerates the three seeded demand traces,
reconstructs retained ERC-20 `Transfer` logs, and now authenticates each replay
deployment against the clean benchmark fixture and decodes every saved swap calldata
record. It is still not live-chain authentication or an independent source
implementation. Raw transaction data and receipts remain retained for review.
Transfer-log reconstruction applies to the original comparative receipts; the separate
rejection checker does not yet reconstruct the replay receipt logs.
Counterfactual false-rejection replay remains open: do not claim every guard rejection
was unsafe outside the defined scope. The bounded replay is complete for this report: all 52 C/C100 guard
rejections were rebuilt from their saved pre-state using the official unguarded router.
It found 17 actual settlement failures, 35 successful swaps that breached the configured
capacity invariant, and zero safe fills. Twelve successful controls (both directions for
each guarded policy/count) reproduced their original after-state. This confirms the
static, fee-free, maximum-allowance TokenMock integration for these cases; it does not
measure same-transaction or finite-allowance conservatism.

Replay evidence is [rejections-v1.json](../benchmarks/raw/rejections-v1.json), generated
from source commit `7a972afdb0493aaf5c675aaaf4bc0c1584221ec9` with `dirty=false`.
`node scripts/check-rejections.mjs --self-test` passed, rejecting 12 deliberately
corrupted reports. Count 1, seeded-shuffle/balanced workloads and universal worst-case
gas remain open. TokenMock results do not cover hostile tokens or real markets. Root lead
owns these acceptance gates before broad performance or frontend proof-page claims.

Sep 9 D017 read-only benchmark audit found no blocking defect. The reviewer independently
ran the 48-fixture checker, 20 regression tests and 12 replay corruptions, compared prior
2/4 metrics and per-attempt gas/outcomes unchanged, and verified both-direction controls
at eight strategies. The audit confirmed the losing gas case above. This is internal
review of the bounded experiment, not an external protocol audit.

## Sep 8: focused conservatism regressions

`test/AquaQoSConservatism.t.sol` adds actual-settlement controls outside the comparative
report. With two g=500 strategies and 1000 real output tokens, a first 500-unit fill
leaves 500 real tokens and a 500-unit transient reservation. Another 500-unit fill
is rejected with available=500, required=1000 in the same test transaction. A normalized
unguarded reference at the same settled real/virtual state completes the second fill
and covers both tokens' remaining entitlements and full allowance floors. This is
one observed safe sequential fill blocked by conservative reservation accounting.

With a decrementing-approval token and allowance=1499, the guard rejects a 500-unit
fill because it requires 1500. Unguarded settlement succeeds and covers immediately
remaining entitlement, but leaves allowance=999. A permissionless push of 500 restores
the full 1000 entitlement while allowance remains 999. This justifies the stronger
future-replenishment floor; it is not a safe fill under the full v0 specification.
Allowance depletion is injected with a test prank, not a production vault API.

The reference recipes use the existing router's inherited official XYC/settlement
path, ordinary makers and matching virtual/real balances. Maker/order identities differ;
these are bounded fee-free test controls, not proof of a vault bypass or market rates.
These controls are separate from the current comparative 52-rejection denominator.
Independent implementation review of these focused tests closed on Sep 8;
see SECURITY_REVIEW_V0 for the review scope and residual coverage.
