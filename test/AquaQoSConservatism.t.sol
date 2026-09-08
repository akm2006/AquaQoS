// SPDX-License-Identifier: LicenseRef-Degensoft-SwapVM-1.1
pragma solidity 0.8.30;

import { ISwapVM } from "@1inch/swap-vm/src/interfaces/ISwapVM.sol";
import { TakerTraitsLib } from "@1inch/swap-vm/src/libs/TakerTraits.sol";
import { MakerTraitsLib } from "@1inch/swap-vm/src/libs/MakerTraits.sol";
import { XYCSwap } from "@1inch/swap-vm/src/instructions/XYCSwap.sol";
import { Salt } from "@1inch/swap-vm/src/instructions/Controls.sol";
import { AquaStrategyBuilders } from "@1inch/swap-vm/test/base/AquaStrategyBuilders.sol";
import { DecrementingApprovalToken } from "./AquaQoS.t.sol";
import { AquaQoSRouter } from "../contracts/AquaQoSRouter.sol";
import { AquaQoSVault } from "../contracts/AquaQoSVault.sol";

// Separate harness keeps the pinned compiler below its test-contract assembly size limit.
contract AquaQoSConservatismTest is AquaStrategyBuilders {
    AquaQoSRouter internal router;
    AquaQoSVault internal vault;
    address internal taker = address(0xBEEF);

    function setUp() public override {
        super.setUp();
        router = new AquaQoSRouter(address(aqua), address(this));
        vault = new AquaQoSVault(address(aqua), address(router), address(tokenA), address(tokenB), address(this));
    }

    function _takerData(bool exactIn, bool aToB, bool takerFirst) internal view returns (bytes memory) {
        TakerTraitsLib.Args memory args;
        args.taker = taker;
        args.isExactIn = exactIn;
        args.isAToB = aToB;
        args.isFirstTransferFromTaker = takerFirst;
        args.useTransferFromAndAquaPush = true;
        return TakerTraitsLib.build(args);
    }

    function _createPair() internal returns (ISwapVM.Order memory first, ISwapVM.Order memory second, bytes32 firstHash, bytes32 secondHash) {
        return _createPair(1000, 500);
    }

    function _createPair(uint256 backing, uint256 guarantee)
        internal
        returns (ISwapVM.Order memory first, ISwapVM.Order memory second, bytes32 firstHash, bytes32 secondHash)
    {
        tokenA.mint(address(vault), backing);
        tokenB.mint(address(vault), backing);
        firstHash = vault.createStrategy(1, 1000, 1000, guarantee, guarantee);
        secondHash = vault.createStrategy(2, 1000, 1000, guarantee, guarantee);
        vault.activate();
        first = vault.order(1);
        second = vault.order(2);
    }

    function _fundAndApprove(uint256 amount) internal {
        tokenA.mint(taker, amount);
        tokenB.mint(taker, amount);
        vm.startPrank(taker);
        tokenA.approve(address(router), type(uint256).max);
        tokenB.approve(address(router), type(uint256).max);
        vm.stopPrank();
    }

    function _useDecrementingTokens() internal {
        tokenA = new DecrementingApprovalToken();
        tokenB = new DecrementingApprovalToken();
        if (address(tokenA) > address(tokenB)) (tokenA, tokenB) = (tokenB, tokenA);
        vault = new AquaQoSVault(address(aqua), address(router), address(tokenA), address(tokenB), address(this));
    }

    function _programOrder(address maker_, bytes memory program) private view returns (ISwapVM.Order memory) {
        MakerTraitsLib.Args memory args;
        args.maker = maker_;
        args.tokenA = address(tokenA);
        args.tokenB = address(tokenB);
        args.useAquaInsteadOfSignature = true;
        args.program = program;
        return MakerTraitsLib.build(args);
    }

    // Reference makers use ordinary unguarded XYC orders through the existing router.
    // Only normalized token/virtual state is comparable; no protected vault API is bypassed.
    function _referencePair(uint256 firstA, uint256 firstB, uint256 realA, uint256 realB, uint256 allowanceB)
        private returns (ISwapVM.Order memory first, ISwapVM.Order memory second, bytes32 h1, bytes32 h2)
    {
        address referenceMaker = address(0xCAFE);
        first = _programOrder(referenceMaker, bytes.concat(XYCSwap.build(), Salt.build(101)));
        second = _programOrder(referenceMaker, bytes.concat(XYCSwap.build(), Salt.build(102)));
        tokenA.mint(referenceMaker, realA);
        tokenB.mint(referenceMaker, realB);
        address[] memory tokens = new address[](2);
        tokens[0] = address(tokenA); tokens[1] = address(tokenB);
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = firstA; amounts[1] = firstB;
        vm.startPrank(referenceMaker);
        tokenA.approve(address(aqua), type(uint256).max);
        tokenB.approve(address(aqua), allowanceB);
        h1 = aqua.ship(address(router), abi.encode(first), tokens, amounts);
        amounts[0] = 1000; amounts[1] = 1000;
        h2 = aqua.ship(address(router), abi.encode(second), tokens, amounts);
        vm.stopPrank();
        assertEq(h1, router.hash(first));
        assertEq(h2, router.hash(second));
        assertEq(tokenA.balanceOf(referenceMaker), tokenA.balanceOf(address(vault)));
        assertEq(tokenB.balanceOf(referenceMaker), tokenB.balanceOf(address(vault)));
        assertEq(tokenA.allowance(referenceMaker, address(aqua)), tokenA.allowance(address(vault), address(aqua)));
        assertEq(tokenB.allowance(referenceMaker, address(aqua)), tokenB.allowance(address(vault), address(aqua)));
        bytes32[2] memory refs = [h1, h2];
        for (uint64 i; i < 2; i++) {
            (uint256 a, uint256 b) = aqua.safeBalances(referenceMaker, address(router), refs[i], address(tokenA), address(tokenB));
            (uint256 originalA, uint256 originalB) = aqua.safeBalances(address(vault), address(router),
                router.hash(vault.order(i + 1)), address(tokenA), address(tokenB));
            assertEq(a, originalA); assertEq(b, originalB);
        }
    }

    function _guardedState(bytes32 h1, bytes32 h2) private view returns (bytes32 digest) {
        address[4] memory accounts = [address(vault), taker, address(router), address(aqua)];
        for (uint256 i; i < accounts.length; i++) {
            digest = keccak256(abi.encode(digest,
                tokenA.balanceOf(accounts[i]), tokenB.balanceOf(accounts[i]),
                tokenA.allowance(accounts[i], address(aqua)), tokenB.allowance(accounts[i], address(aqua)),
                tokenA.allowance(accounts[i], address(router)), tokenB.allowance(accounts[i], address(router))));
        }
        bytes32[2] memory pair = [h1, h2];
        for (uint256 i; i < pair.length; i++) {
            (uint256 a, uint8 markerA) = aqua.rawBalances(address(vault), address(router), pair[i], address(tokenA));
            (uint256 b, uint8 markerB) = aqua.rawBalances(address(vault), address(router), pair[i], address(tokenB));
            digest = keccak256(abi.encode(digest, a, b, markerA, markerB,
                vault.reservation(pair[i], address(tokenA)), vault.reservation(pair[i], address(tokenB))));
        }
    }

    function test_settledReservationRejectsOtherwiseBackedSequentialFill() public {
        (ISwapVM.Order memory first, ISwapVM.Order memory second, bytes32 h1, bytes32 h2) = _createPair();
        _fundAndApprove(5000);
        vm.prank(taker);
        router.swap(first, 500, _takerData(false, true, true));
        assertEq(tokenA.balanceOf(address(vault)), 2000);
        assertEq(tokenB.balanceOf(address(vault)), 500);
        assertEq(vault.reservation(h1, address(tokenB)), 500);
        bytes32 beforeRejection = _guardedState(h1, h2);
        ISwapVM viewRouter = router.asView();
        bytes memory data = _takerData(false, true, true);
        bytes memory reason = abi.encodeWithSelector(AquaQoSVault.InsufficientCapacity.selector, 500, 1000);
        vm.expectRevert(reason);
        viewRouter.quote(second, 500, data);
        vm.prank(taker);
        vm.expectRevert(reason);
        router.swap(second, 500, data);
        assertEq(_guardedState(h1, h2), beforeRejection, "quote/swap rejection preserves all recorded state");

        // Recreate the settled economic state without an outstanding guard reservation.
        (ISwapVM.Order memory refFirst, ISwapVM.Order memory refSecond, bytes32 r1, bytes32 r2) =
            _referencePair(2000, 500, 2000, 500, type(uint256).max);
        uint256 takerA = tokenA.balanceOf(taker);
        uint256 takerB = tokenB.balanceOf(taker);
        (uint256 quotedIn, uint256 quotedOut,) = viewRouter.quote(refSecond, 500, data);
        assertEq(quotedIn, 1000); assertEq(quotedOut, 500);
        vm.prank(taker);
        router.swap(refSecond, 500, data);
        assertEq(tokenA.balanceOf(taker), takerA - 1000);
        assertEq(tokenB.balanceOf(taker), takerB + 500);
        assertEq(tokenA.balanceOf(refFirst.maker), 3000);
        assertEq(tokenB.balanceOf(refFirst.maker), 0);
        (uint256 a1, uint256 b1) = aqua.safeBalances(refFirst.maker, address(router), r1, address(tokenA), address(tokenB));
        (uint256 a2, uint256 b2) = aqua.safeBalances(refFirst.maker, address(router), r2, address(tokenA), address(tokenB));
        assertEq(a1, 2000); assertEq(b1, 500); // unchanged sibling
        assertEq(a2, 2000); assertEq(b2, 500);
        // Original g=500 and baseline=500: both B entitlements consumed; A total=1000.
        assertGe(tokenA.balanceOf(refFirst.maker), 1000);
        assertGe(tokenA.allowance(refFirst.maker, address(aqua)), 1000);
        assertGe(tokenB.allowance(refFirst.maker, address(aqua)), 1000);
        assertEq(vault.reservation(h1, address(tokenB)), 500, "original vault reservation still exists");
    }

    function test_finiteAllowanceRejectionProtectsFuturePushBacking() public {
        _useDecrementingTokens();
        (ISwapVM.Order memory first,, bytes32 h1, bytes32 h2) = _createPair();
        _fundAndApprove(5000);
        // Fault injection models cumulative allowance depletion, not a vault entrypoint.
        vm.prank(address(vault));
        tokenB.approve(address(aqua), 1499);
        bytes32 beforeRejection = _guardedState(h1, h2);
        bytes memory data = _takerData(false, true, true);
        vm.prank(taker);
        vm.expectRevert(abi.encodeWithSelector(AquaQoSVault.InsufficientCapacity.selector, 1499, 1500));
        router.swap(first, 500, data);
        assertEq(_guardedState(h1, h2), beforeRejection);

        (ISwapVM.Order memory refFirst,, bytes32 r1, bytes32 r2) = _referencePair(1000, 1000, 1000, 1000, 1499);
        (uint256 quotedIn, uint256 quotedOut,) = router.asView().quote(refFirst, 500, data);
        assertEq(quotedIn, 1000); assertEq(quotedOut, 500);
        vm.prank(taker);
        router.swap(refFirst, 500, data);
        assertEq(tokenA.balanceOf(refFirst.maker), 2000);
        assertEq(tokenB.balanceOf(refFirst.maker), 500);
        assertEq(tokenA.balanceOf(taker), 4000); assertEq(tokenB.balanceOf(taker), 5500);
        assertEq(tokenB.allowance(refFirst.maker, address(aqua)), 999);
        (uint256 inputFirst, uint256 inputSecond) = (
            _inputBalance(refFirst.maker, r1), _inputBalance(refFirst.maker, r2));
        assertEq(inputFirst, 2000); assertEq(inputSecond, 1000);
        assertGe(tokenA.allowance(refFirst.maker, address(aqua)), 1000);
        (uint256 firstB,) = aqua.rawBalances(refFirst.maker, address(router), r1, address(tokenB));
        (uint256 secondB,) = aqua.rawBalances(refFirst.maker, address(router), r2, address(tokenB));
        assertEq(firstB, 500); assertEq(secondB, 1000);
        // Immediate B entitlement is only 500 and is covered; the full 1000 floor is lost.
        assertGe(tokenB.allowance(refFirst.maker, address(aqua)), 500);
        vm.startPrank(taker);
        tokenB.approve(address(aqua), 500);
        aqua.push(refFirst.maker, address(router), r1, address(tokenB), 500);
        vm.stopPrank();
        (firstB,) = aqua.rawBalances(refFirst.maker, address(router), r1, address(tokenB));
        assertEq(firstB, 1000);
        assertEq(tokenB.balanceOf(refFirst.maker), 1000);
        assertEq(tokenB.balanceOf(taker), 5000);
        assertEq(tokenB.allowance(refFirst.maker, address(aqua)), 999, "push cannot replenish maker allowance");
        assertLt(tokenB.allowance(refFirst.maker, address(aqua)), 1000, "restored full entitlements underbacked");
    }

    function _inputBalance(address maker_, bytes32 hash) private view returns (uint256 value) {
        (value,) = aqua.rawBalances(maker_, address(router), hash, address(tokenA));
    }

}
