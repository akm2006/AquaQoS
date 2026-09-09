# AquaQoS

AquaQoS is an experimental capacity scheduler for makers running multiple strategies on
1inch Aqua. It protects configured capacity for registered strategies while allowing
controlled burst access to shared maker inventory.

## Why it exists

Aqua keeps virtual balances independently accounted for each maker, app, strategy and
token, while the maker's real ERC-20 inventory remains shared. Independent strategies can
therefore appear funded at the virtual layer and still compete for the same final token
transfer. AquaQoS tests an execution-enforced policy for that boundary.

The v0 implementation adds a `CAPACITY_GUARD` SwapVM instruction and a restricted maker
vault. The guard checks the configured capacity before canonical Aqua settlement, records
transaction-scoped reservations, and leaves the official Aqua accounting and settlement
path load-bearing.

## Current state

This is a local Solidity prototype with reproducible transaction receipts, state checks,
benchmarks and a dependency-free verification page. The supported domain is deliberately
small: one immutable token pair, up to eight fee-free XYC strategies, standard ERC-20
behavior and pinned Aqua/SwapVM code. It does not claim general solvency, profitability,
hostile-token coverage or an external audit.

## Reproduce it

Exact source identities are in [sources.lock.json](sources.lock.json) and the dependency
lockfile. With Node 22.16.0 and pnpm 11.10.0:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm test
node scripts/check-capacity-model.mjs
node scripts/check-bootstrap.mjs
```

The [guard specification](docs/CAPACITY_GUARD_SPEC.md) defines the supported domain and
invariants. Reservations last until transaction end, which can reject otherwise safe
sequential fills in the same transaction. Run `pnpm proof:serve` and open
`http://127.0.0.1:4173/proof/`; the [recorded transaction replay](proof/demo.html) lets
you step through receipts, balance changes and ERC-20 transfer logs. It reports only
committed evidence; no public deployment or wallet connection is implied.

## Repository map

- `contracts/`, `test/`: protocol implementation and Solidity tests.
- `scripts/`, `benchmarks/`, `benchmarks/raw/`: reproducible checks and retained evidence.
- `proof/`: dependency-free local verification page.
- `docs/`: protocol, benchmark, security, requirements and release documentation.
- `docs/AI_PROVENANCE.md`, `docs/prompts/`: AI attribution and sanitized planning evidence
  retained for ETHOnline transparency; they are not runtime dependencies.
- `.agents/`, `.codex/`: optional project-local Codex skills and read-only reviewer roles;
  they do not affect `pnpm build` or `pnpm test`.

The public technical path is this README, `docs/STATUS.md`, the verification page and the
reproduction/benchmark commands above. Maintainer and AI-process material is retained in
the documentation tree so it remains auditable without obscuring the protocol path.

See [AI provenance](docs/AI_PROVENANCE.md) and
[third-party notices](docs/THIRD_PARTY.md) for development and licensing records.

The project was started during ETHOnline 2026. Event requirements and submission records
are archived under [docs/archive/ethonline-2026/](docs/archive/ethonline-2026/) and do not
define the protocol itself.

Powered by Aqua — © Degensoft Ltd 2025.
Powered by SwapVM — © Degensoft Ltd 2025.
