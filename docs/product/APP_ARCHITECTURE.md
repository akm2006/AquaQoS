# AquaQoS Next.js app refactor guide

**Status:** Implemented and integration-verified 2026-09-12; independent frontend review pending
**Date:** 2026-09-10
**Applies to:** `web/` Next.js App Router application
**Design authority:** [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)
**Product authority:** [`docs/STATUS.md`](../STATUS.md), [`docs/ACCEPTANCE_CRITERIA.md`](../ACCEPTANCE_CRITERIA.md)

**Implementation update (2026-09-12):** the app now uses `(site)` and `(docs)` route groups
with separate root layouts. This is the one justified exception to the flat structure below:
the Fumadocs/Tailwind documentation surface stays isolated from the interactive product shell.
The public navigation now prioritizes Sepolia evidence. The local execution lab remains an
unpromoted contributor tool linked from the reproduction guide.

This guide turns the design direction into a focused, evidence-first product. It is an
implementation contract, not a request to add every possible page, package or animation.
The app must make AquaQoS understandable in ten seconds, verifiable in two minutes and
reproducible from the repository.

## 1. Product contract

The app communicates one idea:

> Aqua makes liquidity shareable. AquaQoS makes shared liquidity schedulable.

The first-time visitor should understand this sequence:

```text
Independent Aqua strategies
        ↓
One shared real inventory
        ↓
CAPACITY_GUARD schedules access
        ↓
Guaranteed capacity + controlled burst
        ↓
Actual transfer receipt
```

The app must distinguish four kinds of truth:

| Label | Meaning |
| --- | --- |
| Recorded | Retained local transaction evidence from the benchmark report |
| Live local | A fresh isolated local EVM session with mock tokens |
| Public testnet | The retained Sepolia deployment with chain, address and receipt evidence |
| Planned | Not implemented and not evidence |

Never use a recorded number, ephemeral address or mock-token receipt as if it were a public
deployment or a market result.

## 2. Final route map

Ship five primary public product routes:

| Route | Job | Primary action |
| --- | --- | --- |
| `/` | Landing and orientation | View onchain proof |
| `/workspace/` | Recorded comparison explorer | Step through a scenario |
| `/onchain/` | Public deployment evidence | Inspect contracts and receipts |
| `/proof/` | Independent verification | Open receipts and commands |
| `/docs/` | Curated public documentation | Understand the protocol |

`/live/` is retained as a contributor-only local execution lab. It is linked from
`/docs/reproduce/`, not from the primary navigation or landing page.

System routes are not product pages:

- `loading.tsx` gives an immediate route skeleton.
- `error.tsx` gives a recoverable failure state.
- `not-found.tsx` gives a useful 404.
- `global-error.tsx` is added only if the static export path supports it without hiding
  useful diagnostics.

Do not add separate `/about`, `/methodology`, `/benchmarks`, `/simulator` or `/evidence`
pages. Their jobs are already covered by `/docs`, `/proof`, `/workspace` and `/live`.
Additional routes are justified only by a real user or verification task that cannot be completed
in those four product surfaces.

## 3. Recommended file structure

Keep the flat route structure easy to navigate. Use private folders for implementation
details instead of introducing route groups before they solve a real layout problem.

```text
web/
  app/
    layout.tsx                 # shared shell, metadata, navigation and footer
    page.tsx                   # landing page
    workspace/
      page.tsx                 # recorded comparison route
      loading.tsx              # optional route skeleton
    live/
      page.tsx                 # live execution route
      loading.tsx              # setup/read skeleton
      error.tsx                # recoverable local-service error
      live.css
    proof/
      page.tsx                 # concise evidence hub
    docs/
      page.tsx                 # curated docs, not raw Markdown rendering
    _components/
      BrandLogo.tsx
      Button.tsx
      StatusBadge.tsx
      Metric.tsx
      CapacityBar.tsx
      TransactionTimeline.tsx
      ReceiptPanel.tsx
      SectionHeading.tsx
    _lib/
      copy.ts                  # reviewed UI copy only
      format.ts                # units, addresses and receipt formatting
      routes.ts                # internal links, no duplicated strings
    evidence.ts                # checked report types and validation
    globals.css                # tokens and global primitives
    icon.svg                   # favicon derivative, not the logo master
  public/
    brand/
      AquaQoS.svg              # unchanged owner-supplied master
    evidence/                  # generated checked evidence, ignored as configured
  scripts/
    prepare-evidence.mjs
    check-browser.js
    check-live-browser.js
```

