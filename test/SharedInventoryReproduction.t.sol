// SPDX-License-Identifier: LicenseRef-Degensoft-SwapVM-1.1
pragma solidity 0.8.30;

import { SafeERC20 } from "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";
import { ISwapVM } from "@1inch/swap-vm/src/interfaces/ISwapVM.sol";
import { TakerTraitsLib } from "@1inch/swap-vm/src/libs/TakerTraits.sol";
import { XYCSwap } from "@1inch/swap-vm/src/instructions/XYCSwap.sol";
import { Salt } from "@1inch/swap-vm/src/instructions/Controls.sol";
import { AquaSwapVMTest } from "@1inch/swap-vm/test/base/AquaSwapVMTest.sol";

contract SharedInventoryReproductionTest is AquaSwapVMTest {
    function _takerData(bool isAToB) internal view returns (bytes memory) {
        return TakerTraitsLib.build(TakerTraitsLib.Args({
            taker: address(taker),
            isExactIn: false,
            shouldUnwrapWeth: false,
            isStrictThresholdAmount: false,
            isFirstTransferFromTaker: true,
            useTransferFromAndAquaPush: true,
            isAToB: isAToB,
            allowPartialFill: false,
            threshold: "",
            to: address(0),
            deadline: 0,
            hasPreTransferInCallback: false,
            hasPreTransferOutCallback: false,
            preTransferInHookData: "",
            postTransferInHookData: "",
            preTransferOutHookData: "",
            postTransferOutHookData: "",
            preTransferInCallbackData: "",
            preTransferOutCallbackData: "",
            instructionsArgs: "",
            signature: ""
        }));
    }

    function _order(uint64 salt) internal view returns (ISwapVM.Order memory) {
        return createStrategy(bytes.concat(XYCSwap.build(), Salt.build(salt)));
    }

    function _ship(ISwapVM.Order memory order) internal returns (bytes32) {
        return shipStrategy(order, tokenA, tokenB, 1000, 1000);
    }

    function test_sharedInventory_doubleCommitment_failsOnlyAtSettlement() public {
        ISwapVM.Order memory first = _order(1);
        ISwapVM.Order memory sibling = _order(2);
        bytes32 firstHash = _ship(first);
        bytes32 siblingHash = _ship(sibling);

        tokenB.mint(maker, 1000);
        tokenA.mint(address(taker), 5000);
        vm.prank(address(taker));
        tokenA.approve(address(swapVM), type(uint256).max);

        (uint256 quotedIn, uint256 quotedOut,) = swapVM.quote(
            first,
            600,
            _takerData(true)
        );
        assertEq(quotedIn, 1500);
        assertEq(quotedOut, 600);

        taker.swap(first, 600, _takerData(true));
        (uint256 firstA, uint256 firstB) = getAquaBalances(firstHash);
        assertEq(firstA, 2500);
        assertEq(firstB, 400);
        assertEq(tokenB.balanceOf(maker), 400);
        (uint256 siblingABefore, uint256 siblingBBefore) = getAquaBalances(siblingHash);
        assertEq(siblingABefore, 1000);
        assertEq(siblingBBefore, 1000);
        assertGe(tokenB.allowance(maker, address(aqua)), 500);

        (uint256 siblingIn, uint256 siblingOut,) = swapVM.quote(
            sibling,
            500,
            _takerData(true)
        );
        assertEq(siblingIn, 1000);
        assertEq(siblingOut, 500);

        uint256 makerInputBefore = tokenA.balanceOf(maker);
        uint256 takerInputBefore = tokenA.balanceOf(address(taker));
        uint256 makerOutputBefore = tokenB.balanceOf(maker);
        uint256 takerOutputBefore = tokenB.balanceOf(address(taker));
        vm.expectRevert(SafeERC20.SafeTransferFromFailed.selector);
        taker.swap(sibling, 500, _takerData(true));

        // The input transfer and Aqua.push are atomic with the failed output pull.
        assertEq(tokenA.balanceOf(maker), makerInputBefore);
        assertEq(tokenA.balanceOf(address(taker)), takerInputBefore);
        assertEq(tokenB.balanceOf(maker), makerOutputBefore);
        assertEq(tokenB.balanceOf(address(taker)), takerOutputBefore);
        (uint256 siblingA, uint256 siblingB) = getAquaBalances(siblingHash);
        assertEq(siblingA, 1000);
        assertEq(siblingB, 1000);
    }

    function test_settlement_failure_can_be_repaired_by_restoring_inventory() public {
        ISwapVM.Order memory order = _order(3);
        bytes32 orderHash = _ship(order);
        tokenB.mint(maker, 400);
        tokenA.mint(address(taker), 5000);
        vm.prank(address(taker));
        tokenA.approve(address(swapVM), type(uint256).max);

        vm.expectRevert(SafeERC20.SafeTransferFromFailed.selector);
        taker.swap(order, 500, _takerData(true));

        tokenB.mint(maker, 100);
        taker.swap(order, 500, _takerData(true));
        (, uint256 balanceOut) = getAquaBalances(orderHash);
        assertEq(balanceOut, 500);
    }
}
