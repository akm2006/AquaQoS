# Project charter

Updated 2026-09-09 against the implemented v0 and retained tests. See
[sources](RESEARCH_SOURCES.md) and [decisions](DECISIONS.md).

## Validated problem and conditional thesis

Aqua records independent virtual token balances per maker/app/strategy/token, without
escrowing inventory. Its source and official inventory-safety documentation show that
one strategy can consume real tokens while another retains virtual capacity. A later
transfer can fail from insufficient balance or allowance. This is documented behavior,
not a newly discovered Aqua vulnerability. Three local Solidity tests reproduce inventory
and allowance failures with transfer and rollback assertions; see PROBLEM_REPRODUCTION.md.

AquaQoS will test whether configured per-strategy protected capacity plus shared burst
access can improve the allocation trade-off for a maker running multiple strategies.
The intended innovation is execution-enforced sibling-capacity policy, not a claim that
overcommitment creates real capital, guaranteed fills, profitability or solvency.

## User and technical foundation

Primary user: a maker operating a small set of overlapping token strategies who wants
explicit capacity priorities. Aqua is necessary to this experiment: it provides the real
shared-inventory accounting and settlement path being constrained. SwapVM provides pricing,
program execution and an extension point; replacing these with an unrelated escrow AMM
would change the problem being measured.

## Initial implementation scope

One token capacity group with a bounded number of strategies; official Aqua settlement;
one minimal CAPACITY_GUARD implementation after specification; deterministic raw failure;
adversarial and fuzz tests; three-baseline benchmark; simple maker/demo/proof UI; repeatable
local token-transfer demonstration and technical documentation.
The implemented v0 uses a restricted maker vault with registration built in (D007);
there is no separate registry. Its boundary is one immutable token pair and at most
eight fee-free XYC strategies. It assumes ordinary non-rebasing, non-fee-on-transfer
ERC-20s; unsupported behaviors must be rejected or explicitly outside the tested property.

## Non-goals and stretch

No token, DAO, prediction/oracle product, AI trading agent, multi-chain rollout, unrelated
sponsors, mainnet money management or unconditional permanent guarantees. No advance claim
that QoS outperforms either baseline. Stretch only after core gates: broader token support,
dynamic allocation and a 5–7 page technical paper. NAV floors and priority tiers are deferred.

## Questions that can change scope

The v0 specification defines consumable entitlements, replenishment, fee exclusion and
transaction-scoped reservations. D007 selects the dispatcher extension and restricted
vault after comparing native Extruction. Remaining questions include token support,
same-transaction conservatism, broader workloads and release-wide security review.
Eight-strategy measurements expose higher swap and rejection gas; broader efficiency
claims require evidence beyond these fixed test-token workloads.
