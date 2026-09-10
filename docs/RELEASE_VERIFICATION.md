# v0 release verification

Updated 2026-09-11. This record separates completed checks from the still-open
additional independent review. It is not a production certification.

## Fresh-checkout checks

A new local clone of `d8b92fc76d6f5921cdda033eb2dcf08c7d72219c` at
`.tmp/release-verification-d8b92fc` installed all 528 packages from the existing
pnpm cache with the frozen lockfile. It had no node_modules or build artifacts.
The existing compiler cache, Node 22.16.0 and pnpm 11.10.0 were reused. This is
clean-source verification on the same Windows host, not an uncached or second-host claim.

Completed with exit code zero:

- `pnpm install --frozen-lockfile --ignore-scripts --offline --store-dir <existing-store>`
- `pnpm test`: compiled nine Solidity entry files; 30 tests passed, three properties
  ran 256 cases each. Oversized initcode warnings concern test harnesses only.
- `pnpm test:transactions`: all eight scenarios and 239 retained transactions;
  137 accepted and 55 rejected seeded swaps matched the model at every step.
- `node scripts/check-capacity-model.mjs`: 327,168 bounded cases plus boundaries.
- `node scripts/check-benchmark.mjs`: all 72 retained fixtures passed.
- `node --test scripts/check-benchmark.test.mjs`: 22 tests passed.
- `node scripts/check-rejections.mjs --self-test`: valid report passed and all
  19 deliberately corrupted reports were rejected.
- `node scripts/check-bootstrap.mjs`: source identities, links and skills passed.
- `node scripts/check-live.mjs`: local API/session, fills, rejection, replenishment,
  lifecycle and eight-strategy configuration checks passed.
- `pnpm exec hardhat run scripts/check-lifecycle-gas.mjs`: both eight-strategy matrices
  passed; observed activation maximum 518,103 gas and failed activation 518,883 gas.

Full runtime/gas identities must be read from the current release reports. Historical
builds may differ in compiler metadata and deployed addresses; those differences are
not silently treated as full-bytecode matches.

## Additional independent review

A new separate read-only security reviewer was requested for this milestone. The
agent service rejected the request as a possible cybersecurity risk before returning
findings. No review result or approval is inferred from that failed attempt.
The completed Sep 10 independent internal review in
[SECURITY_REVIEW_RELEASE.md](SECURITY_REVIEW_RELEASE.md) still applies to the unchanged
production source. An additional independent release review remains open, particularly
for the authenticated older deployed AquaRouter integration. Root owns follow-up.

## Accepted v0 limitations

The root technical lead retains these scope decisions from
[CAPACITY_GUARD_SPEC.md](CAPACITY_GUARD_SPEC.md) and D007/D008. They are constraints of
the local demo, not owner approval to risk real funds.

| Limit | Consequence and treatment |
| --- | --- |
| One immutable pair, canonical fee-free XYC, at most eight strategies | Other recipes are unsupported. Keep exact program validation and bound. |
| Honest standard ERC-20 behavior | Rebasing, transfer fees, malicious reports and token callbacks remain unsupported; one DAI/WETH fork run does not broaden support to arbitrary tokens. |
| Same-transaction reservations outlive completed fills | Some safe sequential fills reject. Use independent transactions in the demo; retain the counterexample test. |
| Full configured-guarantee allowance floor | Low allowance can reject otherwise backed fills; the floor protects future replenishment. Owner exit is pause/dock/withdraw. |
| Input-ledger saturation and XYC overflow | Capacity eligibility does not promise settlement. Existing numeric tests assert atomic rollback. |
| Owner may pause | Pausing ends the commitment; withdrawal requires all strategies docked. |
| Bounded fuzzing and gas measurements | No exhaustive all-sequences proof, universal gas bound or external audit. |

Existing tests cover lifecycle authorization and other-app pulls. The vault has no
generic call, arbitrary approval or upgrade entrypoint; its dependencies are immutable.
Correct code at those addresses is a deployment precondition, not something its
constructor's getter check proves. Fork runtime authentication addresses that precondition
for the recorded environment; additional review remains necessary for release approval.

See [FORK_PROOF.md](FORK_PROOF.md) for traces, commands and deployment evidence.
Submission work and testnet deployment remain deferred.

## Committed proof replay

Source `de8c60932c0366962c464e176c855743cf83f5a8` was cloned again into
`.tmp/release-proof-de8c609`, installed with the frozen lockfile and existing pnpm cache,
and rebuilt from absent artifacts. The fork runner passed against Ethereum block
25,948,160. The main checkout ran the pinned-source local mode at the same clean source.
Both reports retain `dirty=false`; only their own generated evidence outputs are
excluded from that check. Production contracts and Solidity tests are unchanged from
the d8b92fc full-suite pass above.

`node scripts/verify-fork-upstream.mjs` passed again without recapturing/changing pins.
`node scripts/check-release-evidence.mjs --self-test` accepted both clean reports and
rejected seven corruptions each. The earlier dirty fork trial was deliberately rejected
by this checker, then replaced with fresh-checkout evidence; it is not release evidence.
No protocol fix was needed. A fork constructor-simulation chain-context difference was
resolved in the verification script and does not alter any deployed Solidity source.
