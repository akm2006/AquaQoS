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

The clean run records source commit `337beebea7dc785f80039fbdf61b38e342ae2e22`,
`dirty=false`, Node 22.16.0, pnpm 11.10.0, Hardhat 3.8.0, ethers 6.13.4,
solc 0.8.30, Cancun, viaIR, optimizer enabled with 700 runs. Build IDs and runtime
hashes are retained. There are **32 fresh EVM fixtures**, grouped into eight policy/count
entries: 2/4 strategies x four policies x four workloads. All 216 offered swaps and
8 push actions are retained with receipts, calldata, states and gas.

Checker passed; 17 checker regression tests passed (valid evidence plus 16 corrupted
variants). `pnpm test` also passed 24 Solidity tests, including 256 fuzz runs in one
property. Sandbox benchmark attempts hit a compiler-cache mutex timeout; approved
host-context generation succeeded. These are local test-token transactions only.

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

At equal initial protected allocation, C100 matches A's overload fill volume: 6,000.
C's 9,000 therefore depends on its smaller configured guarantees; it is not evidence
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

Low contention is a neutral volume case where QoS adds gas. Guarded policies reject
overload before transfers; raw Aqua instead has actual inventory-shortage settlement
failures. Rejected trades remain unsuccessful demand in all summaries.

## Review and release-open limits

Separate read-only benchmark review checked the C100 construction and recomputation
logic; custody wording and optimizer-enabled provenance assertions were corrected.
The reviewer then independently ran the clean-report checker and all 17 regression
tests, and verified C100/A volume, guarantee totals and the gas medians above; no
blocking discrepancy was found. This is internal read-only review, not external audit.
The checker validates recorded data consistency, not live-chain authentication or an
independent source implementation. It does not regenerate demand from the seeds or
decode calldata/receipt logs; raw transaction data is retained for replay/review.
Counterfactual false-rejection replay remains open: do not claim every guard rejection
was unsafe. The bounded replay is now complete for this report: all 30 C/C100 guard
rejections were rebuilt from their saved pre-state using the official unguarded router.
It found 11 actual settlement failures, 19 successful swaps that breached the configured
capacity invariant, and zero safe fills. Eight successful controls (both directions for
each guarded policy/count) reproduced their original after-state. This confirms the
static, fee-free, maximum-allowance TokenMock integration for these cases; it does not
measure same-transaction or finite-allowance conservatism.

Replay evidence is [rejections-v1.json](../benchmarks/raw/rejections-v1.json), generated
from source commit `77a21d60ff6a348e4cfe71e16c0034ea43861c29` with `dirty=false`.
`node scripts/check-rejections.mjs --self-test` passed, rejecting nine deliberately
corrupted reports. Counts 1/8, seeded-shuffle/balanced workloads and lifecycle worst-case
gas remain open. TokenMock results do not cover hostile tokens or real markets. Root lead
owns these acceptance gates before broad performance or frontend proof-page claims.