`AquaQoS.svg` at the repository root is the owner-supplied master. During implementation it
may be copied unchanged into `web/public/brand/`; do not edit the master to fit a component.

## 4. Page contracts

### 4.1 Landing page `/`

The landing page is the only page with a strong marketing hero. It should be spacious and
blue-led while the application routes remain calm and data-led.

Order:

1. Header with the final logo, compact navigation and one primary CTA.
2. Hero: `Shared liquidity, scheduled.`
3. One scheduling visualization: strategies → shared inventory → guard → receipt.
4. Problem: virtual balances can be independently funded while real inventory is shared.
5. Mechanism: guarantees protect sibling capacity; unused capacity can burst.
6. Evidence strip with links, not unsupported superlatives.
7. Measured trade-off: protection has gas cost and bounded scope.
8. Public onchain-proof CTA.
9. Limitations and source links.

Hero copy must not claim solvency, profitability, safety or production deployment. The public
primary CTA opens verified Sepolia proof; the local execution lab remains available through
the reproduction guide and is never presented as a remotely hosted chain.

### 4.2 Recorded workspace `/workspace/`

Move the current root workspace here. Preserve its tested behavior and make the environment
label persistent:

> Recorded benchmark evidence · no wallet transaction

Keep the main comparison visible and move hashes, raw JSON, allowances and detailed logs
behind disclosure panels. The first viewport should answer: what was requested, what was
allowed/rejected, and what real balance changed?

### 4.3 Public deployment `/onchain/`

Lead with chain identity, deployed router/vault addresses and exact source matches. Then show
the representative protected rejection, admitted fills, replenishment and reverse-direction
receipts. Every item links directly to Etherscan or Sourcify and is derived from the checked
deployment report at build time.

### 4.4 Contributor execution lab `/live/`

Keep the existing local API contract. Present it as a five-step flow:

```text
Configure maker → Quote → Execute → Inspect receipt → Manage lifecycle
```

Always show chain ID, local/mock status, revision/staleness state and receipt status. Keep
wallet connection controls out of the page until a real deployment and authorization model
exist. A reset/new-session action is preferable to silently reusing stale state.
On a static public deployment, absence of the localhost-only API is an expected state rather
than an application error: link to public Sepolia proof and recorded transactions, then show
the exact local launch commands.

### 4.5 Proof `/proof/`

This is a verification surface, not another landing page. It should answer in this order:

1. What AquaQoS changes.
2. What the canonical baseline failure looks like.
3. What `CAPACITY_GUARD` changes before settlement.
4. Which transfer receipts and state deltas prove it.
5. What the benchmark measured, including losing gas cases.
6. What remains outside the supported domain.
7. Where to find the developer reproduction guide and raw source material.

Use evidence badges such as `SOURCE-PINNED`, `MEASURED`, `LOCAL RECEIPT` and `SCOPE LIMIT`.
Do not display placeholder addresses or hardcode a test count in visual copy when the value
can be read from the checked manifest.

### 4.6 Curated docs `/docs/`

Build one static, presentable documentation page with a sticky table of contents and
anchor sections. Write a concise narrative from the repository’s validated material; do
not dump or auto-render every Markdown file.

Required sections:

- Overview and vocabulary.
- Why the shared-inventory problem exists.
- Aqua virtual balances versus real ERC-20 inventory.
- Architecture: Aqua, SwapVM, router, vault and `CAPACITY_GUARD`.
- Guarantee consumption, replenishment and burst semantics.
- Quote/swap consistency and lifecycle boundaries.
- Security model and explicit limitations.
- Benchmark methodology and interpretation.
- Reproduction commands.
- Source pins, licenses and links to repository source material.

