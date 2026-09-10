# AquaQoS Design System

> **Aqua makes liquidity shareable. AquaQoS makes shared liquidity schedulable.**

**Document:** `DESIGN.md`
**Project:** AquaQoS
**Purpose:** Single source of truth for brand, product UI, data visualization, motion, and frontend polish.
**Status:** Adopted frontend design direction; owner-supplied logo locked
**Last updated:** September 2026

---

## 1. Design Objective

AquaQoS should feel like a **serious infrastructure product built naturally beside 1inch Aqua**, not a fan-made extension and not a generic “Web3 dashboard.”

The visual system should communicate three things immediately:

1. **Shared capital** — multiple strategies draw from one underlying inventory.
2. **Scheduling** — AquaQoS decides how that shared capacity is allocated.
3. **Reliability** — guaranteed capacity is protected while unused capital can burst elsewhere.

The product should feel:

- precise
- technical
- fast
- self-confident
- minimal
- infrastructure-grade
- visually related to Aqua without copying 1inch marks

The product should **not** feel:

- playful or aquatic for its own sake
- “AI-generated”
- neon/cyberpunk
- glassmorphic
- overly financial/trading-terminal-like
- overloaded with charts
- like a 1inch clone

---

# 2. Research Basis

The design direction is based on the current public 1inch/Aqua product language and documentation.

### Current 1inch visual direction

1inch's current rebrand emphasizes a **simpler, more understated identity** intended to reduce friction and let products and partners take the stage.

Source:
- https://blog.1inch.com/1inch-rebrand/
- https://blog.1inch.com/1inch-in-2025/

This is an ecosystem reference, not a promise to reproduce 1inch's interface. AquaQoS
must remain an independent product with its own mark, copy and information architecture.

### Current Aqua product identity

The live Aqua experience prominently uses:

- a saturated electric-blue field
- white typography
- simple, high-contrast interface elements
- pixel/dot motion artwork
- substantial negative space
- restrained navigation
- minimal visual ornament

Source:
- https://1inch.com/aqua

A reference screenshot of the live site has a blue-led, high-contrast and spacious visual
field. A reference screenshot may be approximately equivalent to:

```text
RGB 0, 0, 254
≈ #0000FE
```

For AquaQoS implementation, use the normalized product token:

```text
#0000FF
```

unless visual testing against current 1inch surfaces indicates a slightly different value is preferable.

### Aqua product concept

Aqua is a shared-liquidity layer where one wallet balance can back multiple positions/strategies simultaneously while real assets remain in the maker's wallet until execution.

That shared-capital model is the conceptual foundation of AquaQoS.

Sources:
- https://help.1inch.com/en/articles/15798646-what-is-1inch-aqua
- https://business.1inch.com/portal/documentation/aqua/overview

### Trademark boundary

AquaQoS must not reproduce, modify, or create a confusingly similar version of the 1inch logo or protected marks.

AquaQoS can feel visually compatible with the ecosystem while retaining an independent product mark.

Source:
- https://1inch.io/assets/trademark.pdf

---

# 3. Core Design Principle

## One visual idea: shared capacity becomes scheduled capacity.

Every major visual should derive from the same primitive:

```text
independent strategies
        ↓
shared inventory
        ↓
AquaQoS scheduling
        ↓
guaranteed + burst capacity
```

Avoid introducing unrelated metaphors such as:

- shields
- locks
- coins
- whales
- droplets
- circuit boards
- generic network nodes
- hexagons
- chains

The Aqua whale/pixel art belongs to Aqua's own brand expression.

AquaQoS should reference the **pixel/grid logic**, not copy the mascot.

---

# 4. Brand Architecture

## Product name

Use:

# AquaQoS

Correct casing:

```text
AquaQoS
```

Avoid:

```text
AQUAQOS
aquaQoS
AQUA QoS
Aqua QOS
```

### Meaning

**QoS = Quality of Service**

In networking and distributed systems, QoS describes the allocation and protection of constrained shared resources.

That maps naturally to AquaQoS:

- guaranteed liquidity
- burst capacity
- prioritization
- shared resource scheduling

---

# 5. Brand Line

Primary:

> **Shared liquidity, scheduled.**

Technical/supporting line:

> **Guaranteed liquidity. Burstable capital.**

Long-form explanation:

> AquaQoS gives every Aqua strategy guaranteed capacity while allowing unused shared capital to burst where it is needed.

Do not use multiple slogans on the same screen.

---

# 6. Logo Direction

The owner-supplied `AquaQoS.svg` is the final master logo. It is authoritative and must
not be redesigned, regenerated, recolored or replaced during the app refactor. The current
master is a transparent 250×150 SVG with flat `#31D7FD`, `#9FEEFD` and white fills.

