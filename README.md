<p align="center">
  <img src="./AquaQoS.svg" alt="AquaQoS" width="220" />
</p>

# AquaQoS

Protected-capacity scheduling for shared maker inventory on 1inch Aqua and SwapVM.

[![CI](https://github.com/akm2006/AquaQoS/actions/workflows/ci.yml/badge.svg)](https://github.com/akm2006/AquaQoS/actions/workflows/ci.yml)
[Documentation](docs/README.md) · [Sepolia proof](docs/SEPOLIA_DEPLOYMENT.md) ·
[Benchmark results](docs/BENCHMARK_RESULTS.md) · [Security model](docs/THREAT_MODEL.md)

## The problem

Aqua keeps virtual balances independently accounted for each maker, app, strategy, and
token, while the maker's real ERC-20 inventory remains shared. Multiple strategies can
therefore quote against independent virtual balances and still compete for the same final
token transfer.

AquaQoS adds a `CAPACITY_GUARD` SwapVM instruction and a restricted maker vault. The guard
checks the final output debit against real transferable inventory and every registered
strategy's remaining configured entitlement. Official SwapVM pricing and Aqua accounting and
settlement remain load-bearing.

## Verified prototype

| Claim | Direct evidence |
| --- | --- |
| Shared-inventory settlement failure reproduced | [Problem reproduction](docs/PROBLEM_REPRODUCTION.md) and Solidity regression tests |
| Custom SwapVM opcode `0x05` executes before settlement | [`AquaQoSRouter.sol`](contracts/AquaQoSRouter.sol), [specification](docs/CAPACITY_GUARD_SPEC.md), and contract tests |
| Real balance and allowance protect sibling capacity | [`AquaQoSVault.sol`](contracts/AquaQoSVault.sol), model checks, and transaction replay |
| Public token-transfer demonstration | [22 Sepolia transactions and exact-match source verification](docs/SEPOLIA_DEPLOYMENT.md) |
| Official deployed Aqua exercised with real token contracts | [Authenticated local-fork DAI/WETH proof](docs/FORK_PROOF.md) |
| Comparative trade-offs measured | [A/B/C/C100 methodology](docs/BENCHMARK_METHODOLOGY.md) and [results](docs/BENCHMARK_RESULTS.md) |
| Security assumptions and residual risk documented | [Threat model](docs/THREAT_MODEL.md) and [release verification](docs/RELEASE_VERIFICATION.md) |

Current retained checks include 30 Solidity tests, three 256-run fuzz properties, a
327,168-case bounded capacity model, a 239-transaction replay, 72 comparative benchmark
fixtures, and public Sepolia receipt revalidation. These are scoped engineering results,
not an external audit or production certification.

## Supported scope

The v0 policy supports one immutable standard-ERC-20 pair, at most eight registered,
fee-free canonical XYC strategies, and a non-upgradeable restricted maker vault. It protects
configured capacity; it does not promise future fills, price quality, profitability, legal
solvency, hostile-token support, or universal gas bounds.

Reservations last until transaction end, so a later otherwise-safe fill in the same
transaction can be rejected conservatively. Extreme upstream input-ledger values can also
quote and then revert atomically during settlement. The complete boundaries are in the
[CAPACITY_GUARD specification](docs/CAPACITY_GUARD_SPEC.md).

## Reproduce locally

Requirements: Node.js 22.16.0 or newer within Hardhat's supported Node 22 range, and
pnpm 11.10.0.

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm test
node scripts/check-capacity-model.mjs
pnpm check:benchmark
node scripts/check-rejections.mjs --self-test
node scripts/check-release-evidence.mjs --self-test
pnpm check:bootstrap
```

Exact upstream identities are pinned in [`sources.lock.json`](sources.lock.json). Raw
machine-readable benchmark and deployment evidence is retained under `benchmarks/raw/` and
`deployments/`.

## Capacity workspace

The Next.js application replays recorded policy comparisons and runs the same contracts on a
fresh isolated local EVM. It displays checked balances, capacity, receipts, errors, and ERC-20
`Transfer` logs; local/mock results remain visibly separate from public Sepolia evidence.

```sh
pnpm --dir web install --frozen-lockfile --ignore-scripts
pnpm proof:serve
```

Open `http://127.0.0.1:4173/`. For the receipt-producing local execution flow:

```sh
pnpm --dir web build
node scripts/serve-live.mjs
```

Open `http://127.0.0.1:4174/live/`. This local runner uses test accounts and mock tokens and
must not be exposed as a public transaction service.

## Repository map

- `contracts/`, `test/`: protocol implementation and adversarial Solidity tests.
- `scripts/`: deterministic model, evidence, deployment, and release checks.
- `benchmarks/`, `deployments/`: raw reproducible measurements, receipts, and traces.
- `web/`: Next.js application and browser regression scripts.
- [`docs/`](docs/README.md): protocol, security, benchmark, product, and provenance index.
- `LICENSES/`: retained upstream and dependency license texts and notices.

See [LICENSE.md](LICENSE.md), [SECURITY.md](SECURITY.md), and
[third-party provenance](docs/THIRD_PARTY.md) before reuse or deployment.

The project began during ETHOnline 2026. Event requirements, sanitized prompts, and AI/work
provenance are retained in the [event archive](docs/archive/ethonline-2026/) without defining
the protocol's public product narrative.

Powered by Aqua — © Degensoft Ltd 2025.

Powered by SwapVM — © Degensoft Ltd 2025.
