// SPDX-License-Identifier: LicenseRef-Degensoft-SwapVM-1.1
pragma solidity 0.8.30;

import { ISwapVM } from "@1inch/swap-vm/src/interfaces/ISwapVM.sol";
import { ITakerCallbacks } from "@1inch/swap-vm/src/interfaces/ITakerCallbacks.sol";
import { SwapVM } from "@1inch/swap-vm/src/SwapVM.sol";
import { TakerTraitsLib } from "@1inch/swap-vm/src/libs/TakerTraits.sol";
import { MakerTraitsLib } from "@1inch/swap-vm/src/libs/MakerTraits.sol";
import { AquaStrategyBuilders } from "@1inch/swap-vm/test/base/AquaStrategyBuilders.sol";
import { FeeBuilders } from "@1inch/swap-vm/test/utils/FeeBuilders.sol";
import { FeeFlatIn, FeeFlatOut } from "@1inch/swap-vm/src/instructions/FeeFlat.sol";
import { IERC20 } from "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";
import { TransientLockUnsafeLib } from "@1inch/solidity-utils/contracts/libraries/TransientLockUnsafe.sol";
import { AquaQoSRouter } from "../contracts/AquaQoSRouter.sol";
import { AquaQoSVault } from "../contracts/AquaQoSVault.sol";

