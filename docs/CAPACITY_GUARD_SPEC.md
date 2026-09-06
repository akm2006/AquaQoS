# CAPACITY_GUARD specification v0

Status: implementation contract for review, not yet implemented or proven.

Independent source/security review completed; the lead incorporated its findings.
`node scripts/check-capacity-model.mjs` passes 327,168 bounded settlement cases
and explicit consumption/burst/replenishment boundaries. This finite arithmetic
check does not prove Solidity overflow behavior, lifecycle safety or EVM integration.

## Goal and boundary

For a configured maker, router and ERC-20 token, admit a fill only when the
maker's transferable inventory can cover that fill and every strategy's
remaining configured entitlement. This protects capacity; it does not promise
future fills, prices, yield, legal solvency, or behavior of unsupported tokens.

The strong claim requires a non-upgradeable restricted maker vault. A normal wallet can spend
or approve inventory outside Aqua, so a registry alone cannot enforce the
boundary. The vault may ship only registered guarded strategies to the selected
router, approves only the pinned Aqua contract, and permits withdrawal only
after the group is paused and every strategy is docked. Pausing makes every
guard check reject and explicitly ends the capacity commitment. Aqua, router,
and the sorted token pair are immutable. Only the owner may configure, pause,
dock, or withdraw; only the immutable router may reserve. The vault exposes no
generic call, delegatecall, arbitrary approval, or upgrade path.

Initial scope is standard, non-rebasing ERC-20 tokens whose `balanceOf`,
`allowance`, and transfers use the requested raw token units. Fee-on-transfer,
rebasing, callback-bearing, and otherwise non-standard tokens are unsupported
until separate tests justify them.

## Terms

For one `(vault, router, sorted tokenA, sorted tokenB)` group, with at most
eight active strategies, evaluate the following independently for the current
output token:

- `S`: bounded set of active registered strategy hashes.
- `v[i]`: live Aqua virtual balance for strategy `i` and `token`.
- `g[i]`: configured maximum entitlement in the token's smallest unit; activation requires `g[i] <= v[i]`.
- `b[i]`: activation baseline surplus, `v[i] at activation - g[i]`.
- `r[i]`: transient debit reserved for an in-progress fill of strategy `i`.
- `I`: transferable inventory, `min(token.balanceOf(vault), token.allowance(vault, Aqua))`.
- `d`: final total maker debit of the current fill in `token`, including any
  output-side protocol fee paid through Aqua.
- `remaining(i, extra)`: `min(g[i], max(v[i] - b[i] - r[i] - extra, 0))`.

The configuration must be feasible when activated:

```text
I >= sum(i in S, g[i])
```

Every lookup must also prove Aqua's token-count marker is active (neither zero
nor docked). The current fill additionally requires `d <= v[j]`; capacity
scheduling must reject a virtual-balance shortage itself instead of admitting
a fill that will later fail in Aqua.

## Admission invariant

For a fill of active strategy `j`, CAPACITY_GUARD first requires `d <= v[j]`,
then admits and reserves `d` only if:

```text
I >= sum(i in S, r[i]) + d
     + sum(i in S, remaining(i, i == j ? d : 0))
```

This counts the proposed debit, preserves every strategy's entitlement after
its own pending consumption, and permits the current strategy to use inventory
above all remaining entitlements as burst capacity. Arithmetic must reject
overflow and treat subtraction as saturating only in the explicitly written
`max(..., 0)` term.

The reservation is transient transaction state. Nested sibling execution sees
it; a revert automatically removes it; successful top-level completion clears
it at transaction end. A later swap in the same transaction may be rejected
conservatively after an earlier transfer because the transient reservation can
outlive settlement. That limitation is acceptable for v0 and must be measured.

## Consumption and replenishment

A successful output pull reduces real inventory and that strategy's Aqua
virtual balance relative to its activation surplus baseline. Its remaining
entitlement therefore falls naturally, down to zero; in v0, the strategy's own
fill consumes this entitlement before being described as burst use. Inventory
above all remaining entitlements is still available as burst capacity. Input
pushed into a strategy increases real inventory and its virtual balance;
entitlement recovers automatically, capped at `g[i]`. A quote is only a
same-state eligibility result and creates no reservation. Swap execution must
recheck and reserve against current state.

Docking, adding, removing, or changing a guarantee must go through the vault in
one transaction and is allowed only while the whole token-pair group is paused.
Activation checks both token invariants. Unknown, duplicate, unguarded, docked,
or ninth strategies are rejected. The fixed bound is deliberately small for
predictable gas and must be measured before it is reconsidered. Changing a
guarantee while paused takes a new live virtual-balance snapshot and resets
`b[i] = v[i] - g[i]`; reactivation must pass feasibility again.
All lifecycle/configuration/withdrawal operations must also reject if any
reservation was made for this vault during the current transaction. This prevents
an owner-controlled callback from pausing, docking, resetting baselines or
withdrawing inventory while an already-admitted output pull remains pending.
Use a transaction-scoped touched flag; a fresh transaction may pause normally.

## SwapVM integration

Use custom opcode `0x05`, the next free pinned core-extension slot, as the first
instruction of every protected program. Never allocate from SwapVM's reserved
`0xf0-0xff` bank.
Its handler calls the remaining VM program, then checks the final registers and
fee metadata. This is necessary because current native Extruction receives
`SwapRegisters` but not `ProtocolFee`; it cannot calculate output-side protocol
fee debit. A final-looking read before the rest of the program is also unsafe.

The custom router minimally subclasses the official `AquaSwapVMRouter`,
overrides its inherited virtual `_runOpcode`, handles one locally reserved
opcode, and delegates every official opcode to `super`. The vault constructs
the supported protected order recipe itself, prepends the wrapper, fixes the
router and maker traits, and ships it to Aqua. It does not accept arbitrary
maker bytecode in v0, so a protected order cannot omit, duplicate, or jump
around the guard. The canonical v0 program is exactly an empty-argument guard
header, XYC, and salt. The guard requires `nextPC == 2` when entered, verifies
the vault and registered order hash, runs the inner program, and requires the
completed PC to equal program length.

v0 is fee-free and rejects nonempty protocol-fee state; arbitrary input-fee or
output-fee programs cannot be shipped by the vault. Its debit is:

```text
d = amountOut
```

and calls the vault's quote-only check in static context or reserve operation in
swap context. No later VM instruction may run after the wrapper completes.

Future output-protocol-fee support must reproduce pinned
`resolveOutAquaPullMaker` arithmetic in view form, including surplus fees and
per-receiver floor rounding; `feeTotal` alone can understate the debit. Input-
side fee recipes need a separate invariant and remain unsupported.

Native Extruction remains useful for optional external calculations, but is not
the v0 enforcement point. No upstream SwapVM source file needs to be copied;
the custom router and opcode subclass the pinned official contracts.

## Required tests before implementation is accepted

- activation feasibility, zero guarantee, exact boundary, one unit over, and overflow;
- exact-in/out and both directions; reject any noncanonical fee program/state;
- `v > g` at an exactly allocated inventory boundary; one-unit fill must succeed;
- own-guarantee consumption, burst use, reverse replenishment, and stale quote recheck;
- nested sibling attempts before and after transfer, reservation rollback, and same-tx conservatism;
- unknown, duplicate, unguarded and docked strategy rejection;
- pause rejection, atomic dock, guarantee changes, dock-all-before-withdrawal,
  allowance reduction, immutable dependencies and unauthorized calls;
- taker-first and maker-first callbacks, before/after transfer nested attempts;
- fixed maximum group size and gas growth at that maximum;
- independent security review of router, vault, transient state and token assumptions.
