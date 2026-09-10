# Release security review — v0 scope

Checked 2026-09-09 against the pinned Aqua/SwapVM sources, `contracts/AquaQoSRouter.sol`,
`contracts/AquaQoSVault.sol`, the 30 Solidity tests and the retained transaction evidence.
This is a root read-only release review, not an external audit or a production safety
certification.

## Review result

No new blocker was found inside the declared v0 domain: one immutable token pair, at most
eight registered strategies, canonical fee-free XYC programs, standard honest ERC-20
behavior and the pinned official dependencies. The current test suite passes, and the
guarded replay checks rollback, real token movements, virtual balances, allowance floors,
callbacks and lifecycle boundaries.

## Checks performed

- The router accepts `CAPACITY_GUARD` only in the exact `05 00 | XYC | salt` program shape,
  runs the canonical registers first, rejects nonempty fee state and delegates settlement
  to the official Aqua/SwapVM path.
- The vault binds its immutable Aqua/router/token addresses, limits the group to eight,
  requires owner-only lifecycle changes, rejects duplicate/unknown strategies and blocks
  lifecycle callbacks while a guarded transaction is active.
- Quotes call the view capacity path; swaps reserve before settlement. Reverted settlement
  rolls back transient reservations and all token/virtual state.
- Capacity uses the lower of real balance and Aqua allowance. Every guarded output retains
  the full configured guarantee allowance floor, so permissionless `Aqua.push` cannot make
  a depleted allowance look like transferable capacity.
- Docking and withdrawal require the group to be paused; no generic vault call, upgrade
  entrypoint or alternate registered order path was found.

## Conditions before any production or public deployment claim

1. Verify the deployed Aqua and router runtime bytecode against the pinned build and record
   chain, block, addresses and constructor arguments. Constructor code length and an Aqua
   getter check alone do not prove authentic upstream code.
2. Keep the supported-token statement visible. Rebasing, fee-on-transfer, callback-heavy,
   malicious balance-reporting and arbitrary allowance-revoking tokens are outside this
   review.
3. Retain the eight-strategy and canonical-program limits. Gas figures are observed matrix
   values, not universal upper bounds.
4. Explain that transaction-scoped reservations can reject a safe sequential fill in the
   same outer transaction; this is conservative behavior, not a hidden guarantee.
5. Obtain a separate independent release review or explicitly accept that it is absent.

The review therefore supports continued local demo work. It does not close the final
security gate, authorize funds, or establish solvency, profitability or market safety.

## Sep 10 independent internal source review

A separate read-only security reviewer inspected the unchanged protocol at `f49bd1c`:
both production contracts, pinned upstream settlement paths, all four Solidity test files,
the specification and retained validation evidence. It found no release-blocking defect
within the supported v0 domain. The reviewer ran the 327,168-case arithmetic check;
root independently reran the complete Solidity suite on Sep 10: 30 passing, including
256 fuzz runs for each of three properties. This closes the missing independent internal
protocol-review pass for that scope, not the external-audit or deployment gates.

The review checked all six owner lifecycle methods, pause/dock requirements for withdrawal,
absence of generic calls/approvals/upgrades, immutable dependencies, complete membership,
both-token activation, canonical programs, final debit, quote/reserve separation, pending
reservations, allowance floors, input payment routes, both settlement orders, taker
callbacks, disabled maker hooks, Simulator rollback and router-only asset rescue.

Accepted limits: honest standard tokens, authenticated dependency deployments,
same-transaction conservative rejection, input-ledger saturation, and maker pause ending
the commitment. Remaining test breadth includes mixed-direction/deeper nesting,
successful nesting after outer output settlement, combined finite allowance/payment routes,
explicit zero-output rollback and universal callback/token gas bounds. These are coverage
limits rather than newly demonstrated defects. No production contract was changed.
