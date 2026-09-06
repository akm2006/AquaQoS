# Decisions

## 2026-09-05 — D001: Evidence-first bootstrap

Decision: preserve the winning brief unchanged as lowest-priority provenance; claims remain
hypotheses until verified. Alternatives: implement the brief literally. Evidence: official
source contains callback and version differences absent from the brief. Reason: prevent
design-by-marketing. Consequence: no protocol/frontend implementation in bootstrap; separate
reproduction and specification gates. AI/human provenance is a hard event requirement.

## 2026-09-05 — D002: Direct current official packages, template as reference

Decision: use current SwapVM main SHA and its declared Aqua v1.0.0 dependency as the starting
candidate pair in `sources.lock.json`. Compiler 0.8.30; Hardhat 3.8.0 candidate, Node 22.16.0
and pnpm 11.25.0 available. Compatibility is source-declared, not yet proven by local build.
Alternatives: copy official template wholesale; use older release router; Foundry-first.
Evidence: template e9f8def pins Aqua 6f05aa1 and SwapVM b44977a, Hardhat 2, rsync precompile;
current SwapVM uses Hardhat ^3.8.0 and Aqua v1.0.0. Its program dispatcher/ABI differs from
older documentation. Current Hardhat docs support Node >=22.13.0 and Solidity fuzz tests.
Reason: avoid migrating an old scaffold and Windows shell scripts while keeping official
pricing/settlement. Consequence: build a minimal harness directly; pin transitive resolution
in a package lock at installation. No unrelated template AMM/deployment plugins copied.
Foundry remains a fallback if measured Hardhat limitations warrant it; no Foundry install now.

## 2026-09-05 — D003: Guard integration and custody remain unresolved

Decision: investigate custom `_runOpcode` dispatcher extension AND native `Extruction` before
selecting one; neither Registry nor Vault approved yet. Alternatives: fixed sibling-floor
formula from the brief; mandatory Vault from day one. Evidence: VM context exposes maker,
order hash, tokens and amounts; quote and swap share the loop; later callbacks and output
fees occur before pulls; per-order lock does not serialize the whole maker group.
Reason: a pre-transfer read alone cannot establish a post-transfer property. Consequences:
specify protected-domain closure, guarantee consumption/replenishment and total debit;
test nested sibling execution. If needed, retain a restricted maker Vault or narrow claims
to a cooperative-maker policy with explicit external-spend exclusions. Record next ADR.

## 2026-09-05 — D004: Small local control plane

Decision: three short domain skills and three read-only reviewer roles; inherit active model,
set high reasoning for protocol/security, medium for benchmark audit. Current bundled catalog
includes Astra, Sol, Terra and Luna; no obsolete model fixed in project files. Local config
limits spawned concurrency to two and depth to one. Root remains writer.
Alternatives: duplicate global infrastructure skills, broad MCP bundle, many writers.
Evidence: CLI 0.153.4 supports standalone `.codex/agents/*.toml` and project skill discovery;
Context7/web/shell and existing browser/review skills cover present needs.
Reason: domain review needs precise instructions, not more tooling. Consequences: no new MCPs;
relaunch to activate capabilities, inspect loaded roles, fallback to global read-only auditor.

## 2026-09-05 — D005: Local demo first; publication gated

Decision: target reproducible local-fork token transfers, which sponsor rules explicitly allow.
Public deployment and repository publication remain owner-authorized release steps.
Alternatives: require production resolver/API access and funded live wallets immediately.
Evidence: prize rules; deployed-router docs describe credential gates and a different ABI.
Reason: prove protocol behavior without depending on external onboarding. Consequences:
  select fork chain/block and verify deployed Aqua before demo; plain local EVM tests alone
  are engineering evidence, not automatically the final fork demonstration. Preserve upstream
  licenses and review derivative-source obligations before distributing/deploying modifications.

## 2026-09-06 — D006: Reproduce before designing the guard

Decision: retain the current official Aqua/SwapVM router as the reproduction baseline and
do not add CAPACITY_GUARD yet. Evidence: deterministic Solidity tests show two independent
Aqua virtual ledgers can both quote, while the second settlement fails after the first
consumes the maker's real output inventory; the failed transaction rolls back its input
transfer and Aqua push. Reason: the observed gap is between virtual capacity and real
inventory settlement, but guard semantics and protected membership are not specified.
Consequence: add allowance and adversarial path tests before choosing native Extruction or
a dispatcher extension. This is a tested failure mode, not a claim that Aqua is defective.

## 2026-09-06 — D007: Wrapper opcode plus restricted maker vault

Decision: specify CAPACITY_GUARD as a first-in-program wrapper opcode on a minimal custom
SwapVM router, backed by one restricted maker vault that also owns bounded membership and
guarantee configuration. Native Extruction is not the enforcement point. Alternatives:
read-only opcode, Extruction target, registry with an ordinary maker wallet, or copying and
modifying SwapVM settlement. Evidence: the wrapper can run the remaining program and inspect
final `ctx.swap` plus `ctx.fee`; Extruction receives only `SwapRegisters`, while output-side
protocol fees add dynamically resolved Aqua pulls. A wallet or registry cannot stop unrelated spending.
Reason: this is the smallest design that can make omission, final-fee accounting and sibling
reentrancy part of one explicit protected domain. Consequences: programs must begin with the
wrapper; the vault validates shipping and lifecycle; transient reservations serialize nested
capacity use. Same-transaction post-settlement calls may be conservatively rejected in v0.
The canonical v0 recipe is fee-free guard `0x05` + XYC + salt, constructed by a
non-upgradeable pair-specific vault with immutable Aqua/router addresses and no arbitrary
execution path. Fee recipes remain deferred. Implementation may begin only with the tests
listed in CAPACITY_GUARD_SPEC.

## 2026-09-06 — D008: Preserve allowance for permissionless replenishment

Decision: additionally require output allowance >= sum configured guarantees +
sum transient reservations + final debit. Keep the existing inventory admission
formula. Alternatives: check only output inventory, or check projected input
allowance. Evidence: independent contract review M1 found that standard tokens
may decrement maximum approvals; permissionless Aqua.push restores entitlement
without restoring allowance and bypasses an input-only router check.
Reason: a preserved full-guarantee allowance floor covers all future replenishment,
including direct pushes and nested swaps. Consequences: conservative liveness when
allowance approaches configured guarantees; no arbitrary reapproval API. Exit is
pause/dock-all/withdraw. Tests exercise decrementing approvals and direct push;
the follow-up read-only review confirmed the correction's invariant.

Every activation also explicitly resets all group baselines after checking both
tokens. Deployment must attest actual nonproxy Aqua/router code; checking the
router's AQUA getter alone does not authenticate its implementation.

## 2026-09-07 — D009: Predeclare the A/B/C benchmark contract

Decision: benchmark conservative Aqua, raw overcommitment and AquaQoS with equal
initial real backing, identical deterministic offered-demand streams and the same
XYC quote/rounding rules. Keep conservative depth differences visible in the input
quote instead of fabricating equal prices. Count quote rejection, guard rejection,
settlement failure and success separately, and preserve every attempt in raw JSON.
Alternatives: compare only successful trades, adapt demand after failures, or report
the existing stateful validation as a market benchmark. Evidence: the existing
stateful run adapts demand and uses different seeds per group size; it validates the
model but cannot establish comparative utilization or failure rates. Reason: define
the denominator and price/depth trade-off before writing measurement code. Consequence:
benchmark implementation is gated on this methodology and a read-only benchmark audit;
no performance claim is valid from the current gas microcases alone.
