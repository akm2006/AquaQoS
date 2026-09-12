<div align="center">
  <img src="docs/assets/banner.svg" alt="AquaQoS — Shared liquidity, scheduled." width="880">
</div>

<p align="center">
  <b>Protected-capacity scheduling for shared maker inventory on 1inch Aqua and SwapVM.</b>
</p>

<p align="center">
  <img alt="Solidity 0.8.30" src="https://img.shields.io/badge/Solidity-0.8.30-070707?style=flat-square&labelColor=F1EFE9&color=070707">
  <img alt="Node 22.16" src="https://img.shields.io/badge/Node-22.16-070707?style=flat-square&labelColor=F1EFE9&color=070707">
  <a href="docs/SEPOLIA_DEPLOYMENT.md"><img alt="Sepolia: 22 verified transactions" src="https://img.shields.io/badge/Sepolia-22_verified_transactions-31D7FD?style=flat-square&labelColor=F1EFE9"></a>
  <a href="LICENSES/"><img alt="License: source-available, mixed" src="https://img.shields.io/badge/License-source--available-5C5C5C?style=flat-square&labelColor=F1EFE9"></a>
</p>

<p align="center">
  <a href="docs/CAPACITY_GUARD_SPEC.md">Guard specification</a> &nbsp;·&nbsp;
  <a href="docs/SEPOLIA_DEPLOYMENT.md">Sepolia proof</a> &nbsp;·&nbsp;
  <a href="docs/BENCHMARK_RESULTS.md">Benchmarks</a> &nbsp;·&nbsp;
  <a href="docs/SECURITY_REVIEW_RELEASE.md">Security review</a> &nbsp;·&nbsp;
  <a href="docs/STATUS.md">Status</a>
</p>

---

## The problem

Aqua accounts virtual balances independently for each maker, app, strategy, and token. The
maker's real ERC-20 inventory stays shared.

Independent strategies can therefore each look funded at the virtual layer and still compete
for the same final token transfer. The second fill does not get a worse price — it fails, after
the quote was already given.

That failure is reproduced from source in the [problem reproduction](docs/PROBLEM_REPRODUCTION.md)
and held in place by Solidity tests.

## The mechanism

AquaQoS adds a `CAPACITY_GUARD` SwapVM instruction (opcode `0x05`) and a restricted maker
vault. The guard checks configured capacity before canonical Aqua settlement, records
transaction-scoped reservations, and leaves the official Aqua accounting and settlement path
load-bearing. AquaQoS decides admission — nothing else.

<div align="center">
  <img src="docs/assets/capacity-guard.svg" alt="Three independent Aqua strategies feed one CAPACITY_GUARD block, which schedules each fill as guaranteed, burst or rejected against one shared vault inventory." width="880">
</div>

- **Guaranteed** — no sibling fill is admitted that would leave a registered strategy's
  configured entitlement uncovered.
- **Burstable** — inventory above the sum of entitlements stays available to whoever needs it.
- **Decided before transfer** — an unservable fill reverts with `InsufficientCapacity` ahead of
  settlement, leaving tracked state and logs unchanged.

The strong form of that first property depends on the restricted vault: a normal wallet can
spend or approve inventory outside Aqua, so a registry alone cannot enforce the boundary. The
[guard specification](docs/CAPACITY_GUARD_SPEC.md) defines the supported domain, the admission
invariant, and the boundary conditions.

## Current state

A Solidity prototype with reproducible transaction receipts, state checks, benchmarks, a public
Sepolia proof, and a Next.js capacity workspace.

| Claim | Direct evidence |
| --- | --- |
| Shared-inventory settlement failure reproduced | [Problem reproduction](docs/PROBLEM_REPRODUCTION.md) and Solidity tests |
| Custom SwapVM opcode `0x05` executes before settlement | [`AquaQoSRouter.sol`](contracts/AquaQoSRouter.sol), [specification](docs/CAPACITY_GUARD_SPEC.md), and contract tests |
| Real balance and allowance protect sibling capacity | [`AquaQoSVault.sol`](contracts/AquaQoSVault.sol), model checks, and [rejection replay](docs/REJECTION_REPLAY.md) |
| Public token-transfer demonstration | [22 Sepolia transactions with exact-match source verification](docs/SEPOLIA_DEPLOYMENT.md) |
| Official deployed Aqua exercised with real token contracts | [Authenticated Ethereum-fork DAI/WETH proof](docs/FORK_PROOF.md) |
| Comparative trade-offs measured | [A/B/C/C100 methodology](docs/BENCHMARK_METHODOLOGY.md) and [results](docs/BENCHMARK_RESULTS.md) |
| Security assumptions and residual risk documented | [Release review](docs/SECURITY_REVIEW_RELEASE.md) and [release verification](docs/RELEASE_VERIFICATION.md) |

The retained checks behind those claims:

| Check | Scale |
| --- | ---: |
| Solidity tests | 30 |
| Fuzz properties | 3 × 256 runs |
| Bounded capacity-model cases | 327,168 |
| Replayed transactions | 239 |
| Comparative benchmark fixtures | 72 |
| Public Sepolia transactions | 22 |

These are scoped engineering results, not an external audit or production certification.

## The measured cost

The guard reads sibling state on every fill, and that is not free. At eight strategies, the
median measured gas was:

| Path (8 strategies, median) | Unguarded | Guarded |
| --- | ---: | ---: |
| Low-contention successful swap | 113,715 | 210,099 |
| Unservable overload fill | 126,779 <sub>fails at settlement</sub> | 146,465–147,137 <sub>guard rejection</sub> |

