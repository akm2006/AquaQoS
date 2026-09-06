# Objective acceptance criteria

Problem-reproduction checks below reflect the executable evidence; unverified release gates remain open.

## Problem reproduction

- [x] Pin official Aqua/SwapVM and compiler; local install/build/test works without an MCP.
- [x] Two real strategies share one maker/output-token inventory, with sufficient allowance.
- [x] First fill changes real inventory and its own virtual balances; sibling virtual balance is unchanged.
- [x] Sibling quote/virtual capacity remains sufficient but actual settlement fails for inventory shortage.
- [x] Assert failure cause and complete rollback of real/virtual balances; separately reproduce allowance shortage.
- [x] Use real ERC-20 transfer calls on a local EVM; preserve deterministic test command in PROBLEM_REPRODUCTION.
- [ ] Verify a fresh checkout install/build/test and retain an execution trace.

## CAPACITY_GUARD

- [x] Written units, reserve, guarantee-consumption/replenishment semantics and exact invariant.
- [x] Compare native Extruction versus dispatcher extension using pinned current interfaces.
- [ ] Trace quote/swap and all fee/callback paths; check final total maker debit, not a provisional register.
- [ ] Guard cannot be omitted, jumped over, invalidated by later instructions or bypassed through another route
  within the claimed protected domain. Test the selected program-validation/enforcement mechanism.
- [ ] Exact-in/out, both token directions, same-state quote/swap agreement and stale-quote recheck tested.
- [ ] Boundary capacity allowed; one unit above rejected; zero/max/rounding/underflow handled.
- [ ] Every admitted fill preserves the specified sibling capacity/reserve after settlement.
- [ ] Replenishment restores defined capacity; guard reverts do not mutate state.

## Registry / Vault, if retained

- [ ] ADR establishes necessity and trust boundary; omit unused abstractions.
- [ ] Only authorized maker configures; full maker/app/hash/token identity, no duplicate/unknown entries.
- [ ] Atomic ship/dock registration, active-state validation, stale sibling removal and reship identity tested.
- [ ] Reject reserve/guarantee overconfiguration; bound enumeration with measured worst-case gas.
- [ ] Withdrawals, approvals, arbitrary calls, other apps and upgrades cannot silently bypass claimed protection.
- [ ] Document maker escape/pause behavior and the point at which guarantees cease.

## Integration and security

- [ ] Official Aqua handles token movement and virtual accounting; custom functionality executes inside SwapVM.
- [ ] Separate review checks cross-order/router callbacks, reentrancy, hostile tokens, fees, allowance changes,
  lifecycle/config changes, griefing/DoS, integer limits and transaction ordering.
- [ ] Unit/integration/fuzz/property tests cover material paths; fixed seeds and failures retained.
- [ ] No high/critical unresolved findings at release; other accepted risks identify owner and justification.
- [ ] Fresh install/build/test commands and runtime/tool versions verified.

## Benchmark

- [ ] Conservative/raw/QoS share initial real inventory, offered demand, pricing assumptions and seeded workloads.
- [ ] Include concentrated demand, sibling contention, replenishment, adversarial ordering, low contention and
  overloaded regimes. Conservative setup includes an honestly documented reserve/allocation policy.
- [ ] Raw machine-readable per-attempt records, initial/final state, seed, commit, gas settings and commands retained.
- [ ] Metrics: virtual/shared ratio, successful volume, settlement failures, guarantee violations,
  capital utilization, unsafe rejections, burst utilization and gas. Define each denominator/unit.
- [ ] Report rejection and failed-fill counts over all attempts; do not reclassify rejection as filled demand.
- [ ] Separate advertised depth from executable volume and distinguish local workload results from real-market value.
- [ ] Findings reproducible; neutral or losing cases included; no target invented performance threshold.

## Frontend, deployment and demo

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
- [ ] All [hackathon gates](HACKATHON_REQUIREMENTS.md) checked with evidence; dashboard submission receipt saved.
- [ ] Final audit checks secrets, license notices, coherent history, reproducible commands and all public links.
