# AquaQoS

An ETHOnline 2026 research/build project investigating protected capacity and burst access
for strategies sharing maker inventory through 1inch Aqua and SwapVM.

Current state: a local Solidity prototype. Tests reproduce shared-inventory settlement
failure and exercise a custom SwapVM capacity guard with a restricted maker vault.
Benchmark, application and deployment work remain open. See the status file for
current test results and unresolved acceptance gates.

Resume with [AGENTS.md](AGENTS.md) and [project status](docs/STATUS.md).
See [charter](docs/PROJECT_CHARTER.md), [protocol findings](docs/PROTOCOL_BASELINE.md),
[execution plan](docs/EXECUTION_PLAN.md), [acceptance gates](docs/ACCEPTANCE_CRITERIA.md)
and [verified event requirements](docs/HACKATHON_REQUIREMENTS.md).

Exact source identities are in [sources.lock.json](sources.lock.json) and the dependency
lockfile. With Node 22.16.0 and pnpm 11.10.0:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm test
node scripts/check-capacity-model.mjs
node scripts/check-bootstrap.mjs
```

Commands have run in the working tree; fresh-checkout rehearsal remains open.
The [guard specification](docs/CAPACITY_GUARD_SPEC.md) defines the supported domain:
one immutable pair, up to eight fee-free XYC strategies, standard tokens, and
authenticated pinned Aqua/router code. Reservations last until transaction end,
which can reject otherwise safe sequential fills in the same transaction.

The local judge-facing proof page is served with `pnpm proof:serve` and opens at
`http://127.0.0.1:4173/proof/`. It reports only committed evidence; no public deployment
or wallet connection is implied.

The original winning package is preserved as planning provenance, not a specification.
See [AI provenance](docs/AI_PROVENANCE.md) and [third-party notices](docs/THIRD_PARTY.md).

Powered by Aqua — © Degensoft Ltd 2025.
Powered by SwapVM — © Degensoft Ltd 2025.