When the app integrates it, copy the master unchanged to `web/public/brand/AquaQoS.svg`.
Keep the root source asset and its provenance visible in Git. Do not silently substitute
the old wave icon. The earlier three-square/three-lane sketch in this document is a semantic
explanation of scheduling, not a constraint on the final supplied mark.

## 6.1 Meaning

The supplied geometry is the visual identity for a scheduler joining independent strategy
claims to one shared capital boundary. Use it to introduce the product, identify the app and
anchor diagrams; do not create strategy-count variants of the mark.

## 6.2 Geometry and treatment

The master asset is fixed. Surrounding UI geometry should remain flat, vector-friendly and
disciplined: straight lanes, square units, 45° cuts, negative space and no decorative
particles. Do not add gradients, glow, shadow, texture, 3D treatment, glass effects or
1inch marks. Any approved monochrome derivative must be separately named and must preserve
the master silhouette; never mutate the master in place.

## 6.3 Approved surfaces

Use the transparent master unchanged on:

```text
AquaQoS blue marketing field: #0000FF
Near-black application surface: #070707
White documentation surface: #FFFFFF
```

Check contrast with the final fills rather than assuming a white-only logo. The colored
master is the required production asset; a monochrome fallback exists only for platform
constraints.

---

## 6.4 Favicon / avatar

At very small sizes:

- remove wordmark
- use a carefully tested crop of the supplied symbol
- simplify only if the master becomes unreadable
- preserve the supplied geometric silhouette
- never collapse into an unreadable miniature full lockup

Test at:

- 16×16
- 24×24
- 32×32
- 48×48
- 128×128
- 400×400

GitHub/X avatar should use the supplied symbol crop on:

```text
the approved AquaQoS blue field
```

No text.

---

# 7. Color System

## 7.1 Brand colors

### Aqua Blue — Primary

```css
--aq-blue: #0000FF;
```

Purpose:

- brand field
- primary CTA on neutral surfaces
- active navigation state
- selected strategy
- diagram emphasis
- links where appropriate

Do not use five slightly different blues throughout the app.

---

### Pure White

```css
--aq-white: #FFFFFF;
```

Purpose:

- typography on blue/black
- cards on light mode
- logo
- primary high-contrast content

---

### Ink

```css
--aq-ink: #070707;
```

Purpose:

- main product/application background
- dark sections
- terminal/proof surfaces

Use near-black rather than blue-tinted “Web3 dark.”

---

## 7.2 Neutral scale

```css
--aq-gray-950: #0A0A0A;
--aq-gray-900: #141414;
--aq-gray-800: #202020;
--aq-gray-700: #303030;
--aq-gray-600: #525252;
--aq-gray-500: #737373;
--aq-gray-400: #A3A3A3;
--aq-gray-300: #D4D4D4;
--aq-gray-200: #E5E5E5;
--aq-gray-100: #F5F5F5;
--aq-gray-50:  #FAFAFA;
```

Neutral colors are structural, not decorative.

---

## 7.3 Functional colors

Functional colors may be used only when they communicate state.

### Healthy / Allowed

```css
--aq-success: #22C55E;
```

### Constrained / Warning

```css
--aq-warning: #F59E0B;
```

### Rejected / Unsafe

```css
--aq-danger: #EF4444;
```

### Information

Prefer Aqua Blue:

```css
--aq-info: #0000FF;
```

Do not use green/red as brand colors.

---

# 8. Color Usage Ratio

Typical product screen:

```text
60–75% neutral / white / black
15–30% Aqua Blue
<10% status colors
```

Marketing hero may invert this:

```text
80–90% Aqua Blue
10–20% white
```

This distinction is important.

The **brand can be loud**.

The **application should be calm**.

---

# 9. Typography

Use one modern grotesk family.

Preferred order:

1. **Geist**
2. Inter
3. system sans-serif fallback

Implementation:

