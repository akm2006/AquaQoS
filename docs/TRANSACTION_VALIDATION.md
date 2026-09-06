# Separate-transaction validation and representative gas

Run `pnpm test:transactions` from the repository root after the locked install.
The command builds pinned contracts and creates isolated local Hardhat EVMs.
No external RPC, private key, funded wallet or persistent deployment is involved.
It writes [raw results](../benchmarks/raw/transactions-v1.json), replacing that
generated result file on each successful run. Preserve committed historical results
through Git. It exits nonzero when any assertion fails.

## Verified sequence

Two strategies each have virtual balances 1000/1000 and guarantees 500/500;
the vault holds 1000 of each token. Each send is an independent mined transaction:

1. First strategy outputs 500; reservations clear after transaction completion.
2. Sibling output 501 reverts with `InsufficientCapacity(500, 501)`. The receipt
   and debug trace return bytes establish the cause; all observed state rolls back.
3. Sibling output 500 succeeds in a later transaction, consuming its guarantee.
4. Permissionless Aqua.push of 500 restores the first strategy's entitlement.
5. First strategy consumes the restored 500; a reverse trade then replenishes
   the depleted token through official settlement.
6. Owner pauses in a fresh transaction, docks all, and withdraws token A.

For every fill the script independently computes pinned XYC exact-output rounding,
checks maker/taker input and output deltas, active strategy virtual deltas, unchanged
sibling virtual balances, reservation events, cleared transient reservations, and
aggregate entitlement backing. State reads are separate eth_call executions and
do not warm the following transaction. Failed-fill gas is retained but is not included
in the size-comparison table below.

## Group-size micro-measurement

Checked 2026-09-06 with Node 22.16.0, Hardhat 3.8.0, ethers 6.13.4,
solc 0.8.30, viaIR, optimizer 700 and Cancun. Each group starts with 10,000 raw
units of each token, total guarantees 10,000 per token split equally, and virtual
balances 10,000/10,000 per strategy. Thus virtual overcommitment increases with
group size. The first strategy makes two consecutive exact-output fills of 100.

| Strategies | First fill gas | Second fill gas |
| --- | ---: | ---: |
| 1 | 137265 | 137265 |
| 2 | 146250 | 146250 |
| 4 | 165475 | 165475 |
| 8 | 210404 | 210404 |

These are representative **full transaction gasUsed**, including settlement.
They are not guard-only overhead, worst-case gas, or the final A/B/C benchmark.
The two fills have different persistent balances/prices; equal gas does not make
them statistical repetitions. Setup lengths affect base fees, so monetary gas costs
must not be compared. Callback, burst, rejection and lifecycle cost extremes remain
unmeasured. No utilization advantage is established by this micro-measurement.

Raw provenance includes source commit plus dirty flag, script/config/lock/source hashes,
actual installed package versions, compiler build-info identity/settings checks,
deployed runtime hashes and bytes, calldata, receipts, events and balance snapshots.
The raw run identifies the prior commit with dirty=true because this new harness was
not yet committed; source hashes identify measured files precisely. Local addresses
and receipts identify ephemeral simulated-chain evidence only.

A separate read-only benchmark reviewer checked the workload and requested stronger
failure-cause, input/virtual movement and provenance assertions; those were added.
The auditor then independently recomputed all 12 successful raw swaps, checked the
failed receipt/revert bytes, source hashes and gas table, and closed both findings.
Complete A/B/C benchmark acceptance remains open.

## Clean-source rehearsal

Revision `eeee95a09a1ddafbb0db73262fd946afad82ab9d` was locally cloned with
`git clone --no-hardlinks` into an ignored scratch directory on 2026-09-06.
The clone had no node_modules or compiled artifacts. Uncached installation hit
repeated native-package download error 23 both inside and outside the sandbox.
A second fresh clone installed all 528 packages from the existing repository cache:

```sh
pnpm install --frozen-lockfile --ignore-scripts --offline --store-dir <existing-repository-cache>
pnpm build
pnpm test
pnpm test:transactions
```

All exited zero: six Solidity entry files compiled; 15 committed tests passed
(256 fuzz runs); the transaction replay recorded dirty=false. All source hashes,
deployed runtime hashes and the four gas pairs matched the original run.
The [rehearsal record](../benchmarks/raw/clean-replay-eeee95a.json) retains revision,
commands, outcomes, hashes and limitations. Compiler cache was also reused.
This establishes clean-source reproducibility with caches, not uncached network
availability. Nine subsequently added numeric/stateful tests pass in the main checkout
(24 total); they are outside this rehearsal revision. Scratch clones are ignored
and retained locally; no public repository was created.

## Seeded trading sequences

The same command now also runs three 64-trade sequences against the real contracts,
with a separate JavaScript model of virtual balances, actual inventory, taker funds
and remaining entitlements. Every swap is mined separately. Source seeds and all
192 attempted swaps plus 30 replenishment pushes are retained in the raw report.

| xorshift32 seed | Strategies | Accepted | Capacity rejections |
| --- | ---: | ---: | ---: |
| 1 | 2 | 43 | 21 |
| 42 | 4 | 45 | 19 |
| 12648430 | 8 | 49 | 15 |

Each fixture starts with 10,000 per maker token and aggregate guarantees of 5,000
per token. The model predicts admission, independently updates balances after
successful fills/pushes, and compares every step to EVM state. Rejections must
have the exact predicted capacity error and preserve state; positive fills must
match rounded XYC input, both transfers, sibling isolation and reservation events.
All checks passed: 137 accepted, 55 rejected. A read-only auditor regenerated the
PRNG sequence and decoded/recomputed all 192 raw swap attempts independently.

On 2026-09-07, a separate benchmark-auditor review confirmed that these adaptive
sequences are not A/B/C evidence and approved the constraints in
[BENCHMARK_METHODOLOGY.md](BENCHMARK_METHODOLOGY.md): one immutable demand trace per
scenario, equal backing and allowances, explicit raw settlement failures, visible
XYC quote differences, clean-source provenance including pnpm, and neutral/losing
workloads.

These are targeted validation sequences. Offered amounts adapt to virtual depth
and taker affordability; deposits restore capacity, the first two attempts force
both outcomes, and group sizes use different seeds. They are not comparable A/B/C
workloads, an exhaustive state-space proof or a test of decrementing allowances.
The original group-size gas microcases remain separate and unchanged.

Solidity fuzzing uses Hardhat 3.8.0's fixed default seed, verified in installed
`solidity-test/config.ts`: `0x7727ea51af0441c20da14dcd68a15dac8c9ebd589c5be8fa8c87c1d3720450bc`.
It runs 256 cases. No extra seed configuration is needed with the pinned runner.
