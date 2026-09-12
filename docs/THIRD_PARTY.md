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

2026-09-12 design direction: an owner-supplied external visual reference informed only the
product's high-level layout language. No reference files, images, components, copy, or metrics
were copied into `web/`; AquaQoS reimplements its own evidence-backed surface with the supplied
logo and project colors. The owner must confirm that this limited reference use is permitted
before public release. This is a release gate, not a legal clearance opinion.

2026-09-13 branding decision: AquaQoS remains the only product logo in the app and README.
Third-party services are named in text links where their contracts or source verification are
shown. No 1inch, Sourcify, Etherscan or other provider logo is included because written
permission has not been obtained; retain this boundary unless current brand terms clearly
authorize a specific use. The app footer includes the Aqua and SwapVM attribution notices above.
