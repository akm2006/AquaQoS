// SPDX-License-Identifier: LicenseRef-Degensoft-SwapVM-1.1
pragma solidity 0.8.30;

// AquaQoS extension created 2026-09-06; upstream SwapVM: © Degensoft Ltd 2025.
// Pinned source and corresponding license: docs/THIRD_PARTY.md and LICENSES/SwapVM-1.1.txt.

import { AquaSwapVMRouter } from "@1inch/swap-vm/src/routers/AquaSwapVMRouter.sol";
import { Context, ContextLib } from "@1inch/swap-vm/src/libs/VM.sol";
import { FeeMeta } from "@1inch/swap-vm/src/libs/ProtocolFee.sol";

// Separate ABI avoids a circular router/vault import. Only the vault owns policy state.
interface ICapacityVault {
    function checkCapacity(bytes32 hash, address token, uint256 debit) external view;
    function reserve(bytes32 hash, address token, uint256 debit) external;
}

/// @notice Fee-free, canonical AquaQoS programs; official SwapVM performs settlement.
contract AquaQoSRouter is AquaSwapVMRouter {
    using ContextLib for Context;
    uint8 public constant CAPACITY_GUARD = 0x05;
    error InvalidGuardProgram();
    error UnsupportedFees();

    constructor(address aqua, address owner)
        AquaSwapVMRouter(aqua, address(0), owner, "AquaQoS", "0.1") {}

    function _runOpcode(Context memory ctx, uint256 opcode, bytes calldata args) internal override {
        if (opcode != CAPACITY_GUARD) {
            super._runOpcode(ctx, opcode, args);
            return;
        }
        bytes calldata program = ctx.program();
        // 05 00 | 50 00 (XYC) | 02 08 (salt) | uint64 salt.
        require(ctx.vm.nextPC == 2 && args.length == 0 && program.length == 14
            && bytes6(program[:6]) == hex"050050000208", InvalidGuardProgram());
        ctx.runLoop();
        require(ctx.vm.nextPC == program.length, InvalidGuardProgram());
        require(FeeMeta.unwrap(ctx.fee.meta) == 0 && ctx.fee.feeTotal == 0
            && ctx.fee.receivers.length == 0, UnsupportedFees());
        ICapacityVault vault = ICapacityVault(ctx.query.maker);
        if (ctx.vm.isStaticContext) {
            vault.checkCapacity(ctx.query.orderHash, ctx.query.tokenOut, ctx.swap.amountOut);
        } else {
            vault.reserve(ctx.query.orderHash, ctx.query.tokenOut, ctx.swap.amountOut);
        }
    }
}