Every section ends with a `Source` or `Verify` link to the relevant contract, test, report or
official 1inch source. The docs page explains; the proof page demonstrates.

## 5. Component boundaries

Prefer small, typed components with one visual responsibility:

| Component | Responsibility |
| --- | --- |
| `BrandLogo` | Render the unchanged master, with explicit decorative/meaningful mode |
| `CapacityBar` | Show real backing, guaranteed capacity and burst as structure plus text |
| `StatusBadge` | Pair icon/text with allowed, constrained, rejected or recorded state |
| `Metric` | Show value, unit, provenance label and optional explanation |
| `TransactionTimeline` | Show request → guard → settlement → receipt progression |
| `ReceiptPanel` | Show status, gas, balances, errors and transfers behind disclosure |
| `SectionHeading` | Provide consistent eyebrow, heading and supporting copy |

Do not create a design-system abstraction for a component used once. Extract only when a
component is repeated, independently testable or carrying a security-relevant display rule.

## 6. Rendering and data boundaries

- Keep landing, proof and docs pages Server Components where possible.
- Keep interactive benchmark/live controls in focused Client Components.
- Keep the `"use client"` boundary below static page headings and navigation.
- Do not pass raw reports, build metadata or secrets through broad client props.
- Validate evidence at the boundary before rendering it.
- Use explicit loading, empty, stale, rejected and error states.
- The static export remains the default deployment target for recorded pages.
- The live local service remains a separate local process; never fake it with client-only
  state or silently fall back to recorded data.

The current app’s bounded fetch flow does not justify adding a data-cache library. Add SWR
only if the live page gains polling/revalidation that cannot remain a small explicit fetch
loop.

## 7. Library policy

The goal is a reliable product, not a showcase of dependencies.

| Tool | Decision | Use when |
| --- | --- | --- |
| Next.js 16.3.4 | Keep | App Router, static export and route metadata |
| React 19.2.8 | Keep | Existing component runtime |
| `next/font` | Adopt | Load Geist without a runtime font request |
| CSS + inline SVG | Default | Tokens, capacity diagrams, logo wrapper and simple motion |
| Playwright CLI/checks | Keep | Durable desktop/mobile and flow verification |
| `motion` 13.2.0 | Optional | Only when a multi-state animation is materially clearer than CSS |
| `lucide-react` 1.44.0 | Optional | Only if repeated outline icons exceed the few existing symbols |
| `swr` 2.5.1 | Optional | Only if live polling/revalidation is added |
| chart library | Avoid for now | Existing SVG/HTML charts are smaller and easier to audit |
| Tailwind/shadcn/Framer Motion legacy package | Avoid | Current CSS is established; no migration benefit yet |
| Three.js/canvas/particle packages | Avoid | They conflict with the infrastructure-grade visual direction |

Versions above are registry candidates checked 2026-09-10, not an instruction to install
them. Any new dependency requires a concrete user-visible or correctness benefit, a pinned
lockfile change and a build/audit result.

## 8. Logo integration and motion

### Static usage

- Header: small master lockup on the near-black surface.
- Landing hero: larger master with generous clear space.
- Docs/proof: compact master, never competing with evidence.
- Favicon/avatar: tested symbol crop only; no wordmark at tiny sizes.

Use the master as an image when it is only branding. Use an inline SVG only when a specific
presentation needs controlled accessibility or a wrapper reveal. The master’s paths and
fills remain unchanged in either case.

### Approved animation

Use motion to explain scheduling, not to decorate:

- one-time hero reveal of the logo wrapper or scheduling lanes;
- capacity bars filling after a confirmed state change;
- square units moving from a strategy lane to shared inventory;
- receipt timeline progressing after an action completes;
- small CTA hover/focus transitions.

Rules:

