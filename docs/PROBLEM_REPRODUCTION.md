# Aqua shared-inventory reproduction

This is the first executable AquaQoS protocol milestone. It uses the pinned
official Aqua/SwapVM sources and no custom guard.

Run:

```text
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm test
```

`test/SharedInventoryReproduction.t.sol` creates two distinct Aqua strategies
with the same maker, token pair, and XYC program. Each strategy is shipped with
virtual balances `(1000, 1000)`, while the maker has only `1000` units of the
output token. The first exact-output fill requests `600` output and succeeds,
changing only that strategy's virtual balances to `(2500, 400)` and the maker's
real output balance to `400`. The sibling still quotes `500` output for `1000`
input from virtual balances `(1000, 1000)`, but settlement reverts because the
maker cannot transfer `500` output.

The test uses taker-first ordering and verifies that the failed input transfer,
Aqua push, and virtual balances all roll back atomically. The official
SafeERC20 implementation masks the underlying ERC-20 failure as
`SafeTransferFromFailed()`. Separate tests therefore prove the preconditions
through balances and allowances, then repair only the missing inventory or only
the insufficient Aqua allowance before replaying the same fill successfully.

Observed on 2026-09-06: Hardhat Solidity tests, 3 passing; build succeeds with
the expected upstream transient-storage and test initcode-size warnings.

Rollback assertions snapshot real balances and Aqua/router allowances for maker,
taker, router and Aqua, plus both virtual token balances. Both sibling ledgers
are checked around the failed competing fill. Quotes use the static view interface.
A fresh checkout replay and retained execution trace are still required.
