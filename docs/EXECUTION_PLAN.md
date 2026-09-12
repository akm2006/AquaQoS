# Execution plan

AquaQoS advances only through evidence-backed gates. Root owns architecture, implementation,
verification, documentation, and milestone commits; high-risk protocol changes receive a
separate read-only review.

## Delivery order

1. Reproduce the shared-inventory failure with official Aqua/SwapVM behavior.
2. Define the protected-capacity invariant and explicit supported domain.
3. Implement the smallest enforceable primitive and restricted lifecycle boundary.
4. Cover positive, negative, boundary, callback, lifecycle, and fuzz paths.
5. Complete independent internal security review and resolve findings.
6. Measure conservative Aqua, raw overcommitment, and AquaQoS under identical demand.
7. Prove the result on isolated local EVM, authenticated fork, and valueless public testnet.
8. Deliver an accessible product and short verification path.
9. Rehearse the complete release from a clean checkout.

Steps 1–7 are complete within the documented v0 scope. Step 8 is active.

## Active milestone: product surface

The public Next.js application must provide:

- `/`: product thesis, architecture, measured result, limitations, and clear calls to action;
- `/workspace/`: retained A/B/C/C100 comparisons without implying live execution;
- `/onchain/`: public Sepolia contracts, source verification and representative receipts;
- `/proof/`: source, test, receipt, benchmark, and deployment verification;
- `/docs/`: curated public protocol documentation backed by repository sources.

The contributor-only `/live/` lab retains fresh local-EVM transactions and maker lifecycle
controls but is not a primary public navigation destination.

The final logo and product system are defined in
[`product/DESIGN_SYSTEM.md`](product/DESIGN_SYSTEM.md); implementation and browser gates are
defined in [`product/APP_ARCHITECTURE.md`](product/APP_ARCHITECTURE.md). Protocol correctness,
evidence parsers, and environment labels must survive the refactor unchanged.

## Release gate

Before a tagged public release:

- frozen installs, contract compilation, 30 Solidity tests, bounded capacity model, benchmark,
  rejection, release-evidence, and recursive-link checks pass;
- Next.js typecheck, production build, desktop/mobile browser flow, console, requests,
  accessibility basics, and evidence links pass;
- retained local, fork, and Sepolia evidence remains bound to its recorded clean source;
- public claims, contract scope, threat model, license map, and upstream attribution agree;
- reachable Git history and the final staged diff pass secret review;
- a fresh checkout reproduces all checks without relying on untracked files;
- unresolved limitations are visible, not converted into passing claims.

## Deferred work

Do not expand token types, strategy count, VM recipes, fees, upgradeability, or production
custody during product polish. Comprehensive external audit, production operations, formal
verification, and broader market workloads are separate future milestones.

Event-specific deadlines, dashboard steps, video requirements, prompts, and provenance are
retained under [`archive/ethonline-2026/`](archive/ethonline-2026/); they do not define the
protocol roadmap.
