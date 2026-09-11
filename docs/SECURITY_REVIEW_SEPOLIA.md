# Independent internal review before Sepolia

Reviewed 2026-09-11 at source `53941301ee271ee6e60e65dd1b9239ec975dfffb`.
A separate read-only project security reviewer inspected the unchanged production contracts,
four Solidity test files, pinned SwapVM settlement paths, the specification, retained evidence
and authenticated historical AquaRouter source. It made no edits or external transactions.
This is an independent internal review, not an external audit or production certification.

## Result

No critical, high, medium or low protocol defect was demonstrated within the declared v0
scope. The reviewer found no security blocker to an Ethereum Sepolia demonstration using
standard owner-mintable mock ERC-20 tokens, bounded values, authenticated Aqua/runtime
deployments, canonical fee-free programs and at most eight strategies.

The review directly checked:

- all six owner lifecycle operations, reservation-time lifecycle exclusion, atomic activation,
  pause semantics, dock-all requirement and withdrawal boundary;
- maker/router/hash/pair registration, duplicate/ninth/docked rejection and active Aqua markers;
- real balance, allowance, virtual capacity, current debit, sibling entitlement and pending
  reservation accounting, including checked arithmetic and the full allowance floor;
- exact `guard -> XYC -> salt` shape, wrapper entry/exit, empty fee state, quote/reserve split
  and prevention of later instructions changing the approved debit;
- pinned SwapVM settlement order, per-order locks, taker callbacks, both input routes, output
  pull and rollback; canonical traits disable maker hooks, custom receiver and native unwrap;
- cross-order nesting, failed outer settlement rollback, other-router isolation, router rescue,
  and absence of vault generic-call, approval or upgrade entrypoints;
- authenticated historical AquaRouter core, self-multicall and simulator. Multicall preserves
  the sender and simulator reverts its delegatecall effects; no persistent vault bypass was found.

During review, `node scripts/check-capacity-model.mjs` passed 327,168 bounded cases and
`node scripts/check-release-evidence.mjs --self-test` accepted both retained reports while
rejecting seven corruptions per environment. Root retains separate fresh compilation,
Solidity test, transaction replay and live fork execution results in RELEASE_VERIFICATION.

## Remaining limits

Mixed-direction deeper callback nesting, successful nesting after outer output settlement,
combined finite-allowance/payment routes, explicit zero-output rollback and wrapper-specific
executable regressions are not comprehensive. Current tests cover important subsets, not all
sequences. Hostile, rebasing, fee and callback-bearing tokens remain unsupported. Gas results
are measured examples. Same-transaction conservative rejection and numeric input-ledger
saturation remain documented v0 limitations. Public testnet use does not expand these claims.
