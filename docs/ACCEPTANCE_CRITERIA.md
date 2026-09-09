# Objective acceptance criteria

Problem-reproduction checks below reflect the executable evidence; unverified release gates remain open.

## Problem reproduction

- [x] Pin official Aqua/SwapVM and compiler; local install/build/test works without an MCP.
- [x] Two real strategies share one maker/output-token inventory, with sufficient allowance.
- [x] First fill changes real inventory and its own virtual balances; sibling virtual balance is unchanged.
- [x] Sibling quote/virtual capacity remains sufficient but actual settlement fails for inventory shortage.
- [x] Assert failure cause and complete rollback of real/virtual balances; separately reproduce allowance shortage.
- [x] Use real ERC-20 transfer calls on a local EVM; preserve deterministic test command in PROBLEM_REPRODUCTION.
- [x] Fresh checkout with empty package/compiler caches installs, builds and passes
  30 tests plus transaction replay. See TRANSACTION_VALIDATION, source `0bf3447`.
- [ ] Retain a detailed baseline-problem execution trace for the final proof package.

## CAPACITY_GUARD

- [x] Written units, reserve, guarantee-consumption/replenishment semantics and exact invariant.
- [x] Compare native Extruction versus dispatcher extension using pinned current interfaces.
- [x] Trace quote/swap and fee/callback paths within the canonical fee-free supported
  domain; final maker output debit is `amountOut`. SECURITY_REVIEW_V0 maps excluded
  fee/hook routes and tested callbacks. Arbitrary recipes/tokens are not covered.
- [x] Guard cannot be omitted, jumped over, invalidated by later instructions or bypassed through another route
  within the claimed protected domain. Test the selected program-validation/enforcement mechanism.
- [x] Exact-in/out, both token directions, same-state quote/swap agreement and stale-quote recheck tested.
- [x] Boundary capacity allowed; one unit above rejected; zero/max/rounding/underflow handled.
- [ ] Every admitted fill preserves the specified sibling capacity/reserve after settlement.
  Three fixed-seed 64-trade sequences and 30 pushes satisfy model-versus-EVM checks;
  this evidence is bounded and does not establish all sequences/token behaviors.
- [x] Replenishment restores defined capacity; guard reverts do not mutate state.

## Registry / Vault, if retained

- [x] ADR establishes necessity and trust boundary; omit unused abstractions.
- [x] Only authorized maker configures; full maker/app/hash/token identity, no duplicate/unknown entries.
- [x] Atomic ship/dock registration, active-state validation, stale sibling removal and reship identity tested.
- [x] Reject reserve/guarantee overconfiguration; eight-strategy lifecycle enumeration,
  activation, docking and withdrawal receipt maxima are measured in
  [LIFECYCLE_GAS.md](LIFECYCLE_GAS.md). The matrix is bounded and does not claim a
  universal worst-case across token/callback implementations.
- [ ] Withdrawals, approvals, arbitrary calls, other apps and upgrades cannot silently bypass claimed protection.
- [x] Document maker escape/pause behavior and the point at which guarantees cease.

## Integration and security

- [x] Official Aqua handles token movement and virtual accounting; custom functionality executes inside SwapVM.
- [ ] Separate review checks cross-order/router callbacks, reentrancy, hostile tokens, fees, allowance changes,
  lifecycle/config changes, griefing/DoS, integer limits and transaction ordering.
- [x] Unit/integration/fuzz/property tests cover the current material paths; fixed seeds and
  failures are retained. Broader token-behavior and exhaustive-state coverage remain open.
- [ ] No high/critical unresolved findings at release; other accepted risks identify owner and justification.
- [x] Fresh install/build/test commands and runtime/tool versions verified on Windows;
  full-runtime metadata drift is explained and deployment artifact matching remains required.

## Benchmark

The required comparison contract is defined in [BENCHMARK_METHODOLOGY.md](BENCHMARK_METHODOLOGY.md).

- [x] Conservative/raw/QoS share initial real inventory, immutable offered demand, XYC
  pricing assumptions and seeded workloads; the tested guarantee policy is recorded.
- [x] Include concentrated demand, sibling contention, replenishment, adversarial ordering, low contention and
  overloaded regimes. Conservative setup includes an honestly documented reserve/allocation policy.
- [x] Raw machine-readable per-attempt records, initial/final state, seed, commit, gas settings and commands retained.
- [ ] Metrics: virtual/shared ratio, successful volume, settlement failures, guarantee violations,
  capital utilization, unsafe rejections, burst utilization and gas. Define each denominator/unit.
- [x] Report rejection and failed-fill counts over all attempts; do not reclassify rejection as filled demand.
- [x] Separate advertised depth from executable volume and distinguish local workload results from real-market value.
- [x] Matched-guarantee C100 sensitivity covers the same 48-fixture 2/4/8-strategy matrix;
  reports price/custody limits and the eight-strategy losing gas case. Recorded-data
  checker rejects 19 deliberate corruptions.
- [x] Replay independently reconstructs receipt-log mapping before broad claims; seeded
  demand regeneration, deployment identity and exact saved calldata are now checked.
  Same-transaction and finite-allowance cases are not covered by the static replay below.
- [x] Static fee-free maximum-allowance replay rebuilt all 52 C/C100 rejected pre-states;
  17 settlement failures, 35 capacity breaches and 0 safe fills; twelve controls passed.
  Same-transaction and finite-allowance conservatism remain separate gates.
- [x] Focused real-settlement controls reproduce one safely backed sequential fill
  blocked by a settled reservation, and finite allowance followed by direct push
  demonstrates why the full guarantee allowance floor matters. Broad rates/review remain open.
- [x] Findings reproducible; neutral and losing cases are included; no target performance threshold was invented.

## Frontend, deployment and demo

- [x] Next.js recorded-evidence workspace compares A/B and C/C100 for all 48 scenario
  selections, displays checked local receipts and labels its non-live environment.
- [x] Recorded workspace browser regression passes fill/rejection/push values, evidence
  links, failed-load retry and 1440/390/320px layouts. Static build and typecheck pass.
- [ ] Independent review of the Next.js evidence-to-display path; first attempt reached
  the reviewer's usage limit without a completed report.
- [ ] Maker config, capacity explanation, competing fills and proof page use real contract state/evidence.
- [ ] No invented addresses/metrics. Clearly label chain, local fork, stale quotes and failed transactions.
- [ ] Desktop/mobile, accessible controls, changed flow, console and network checks via Playwright CLI.
- [ ] Deployment/replay scripts declare chain/block/source pins; verify deployed code and addresses.
- [ ] Local fork demonstration includes actual token balance changes and receipts/traces; fresh replay succeeds.
- [ ] Public transactions or deployment costs require authority; local test balances carry no market-value claim.

## Documentation and submission

- [ ] README, architecture diagram, threat model, benchmark docs and proof page agree with tested implementation.
- [ ] Technical claims map to source/test/receipt; third-party notices and AI/provenance complete.
- [ ] Paper 5–7 pages if time permits, generated from the same evidence; optional, never blocks hard gates.
- [ ] Human-reviewed contribution record, compliant 2–4 minute narrated video, sponsor mapping and repo access.
- [ ] All [event gates](archive/ethonline-2026/HACKATHON_REQUIREMENTS.md) checked with evidence; dashboard submission receipt saved.
- [ ] Final audit checks secrets, license notices, coherent history, reproducible commands and all public links.
