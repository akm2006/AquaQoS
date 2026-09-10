# Guard-rejection replay

Status: method fixed before execution and implemented. Measured results and clean
source identity are recorded in BENCHMARK_RESULTS.md; this file defines the method.

Question: for every C/C100 capacity rejection in the clean v2 comparative report,
would the same exact-output demand settle and preserve configured entitlements if
executed with the pinned official unguarded router?

Each rejected attempt gets a fresh local EVM. Recreate its recorded maker/taker real
balances, maker allowance, router/Aqua balances and every strategy virtual balance.
Use standard TokenMock, maximum taker approvals and the same XYC/salt program with
the guard removed. Assert the reconstructed state equals the original state after
normalizing identities. Execute the actual swap and retain calldata, receipt, error
bytes, before/after states and build/runtime identity.

Maker custody is an EOA in this reference replay; maker/router/token addresses and
order hashes change. This represents only the original static fee-free XYC/TokenMock
balance transition. It does not test vault bypass, callbacks, signatures, permissions,
transient reservations, arbitrary token behavior or production deployment safety.
The source benchmark mines one swap per transaction, so pending reservations are
zero. The reference fixture must never become an alternative production settlement path.

Classify actual outcomes separately:

- `settlement_failure`: actual token transfer fails with inventory shortage and rolls back;
- `capacity_breach`: swap succeeds, but a token's remaining inventory cannot back its
  post-fill entitlements or allowance is below the full configured-guarantee floor;
- `safe_fill`: swap succeeds and both tokens satisfy those conditions. On rejected
  attempts this is an observed false rejection within this scope.

Use original activation baseline `10000 - g`, never reset it to the reconstructed
virtual balance minus g. For each token compute `sum(min(g,max(v_i-baseline,0)))`
after settlement and compare to real balance/allowance. Also check allowance >= N*g.
Track failed trades separately: an atomic rollback preserving backing is not a safe fill.
Require complete recorded transfer deltas, unchanged sibling balances and rollback.

Use one successful low-contention C/C100 attempt in each direction per policy/group
as positive controls (twelve for the 2/4/8-strategy matrix), also matching original successful after-state.
Controls are excluded from rejection denominators. Corrupted-evidence checks must reject
changed state, missing candidates, fake outcomes and altered summary. The checker also
compares every replay deployment's name/address/build identity/runtime hash with the clean
input fixture and decodes saved `swap` calldata to reconstruct maker, program, salt, amount
and direction. This prevents result-only evidence from silently substituting another local
deployment or demand. The replay also reconstructs each reference receipt's ERC-20
`Transfer` logs: a fee-free successful swap must contain, in order, taker-to-router input,
router-to-maker input, and maker-to-taker output, with the recorded TokenMock emitter,
participant addresses and amounts. A reverted reference swap must contain no Transfer logs.
Missing, extra, reordered or altered logs reject the evidence.
The retained evidence contains every rejected attempt; no adaptive selection.

Denominators are total rejected attempts and total rejected output units, with counts
and output amounts for each classification. Output amounts aggregate synthetic token
units only. No replay gas comparison is claimed because identities/custody differ.

For these top-level, maximum-allowance states the admission inequality is equivalent
to output post-state backing. Zero safe rejections would therefore confirm the EVM
integration on this sample, not establish general optimality. Same-transaction and
finite-allowance conservatism need separate controlled experiments.

Commands (from the root):

```text
pnpm exec hardhat run benchmarks/replay-rejections.mjs
node scripts/check-rejections.mjs
node scripts/check-rejections.mjs --self-test
```

Root owns remaining scope and publication gates. A clean source replay plus independent
read-only benchmark review is required before presenting results.