- animate `opacity` and `transform` before layout properties;
- animate a wrapper around the SVG rather than morphing logo paths;
- never recolor, rotate, pulse or continuously spin the master logo;
- never animate numbers before the underlying state is confirmed;
- keep micro transitions at 120–180ms, standard transitions at 180–260ms and explanatory
  sequences below 800ms;
- include a static state under `prefers-reduced-motion: reduce`;
- if `motion` is used, keep it in a client-only presentation component and use its reduced
  motion hook.

CSS is preferred for one-state transitions. Motion for React is a conditional tool, not a
default dependency; its current documentation supports client-only App Router components,
SVG path animation and reduced-motion handling. [Motion React guidance](https://motion.dev/docs/react-accessibility)

## 9. Accessibility and performance gate

- Use one `h1` per route and a logical heading order.
- Use labels independent of color; pair state color with text and an icon.
- Preserve visible keyboard focus and 44px practical touch targets.
- Keep technical tables horizontally scrollable rather than shrinking labels unreadably.
- Provide `aria-live` only for meaningful state changes, not every render.
- Use `alt="AquaQoS"` for meaningful logo instances and `aria-hidden="true"` for decorative
  repeats.
- Add `loading.tsx`/`error.tsx` where navigation or local execution can wait or fail.
- Use `next/font` and explicit image dimensions to avoid layout shift.
- Keep heavy client components out of the landing page.
- Respect reduced motion and test at 1440px, 390px and 320px widths.

Next.js production guidance specifically recommends shared layouts, route loading/error
states, metadata, optimized fonts and careful Server/Client boundaries. [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)

## 10. Evidence and copy integrity

Before any UI claim ships, classify it:

| Class | Allowed source |
| --- | --- |
| Implemented | Current code and passing test |
| Measured | Retained raw report and checker |
| Verified | Receipt/runtime/source comparison |
| Limitation | Specification, review or reproducible negative case |
| Planned | Explicitly labeled roadmap item |

The landing page may summarize. The proof/docs pages must link. Raw Markdown remains the
audit record; curated docs are the readable explanation.

## 11. Refactor sequence

1. Lock the supplied logo master and move the current wave favicon out of the brand role.
2. Add semantic design tokens and Geist through `next/font`.
3. Add `/workspace/` and move the current recorded route without changing evidence logic.
4. Build the landing page and hero scheduling visualization.
5. Refine `/proof/` into a short independent-verification path.
6. Add curated `/docs/` from validated repository material.
7. Add route-level loading/error states.
8. Add only the approved logo-wrapper and capacity-state motion.
9. Run typecheck, production build, dependency audit and both Playwright suites.
10. Review the rendered pages at desktop/mobile widths and inspect the final diff for
    fabricated claims, untracked assets, remote images and accidental protocol changes.

Do not begin paper/video/release polish until the landing, docs, proof and live flow pass
the browser gate.

## 12. Definition of done

The refactor is complete only when:

- all five routes are reachable from compact navigation;
- the landing page explains AquaQoS without requiring protocol knowledge;
- the final logo master is integrated unchanged and remains legible;
- recorded, live-local and public-Sepolia states cannot be confused;
- `/docs/` explains the protocol without copying raw files;
- `/proof/` links every claim to code, test, receipt or source;
- loading, error, stale and reduced-motion states work;
- typecheck, build, audit and browser checks pass;
- no new library exists without a recorded reason;
- `DESIGN_SYSTEM.md`, this guide and `docs/STATUS.md` agree;
- a coherent Git commit records the refactor and no unrelated files are staged.

## 13. Primary references

- [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Motion for React accessibility](https://motion.dev/docs/react-accessibility)
- [1inch Aqua product](https://1inch.com/aqua)
- [1inch rebrand rationale](https://1inch.com/blog/post/1inch-rebrand)
- [ETHGlobal 1inch Aqua prize requirements](https://ethglobal.com/events/ethonline2026/prizes)
- [AquaQoS design system](DESIGN_SYSTEM.md)
- [AquaQoS acceptance criteria](../ACCEPTANCE_CRITERIA.md)
