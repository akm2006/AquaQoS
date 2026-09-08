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

## Sep 8: fee and callback path trace (root fallback review)

Pinned SwapVM `f09a41e689240adc645934f965c8061749397cd2` initializes fee state
to zero in quote and swap. Canonical XYC changes only amount registers; salt is a
no-op. The wrapper checks empty fee state after the inner program finishes. No
owner/global fee setter is present in this router. Settlement then validates traits
and runs the two transfer helpers in taker-selected order. Scope below is the
registered vault, canonical fee-free recipe and supported honest ERC-20 tokens.

| Path after or around the guard | Enforcement and evidence |
| --- | --- |
| Input/output protocol, surplus and provider fees; LP flat fees | Vault cannot ship these recipes. Eight official fee builders inserted inside the wrapper are rejected by quote and swap with `InvalidGuardProgram`, before fee execution; balances and virtual state stay unchanged. Existing malformed-program tests cover trailing/duplicate instructions. |
| Nonempty fee registers | Wrapper rejects them defensively. They are unreachable through canonical XYC/salt; no synthetic register injection is presented as a production-path test. With zero metadata, every input/output fee resolver returns zero before any fee transfer. |
| Four maker hooks, maker receiver and maker unwrap | Vault constructs fixed traits; new test checks every hook disabled, receiver is vault, unwrap disabled and exact registered hash. Changing order data/traits changes the Aqua key. |
| Taker pre-input and pre-output callbacks | Both run after reservation. New boolean-parameter tests sample both directions, both transfer orders and router payment versus callback `Aqua.push`. Quotes invoke neither callback and create no reservation. |
| Reentrant same-order/sibling swap from pre-output callback | Same order returns upstream `UnexpectedLock`. Sibling output 501 rejects with available 1000/required 1001 and unchanged state; output 500 succeeds while the outer 500 remains pending. Final real/virtual balances, both reservations and allowance floors are checked. |
| Owner callback lifecycle/configuration | Actual owner callback attempts pause, activate, dock-all, guarantee change, registration and withdrawal. All fail with `TransactionInProgress`, not merely an authorization failure. |
| Missing callback payment after nested success | Maker-first outer fill and nested sibling output execute, then missing input fails with exact `AquaBalanceInsufficientAfterTakerPush`. All recorded balances, allowances, virtual markers, reservations and callback state roll back; pause/activate and retry of the same order succeed. |
| Native currency/output unwrap and token callbacks | Router WETH is zero and vault tokens are nonzero; nonzero native payment is rejected for supported tokens and the unwrap branch cannot match them. Callback-bearing tokens remain unsupported, not newly validated by taker callback tests. |

`test/AquaQoSCallbacks.t.sol` adds four tests; the full suite now passes 30 tests,
including 256 runs each in three parameterized properties. These examples do not
prove arbitrary callback code, every nested direction/sequence or hostile tokens.
Root inspected the final test paths as the documented fallback; independent final
implementation review remains open. No production code or invariant changed.
The initial rollback test hit nested `expectRevert` bookkeeping; normal try/catch
now checks the exact outer error without overlapping callback expectations.