// Separate harness avoids the pinned compiler's large-test-contract assembly limit.
contract AquaQoSCallbacksTest is AquaStrategyBuilders, ITakerCallbacks {
    using MakerTraitsLib for *;
    AquaQoSRouter private router;
    AquaQoSVault private vault;
    ISwapVM.Order private first;
    ISwapVM.Order private second;
    bytes32 private h1;
    bytes32 private h2;
    bool private direction;
    bool private routerPays;
    bool private omitPayment;
    uint256 private inCalls;
    uint256 private outCalls;
    uint256 private inputAtOutputCallback;

    function setUp() public override {
        super.setUp();
        router = new AquaQoSRouter(address(aqua), address(this));
        vault = new AquaQoSVault(address(aqua), address(router), address(tokenA), address(tokenB), address(this));
        tokenA.mint(address(vault), 1000);
        tokenB.mint(address(vault), 1000);
        h1 = vault.createStrategy(1, 1000, 1000, 500, 500);
        h2 = vault.createStrategy(2, 1000, 1000, 500, 500);
        vault.activate();
        first = vault.order(1);
        second = vault.order(2);
        tokenA.mint(address(this), 5000);
        tokenB.mint(address(this), 5000);
        tokenA.approve(address(router), type(uint256).max);
        tokenB.approve(address(router), type(uint256).max);
    }

    function _data(bool takerFirst, bool callbacks, bool payThroughRouter) private view returns (bytes memory) {
        TakerTraitsLib.Args memory args;
        args.taker = address(this);
        args.isAToB = direction;
        args.isFirstTransferFromTaker = takerFirst;
        args.useTransferFromAndAquaPush = payThroughRouter;
        args.hasPreTransferInCallback = callbacks;
        args.hasPreTransferOutCallback = callbacks;
        return TakerTraitsLib.build(args);
    }

    function testFuzz_callbacksProtectPendingOutput(bool takerFirst, bool aToB, bool payThroughRouter) public {
        direction = aToB;
        routerPays = payThroughRouter;
        bytes memory data = _data(takerFirst, true, routerPays);
        (uint256 quotedIn, uint256 quotedOut,) = router.asView().quote(first, 500, data);
        assertEq(quotedIn, 1000); assertEq(quotedOut, 500);
        assertEq(inCalls, 0); assertEq(outCalls, 0);
        assertEq(vault.reservation(h1, aToB ? address(tokenB) : address(tokenA)), 0);
        (uint256 paid, uint256 received,) = router.swap(first, 500, data);
        assertEq(paid, quotedIn); assertEq(received, quotedOut);
        assertEq(inCalls, 1); assertEq(outCalls, 1);
        assertEq(inputAtOutputCallback, takerFirst ? 2000 : 1000);
        IERC20 input = IERC20(aToB ? address(tokenA) : address(tokenB));
        IERC20 output = IERC20(aToB ? address(tokenB) : address(tokenA));
        assertEq(input.balanceOf(address(vault)), 3000);
        assertEq(output.balanceOf(address(vault)), 0);
        assertEq(input.balanceOf(address(this)), 3000);
        assertEq(output.balanceOf(address(this)), 6000);
        assertEq(input.balanceOf(address(router)), 0); assertEq(output.balanceOf(address(router)), 0);
        assertEq(input.balanceOf(address(aqua)), 0); assertEq(output.balanceOf(address(aqua)), 0);
        bytes32[2] memory hashes_ = [h1, h2];
        for (uint256 i; i < 2; i++) {
            (uint256 vi, uint256 vo) = aqua.safeBalances(address(vault), address(router), hashes_[i], address(input), address(output));
            assertEq(vi, 2000); assertEq(vo, 500);
            assertEq(vault.reservation(hashes_[i], address(output)), 500);
            assertEq(vault.reservation(hashes_[i], address(input)), 0);
        }
        // g=500, baseline=500: both output entitlements consumed; input sum is 1000.
        assertGe(input.allowance(address(vault), address(aqua)), 1000);
        assertGe(output.allowance(address(vault), address(aqua)), 1000);
        assertFalse(vault.paused());
    }

    function testFuzz_missingOuterPaymentRollsBackNestedFill(bool aToB) public {
        direction = aToB;
        omitPayment = true;
        bytes32 beforeState = _state();
        bytes memory data = _data(false, true, false);
        // Catch normally: an outer expectRevert conflicts with callback-local expectations.
        try router.swap(first, 500, data) {
            fail("unpaid outer fill must revert");
        } catch (bytes memory reason) {
            assertEq(reason, abi.encodeWithSelector(SwapVM.AquaBalanceInsufficientAfterTakerPush.selector, 1000, 1000, 1000));
        }
        assertEq(_state(), beforeState, "outer failure rolls back both fills and callback state");
        vault.pause();
        vault.activate(); // The failed fill must not leave the lifecycle touched flag set.
        // Retry the same order: its upstream lock and vault reservations must also roll back.
        omitPayment = false;
        router.swap(first, 500, data);
        assertEq(inCalls, 1); assertEq(outCalls, 1);
    }

    function preTransferInCallback(address maker_, address, address tokenIn, address, uint256 amountIn,
        uint256, bytes32 hash, bytes calldata) external override {
        require(msg.sender == address(router));
        inCalls++;
        if (!routerPays && !omitPayment) {
            IERC20(tokenIn).approve(address(aqua), amountIn);
            aqua.push(maker_, address(router), hash, tokenIn, amountIn);
        }
    }

    function preTransferOutCallback(address, address, address tokenIn, address tokenOut, uint256,
        uint256, bytes32 hash, bytes calldata) external override {
        require(msg.sender == address(router));
        outCalls++;
        assertEq(hash, h1);
        assertEq(vault.reservation(h1, tokenOut), 500);
        assertEq(IERC20(tokenOut).balanceOf(address(vault)), 1000);
        inputAtOutputCallback = IERC20(tokenIn).balanceOf(address(vault));
        // The callback contract is the real owner; no authorization prank hides the touched check.
        vm.expectRevert(AquaQoSVault.TransactionInProgress.selector); vault.pause();
        vm.expectRevert(AquaQoSVault.TransactionInProgress.selector); vault.activate();
        vm.expectRevert(AquaQoSVault.TransactionInProgress.selector); vault.dockAll();
        vm.expectRevert(AquaQoSVault.TransactionInProgress.selector); vault.setGuarantees(h1, 0, 0);
        vm.expectRevert(AquaQoSVault.TransactionInProgress.selector); vault.createStrategy(3, 1000, 1000, 0, 0);
        vm.expectRevert(AquaQoSVault.TransactionInProgress.selector); vault.withdraw(tokenOut, address(this), 1);
        bytes memory nestedData = _data(true, false, true);
        vm.expectRevert(TransientLockUnsafeLib.UnexpectedLock.selector);
        router.swap(first, 500, nestedData);
        bytes32 beforeRejection = _state();
        vm.expectRevert(abi.encodeWithSelector(AquaQoSVault.InsufficientCapacity.selector, 1000, 1001));
        router.swap(second, 501, nestedData);
        assertEq(_state(), beforeRejection);
        (uint256 paid, uint256 received,) = router.swap(second, 500, nestedData);
        assertEq(paid, 1000); assertEq(received, 500);
        assertEq(IERC20(tokenOut).balanceOf(address(vault)), 500);
        assertEq(vault.reservation(h2, tokenOut), 500);
    }

    function _state() private view returns (bytes32 digest) {
        address[4] memory accounts = [address(vault), address(this), address(router), address(aqua)];
        for (uint256 i; i < accounts.length; i++) {
            digest = keccak256(abi.encode(digest, tokenA.balanceOf(accounts[i]), tokenB.balanceOf(accounts[i]),
                tokenA.allowance(accounts[i], address(aqua)), tokenB.allowance(accounts[i], address(aqua)),
                tokenA.allowance(accounts[i], address(router)), tokenB.allowance(accounts[i], address(router))));
        }
        bytes32[2] memory hashes_ = [h1, h2];
        for (uint256 i; i < 2; i++) {
            (uint256 a, uint8 ma) = aqua.rawBalances(address(vault), address(router), hashes_[i], address(tokenA));
            (uint256 b, uint8 mb) = aqua.rawBalances(address(vault), address(router), hashes_[i], address(tokenB));
            digest = keccak256(abi.encode(digest, a, b, ma, mb,
                vault.reservation(hashes_[i], address(tokenA)), vault.reservation(hashes_[i], address(tokenB))));
        }
        return keccak256(abi.encode(digest, vault.paused(), inCalls, outCalls, inputAtOutputCallback));
    }

    function test_canonicalTraitsExcludeAllMakerHooksAndCustomReceiver() public view {
        ISwapVM.Order memory order_ = vault.order(1);
        assertFalse(order_.traits.hasPreTransferInHook()); assertFalse(order_.traits.hasPostTransferInHook());
        assertFalse(order_.traits.hasPreTransferOutHook()); assertFalse(order_.traits.hasPostTransferOutHook());
        assertFalse(order_.traits.shouldUnwrapWeth());
        assertTrue(order_.traits.useAquaInsteadOfSignature());
        assertEq(order_.traits.receiver(order_.maker), address(vault));
        assertEq(router.hash(order_), h1);
        assertEq(address(router.WETH()), address(0));
    }

    function test_feeInstructionsCannotBeAddedInsideGuard() public {
        bytes[8] memory fees = [FeeBuilders.protocolFeeIn(100000, address(this)),
            FeeBuilders.protocolFeeOut(100000, address(this)),
            FeeBuilders.protocolSurplusIn(100000, address(this), 0),
            FeeBuilders.protocolSurplusOut(100000, address(this), 0),
            FeeFlatIn.build(100000), FeeFlatOut.build(100000),
            FeeBuilders.protocolProviderIn(address(this)), FeeBuilders.protocolProviderOut(address(this))];
        MakerTraitsLib.Args memory args;
        args.maker = address(this); args.tokenA = address(tokenA); args.tokenB = address(tokenB);
        args.useAquaInsteadOfSignature = true;
        address[] memory tokens = new address[](2);
        tokens[0] = address(tokenA); tokens[1] = address(tokenB);
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1000; amounts[1] = 1000;
        bytes memory data = _data(true, false, true);
        ISwapVM viewRouter = router.asView();
        for (uint256 i; i < fees.length; i++) {
            // Ordinary makers can ship arbitrary programs; wrapper validation still rejects them.
            args.program = bytes.concat(hex"0500", fees[i], hex"500002080000000000000001");
            ISwapVM.Order memory order_ = MakerTraitsLib.build(args);
            bytes32 hash = aqua.ship(address(router), abi.encode(order_), tokens, amounts);
            assertEq(hash, router.hash(order_));
            bytes32 beforeState = _state();
            vm.expectRevert(AquaQoSRouter.InvalidGuardProgram.selector);
            viewRouter.quote(order_, 100, data);
            vm.expectRevert(AquaQoSRouter.InvalidGuardProgram.selector);
            router.swap(order_, 100, data);
            assertEq(_state(), beforeState);
            (uint256 a, uint256 b) = aqua.safeBalances(address(this), address(router), hash, address(tokenA), address(tokenB));
            assertEq(a, 1000); assertEq(b, 1000);
        }
    }
}
