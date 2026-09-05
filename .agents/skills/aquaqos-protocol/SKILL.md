---
name: aquaqos-protocol
description: Design or modify AquaQoS Solidity, CAPACITY_GUARD, SwapVM extensions, shared inventory, settlement, strategy lifecycle or Registry/Vault boundaries.
---

Read repository `docs/PROTOCOL_BASELINE.md`, `docs/DECISIONS.md`, relevant acceptance gates
and `sources.lock.json` before selecting an interface. Resolve current primary 1inch docs
through Context7 and inspect the pinned implementation; record drift before upgrading.

Trace the real flow into Aqua pull/push and every caller of modified behavior. Write the
invariant with token units, guarantee consumption/replenishment and explicit trust boundary.
Virtual balance is a strategy ceiling, not escrow; actual transferable inventory also
depends on allowance and token behavior. A Registry does not control external wallet spend.

Compare native Extruction and dispatcher extension. Verify guard placement relative to
wrapping instructions, final fees and subsequent hooks/callbacks; per-order locks do not
serialize sibling strategies. Prove all claimed protected paths enforce policy.
Use identical same-state quote/swap logic; static quote must not write state. Never promise
future fill success from a quote. Bound registration and gas growth.

Implement only after the reproduction/specification gates. Include regression, adversarial,
boundary and useful property tests alongside code. Require independent read-only security
review for contract changes, resolve findings, update decisions/status and commit the milestone.
