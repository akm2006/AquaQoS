# AquaQoS demo path

The dependency-free proof page includes a transaction replay at `/proof/demo.html`.
It reads `benchmarks/raw/a-b-c-v1.json`, the same retained report checked by
`node scripts/check-benchmark.mjs`; it does not sign transactions, connect a wallet,
call an RPC endpoint or invent a live address.

Start it locally:

```sh
pnpm proof:serve
```

Open <http://127.0.0.1:4173/proof/> and choose the replay link. The default view compares
the two-strategy C100 policy with the concentrated overload workload. Select policy B to
see raw Aqua continue fills until a sibling settlement fails. Select C100 to see the
capacity guard reject the same demand before settlement. Use the step controls to inspect
the exact recorded status, gas, receipt hash, before/after state and standard ERC-20
`Transfer` logs.

The addresses and receipts are ephemeral local-EVM evidence retained in the report. Token
labels are deliberately shown as `Token 0` and `Token 1` because the report sorts deployed
addresses and does not establish a market token identity. The replay is a judge-verification
aid; it is not a public deployment, testnet transaction or production safety claim.

For the complete checks, run `pnpm build`, `pnpm test`, `node scripts/check-benchmark.mjs`,
`node scripts/check-rejections.mjs --self-test`, and `pnpm test:transactions`.