```css
font-family:
  Geist,
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Avoid:

- futuristic display fonts
- monospace for general UI
- excessive uppercase
- ultra-thin weights

---

## 9.1 Type scale

### Display

```text
64–88px desktop
48–56px tablet
40–48px mobile
Weight: 600–700
Tracking: -0.04em to -0.03em
```

### H1

```text
48–64px
Weight 600–700
```

### H2

```text
32–40px
Weight 600
```

### H3

```text
22–28px
Weight 600
```

### Body

```text
15–17px
Line height 1.5–1.65
```

### Data / numerical values

Use tabular numbers where supported:

```css
font-variant-numeric: tabular-nums;
```

---

# 10. Layout System

AquaQoS should use **large, controlled whitespace**, borrowing the confidence of the Aqua landing experience.

## Marketing width

```text
max-width: 1440px
content width: 1180–1280px
```

## Application width

```text
max-width: 1600px
```

## Grid

Desktop:

```text
12 columns
24px gutters
```

Mobile:

```text
4 columns
16px gutters
```

## Spacing

Use a disciplined 4px base system:

```text
4
8
12
16
24
32
48
64
96
128
```

Avoid arbitrary values unless optical correction requires them.

---

# 11. Corners and Borders

The AquaQoS symbol is geometric and infrastructure-oriented.

UI should therefore avoid excessively soft “consumer fintech” cards.

Recommended:

```text
buttons: 10–12px radius
cards: 12–16px radius
small controls: 8px
```

Do not use:

```text
24–40px rounded cards everywhere
pill-shaped everything
```

Borders:

```css
1px solid rgba(...)
```

Use borders to define structure.

Avoid floating glass panels.

---

# 12. Hero Design

The hero should communicate the product mechanism, not just branding.

Recommended composition:

```text
AquaQoS

Shared liquidity,
scheduled.

Give every Aqua strategy guaranteed capacity
and let unused capital burst where it is needed.

[Run live demo] [Read docs]
```

Adjacent/below: one large **capacity scheduling visualization**.

Example:

```text
                    $100K SHARED CAPITAL
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
      ETH                BTC                LINK
   G $30K / $70K      G $20K / $60K      G $20K / $50K
```

The visualization should use straight geometric lanes and square liquidity units.

Do not put a giant 3D coin or watery illustration in the hero.

---

# 13. Pixel / Square Visual Language

The square is AquaQoS's smallest visual unit.

Meaning:

> one discrete unit of liquidity / one strategy resource request

Use squares in:

- diagrams
- loading states
- capacity meters
- simulator flows
- empty-state illustrations
- subtle page transitions

Do not scatter them randomly as decoration.

Every square should visually represent one of:

- inventory
- allocation
- strategy
- capacity
- transaction

If it cannot be explained, remove it.

---

# 14. Guaranteed vs Burst Visualization

This is the product's most important visual distinction.

Use **structure**, not extra colors, to communicate it.

Recommended:

### Guaranteed capacity

```text
solid filled bar
```

### Burst capacity

```text
outlined / lower-opacity continuation
```

Example:

```text
ETH
████████████░░░░░░░░
Guaranteed   Burst
```

or:

```text
[■■■■■■■■][□□□□□□]
 guaranteed   burst
```

Do not rely solely on green vs cyan or another color pair.

The distinction must survive:

- monochrome printing
- color blindness
- screenshots
- technical paper export

---

# 15. Capacity Cards

Every strategy card should prioritize the same hierarchy:

```text
ETH / USDC

$52,400
available now

Guaranteed      $30,000
Burst ceiling   $70,000
Currently used  $17,600

[capacity bar]
```

Do not show ten secondary metrics by default.

Use disclosure/details for:

- virtual balance
- wallet allowance
- raw backing
- strategy hash
- gas
- execution history

---

# 16. Global Capital Panel

This is the central product component.

It should show:

```text
REAL BACKING
$100,000

ADVERTISED CAPACITY
$180,000

SHARED LIQUIDITY RATIO
1.80×

GUARANTEED
$70,000

GLOBAL RESERVE
$10,000

BURST HEADROOM
$20,000
```

The most important number should be **real backing**.

Never visually imply virtual liquidity is actual owned capital.

This is both a UX and trust requirement.

---

# 17. Simulator

The simulator is the strongest demonstration screen.

It should make one sequence obvious:

```text
1. Strategy requests capacity
2. CAPACITY_GUARD reads latest shared state
3. Sibling guarantees are protected
4. Trade is allowed or rejected
5. Real balance changes only after execution
```

Example transaction:

```text
BTC / USDC
Requested       $40,000
Safe capacity   $30,000

CAPACITY_GUARD
REJECTED
```

Use a large, unambiguous state label.

Then allow:

```text
Retry at safe capacity
```

---

# 18. Proof Page

The judge-facing proof page should be visually austere.

Recommended:

```text
PROTOCOL PROOF

Official Aqua/SwapVM     Source-pinned
Custom instruction       CAPACITY_GUARD
Transfer evidence        Environment-labelled
Contract identity        Runtime-verified when deployed

