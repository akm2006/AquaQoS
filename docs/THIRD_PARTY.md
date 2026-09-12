# Third-party provenance and release gate

2026-09-11: `deployments/ethereum-fork/upstream-aqua.json` retains unmodified published
compiler input for the older Ethereum AquaRouter, with original source/license notices,
to reproduce deployed bytecode. This is third-party source, not AquaQoS-authored code
or a replacement for main build pins. See [FORK_PROOF.md](FORK_PROOF.md).

Powered by Aqua — © Degensoft Ltd 2025.
Powered by SwapVM — © Degensoft Ltd 2025.

No upstream implementation files were copied during bootstrap. On 2026-09-06,
the custom router subclasses the pinned SwapVM router and the vault uses official
instruction builders. New Solidity files use the SwapVM license identifier;
upstream Aqua remains an unmodified dependency under its own license. Tests inherit
upstream helpers. Full custom license texts and original component notices are
retained in ../LICENSES; dependency lockfiles preserve exact resolved versions.
Original notices mention historical package versions: the actual installed
solidity-utils is 6.9.10 and Aqua is the pinned v1.0.0 commit. Preserve the original
notices rather than rewriting their historical labels. This component mapping
does not constitute legal clearance; publication obligations remain a release gate.
The source pins and research notes refer to official work; they are not AquaQoS inventions.

Inspected full [Aqua license](https://github.com/1inch/aqua/blob/81c26e4619ce21556ab02b3284ee2685de21fb18/LICENSES/Aqua-Source-1.1.txt)
and [SwapVM license](https://github.com/1inch/swap-vm/blob/f09a41e689240adc645934f965c8061749397cd2/LICENSES/SwapVM-1.1.txt).
These are custom source licenses, not blanket MIT/Apache grants. Their terms address
modifications, corresponding source, dated changes, attribution and reproducible builds.
Do not replace upstream headers or label the whole combined project MIT. Before copying,
distributing or deploying derivative code, retain its applicable full license and
THIRD_PARTY_NOTICES and resolve the component license mapping. Public publication still
requires the owner's approval. This records source terms, not a legal clearance opinion.

At dependency installation retain package notices and lockfiles. Mark copied template code
with original SHA/path and modification date. The template is reference-only at bootstrap.
Do not copy demo metrics, economic claims or whitepaper diagrams as our measured results.

2026-09-12 design reference: `brutalist-ai-saa-s-landing-page/` is an owner-supplied v0 export
("v0-design-brutalist-ai-saa-s") for a fictional AI product. It is kept on disk as a visual
reference only and is git-ignored. Its layout language — dot-grid ground, 2px frames, section
rules, bento grid, tier cards and marquee — informs the AquaQoS product surface (D025). No file,
image, component, copy line or metric was copied into `web/`: the sections were reimplemented
against AquaQoS evidence, its demo numbers and "SYS.INT" copy are absent, and its orange is
replaced by the logo's matte light blue. Geist Mono and Geist Pixel are loaded from the installed
`next/font/google`, not from the template.

**The export ships no license file, so its reuse rights are unresolved.** Confirm them before any
public publication of the product surface. This is a release gate alongside the component
license mapping above, and it is not a legal clearance opinion.