Low contention is a neutral volume case where the guard only adds gas — about 84.8% overhead.
Rejecting earlier is not the same as rejecting cheaply. Higher fill volume at smaller configured
guarantees is also not an equal-protection efficiency claim; at equal initial protected
allocation, the guarded policy matches raw Aqua's overload fill volume. Guard rejections are
counted separately from settlement failures throughout, and all attempted demand is reported.
Full methodology and every fixture are in the [benchmark results](docs/BENCHMARK_RESULTS.md).

## Supported scope

**v0 supports**

- one immutable token pair with standard ERC-20 behavior;
- up to eight fee-free canonical XYC strategies;
- pinned Aqua/SwapVM code and a non-upgradeable restricted maker vault.

**v0 does not claim**

- general solvency, profitability, or price quality;
- hostile-token coverage — fee-on-transfer, rebasing, and callback-bearing tokens are outside
  the supported domain;
- universal gas bounds;
- an external audit.

**Known conservative behaviour**

- Reservations last until transaction end, which can reject otherwise safe sequential fills in
  the same transaction.
- Extreme upstream input-ledger values can quote and then revert atomically during settlement.

## Reproduce it

Exact source identities are pinned in [sources.lock.json](sources.lock.json) and the dependency
lockfile. With Node 22.16.0 and pnpm 11.10.0:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm test
```

Then the full evidence sweep — each command re-derives its own claim rather than trusting a
committed report:

```sh
node scripts/check-capacity-model.mjs             # 327,168 bounded settlement cases
pnpm check:benchmark                              # recomputes the 72 comparative fixtures
node scripts/check-rejections.mjs --self-test     # rejection replay against the unguarded router
node scripts/check-release-evidence.mjs --self-test
pnpm check:bootstrap                              # source pins, local links, skill files
```

`pnpm check:sepolia` additionally re-queries Sepolia and Sourcify, so it needs network access.
Raw machine-readable evidence is retained under `benchmarks/raw/` and `deployments/`.

## Capacity workspace

The [Next.js app](web/) compares raw or conservative Aqua with two AquaQoS protection policies.
Explore 2/4/8 strategies, replay synchronized transactions, inspect protected capacity, and open
real balance changes and receipt logs.

| Public deployment | Local verification |
| --- | --- |
| Landing, recorded workspace, public Sepolia proof, documentation and evidence downloads | Fresh isolated EVM, executable maker controls and newly generated local receipts |

The public site does not simulate a live chain in the browser. Its `/live/` page links to public
proof and explains how to start the genuine local execution lab.

```sh
pnpm --dir web install --frozen-lockfile --ignore-scripts
```

| Surface | Command | Open |
| --- | --- | --- |
| Recorded comparison, `/proof/` and `/docs/` | `pnpm proof:serve` | `http://127.0.0.1:4173/` |
| Live local session | `pnpm --dir web build` then `node scripts/serve-live.mjs` | `http://127.0.0.1:4174/live/` |

`/live/` runs the same protocol against a fresh isolated local EVM with actual receipts, maker
controls, and token transfers. It uses test accounts and mock tokens only; no wallet, testnet,
or public deployment is implied.

`pnpm --dir web build` also validates the evidence and produces the static Next.js build. Run
`node scripts/check-live.mjs` for the API self-check, and
`playwright-cli -s=aqua-live run-code --filename=web/scripts/check-live-browser.js` for the
browser flow. The frontend has its own lockfile; the protocol pins and benchmark hashes are
unchanged.

For Vercel, import the repository root. The committed `vercel.json` installs both frozen
dependency sets, performs portable transaction and metric validation, and publishes `web/out`.
Full historical source authentication remains enforced by CI and normal local builds because
Vercel checks out only recent Git history.

## Repository map

| Path | Contents |
| --- | --- |
| `contracts/`, `test/` | Protocol implementation and Solidity tests |
| `scripts/` | Reproducible model, evidence, deployment, and release checks |
| `benchmarks/`, `benchmarks/raw/` | Comparative measurements and retained raw reports |
| `deployments/` | Local, fork, and Sepolia runtime identities, receipts, and source authentication |
| `web/` | Next.js App Router workspace, evidence page, and Fumadocs documentation (`web/content/docs/`) |
| `docs/` | Protocol, benchmark, security, requirements, and release documentation |
| [`docs/archive/ethonline-2026/AI_PROVENANCE.md`](docs/archive/ethonline-2026/AI_PROVENANCE.md), `docs/archive/ethonline-2026/prompts/` | AI attribution and sanitized planning evidence, retained for ETHOnline transparency; not runtime dependencies |
| `.agents/`, `.codex/` | Optional project-local Codex skills and read-only reviewer roles; they do not affect `pnpm build` or `pnpm test` |
| `LICENSES/` | Retained upstream and dependency license texts and notices |

The public technical path is this README, [`docs/STATUS.md`](docs/STATUS.md), the verification
page, and the reproduction and benchmark commands above. Maintainer and AI-process material is
retained in the documentation tree so it stays auditable without obscuring the protocol path.

## Licensing and provenance

This repository is source-available under mixed licenses — no single license applies to every
file, and it is not OSI-licensed as a whole. Read the retained texts in [`LICENSES/`](LICENSES/)
and the [third-party notices](docs/THIRD_PARTY.md) before reuse or deployment.

The project was started during ETHOnline 2026. Event requirements and submission records are
archived under [docs/archive/ethonline-2026/](docs/archive/ethonline-2026/) and do not define
the protocol itself.

---

<p align="center">
  <b>Powered by Aqua — © Degensoft Ltd 2025.</b><br>
  <b>Powered by SwapVM — © Degensoft Ltd 2025.</b>
</p>
