# AquaQoS capacity workspace

The Next.js app in `web/` replaces the earlier HTML replay. `/` is the recorded capacity
workspace; `/live/` is a fresh local-EVM execution workspace; `/proof/` links the protocol
specification, benchmark, limitations and downloadable evidence.

Start it locally:

```sh
pnpm --dir web install --frozen-lockfile --ignore-scripts
pnpm proof:serve
```

Open <http://127.0.0.1:4173/>. The default compares raw Aqua with half-guarantee AquaQoS
on two strategies and concentrated demand. At step 3 the guarded policy rejects a fill;
at step 4 the guarded sibling succeeds while the raw sibling fails settlement.
Select 100% protection to compare a full-guarantee policy, or choose conservative Aqua
as the reference. All 2/4/8 group sizes and four workloads are available.

Expand each card to inspect receipt status, error arguments, gas, token balances,
addresses, allowance and Transfer logs. Replenishment is a deposit via Aqua.push,
not a swap. The capacity meter displays post-settlement remaining entitlements under
the recorded policy; it is not a live quote. Amounts are raw mock-token units.

`pnpm --dir web build` first runs the original benchmark checker, then exports a static
Next.js site to `web/out/`. The generated `public/evidence/` directory is ignored; its
manifest records the original report SHA256 and source commit. No protocol lockfile or
benchmark report is changed by the frontend install/build. Runtime has no MCP dependency.

For development use `pnpm --dir web dev` (port 3000). With it running, replay the durable
browser checks from the repository root:

```sh
playwright-cli -s=aqua-next open http://127.0.0.1:3000
playwright-cli -s=aqua-next run-code --filename=web/scripts/check-browser.js
playwright-cli -s=aqua-next close
```

The browser checks cover 72 comparison selections, real fill/rejection/deposit values,
scenario reset/end boundaries, 1440/390/320px layouts, evidence links and failed-load recovery.
Playwright CLI is an optional development tool, not an app runtime dependency.

For live local execution, build and serve the static app from the repository root:

```sh
pnpm --dir web build
node scripts/serve-live.mjs
```

Open <http://127.0.0.1:4174/live/>. The server creates a fresh isolated Cancun EVM,
deploys the pinned AquaQoS contracts and mock tokens, and exposes authenticated setup,
quote, fill, rejection, replenishment and maker-exit actions. The browser regression is:

```sh
playwright-cli -s=aqua-live open http://127.0.0.1:4174/live/
playwright-cli -s=aqua-live run-code --filename=web/scripts/check-live-browser.js
playwright-cli -s=aqua-live close
```

This is real local transaction evidence, not a wallet, testnet or public deployment.

The addresses and receipts are ephemeral local-EVM evidence retained in the report. Token
labels are deliberately shown as `Token 0` and `Token 1` because the report sorts deployed
addresses and does not establish a market token identity. The replay is a judge-verification
aid; it is not a public deployment, testnet transaction or production safety claim.

For the complete checks, run `pnpm build`, `pnpm test`, `node scripts/check-benchmark.mjs`,
`node scripts/check-rejections.mjs --self-test`, and `pnpm test:transactions`.
