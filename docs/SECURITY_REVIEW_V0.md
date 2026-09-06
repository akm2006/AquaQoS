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
- Eight-strategy gas measurement, fresh-transaction clearing/sequence tests, broader
  stateful fuzzing, malicious/noncanonical-program regressions and clean checkout
  replay remain open. Do not equate the passing local suite with final acceptance.