Tests                    Read from checked evidence
Benchmark                View retained report
Source                   GitHub + pinned sources
Architecture             Read curated docs
```

No marketing animation.

No giant hero.

No unnecessary cards.

This page exists to establish credibility quickly.

---

# 19. Data Visualization

AquaQoS should not look like a trading terminal.

Charts must answer a specific product question.

Good:

- shared liquidity ratio over time
- available guaranteed/burst capacity
- successful vs rejected fills
- inventory utilization
- strategy demand
- benchmark comparison

Bad:

- candlestick chart just because this is DeFi
- market price chart unrelated to scheduling
- animated price ticker
- decorative token prices

---

## 19.1 Benchmark chart

For the final hackathon comparison:

```text
Conservative Aqua
Raw Overcommit
AquaQoS
```

Use simple bars or dot plots.

Primary metric hierarchy:

1. fill success / inventory failure
2. shared liquidity ratio
3. successful volume
4. guarantee violations
5. gas overhead

AquaQoS blue is used for AquaQoS.

Competitors/baselines use neutral gray.

Do not make competitors red to manipulate perception.

---

# 20. Motion

Motion should explain resource scheduling.

Allowed:

- square liquidity units moving along lanes
- capacity bars expanding/contracting
- a burst section activating
- clean state transitions
- transaction sequencing
- subtle pixel loading

Duration:

```text
micro: 120–180ms
standard: 180–260ms
complex explanatory animation: 400–800ms
```

Use ease-out for state entry.

No:

- floating particles
- parallax for no reason
- glowing waves
- liquid morph blobs
- rotating 3D icons
- perpetual background animation that competes with content

Respect `prefers-reduced-motion`.

## 20.1 Logo usage and animation

The master logo is primarily a stable identity element:

- header/footer: static, compact and never continuously animated
- landing hero: one entrance reveal of the unchanged SVG or its wrapper, 400–800ms maximum
- live state changes: animate a surrounding lane/capacity component, not the logo itself
- favicon, metadata and proof page: static asset only

For the supplied filled SVG, prefer animating an enclosing element with opacity and a small
translate/clip reveal. Do not morph paths, rotate the mark, recolor its fills, or animate
individual logo pieces as if they were live balances. If Motion for React is introduced,
keep it in a client-only presentation component and use its reduced-motion hook; CSS
transitions are preferred for one-state changes. Every animation must have a static fallback
under `@media (prefers-reduced-motion: reduce)`.

---

# 21. Navigation

Keep the product navigation compact.

Suggested public app navigation:

```text
AquaQoS    Overview   Workspace   Live   Proof   Docs
                                                   [GitHub]
