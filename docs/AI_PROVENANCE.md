# AI and work provenance

This is an AI-assisted project, not a claim of unaided human authorship.

| Date | Artifact scope | Origin / contribution |
| --- | --- | --- |
| 2026-09-05 takeover | Winning-package markdown | Supplied by owner, pre-existing at takeover; original authorship/time not yet established |
| 2026-09-05 bootstrap | AGENTS, README, docs, source lock, local Codex roles/config/skills, bootstrap check | Codex generated from owner's detailed operating requirements; official-source research assisted by one read-only agent |
| 2026-09-05 human input | Project direction and bootstrap requirements | Owner supplied the thesis, priorities, source hierarchy, acceptance requirements and authorization boundaries; further substantive human review/contributions must be recorded |
| 2026-09-06 protocol baseline | Hardhat setup, shared-inventory/allowance tests, reproduction documentation | Codex implemented against pinned official sources; read-only protocol and security agents reviewed source paths, assertions and claims |
| 2026-09-06 guard specification | CAPACITY_GUARD invariant, wrapper/vault boundary and D007 | Codex drafted and corrected the design through independent read-only source and security review; no production contract exists yet |
| 2026-09-06 specification checks | scripts/check-capacity-model.mjs, strengthened reproduction snapshots | Codex authored bounded exhaustive arithmetic checks and real-token rollback assertions; model outcomes are not performance benchmarks |
| 2026-09-06 guard implementation | contracts/AquaQoSRouter.sol, contracts/AquaQoSVault.sol, test/AquaQoS.t.sol, supporting docs | Codex root implemented router/vault and regression corrections; a bounded worker wrote initial integration tests; separate read-only reviewers found and checked the allowance-floor correction. Owner requested continued implementation and plain-language progress updates. |
| 2026-09-06 transaction replay | scripts/check-transactions.mjs, build roots/direct ethers pin, benchmarks/raw/transactions-v1.json, TRANSACTION_VALIDATION | Root implemented separate-transaction checks and generated EVM receipts/gas/state; a read-only benchmark auditor challenged assertions and provenance. This is a group-size micro-measurement, not the full benchmark. |
| 2026-09-06 enforcement regressions | test/AquaQoS.t.sol, acceptance/status/review docs | Root added omitted/malformed-guard, changed-hash, dock/reship, configuration authorization and cross-app pull tests against exact upstream error behavior. |
| 2026-09-06 clean-source rehearsal | benchmarks/raw/clean-replay-eeee95a.json, TRANSACTION_VALIDATION | Root cloned committed source locally, installed from the existing package cache after network failures, rebuilt and reran tests/replay, and compared source/runtime hashes and gas. |
| 2026-09-06 stateful/numeric validation | scripts/check-transactions.mjs and raw evidence, test/AquaQoS.t.sol, updated spec/review/status | Root implemented fixed-seed model-versus-EVM sequences; read-only auditor independently regenerated all 192 swaps. A bounded worker added five numeric tests; root reviewed the actual diff and strengthened quote/rollback assertions. |
| 2026-09-07 comparative benchmark | benchmarks/run-a-b-c.mjs, scripts/check-benchmark.mjs, raw report, method/results and D009/D010 | Root implemented fixed shared workloads and local A/B/C replay; earlier audit prompted trace and outcome checks. Earlier checker scope and metric labels are corrected in D011. |
| 2026-09-07 matched-policy validation | C100 runner/checker changes, scripts/check-benchmark.test.mjs, D011 and updated evidence/docs | Root added matched guarantees, receipt/build retention, state/error recomputation and corrupted-report regressions. Separate read-only benchmark reviewer checked code, reran checker/17 tests and verified raw metrics; custody wording and optimizer-enabled check corrected. Clean replay from 337beeb and all 24 Solidity tests passed. No smart-contract changes or new human contribution inferred. |

2026-09-07 rejection replay: root implemented benchmarks/replay-rejections.mjs,
scripts/check-rejections.mjs and REJECTION_REPLAY/D012 from the STATUS next task.
Read-only benchmark reviewer challenged reconstruction, baseline preservation, controls
and scope; the reviewer then exhausted its usage limit before final rerun. Root reran
cleanly from `39569ca`: 30 candidates, 8 controls, 11 settlement failures, 19 capacity
breaches, zero safe fills, and 9 corrupted-report tests rejected. Evidence is recorded
in STATUS and BENCHMARK_RESULTS.
Owner authorized continuation; no additional human technical contribution is inferred.

2026-09-08 conservatism regressions: root authored AquaQoSConservatism.t.sol, reused
existing mock/token/strategy helpers, and recorded settled-reservation and finite-allowance
controls. Test harness split fixed a compiler assembly-size failure; no production
contracts/compiler flags changed. Independent reviewer hit usage limit; root fallback
review completed, independent implementation review explicitly pending.

2026-09-08 lifecycle continuation: root authored scripts/check-lifecycle-gas.mjs and
docs/LIFECYCLE_GAS.md, adding a bounded eight-strategy receipt matrix with exact
rollback and live-array assertions. A read-only benchmark-auditor reviewed the draft
and reported no blocking issue; no production contracts changed.

2026-09-08 callback continuation: root authored AquaQoSCallbacks.t.sol and the fee/
callback path matrix in SECURITY_REVIEW_V0, using pinned official builders and
settlement source. Four tests cover callback nesting/rollback, canonical traits and
fee-recipe exclusion; no production edits. Root fallback review, not independent
audit closure. Owner authorized continuation; no human contribution is inferred.

2026-09-08 fresh verification: root performed isolated package/compiler downloads,
build, tests and replay from source 0bf3447; documented metadata-only build drift.
Independent security and benchmark reviewers closed the recent test/rejection-review
gaps and found a lifecycle enumeration evidence weakness. Root implemented its
minimal fix and startup fault regressions; benchmark reviewer approved the diff.
Fresh receipts/verification manifest and sanitized continuation scope are retained.

2026-09-08 rejection identity closure: root strengthened scripts/check-rejections.mjs to
bind replay deployment layout/build identity and decode exact maker/program/salt/amount/
direction calldata. The clean report was regenerated from source 9d77eda after the
proof-page package change; the checker
passed 12 deliberate corruptions with unchanged 30/11/19/0 results. Independent seed
regeneration now recomputes both A/B/C/C100 demand traces. The benchmark checker also
reconstructs the retained ERC-20 Transfer-log multiset for every push/successful swap and
requires failed swaps to emit none; broader workload diversity remains open.

2026-09-08 proof page: root authored the dependency-free `proof/index.html` and
`scripts/serve-proof.mjs`, using only committed measurements and links. Browser checks
covered desktop and 390px layouts; no wallet, deployment or external publication is inferred.

Original brief SHA-256:
`afe4a87cc791e00b1ed926337f1f7413202beb3c7f4d0834941723473d4a66ee`.
Filesystem timestamp observed September 5 is not proof of original creation time or
Classic eligibility. Preserve it unchanged; annotate disagreements elsewhere.

The exact owner bootstrap request is retained in
`docs/prompts/2026-09-05-owner-bootstrap.md`, recovered from this session's user message.
Retain sanitized project prompts in `docs/prompts/`; omit credentials/private runtime
context, not substantive project direction. Update this ledger with precise file/asset
scope and actual human decisions/test contributions every milestone. Before submission,
reconcile the ledger with Git history and retained prompts. Never fabricate human activity
to satisfy the official meaningful-contribution requirement.
