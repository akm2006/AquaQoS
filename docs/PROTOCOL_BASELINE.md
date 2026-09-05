# Source-level protocol baseline

Status: inspected, **not executable proof**. Pins: [sources.lock.json](../sources.lock.json).

## Aqua

`src/Aqua.sol` keys virtual balances by maker/app/hash/token. `ship` hashes the supplied
bytes and stores amounts without moving inventory or checking allowance/backing. `pull`
uses the caller as app, reduces only that strategy/token balance and calls token
`safeTransferFrom(maker,to,amount)`. `push` increases the selected active balance and
transfers from its caller to maker. Failure reverts the transaction; assert rollback in tests.
`safeBalances` checks active token markers, not real funding. `rawBalances` returns amount
and token-count marker; zero means unregistered, 255 docked. No onchain enumeration API
is exposed by this mapping; any scheduler needs a bounded explicit set or another proven
membership mechanism. Events can support offchain discovery, not complete onchain enforcement.

## Current SwapVM extension path

`src/routers/AquaSwapVMRouter.sol` inherits SwapVM/AquaOpcodes; `_dispatch` invokes virtual
`_runOpcode(ctx,opcode,args)`. A subclass can handle a custom opcode there and delegate
existing instructions to the original implementation. Do not assume `_dispatch` itself can
be overridden again: the concrete router override is not marked virtual.
`src/libs/OpcodeList.sol` assigns banked one-byte opcodes; 0xf0–0xff are reserved.
No opcode has been selected for AquaQoS.

`src/libs/VM.sol` parses `[opcode byte][argument-length byte][arguments]` in `runLoop`.
Context exposes maker, taker, orderHash, tokenIn/out, exact-in flag, balanceIn/out and
amountIn/out; current fee bookkeeping is in `ctx.fee`. The paper's `amountNetPulled`
register is not present in inspected current `SwapRegisters`; never code against that example.

Both `quote(order,amount,takerTraitsAndData)` and `swap` seed Aqua balances and run the
same program. Aqua order identity is `keccak256(abi.encode(order))`. Quote marks static
context; use static-call execution for quote tests. A quote is not a reservation and
cannot promise success after intervening state changes.

Native `src/instructions/Extruction.sol` already permits an external instruction target,
passing query/registers and accepting updated registers/PC. Quote calls the view interface;
swap can change state. It warns of repeated-call divergence. This may avoid a router fork
but does not itself implement sibling scheduling or eliminate downstream callbacks.

## Settlement hazard to resolve before implementation

`SwapVM.swap`: lock per order -> read balances -> run program -> validate traits -> transfer
in/out in taker-selected order -> unlock. Transfer helpers execute maker hooks and taker
callbacks; output fee pulls precede principal output pull. Thus a guard's pre-transfer read
may be invalidated by nested sibling activity, a hook or an external token interaction.
Wrapping fee instructions can also finalize registers after an inner guard has returned.
The eventual capacity condition must cover final total maker-token debit and every permitted
path. Reject unsafe configurations/programs or enforce a stronger boundary; do not assert
atomic protection merely because transactions themselves are atomic.

## Working questions and falsification

1. Define guarantee as consumable remaining entitlement or fixed protected floor; do not
   repeatedly reserve already-consumed guarantees or claim all floors survive their own use.
2. Consider `min(balance, allowance)` as transferable inventory for standard tokens, then
   model reserve and sibling obligations without underflow. Decide if sibling obligation is
   bounded by current virtual balance. These are candidates, not final equations.
3. Prove restricted program placement, fee composition, lifecycle and cross-router closure.
4. Compare cooperative maker with minimal Vault that owns shipping/approvals/withdrawals.
   A Registry alone cannot stop unrelated apps or maker wallet transfers.
5. Measure external-read growth at several strategy counts and establish a maximum.
6. Do official hooks/Extruction already cover the desired policy? Is our contribution a
   useful policy plus proof rather than a new VM capability? Document honestly.

Smallest fallback if strong guarantees fail: explicitly cooperative-maker execution policy
protecting only registered strategies during controlled fills, with unsupported paths denied
and external-spend limitations visible. If no measurable value remains, record that and pivot
before UI work. Do not call a rejected trade a successful fill.