```

When connected/deployed:

```text
[Network] [Wallet]
```

Do not mimic the exact 1inch navigation shell.

AquaQoS must remain its own product.

---

# 22. Buttons

### Primary

On dark/light surfaces:

```text
background: #0000FF
text: #FFFFFF
```

On Aqua Blue hero:

```text
background: #FFFFFF
text: #070707
```

### Secondary

Transparent with 1px border.

### Danger

Only use red for destructive/unsafe action.

Do not create gradient buttons.

Do not add glow.

---

# 23. Iconography

Use a consistent simple outline icon set, e.g. Lucide.

Rules:

- 1.5–2px stroke
- square optical box
- neutral/white by default
- no multicolor icons
- no crypto-token clip-art

Custom icons should follow the logo geometry:

- straight lines
- square terminals
- geometric cuts

---

# 24. Responsive Behavior

Mobile does not need to reproduce the entire desktop simulator visually.

Prioritize:

1. global capital state
2. strategy guarantees
3. requested vs safe capacity
4. allow/reject result

On small screens:

- stack strategy cards
- collapse raw protocol details
- allow horizontal scroll only for technical tables
- keep CTAs full-width when appropriate
- never shrink diagrams until labels become unreadable

---

# 25. Accessibility

Minimum requirements:

- WCAG AA contrast for text
- keyboard navigation
- visible focus state
- semantic headings
- labels independent of color
- status icon + text, not color alone
- reduced motion support
- 44px minimum practical touch targets

Status example:

```text
✓ ALLOWED
⚠ CONSTRAINED
× REJECTED
```

not just:

```text
green
yellow
red
```

---

# 26. Copy Style

AquaQoS copy should be concise and technical.

Prefer:

> Protect $20K for LINK. BTC can currently burst to $30K.

Avoid:

> Our revolutionary next-generation smart liquidity orchestration layer leverages cutting-edge DeFi primitives...

Prefer verbs:

- allocate
- guarantee
- burst
- reserve
- schedule
- consume
- protect
- execute
- reject

Avoid hype terms:

- revolutionary
- groundbreaking
- game-changing
- AI-powered
- next-gen
- unprecedented

unless objectively necessary.

---

# 27. Design Tokens — Suggested CSS

```css
:root {
  --aq-blue: #0000ff;
  --aq-white: #ffffff;
  --aq-ink: #070707;

  --aq-gray-950: #0a0a0a;
  --aq-gray-900: #141414;
  --aq-gray-800: #202020;
  --aq-gray-700: #303030;
  --aq-gray-600: #525252;
  --aq-gray-500: #737373;
  --aq-gray-400: #a3a3a3;
  --aq-gray-300: #d4d4d4;
  --aq-gray-200: #e5e5e5;
  --aq-gray-100: #f5f5f5;
  --aq-gray-50: #fafafa;

  --aq-success: #22c55e;
  --aq-warning: #f59e0b;
  --aq-danger: #ef4444;

  /* semantic aliases: components should use these, not unexplained hex values */
  --surface: var(--aq-gray-950);
  --surface-raised: var(--aq-gray-900);
  --border: var(--aq-gray-800);
  --text: var(--aq-white);
  --text-muted: var(--aq-gray-400);
  --state-allowed: var(--aq-success);
  --state-constrained: var(--aq-warning);
  --state-rejected: var(--aq-danger);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
}
```

Use the blue token primarily on marketing surfaces and primary actions. Keep application
surfaces calm and near-black. Semantic aliases make state meaning reviewable and prevent a
status from depending on an unexplained raw color.

---

# 28. Frontend Styling Rule

Until protocol functionality is final:

> **Usable > polished.**

Final-pass frontend priorities:

1. information hierarchy
2. correctness of displayed protocol state
3. demo clarity
4. responsive behavior
5. typography
6. spacing
7. brand consistency
8. motion
9. decorative polish

Never let animation or styling delay working protocol evidence.

---

# 29. Things We Explicitly Do Not Do

## Branding

- no gradients
- no curved-ribbon logo
- no Aqua whale copy
- no modified 1inch logo
- no shield
- no droplet
- no generic crypto hexagon
- no “AQ” monogram inside a coin
- no random dots
- no 3D

## UI

- no glassmorphism
- no neon bloom
- no giant border-radius everywhere
- no decorative charts
- no permanent animated background
- no excessive card nesting
- no token-price dashboard unless directly required

## Copy

- no hype-first positioning
- no fake benchmark values
- no vague “capital optimization” claim without measurement

---

# 30. Design QA Checklist

Before final submission:

### Logo

- [ ] owner-supplied `AquaQoS.svg` is used unchanged as the master
- [ ] master has no added gradients, glow, shadow, texture or particles
- [ ] transparent master remains legible on approved dark, blue and light surfaces
- [ ] any favicon/avatar crop preserves the supplied silhouette
- [ ] no generated or placeholder logo is shipped
- [ ] legible at 24–32px
- [ ] clearly distinct from 1inch marks

### Landing

- [ ] product understood in 10 seconds
- [ ] one main headline
- [ ] one scheduling visualization
- [ ] primary CTA obvious
- [ ] no generic DeFi artwork

### App

- [ ] real backing visually distinguished from virtual/advertised liquidity
- [ ] guaranteed vs burst distinction is obvious
- [ ] current safe capacity visible
- [ ] allow/reject result unambiguous
- [ ] technical detail available but not overwhelming

### Proof

- [ ] contract addresses
- [ ] test results
- [ ] benchmark
- [ ] architecture
- [ ] source
- [ ] onchain evidence
- [ ] custom SwapVM primitive clearly named

### Accessibility

- [ ] keyboard works
- [ ] focus visible
- [ ] contrast checked
- [ ] mobile checked
- [ ] reduced motion checked
- [ ] state never communicated by color alone

---

# 31. Final Visual Identity Summary

AquaQoS should look like:

> **1inch Aqua's confident simplicity applied to infrastructure scheduling.**

The visual formula:

```text
ELECTRIC BLUE
+
PURE WHITE
+
NEAR BLACK
+
STRAIGHT GEOMETRY
+
SQUARE LIQUIDITY UNITS
+
LARGE NEGATIVE SPACE
+
PRECISE DATA
```

The conceptual formula:

```text
3 strategy inputs
        ↓
shared capital
        ↓
scheduler
        ↓
guaranteed + burst capacity
```

The mark, UI, animation, architecture diagrams, and demo should all tell that same story.

---

# 32. Final Brand Rule

If a visual element cannot be explained in terms of:

- shared liquidity
- strategies
- guaranteed capacity
- burst capacity
- scheduling
- execution

remove it.

AquaQoS should look **designed from the protocol outward**, not decorated after the protocol was built.
