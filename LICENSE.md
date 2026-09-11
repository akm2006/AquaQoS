# AquaQoS licensing

AquaQoS is a mixed-license source repository. No single license applies to every file.

| Scope | License |
| --- | --- |
| `contracts/AquaQoSRouter.sol`, `contracts/AquaQoSVault.sol`, and modifications or extensions derived from SwapVM | Degensoft SwapVM License 1.1 (`LicenseRef-Degensoft-SwapVM-1.1`) |
| Retained Aqua source and compiler input, including `deployments/ethereum-fork/upstream-aqua.json` | Degensoft Aqua Source License 1.1 (`LicenseRef-Degensoft-Aqua-Source-1.1`) |
| Third-party packages, test helpers, and retained notices | The license identified in the relevant file, package, or `LICENSES/` notice |
| AquaQoS-authored web, scripts, tests, and documentation without a separate license notice | Copyright © 2026 AquaQoS contributors. All rights reserved. No license is granted beyond viewing and evaluating the published source. |

The complete retained upstream license texts and notices are in [`LICENSES/`](LICENSES/).
Component provenance, modification dates, build instructions, and source identities are
documented in [`docs/THIRD_PARTY.md`](docs/THIRD_PARTY.md),
[`sources.lock.json`](sources.lock.json), and the dependency lockfiles.

Do not infer that this repository is MIT-, Apache-, or OSI-licensed as a whole. A file-level
SPDX identifier or an applicable retained third-party notice takes precedence over this map.
This summary is informational and is not legal advice.

Powered by Aqua — © Degensoft Ltd 2025.

Powered by SwapVM — © Degensoft Ltd 2025.
