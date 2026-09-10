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
benchmarks and a Next.js capacity workspace. The supported domain is deliberately
small: one immutable token pair, up to eight fee-free XYC strategies, standard ERC-20
behavior and pinned Aqua/SwapVM code. It does not claim general solvency, profitability,
hostile-token coverage or an external audit.

The [local-fork proof](docs/FORK_PROOF.md) also exercises the authenticated Ethereum
Aqua deployment with DAI/WETH, retaining deployment code, receipts and execution traces.
These transactions run on a local copy of Ethereum, not a public testnet. See
[release verification](docs/RELEASE_VERIFICATION.md) for passing checks and the remaining
additional independent-review gate.

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
sequential fills in the same transaction.

## Capacity workspace

The [Next.js app](web/) compares raw or conservative Aqua with two AquaQoS protection
policies. Explore 2/4/8 strategies, replay synchronized transactions, inspect protected
capacity and open real balance changes and receipt logs. `/live/` runs the same protocol
against a fresh isolated local EVM with actual receipts, maker controls and token transfers.

```sh
pnpm --dir web install --frozen-lockfile --ignore-scripts
pnpm proof:serve
```

Open `http://127.0.0.1:4173/`; `/proof/` contains the protocol evidence. For the live local
workspace, build the static app and serve it with the protocol runner:

```sh
pnpm --dir web build
node scripts/serve-live.mjs
```

Open `http://127.0.0.1:4174/live/`. It uses test accounts and mock tokens only; no wallet,
testnet or public deployment is implied. Run `node scripts/check-live.mjs` for the API
self-check and `playwright-cli -s=aqua-live run-code --filename=web/scripts/check-live-browser.js`
for the browser flow. `pnpm --dir web build` also validates the evidence and produces the
static Next.js build.
The frontend has its own lockfile; the protocol pins and benchmark hashes are unchanged.

## Repository map

- `contracts/`, `test/`: protocol implementation and Solidity tests.
- `scripts/`, `benchmarks/`, `benchmarks/raw/`: reproducible checks and retained evidence.
- `deployments/`: local/fork runtime identities, receipts, source authentication and traces.
- `web/`: Next.js App Router workspace, evidence page and browser regression checks.
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
