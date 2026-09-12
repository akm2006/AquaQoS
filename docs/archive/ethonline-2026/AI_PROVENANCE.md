# Development provenance

AquaQoS is an AI-assisted project. This disclosure identifies the material use of AI tools
without treating model output as evidence. Technical claims are supported by pinned upstream
source, executable tests, retained benchmark reports, and public transaction receipts.

## Recorded contributions

| Area | Recorded contribution | Evidence |
| --- | --- | --- |
| Product direction | The owner supplied the initial thesis, source-of-truth hierarchy, scope constraints, acceptance requirements, release boundaries, and frontend direction. | Sanitized owner prompts and Git history |
| Protocol and verification | Codex assisted research, Solidity implementation, test coverage, benchmark/replay tooling, deployment documentation, and release checks. | `contracts/`, `test/`, `scripts/`, `benchmarks/`, `deployments/` |
| Product surface | Claude Code contributed the early Next.js scaffold; Anik (`ansu555`) contributed the visual system, documentation surface, README, and SVG work in refactor commits `d9bb690` through `0c3c126`. Codex later integrated that work with the protocol evidence. | Git history and `web/` |
| Review | AI-assisted read-only reviews informed bounded internal checks. They are not an external audit or production certification. | `docs/SECURITY_REVIEW_*.md` and release records |

## Retained event artifacts

The sanitized prompts in [`prompts/`](prompts/) retain the project specifications and planning
directions used during ETHOnline 2026. They are compliance and provenance material, not the
current technical specification; the pinned sources, tests, and evidence documents take
precedence when they differ.

No credentials, private runtime configuration, or private account data are retained in this
archive. Do not infer unrecorded human implementation, testing, or review from commit authorship
or tool use. The owner must accurately describe any additional human contribution in the event
submission.
