# Sepolia deployment proof

Verified 2026-09-11 on Ethereum Sepolia (chain ID `11155111`). This is a public
testnet demonstration with valueless, owner-mintable demo tokens—not a production
deployment or security certification.

## Contracts

| Contract | Address | Source verification |
| --- | --- | --- |
| AquaQoS router | [`0xE2EE...5496`](https://sepolia.etherscan.io/address/0xE2EE332421bb0aE4177d0dE764ce5969bA0A5496) | [Sourcify exact match](https://repo.sourcify.dev/11155111/0xE2EE332421bb0aE4177d0dE764ce5969bA0A5496) |
| AquaQoS vault | [`0x22a3...C252`](https://sepolia.etherscan.io/address/0x22a305FDB19C8856a427f4AEaB3264618Ca5C252) | [Sourcify exact match](https://repo.sourcify.dev/11155111/0x22a305FDB19C8856a427f4AEaB3264618Ca5C252) |
| Demo token aqA | [`0x5f0a...F5DC`](https://sepolia.etherscan.io/address/0x5f0a52c5E51400157FbDA583d3141fAa5B7eF5DC) | [Sourcify exact match](https://repo.sourcify.dev/11155111/0x5f0a52c5E51400157FbDA583d3141fAa5B7eF5DC) |
| Demo token aqB | [`0x6242...374a`](https://sepolia.etherscan.io/address/0x62420946020B80935dD87cac1A0034cA2C63374a) | [Sourcify exact match](https://repo.sourcify.dev/11155111/0x62420946020B80935dD87cac1A0034cA2C63374a) |

The router uses the official Aqua deployment at
[`0x4999...6d31`](https://sepolia.etherscan.io/address/0x499943e74fb0ce105688beee8ef2abec5d936d31).
Its 6,251-byte runtime hashes to
`0xced66b74e01f418c698e6aca8560d33957fb2588ea120eadbde74960f138baa2`,
matching the separately authenticated Ethereum deployment.

## Public behavior

Two strategies each received a configured 500 aqA guarantee over shared vault
inventory. The retained transactions prove:

| Action | Result | Transaction |
| --- | --- | --- |
| Strategy 1 requests 600 aqA | Reverted with `InsufficientCapacity`; tracked state and logs unchanged | [`0x5ad5...7bbd`](https://sepolia.etherscan.io/tx/0x5ad5e9463046dd1c8febddf3c45a8397faefd1d4872faa436ea579230aaf7bbd) |
| Strategy 1 requests 500 aqA | Filled; three ERC-20 `Transfer` logs | [`0x49f7...3c42`](https://sepolia.etherscan.io/tx/0x49f76b79475c4f962cf09a92219f8c4947c8eff55bc7f71c63c97675ce073c42) |
| Strategy 2 requests 501 aqA | Reverted with `InsufficientCapacity`; tracked state and logs unchanged | [`0x6a76...c61d`](https://sepolia.etherscan.io/tx/0x6a7659c2773c4061149736cd063b9c7ed4756d06e5a9b927dc34a4bbc273c61d) |
| Strategy 2 requests 500 aqA | Filled; three ERC-20 `Transfer` logs | [`0x1696...e968`](https://sepolia.etherscan.io/tx/0x1696c953ae351be9e90f55789081f428cea40158b57c79b358ede9f64c19e968) |
| Replenish strategy 1 through Aqua | 500 aqB pushed and capacity restored | [`0x0c09...b5e`](https://sepolia.etherscan.io/tx/0x0c09639ac634c9abfa9737faff8e67e021196af34df4d7ba0c6f48451e556b5e) |
| Strategy 1 requests restored 500 aqA | Filled | [`0x7c99...9ff2`](https://sepolia.etherscan.io/tx/0x7c996a5ffd61da8b7373c0042335d44a77b34a2b9849f804a18f8a677ac69ff2) |
| Reverse-direction request | Filled 100 aqB output | [`0x78dd...6309`](https://sepolia.etherscan.io/tx/0x78ddb0497030e0a7c9fd66c793e8b2129477f63c2816ae5127db680b053a6309) |

The complete run retained 22 public transactions from clean source commit
`17a6b990f98016c71de6ab8210da3864ac9ac318`. Total testnet gas cost was
`0.012706443810287423` Sepolia ETH.

## Recheck

The raw machine-readable record is
[`deployments/sepolia/report.json`](../deployments/sepolia/report.json). Re-query
Sepolia and Sourcify rather than trusting the report alone:

```sh
pnpm check:sepolia
```

The checker binds the committed source hashes, authenticated Aqua runtime, deployed
runtime hashes, deployment receipts, exact Sourcify creation/runtime matches, rejected
rollback states, successful transfer logs, final balances and Aqua allowances.
