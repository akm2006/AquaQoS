# Eight-strategy lifecycle gas measurement

Run `pnpm exec hardhat run scripts/check-lifecycle-gas.mjs` after the locked install.
This creates two isolated Cancun EVMs and writes
[raw receipt evidence](../benchmarks/raw/lifecycle-gas-v1.json). Local addresses and
transactions are ephemeral. All amounts are raw TokenMock units.

Each fixture registers eight strategies with virtual balances 1000/1000. Initial
guarantees are either 1000 (zero baselines) or 500 (both guarantees and baselines
nonzero). Each operation is a separately mined transaction; preceding state reads
cannot warm its storage. Token A backing is 8000; token B starts at 3999 to test
late activation failures, then is topped up to 8000.

The matrix covers registration positions 1..8, ninth-strategy rejection, activation
with insufficient second-token backing, sixteen baseline writes followed by atomic
revert, successful zero-to-nonzero/unchanged/nonzero-to-nonzero/nonzero-to-zero baseline
writes, both-token guarantee zero/nonzero transitions, pause, full/empty docking,
withdrawal before docking, partial withdrawal to a fresh recipient and full remaining
withdrawal to an existing recipient. Assertions check exact error bytes and rollback,
registered hashes/configuration/virtual markers, empty registration array after dock,
unchanged inventory on docking and actual withdrawal deltas.

Provenance retains source commit/dirty flag, source/config/lock hashes, installed
versions, compiler settings/build IDs, deployed runtime hashes, submitted calldata,
mined transaction data, receipts, block gas limits and observed before/after state.
Compile settings are checked against solc 0.8.30, optimizer enabled/700, viaIR, Cancun.

Gas is full receipt `gasUsed`, including intrinsic gas and refunds. Report maxima as
the highest **measured charged gas in this matrix**. They are not an upper bound for
all token implementations, calldata, callbacks, storage histories or future EVM rules.
Deployments/setup are retained but excluded from lifecycle maxima. Rejections have
their own category. Existing swap measurements remain in TRANSACTION_VALIDATION;
this script does not establish worst-case swap/callback gas or financial gas costs.

Results and review status are recorded in STATUS and TRANSACTION_VALIDATION. The
raw report hashes this methodology; later result-only updates belong in those files.
