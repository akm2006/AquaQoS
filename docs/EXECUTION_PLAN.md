# Execution plan

Deadline: September 13, 2026, 16:00 UTC. Dates below are internal targets, not event rules.
Root owns implementation, gates and commits. Reviewer passes are read-only.

| Phase | Dependency | Objective gate | Target |
| --- | --- | --- | --- |
| 0 Bootstrap | Full brief + environment audit | Durable docs, pins, local skills/reviewers validated and committed | Sep 5 |
| 1 Reproduction | Relaunch; candidate toolchain compile | Unmodified official Aqua/SwapVM competing-fill failure with rollback evidence | Sep 6 |
| 2 Specification | Reproduction + source map | Invariants, policy semantics, native-extension comparison, Registry/Vault decision, threat model | Sep 6 |
| 3 Primitive | Approved recorded specification | Smallest guard and necessary lifecycle controls; positive/negative/fuzz tests | Sep 7–8 |
| 4 Security | Integration tests | Independent adversarial review; callback/fee/lifecycle findings resolved | Sep 8 |
| 5 Measurement | Stable invariant + security gate | Reproducible A/B/C workloads, raw data, gas and limitations | Sep 9 |
| 6 Usable app | Stable ABI + benchmark | Functional configuration/demo/proof routes, desktop/mobile verification | Sep 10 |
| 7 Demo/release | Reproducible protocol/app | Local fork or approved deployment; real transfer receipts; clean-machine rehearsal | Sep 11 |
| 8 Packaging | Evidence locked | README, diagrams, threat model, benchmark docs, video script; paper if time | Sep 12 |
| 9 Final audit/submission | All hard gates + human actions | Final test run, public access approval, narrated video, dashboard confirmation | Sep 13 before deadline |

Critical path: reproduction -> invariant and trust boundary -> enforcement -> adversarial
review -> measured benefit -> usable proof -> reproducible transfer demo -> submission.
Record a pivot if the thesis fails; do not skip reproducibility or hide losing workloads.

Before frontend polish: protocol correctness, relevant negative tests, security review and
stable reproducible benchmark must pass. Documentation and human-account tasks run alongside
technical work. Trim stretch features/paper before correctness or demo reliability.

Each milestone requires implementation where applicable, actual passing checks, validated
assumptions, updated STATUS/decisions, disposition of findings and a coherent commit.
No artificial commit count: commit actual increments. Review [acceptance](ACCEPTANCE_CRITERIA.md).

Immediate next phase: define and independently review the A/B/C methodology before
implementing measurements. Preserve identical offered demand, equal initial backing,
explicit guarantee/allocation policies, price/slippage differences, raw failures and
losing cases. Existing group-size gas and adaptive validation sequences do not satisfy
that comparison gate. See STATUS for remaining validation and reproduction work.
