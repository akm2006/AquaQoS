# v0 release verification

Updated 2026-09-11. Internal review and public Sepolia proof are complete. This is not a
production certification or external audit.

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

A narrowly scoped read-only review completed against unchanged
production source and authenticated historical AquaRouter. It found no demonstrated
critical, high, medium or low defect within v0 scope and no security blocker to a Sepolia
demo with standard mock tokens. See [SECURITY_REVIEW_SEPOLIA.md](SECURITY_REVIEW_SEPOLIA.md).
This closes the requested internal release-review gate, not external audit or production use.

## Accepted v0 limitations

The v0 specification and D007/D008 define these scope decisions. They are constraints of the
local demo, not approval to risk real funds.

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

## Public Sepolia proof

Clean source `17a6b990f98016c71de6ab8210da3864ac9ac318` deployed the unchanged router,
vault and two explicitly labelled demo tokens on chain `11155111`. Twenty-two public
transactions cover setup, two guarded rejections, four successful swaps and Aqua
replenishment. Sourcify reports exact creation/runtime matches for all four custom
deployments. `pnpm check:sepolia` re-queries Sepolia and Sourcify and passed source,
runtime, receipt, rollback, transfer, balance and allowance checks. See
[SEPOLIA_DEPLOYMENT.md](SEPOLIA_DEPLOYMENT.md) and the retained
[report](../deployments/sepolia/report.json).

See [FORK_PROOF.md](FORK_PROOF.md) for the separate authenticated DAI/WETH fork proof.
Submission work remains deferred until product polish is complete.

## Public-repository rehearsal

Commit `8710918f9ba423f5196487d5d76840d4b17e5236` was cloned into a new directory and
installed from the frozen root and web lockfiles with pnpm 11.10.0 and `--ignore-scripts`.
This exact normal install required the network because the existing local cache lacked one
pinned Aqua tarball; it completed without changing tracked files.

The clone then passed:

- contract compilation and all 30 Solidity tests, including three 256-run fuzz properties;
- 327,168 bounded capacity-model cases;
- all 72 retained benchmark fixtures and 24 checker tests covering 27 negative assertions;
- the rejection replay plus 25 deliberately invalid report/source cases;
- both release-evidence reports plus seven corruptions per report;
- bootstrap link/source/skill checks;
- Next.js type-check and production build; and
- a final clean Git-status check after the read-only release gates.

The separate 239-transaction stateful generator also passed all three strategy-count seeds
and gas scenarios. It intentionally regenerated `benchmarks/raw/transactions-v1.json`, so it
is retained as an evidence-generation command rather than a clean-checkout CI gate.

Before the commit, Gitleaks 8.30.1 scanned the exact staged content (about 61 KB) with zero
findings. A reachable-history scan reported 140 `generic-api-key` candidates; inspection found
that every candidate was a JSON field named `token` containing a public 20-byte EVM contract
address in retained deployment evidence. No `.env` file is tracked, `.env.sepolia` remains
ignored, and the removed workspace ZIP is not part of Git history.

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
