# A/B/C benchmark results (v1)

This is measured local-EVM evidence, not a market or solvency claim. The raw source
is [a-b-c-v1.json](../benchmarks/raw/a-b-c-v1.json); the independent checker is
`pnpm check:benchmark`.

## Reproduction

Run from the repository root:

```text
pnpm benchmark:a-b-c
pnpm check:benchmark
```

The clean run recorded runner source commit `9c7d94cc0410a78f335eea3a57169e11a740efba`,
`dirty=false`, Node `22.16.0`, pnpm `11.10.0`, Hardhat `3.8.0`, ethers `6.13.4`,
solc `0.8.30`, Cancun, viaIR and optimizer runs `700`. Each workload starts from a
fresh EVM and the exact same demand trace is replayed for A, B and C.

## Policy

Backing is 10,000 units of each token. A splits virtual depth and backing at `B/N`.
B advertises `B` per strategy with no guard. C advertises `B` per strategy and
reserves `B/(2N)` per strategy as guarantee; the remainder is declared burst budget.
All systems use the same fee-free XYC exact-output program and integer rounding.

`success/offered` is successful maker output divided by all offered output. `q` is
virtual quote rejection, `g` is AquaQoS guard rejection, and `f` is raw settlement
failure; values are output units, not silently dropped attempts.

The raw `capitalUtilization` metric is successful output divided by total initial
two-token backing plus declared push deposits. `advertisedVirtualDepth` is the sum
of both virtual token balances across strategies. A false/unsafe-guard-rejection
counter is intentionally not claimed yet; matched-guard replay is a release-open
follow-up.

| Strategies | Workload | A | B | C |
| ---: | --- | --- | --- | --- |
| 2 | low contention | 5,117/5,117 | 5,117/5,117 | 5,117/5,117 |
| 2 | concentrated overload | 6,000/18,000 (q 12,000) | 9,000/18,000 (q 3,000; f 6,000) | 9,000/18,000 (g 9,000) |
| 2 | replenishment | 7,500/10,000 (q 2,500) | 10,000/10,000 | 10,000/10,000 |
| 4 | low contention | 2,467/2,467 | 2,467/2,467 | 2,467/2,467 |
| 4 | concentrated overload | 6,000/13,500 (q 7,500) | 9,000/13,500 (f 4,500) | 9,000/13,500 (g 4,500) |
| 4 | replenishment | 3,750/5,000 (q 1,250) | 5,000/5,000 | 5,000/5,000 |

The C **net burst outstanding** ratio is `0.1333` for the two-strategy concentrated
case, `0.0571` for the four-strategy concentrated case, `0.0833` and `0.0179` for the
corresponding replenishment cases, and zero in low contention. It is computed from
initial virtual depth minus final virtual depth, so later replenishment can reduce it;
it is not a cumulative peak-burst metric. No protected-capacity violation was observed
in the C runs. Quote input/slippage for every attempt is kept in the raw report because
A has shallower virtual depth by design.

## Representative swap gas

These are median `gasUsed` values by outcome within this fixture; deployment, mint,
approval and shipping gas is retained separately as setup gas, while replenishment
push gas remains attached to its action. They are not a universal gas estimate.

| Strategies | Workload | A | B | C |
| ---: | --- | --- | --- | --- |
| 2 | low contention | success 113,708 | success 113,708 | success 146,260 |
| 2 | concentrated overload | success 113,708; quote 36,324 | success 113,708; quote 36,324; settle 126,779 | success 146,159; guard 79,604 |
| 4 | low contention | success 113,708 | success 113,708 | success 165,471 |
| 4 | concentrated overload | success 113,708; quote 36,324 | success 113,708; settle 126,779 | success 165,269; guard 101,890 |

## Interpretation and limits

The concentrated workload is the intended failure-discrimination case: raw Aqua can
quote beyond shared inventory and then rolls back at settlement, while AquaQoS rejects
before token movement and preserves guarantees. Conservative Aqua rejects earlier when
its per-strategy virtual depth is exhausted. The low-contention workload is a neutral
case where QoS adds gas without increasing volume.

The result is policy-specific: C uses full shared virtual depth with guarantees of
`B/(2N)`, while A uses `B/N` depth and `B/N` guarantees. This run therefore does not
isolate the guard's effect from the chosen guarantee ratio. A matched-guarantee
sensitivity run remains open before making a broad capital-efficiency claim.

This is only six fixtures, two group sizes, one TokenMock pair, and three fixed local
workloads. It does not measure hostile ERC-20 behavior, decrementing allowances in the
benchmark runner, mainnet liquidity, profitability, universal solvency, or every
ordering/guarantee ratio. The raw report and source pins must be regenerated after any
code or methodology change; no number here should be copied into marketing without
the same provenance.
