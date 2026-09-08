# Primary-source register

Bootstrap entries checked **2026-09-05**; pinned contract source was reinspected
on **2026-09-06** for reproduction and guard design. Event pages were not all
rechecked on September 6. Moving pages have no published commit identifier;
recheck before relying on changed behavior. Exact candidates are in [source lock](../sources.lock.json).
This file records inspected evidence and links the phase-1 executable reproduction;
it is not a claim that the proposed guard is correct.

| ID | Source / immutable reference | Supports / limits |
| --- | --- | --- |
| E1 | [1inch prizes](https://ethglobal.com/events/ethonline2026/prizes/1inch) | Track/prizes, official contracts, modified VM, transfers/forks, history |
| E2 | [Event details](https://ethglobal.com/events/ethonline2026/info/details) | Deadline, Classic rules, AI attribution, video, judging, submission |
| E3 | [Start guide](https://ethglobal.com/events/ethonline2026/info/start) | Participation/staking, team/dashboard process; private state unverified |
| E4 | [Global rules](https://ethglobal.com/rules) | Pre-existing work disclosure and general conduct |
| A1 | [Aqua main](https://github.com/1inch/aqua/tree/9c5c42e5840e8741fba3597c48456c9510212b66) | Current main, README, package and source inspected |
| A2 | [Aqua v1.0.0 source](https://github.com/1inch/aqua/blob/81c26e4619ce21556ab02b3284ee2685de21fb18/src/Aqua.sol) | SwapVM dependency; raw/safe balances, ship/dock/pull/push; core matches inspected main |
| A3 | [Official inventory and resolver docs](https://business.1inch.com/portal/documentation/aqua/liquidity-layer/access-resolvers-and-pathfinder) | Explicit independent accounting/double commitment; conservative coverage and reproduction already documented; deployed-v1.0.1 examples are not current-main ABI |
| A4 | [Aqua whitepaper](https://github.com/1inch/aqua/blob/9c5c42e5840e8741fba3597c48456c9510212b66/docs/whitepaper-aqua-1.0.pdf) | Release 1.0, section 3: accounting, inventory-shortage reverts, virtual quoting; no guarantee of economic performance |
| V1 | [SwapVM main](https://github.com/1inch/swap-vm/tree/f09a41e689240adc645934f965c8061749397cd2) | Package, compiler config, VM, opcode table/router, settlement source inspected |
| V2 | [SwapVM whitepaper](https://github.com/1inch/swap-vm/blob/f09a41e689240adc645934f965c8061749397cd2/docs/whitepaper-swap-vm-1.0.pdf) | Sections 3–5: context, wrapping, quote consistency, extensions; register/opcode examples drift from current source |
| V3 | [Sponsor-linked paper branch](https://github.com/1inch/swap-vm/blob/ac06e1bac021cd1983dc7c44d1f69b4b8861a945/docs/whitepaper-swap-vm-1.0.pdf) | release/1.1 resolved; paper downloaded/read from V2, not assumed byte-identical to V3 |
| T1 | [Official template](https://github.com/1inch/swap-vm-template/tree/e9f8def43c7e8fbe5d8453df2e0a83e2be17c38b) | README, package, Hardhat config; older pins and rsync step make wholesale scaffold undesirable |
| S1 | [Aqua SDK](https://github.com/1inch/sdks/tree/cf377ec45b32fb5b5d141b9407f4635b9895f89d/typescript/aqua) | Package 0.3.1, viem dependency; AquaProtocolContract source encodes ship/dock and hashes strategy bytes; README/source comments contain older example links |
| H1 | [Hardhat Node support](https://hardhat.org/docs/reference/nodejs-support) | Node >=22.13.0; installed 22.16.0 satisfies documented floor |
| H2 | [Hardhat Solidity tests](https://hardhat.org/docs/reference/foundry-compatibility) | Foundry-style Solidity tests; local 3.8.0 execution still pending |
| C1 | [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) | Standalone project TOML, required name/description/instructions; inherited models, read-only mode |
| C2 | [Codex source via Context7](https://github.com/openai/codex/blob/main/codex-rs/ext/skills/src/host_roots.rs) | `.agents/skills` discovery; installed prompt loader validation supplements moving-source docs |
| P1 | [Official Aqua workflows](https://github.com/1inch/1inch-ai/tree/e60a741a50c7f0b61881c7551b8caaf48a7e0b68/skills/1inch-aqua) | Existing maker/taker workflow tooling; no reason to install another integration/MCP now |

## Resolution notes

GitHub API default-branch commits and tags were fetched directly. Aqua main package says
0.1.0 while SwapVM requests Aqua tag v1.0.0; package labels are not interchangeable with
repository release tags. SwapVM main package says 0.0.6 while latest observed tag is v1.0.2.
Do not pick packages by semver labels alone. SDK npm 0.3.1 existence/integrity confirmed;
published bytes have not yet been compared to source. Dependency install/lockfile and ABI
compatibility is locally validated by `pnpm build` and `pnpm test`; the allowance-specific
reproduction and custom guard remain open.

Both pinned papers were downloaded to ignored `.research/`, hashed and text-extracted with
pypdf for conceptual research. No layout review or paper-figure reproduction was needed.
The public Aqua website PDF is an older Developer Preview; prefer the pinned repository PDF.

Prior-art search: official docs already include an inventory-coverage health check and
double-commitment reproduction. Inspected current AquaOpcode dispatch and Extruction;
no sibling entitlement scheduler found in those paths. Web queries for Aqua guaranteed
liquidity and SwapVM capacity guard did not establish originality. Search official
issues/PRs, SDK/starter variants and recent ETHGlobal showcase projects before novelty claims.
The initial limited search is not proof that no equivalent project exists.

## 2026-09-06 implementation verification

Rechecked the official 1inch prize page linked above: modified SwapVM and local-fork
transfers remain permitted; no qualification claim is inferred from local unit tests.
Inspected installed pinned Aqua `src/Aqua.sol` ship/dock/pull/push and SwapVM
`src/SwapVM.sol`, `src/routers/AquaSwapVMRouter.sol`, `src/libs/VM.sol`,
`src/libs/ProtocolFee.sol`, `src/instructions/Controls.sol` and `XYCSwap.sol`.
Refs and SHAs remain the A1/S1 identities above and sources.lock.json.
Supported claims: canonical wrapper dispatch through virtual _runOpcode; quote's
static context; fee-free final amountOut debit; independent virtual markers;
permissionless push; per-order lock plus callback timing. Native Simulator always
reverts delegated effects; inherited rescue can transfer router-held balances only.
Context7 `/1inch/aqua` documentation described docking as withdrawal; pinned source
sets virtual state/markers and makes no real-token transfer. Source takes precedence.

2026-09-06 replay tooling: Context7 `/websites/hardhat` and installed Hardhat 3.8.0
`dist/src/types/network.d.ts` confirm network.create (connect deprecated),
provider.request, artifact/build-info APIs and npmFilesToBuild. Context7
`/websites/ethers_v6` [ABI reference](https://docs.ethers.org/v6/api/abi/) supports
Interface encoding/decoding; pinned ethers 6.13.4 was already installed transitively
and is now a direct dependency. No new Hardhat plugin is needed. Pinned TakerTraits.sol
build packs ten uint16 indexes and uint16 flags; script encodes only its empty-slice
exact-output recipe. Compiled XYC source validates independent ceil input arithmetic.

## 2026-09-08 pinned fee/callback verification

Checked installed source at SwapVM `f09a41e689240adc645934f965c8061749397cd2`
(S1; no latest-main or new-release claim):

- [SwapVM settlement](https://github.com/1inch/swap-vm/blob/f09a41e689240adc645934f965c8061749397cd2/src/SwapVM.sol):
  fee initialization, two transfer orders, maker hooks, taker callbacks, native/unwrap
  conditions and original-input virtual-balance validation after callback push.
- [Protocol fee resolution](https://github.com/1inch/swap-vm/blob/f09a41e689240adc645934f965c8061749397cd2/src/libs/ProtocolFee.sol):
  empty fee metadata exits before transfers; output fees otherwise add Aqua pulls.
- [Maker traits](https://github.com/1inch/swap-vm/blob/f09a41e689240adc645934f965c8061749397cd2/src/libs/MakerTraits.sol)
  and [taker traits](https://github.com/1inch/swap-vm/blob/f09a41e689240adc645934f965c8061749397cd2/src/libs/TakerTraits.sol):
  hook enablement, receiver, callback and payment flags used in the new tests.
- [XYC](https://github.com/1inch/swap-vm/blob/f09a41e689240adc645934f965c8061749397cd2/src/instructions/XYCSwap.sol)
  and [controls](https://github.com/1inch/swap-vm/blob/f09a41e689240adc645934f965c8061749397cd2/src/instructions/Controls.sol):
  canonical inner instructions do not populate fees or make external calls.

The path matrix and new real-transfer tests are recorded in SECURITY_REVIEW_V0.
This is pinned implementation verification, not a change to protocol dependencies.
