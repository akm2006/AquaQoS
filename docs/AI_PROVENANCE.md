# AI and work provenance

2026-09-12 documentation surface: the owner asked for `/docs/` to carry the landing page's design
language, keeping the existing page structure, and to offer light and dark modes. Claude Code
(Claude Opus 5) implemented D026: a rewritten `web/app/(docs)/docs.css` mapping the Fumadocs
token set onto the D025 brutalist palette for both themes, radius pinned to 0, the product's dot
grid and Geist Mono/Pixel faces, plus frame, label and button primitives mirroring the product
stylesheet; the six docs-only MDX components (`DocsHero`, `Stats`, `Truth`, `Verify`,
`CapacitySplit`, `ScheduleFlow`) restyled onto theme-aware tokens; `forcedTheme` removed in
favour of a system-default theme switch; and the header logo seated on the ink tile the product
header already uses. No content, no page tree entry and no navigation target changed, and no
dependency was added — the docs root layout now loads the product surface's font module instead
of Geist Sans. The nineteen foreground/background pairs across the two themes were computed and
all meet WCAG AA, the lowest at 4.80:1. Rendering was not visually verified: no browser
automation is installed in this environment, and the repository's Playwright checks run through
an external CLI.


2026-09-12 product surface: the owner supplied an untracked v0 brutalist landing template and
asked for its design, in the logo's colors, to carry AquaQoS content across the landing, shared
header/footer, live and proof routes. Claude Code (Claude Opus 5) planned and implemented D025:
the Tailwind/layer foundation and cream/ink/matte-blue tokens, new shared primitives (Navbar,
NavLinks, Footer, SectionLabel, FrameCard, KnownLimits, Reveal, Scramble, inline icons), the
rebuilt landing and proof pages, and a CSS-only restyle of the workspace and live routes with no
markup change. It added a landing block to `check-browser.js` and a Sepolia summary to the
evidence manifest, and deleted the four superseded landing components. No file, image, component,
copy line or metric was copied from the template, and no runtime dependency was added. Landing
and proof figures are derived from the checked report and manifest at build time and
cross-checked against the documented gas medians, so a drifted claim fails the build. Copy reuses
previously reviewed text; the proof page's out-of-date "no public deployment" sentence was
corrected to README's wording (public Sepolia proof, no external audit, no mainnet deployment).
Verification was local and agent-run: typecheck, build, production audit, both browser suites and
emulated reduced motion. The live suite timed out twice before passing unchanged; no root cause
was established and no live code or assertion was modified. No independent review or human test
execution is inferred.

2026-09-11: owner requested final checks before fork evidence, with testnet afterward
if practical. Codex authored release/trace and upstream-authentication scripts, ran
clean-checkout checks and documented source drift. Receipts/traces are EVM-generated.
The additional independent reviewer request was rejected by the agent service before
findings; no new independent approval or human execution is inferred.

This is an AI-assisted project, not a claim of unaided human authorship.

2026-09-11 app scaffold: owner asked for a basic structure from APP_REFACTOR_GUIDE and
deferred `/docs/` to a docs framework. Claude Code (Claude Opus 5) created the `web/app`
route scaffold, shared component/copy/route modules, favicon derivative and the route
updates in `check-browser.js`; the logo master was copied byte-identical. At the owner's
request it removed arrow glyphs from UI text (direction arrows became words) and renamed
the matching `check-live-browser.js` button. Copy reuses the
reviewed proof-page text and CAPACITY_GUARD_SPEC wording; the landing capacity bar is a
labelled worked example, not measured data. No independent review or human test execution
is inferred.

2026-09-11 docs: owner selected Fumadocs and a logo-derived light blue on black palette for
`/docs/`. Claude Code (Claude Opus 5) read the Fumadocs documentation, installed pinned packages,
moved the product routes into `web/app/(site)` without content changes, and authored
`web/app/(docs)`, `web/content/docs/*.mdx`, the docs theme and the D024/guide/status updates.
Page text restates repository records; numbers come from STATUS, BENCHMARK_RESULTS,
SEPOLIA_DEPLOYMENT, FORK_PROOF and LIFECYCLE_GAS. No independent review or human test
execution is inferred.

