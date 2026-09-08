# v0 implementation review — 2026-09-06

Scope: AquaQoSRouter, AquaQoSVault and canonical fee-free XYC programs against
the exact Aqua/SwapVM pins in sources.lock.json. Root inspected the worker test
file and ran the suite. Separate read-only reviewers traced execution and the
allowance correction. This is an internal review, not a third-party audit.

## Resolved finding M1: allowance and replenishment

Initial output policy used transferable inventory against remaining entitlements.
A standard token can decrement even UINT256_MAX approval. After enough trading,
permissionless Aqua.push can restore entitlements without restoring allowance.
The previous policy could therefore leave restored capacity without transferable
backing. An input-only router check would not cover direct pushes.

Correction (D008): require output allowance >= full configured guarantee sum +
transient reservation sum + proposed debit. Activation establishes the full floor;
every guarded output preserves it. Direct pushes cannot increase entitlement above
the configured sum. The follow-up reviewer confirmed M1 closed under supported
token/dependency assumptions. Regression tests cover the exact allowance boundary,
decrementing approvals, direct replenishment and successful nested outputs.

## Reviewed boundaries

- Canonical program and Aqua order hash bind the vault to the wrapper. No generic
  execute, arbitrary approve, signature-authorized order or upgrade entrypoint in vault.
- Wrapper executes final XYC registers; fee-bearing recipes are excluded.
- Quotes read policy without writing; swaps reserve before official settlement.
- Per-order upstream lock does not isolate siblings; vault transient reservations do.
- Lifecycle touched flag blocks owner callbacks from changing commitments mid-fill.
- Inherited Simulator reverts delegated effects; rescue accesses router-held tokens only.
- Aqua owns real transfer and virtual accounting paths. Direct push remains permissionless.

## Accepted limits and open verification

Root accepts these prototype limits; they remain explicit release/benchmark gates:

- Authentic immutable Aqua/router code must be verified at deployment. Constructor
  code-length and AQUA getter checks alone cannot exclude a counterfeit or proxy.
- Standard honest tokens only: no rebases, transfer tax, token callbacks, arbitrary
  allowance revocation or malicious balance reports. Test-only mint/burn and prank
  operations inject fault states and do not represent vault APIs.
- Allowance at the full guarantee floor blocks further outputs. No reapproval API;
  paused dock-all and withdrawal permit migration.
- Reservations outlive settlement until transaction end. Safe sequential same-tx
  fills may reject; quantify this in benchmark results.
- Representative eight-strategy gas and fresh-transaction clearing/sequence tests
  now pass; see TRANSACTION_VALIDATION. Worst-case gas, broader
  exhaustive/adversarial state-space coverage remains open. Three fixed-seed
  transaction sequences now pass; their adaptive demand limits are documented.
  Clean-source replay using package/compiler caches
  passes at eeee95a; uncached downloads remain unverified. Do not equate the passing
  local suite with final acceptance.

## Additional negative regressions

The 24-test suite includes exact-error quote/swap rejection for a vault order with
the guard omitted or its salt changed (unregistered hash); duplicate guard, guard
arguments and trailing instructions shipped by an ordinary maker (wrapper rejects).
Docked hashes cannot be reshipped; a new salt reactivates normally and the old hash
stays inactive. Unauthorized configuration/activation/docking/withdrawal and another
app's attempt to Aqua.pull from the vault fail. Root traced these assertions into
pinned MakerTraits building, Aqua active markers/app keys and immutable ship logic.

Numeric tests cover funded zero-guarantee burst, invalid initial capacity,
uint248 maximum registration and max+1 rejection, input-ledger overflow and XYC
multiplication overflow. Root reviewed the worker diff, corrected external-call
ordering around test cheatcodes, and added explicit quote/input/allowance rollback
assertions. A quote at the maximum input ledger can succeed while the actual push
overflows; this preserves atomicity but limits fill availability. No production
contract or acceptance invariant was weakened to accommodate it.

## Sep 8: conservatism controls (root fallback review)

AquaQoSConservatism.t.sol compares rejected guarded execution with normalized
unguarded reference orders. Before-state real inventory, maker allowance and all
strategy virtual balances are explicitly matched. Quote/swap rejection snapshots
cover maker/taker/router/Aqua balances/allowances, virtual markers and reservations.
Successful reference fills assert real transfer and virtual changes; the same-tx case
also checks unchanged siblings and both allowance floors. The finite-allowance case
restores entitlement via actual Aqua.push and shows allowance remains underfunded.
No production contract or invariant changes. One safe sequential rejection is proven;
no general optimality or market rejection rate is claimed.

The read-only reviewer could not run because of its usage limit. Root inspected the
actual test paths and arithmetic as fallback. Independent implementation review of
these cases and the earlier rejection replay remains a release gate.
