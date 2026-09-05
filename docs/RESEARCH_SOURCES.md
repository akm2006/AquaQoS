# Primary-source register

All entries checked **2026-09-05**. Moving pages have no published commit identifier;
recheck before relying on changed behavior. Exact candidates are in [source lock](../sources.lock.json).
This file records inspected evidence, not compatibility or test certification.

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
compatibility tests remain phase 1 work, not accomplished bootstrap work.

Both pinned papers were downloaded to ignored `.research/`, hashed and text-extracted with
pypdf for conceptual research. No layout review or paper-figure reproduction was needed.
The public Aqua website PDF is an older Developer Preview; prefer the pinned repository PDF.

Prior-art search: official docs already include an inventory-coverage health check and
double-commitment reproduction. Inspected current AquaOpcode dispatch and Extruction;
no sibling entitlement scheduler found in those paths. Web queries for Aqua guaranteed
liquidity and SwapVM capacity guard did not establish originality. Search official
issues/PRs, SDK/starter variants and recent ETHGlobal showcase projects before novelty claims.
The initial limited search is not proof that no equivalent project exists.