2026-09-11 evidence re-run: owner approved re-running the pinned benchmark after 17a6b99's
`package.json` change blocked the web build. Claude Code re-ran `run-a-b-c.mjs` from clean
58ae957 and `replay-rejections.mjs` from clean 9fe8aaf on checksum-verified Node 22.16.0.
Only source-identity fields changed; `check-benchmark` (72 fixtures, 22 tests) and the
rejection self-test (19 corruptions) passed. No independent review is inferred.

2026-09-09 product direction: owner requested completing product polish before submission
and explicitly selected Next.js for the frontend. Codex implemented `web/`, the local
launcher migration, evidence export and browser checks. Earlier HTML replay and root
release-review documents were also Codex-authored; that review was not an external audit.
The Next.js app reuses recorded benchmark transactions, not generated illustrative values.
Root inspected the implementation and browser results. A separate frontend reviewer
reached its usage limit without delivering a report; no independent approval is claimed.
No additional human test execution or code authorship is inferred.

| Date | Artifact scope | Origin / contribution |
| --- | --- | --- |
| 2026-09-05 takeover | Initial owner-supplied planning material | Used as unvalidated starting context; it is not part of the public repository |
| 2026-09-05 bootstrap | AGENTS, README, docs, source lock, local Codex roles/config/skills, bootstrap check | Codex generated from owner's detailed operating requirements; official-source research assisted by one read-only agent |
| 2026-09-05 human input | Project direction and bootstrap requirements | Owner supplied the thesis, priorities, source hierarchy, acceptance requirements and authorization boundaries; further substantive human review/contributions must be recorded |
| 2026-09-06 protocol baseline | Hardhat setup, shared-inventory/allowance tests, reproduction documentation | Codex implemented against pinned official sources; read-only protocol and security agents reviewed source paths, assertions and claims |
| 2026-09-06 guard specification | CAPACITY_GUARD invariant, wrapper/vault boundary and D007 | Codex drafted and corrected the design through independent read-only source and security review; the resulting v0 contract boundary is explicitly limited in `docs/CAPACITY_GUARD_SPEC.md` |
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

The exact owner bootstrap request is retained in
`docs/prompts/2026-09-05-owner-bootstrap.md`, recovered from this session's user message.
Retain sanitized project prompts in `docs/prompts/`; omit credentials/private runtime
context, not substantive project direction. Update this ledger with precise file/asset
scope and actual human decisions/test contributions every milestone. Before submission,
reconcile the ledger with Git history and retained prompts. Never fabricate human activity
to satisfy the official meaningful-contribution requirement.

The initial owner-supplied planning material is intentionally excluded from the public
repository. Current technical claims are derived from the pinned sources, executable tests,
retained raw evidence and the decisions recorded in this repository.

## Public-release policy

2026-09-09 continuation: Codex extended the existing benchmark and checker to eight
strategies, added three corrupted-evidence regressions, and corrected stale method
coverage and the README proof-server command. Owner requested continued project work.
Measurements and separate benchmark review are recorded after execution in STATUS.
The read-only benchmark-auditor independently passed 48 fixtures, 20 regression tests
and 12 replay corruptions, and verified unchanged 2/4 measurements. Root retained the
clean 52-candidate replay, documented the eight-strategy gas loss, corrected stale
charter/coverage wording, and browser-checked the proof page at 1280px and 390px.
This is AI-assisted internal review; no additional human technical contribution is inferred.

The provenance and prompt files are intentionally retained. ETHOnline permits AI-assisted
development but asks teams to identify where AI was used; its current submission guidance
also asks spec-driven projects to include the relevant prompts and planning artifacts.
The Codex configuration is optional development tooling, not part of the protocol runtime.
No claim of unaided authorship is made, and owner contributions must be recorded here as
they occur rather than inferred from the commit author name.
