# AquaQoS handoff

Updated 2026-09-13. Current phase: public product and repository release polish complete;
owner-controlled publication decisions remain. Protocol, benchmarks, local/fork proof and
Sepolia deployment are complete within the documented v0 scope. Submission packaging remains
deferred until the owner accepts the product.

## Verified protocol state

- Last protocol-proof commit: `576e12e`. Production contracts have not changed since the
  verified local, fork and Sepolia runs.
- 30 Solidity tests pass, including three 256-run fuzz properties. A bounded model covers
  327,168 cases and a 239-transaction replay.
- The retained benchmark contains 72 A/B/C/C100 fixtures, 616 swaps and 12 pushes across
  2/4/8 strategies and six workloads. Twenty-four checker tests authenticate the raw results.
- Local release evidence contains 45 transactions; the authenticated Ethereum-fork proof has
  43 DAI/WETH transactions and 16 detailed traces.
- Sepolia evidence contains 22 public transactions. The router, vault and two demo tokens are
  exact Sourcify creation/runtime matches. Protected rejection, successful sibling fills,
  replenishment, reverse direction and maker exit are covered.
- A bounded independent internal protocol review found no demonstrated v0-scope defect or
  Sepolia blocker. This is not an external audit or production certification.

## Product state

- `web/` uses Next.js 16.3.4 and React 19.2.8 with frozen dependencies and static export.
- Primary public routes are landing, `/workspace/`, `/onchain/`, `/proof/` and curated `/docs/`.
  `/onchain/` derives its four contracts and seven representative receipts from the checked
  Sepolia report at build time.
- `/live/` remains a contributor-only local execution lab linked from the reproduction guide;
  it is not promoted as a hosted product or public chain.
- Public metadata now includes Open Graph, Twitter, robots and sitemap output. The supplied logo
  remains unchanged.
- Current clean-tree validation: 30 Solidity tests, 327,168 model cases, all 72 benchmark
  fixtures, rejection replay, local/fork evidence checks, bootstrap checks, TypeScript and the
  22-page Vercel-mode export passed. The browser suite passed all primary routes, Sepolia links,
  72 comparison selections, evidence downloads, malformed-data recovery and 1440/390/320px
  layouts without application errors or overflow.
- Public presentation commit `0f04456` is pushed to `main`. Vercel production deployment
  `dpl_DSqMaeCjJ6BJwVPkJ2he9hF2HF3i` completed its 22-page build and is aliased at
  `https://aquaqos.vercel.app`.
- Public documentation now separates curated product evidence from a concise event-compliance
  archive. Required sanitized prompts remain retained; operational credential and tool-diagnostic
  details are not tracked in public documentation.

## Supported claim and limits

AquaQoS v0 protects configured capacity for at most eight canonical, fee-free XYC strategies
sharing one immutable standard-ERC-20 pair through a restricted maker vault. It does not claim
general solvency, hostile-token support, profitable execution, universal gas bounds or
production safety.

Known limits: same-transaction reservations can reject a later safe fill; extreme input-ledger
values may quote and then revert atomically in upstream settlement; gas measurements are
scenario bounds; broader prior art and an external audit remain open.

## Release blockers and owner actions

- No protocol implementation blocker.
- Confirm the permitted visual-reference boundary in `docs/THIRD_PARTY.md` before making the
  GitHub repository public. No reference files are committed or deployed.
- GitHub visibility/security settings, wallet custody, video and ETHGlobal dashboard actions
  remain owner-controlled. See `docs/archive/ethonline-2026/MANUAL_ACTIONS.md`.

## Next three tasks

1. Confirm GitHub public-release timing and the visual-reference permission boundary.
2. Review the deployed product on a real phone/desktop and record owner visual acceptance.
3. Keep submission packaging deferred until the product and evidence surfaces are accepted.
