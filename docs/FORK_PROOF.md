# Reproducible local-fork proof

This proof runs AquaQoS against Ethereum state copied into an in-process Hardhat EVM.
All deployments, funding and swaps are local. There is no public testnet deployment,
spending on Ethereum or public explorer transaction link for these receipts.

## Authentication and source difference

The official pinned [Aqua README](https://github.com/1inch/aqua/blob/81c26e4619ce21556ab02b3284ee2685de21fb18/README.md)
lists `0x499943e74fb0ce105688beee8ef2abec5d936d31` for Ethereum. At block
**25,948,160** (`0x18bf000`), its runtime is 6,251 bytes with keccak256
`0xced66b74e01f418c698e6aca8560d33957fb2588ea120eadbde74960f138baa2`.
The block hash and token addresses are in the [fork pin](../deployments/ethereum-fork/pin.json).
This historical block is not represented as the current head or the date of our work.

The address hosts **AquaRouter**, an older official Aqua core plus self-multicall and
reverting simulation helpers. It is not the exact `Aqua` build in our unit tests.
The [retained compiler input](../deployments/ethereum-fork/upstream-aqua.json) comes from
[Blockscout verified source](https://eth.blockscout.com/address/0x499943e74fb0ce105688beee8ef2abec5d936d31?tab=contract).
Recompilation with original Solidity 0.8.30, viaIR, optimizer disabled and Prague
settings exactly matches the onchain runtime, including metadata. Compiler input is
SHA-256 pinned. Original source/license notices remain in that JSON.

The core uses the same maker/app/hash/token layout, pull/push transfer ordering,
uint248 accounting and lifecycle interfaces exercised by this demo. Deployed errors
are declared in the implementation rather than interface; the rejected 255-token ship
case reports a maximum argument of 255 rather than 254. Library documentation differs.
The wrapper's multicall/simulation paths add surface; the demo invokes core entrypoints
directly and is not a full audit of the historical wrapper. Keep both source versions explicit.

## Run

From a clean checkout, with Node >=22.13 and the pinned pnpm version:

```powershell
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm exec hardhat run scripts/check-release.mjs
node scripts/verify-fork-upstream.mjs
$env:AQUAQOS_FORK = '1'
pnpm exec hardhat run scripts/check-release.mjs
Remove-Item Env:AQUAQOS_FORK
node scripts/check-release-evidence.mjs --self-test
```

The fork defaults to a public read-only Ethereum RPC. An archive-capable URL may be
supplied through `AQUAQOS_FORK_RPC`; never put credentials in Git or reports.
Publicnode rejected tested historical state reads without a personal token; dRPC
served the pinned block. Availability is external. The runner never forwards writes
to that URL. It creates local chain ID 31337 and records upstream identity separately.

`--capture` on the upstream script is a maintainer pin-creation operation, not normal
replay. Changing block/source/runtime pins requires a decision and new verification.
The existing Hardhat compiler adapter is reused; its internal import is specific to 3.8.0.

## What the sequence proves

Each group starts with one token of each asset, two strategies advertising one token
each, and identical first demand. One scenario unit is 10^15 raw units. This synthetic
capacity workload does not assert DAI/WETH fair value or real-market performance.

| Sequence | Raw Aqua | AquaQoS with 0.5-token guarantees |
| --- | --- | --- |
| Strategy 0 requests 0.6 output | Fills; leaves 0.4 real output and sibling virtual balance 1 | Rejects: debit plus sibling capacity requires 1.1 |
| Sibling requests 0.5 after raw fill | Quote succeeds; transfer fails for inventory shortage despite adequate allowance; observed state rolls back | Guarded sequence admits 0.5 for strategy 0 and 0.5 for its sibling |
| Sibling requests 0.501 after guarded 0.5 | Not used as a raw counterfactual | Rejects excess; sibling's 0.5 still fills afterward |
| Direct push and reverse swap | Not included | Restores entitlement; restored and reverse fills succeed |
| Owner exit | Not included | Pause, dock all, withdraw both tokens; vault ends empty |

DAI funding is transferred from an impersonated account in the local copy only. WETH
is created through its actual deposit function using local native currency. No token
storage is patched and no TokenMock is used in fork mode. Token runtime hashes and
decimals are retained; this bounded run does not establish future token governance safety.

Custom deployments retain constructor arguments, initcode hashes, compiler-input hashes,
full runtime and receipts. Constructor simulation and mined runtime must agree exactly,
including immutables. Mine a local block before simulation: historical fork-block eth_call
can retain upstream chain context, affecting EIP-712 values. No protocol workaround is used.

## Evidence and limitations

The runner writes `deployments/local-release/report.json` and
`deployments/ethereum-fork/report.json`, plus compressed EVM opcode/stack traces for
all eight recorded swaps per environment. Memory/storage snapshots are disabled;
calldata, receipts and observed before/after token/allowance/virtual states are retained.
SHA-256 binds each compressed trace; inspect with Node `gunzipSync` or a gzip reader.

The checker validates committed source hashes, deployment/transaction identity, calldata,
receipt transfer decoding, virtual/real deltas, failure selectors and trace hashes.
Corruption checks exercise retained-evidence validation; the runner checks live EVM state.
Only generated report/trace files are excluded from dirty-source checks, never code/pins.

These are local-fork transactions, not Ethereum inclusion. Bytecode authentication is
not an independent security audit. See [RELEASE_VERIFICATION.md](RELEASE_VERIFICATION.md).
