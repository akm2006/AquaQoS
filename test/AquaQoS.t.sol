// SPDX-License-Identifier: LicenseRef-Degensoft-SwapVM-1.1
pragma solidity 0.8.30;

import { ISwapVM } from "@1inch/swap-vm/src/interfaces/ISwapVM.sol";
import { ITakerCallbacks } from "@1inch/swap-vm/src/interfaces/ITakerCallbacks.sol";
import { TakerTraitsLib } from "@1inch/swap-vm/src/libs/TakerTraits.sol";
import { AquaStrategyBuilders } from "@1inch/swap-vm/test/base/AquaStrategyBuilders.sol";
import { IAqua } from "@1inch/aqua/src/interfaces/IAqua.sol";
import { IERC20 } from "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";
import { SafeERC20 } from "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";
import { TokenMock } from "@1inch/solidity-utils/contracts/mocks/TokenMock.sol";

import { AquaQoSRouter } from "../contracts/AquaQoSRouter.sol";
import { AquaQoSVault } from "../contracts/AquaQoSVault.sol";

contract DecrementingApprovalToken is TokenMock {
    constructor() TokenMock("Decrementing approval", "DEC") {}

    function _spendAllowance(address account, address spender, uint256 value) internal override {
        uint256 allowed = allowance(account, spender);
        require(allowed >= value);
        _approve(account, spender, allowed - value, false);
    }
}

contract AquaQoSTest is AquaStrategyBuilders, ITakerCallbacks {
    AquaQoSRouter internal router;
    AquaQoSVault internal vault;
    address internal taker = address(0xBEEF);
    ISwapVM.Order private _nestedOrder;
    bytes private _nestedData;
    uint256 private _nestedAmount;
    bool private _attemptNested;
    bool private _attemptPause;
    bytes4 private _nestedSelector;
    bytes4 private _pauseSelector;
    uint256 private _inventoryDuringCallback;

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

    function test_exactBoundarySucceeds_andOneUnitOverIsRejected() public {
        (ISwapVM.Order memory first,, bytes32 firstHash,) = _createPair();
        _fundAndApprove(5000);

        (uint256 quotedIn, uint256 quotedOut, bytes32 quotedHash) = router.asView().quote(first, 500, _takerData(false, true, true));
        assertEq(quotedHash, firstHash);
        assertEq(quotedIn, 1000);
        assertEq(quotedOut, 500);
        assertEq(vault.reservation(firstHash, address(tokenB)), 0, "quote must not reserve");

        vm.expectRevert(abi.encodeWithSelector(AquaQoSVault.InsufficientCapacity.selector, 1000, 1001));
        vault.checkCapacity(firstHash, address(tokenB), 501);

        vm.prank(taker);
        router.swap(first, 500, _takerData(false, true, true));
        assertEq(tokenB.balanceOf(taker), 5500);
        assertEq(vault.reservation(firstHash, address(tokenB)), 500, "same transaction retains reservation");
    }

    function test_exactInAndReverseExactOutMoveRealTokens() public {
        (ISwapVM.Order memory first, ISwapVM.Order memory second, bytes32 firstHash, bytes32 secondHash) = _createPair();
        _fundAndApprove(5000);

        (uint256 inA, uint256 outB, bytes32 hashA) = router.asView().quote(first, 500, _takerData(true, true, true));
        assertEq(inA, 500);
        assertEq(outB, 333);
        assertEq(hashA, firstHash);
        vm.prank(taker);
        router.swap(first, 500, _takerData(true, true, true));
        assertEq(tokenA.balanceOf(taker), 4500);
        assertEq(tokenB.balanceOf(taker), 5333);

        (uint256 inB, uint256 outA, bytes32 hashB) = router.asView().quote(second, 500, _takerData(false, false, true));
        assertEq(inB, 1000);
        assertEq(outA, 500);
        assertEq(hashB, secondHash);
        vm.prank(taker);
        router.swap(second, 500, _takerData(false, false, true));
        assertEq(tokenB.balanceOf(taker), 4333);
        assertEq(tokenA.balanceOf(taker), 5000);
    }

    function test_staleQuoteIsRecheckedAfterSiblingUsesBurst() public {
        (ISwapVM.Order memory first, ISwapVM.Order memory second,,) = _createPair(1200, 500);
        _fundAndApprove(5000);
        (uint256 staleIn, uint256 staleOut,) = router.asView().quote(second, 600, _takerData(false, true, true));
        assertEq(staleIn, 1500);
        assertEq(staleOut, 600);

        vm.prank(taker);
        router.swap(first, 700, _takerData(false, true, true));
        assertEq(vault.inventory(address(tokenB)), 500);

        vm.prank(taker);
        vm.expectRevert(abi.encodeWithSelector(AquaQoSVault.InsufficientCapacity.selector, 500, 1300));
        router.swap(second, 600, _takerData(false, true, true));
    }

    function test_pauseDockWithdrawAndUnauthorizedReserve() public {
        (,, bytes32 firstHash,) = _createPair();
        vm.prank(taker);
        vm.expectRevert(AquaQoSVault.Unauthorized.selector);
        vault.pause();

        vault.pause();
        vm.expectRevert(AquaQoSVault.InvalidConfiguration.selector);
        vault.withdraw(address(tokenA), address(this), 1);
        vault.dockAll();
        (, uint8 count) = aqua.rawBalances(address(vault), address(router), firstHash, address(tokenA));
        assertEq(count, 0xff);
        uint256 before = tokenA.balanceOf(address(this));
        vault.withdraw(address(tokenA), address(this), 1000);
        assertEq(tokenA.balanceOf(address(this)), before + 1000);

        vm.prank(taker);
        vm.expectRevert(AquaQoSVault.Unauthorized.selector);
        vault.reserve(firstHash, address(tokenB), 1);
    }

    function test_duplicateNinthAndPausedGuardAreRejected() public {
        bytes32 firstHash = vault.createStrategy(1, 1000, 1000, 0, 0);
        vm.expectRevert();
        vault.createStrategy(1, 1000, 1000, 0, 0);
        for (uint64 salt = 2; salt <= 8; salt++) vault.createStrategy(salt, 1000, 1000, 0, 0);
        vm.expectRevert(AquaQoSVault.InvalidConfiguration.selector);
        vault.createStrategy(9, 1000, 1000, 0, 0);
        vm.expectRevert(AquaQoSVault.GroupPaused.selector);
        vault.checkCapacity(firstHash, address(tokenA), 1);
    }

    function testFuzz_exactEntitlementsFitAndOneMoreDoesNot(uint32 rawGuarantee) public {
        uint256 guarantee = bound(uint256(rawGuarantee), 1, 500);
        (,, bytes32 firstHash,) = _createPair(guarantee * 2, guarantee);
        vault.checkCapacity(firstHash, address(tokenB), guarantee);
        vm.expectRevert(abi.encodeWithSelector(
            AquaQoSVault.InsufficientCapacity.selector, guarantee * 2, guarantee * 2 + 1
        ));
        vault.checkCapacity(firstHash, address(tokenB), guarantee + 1);
    }

    function _useDecrementingTokens() internal {
        tokenA = new DecrementingApprovalToken();
        tokenB = new DecrementingApprovalToken();
        if (address(tokenA) > address(tokenB)) (tokenA, tokenB) = (tokenB, tokenA);
        vault = new AquaQoSVault(address(aqua), address(router), address(tokenA), address(tokenB), address(this));
    }

    function test_allowanceFloorProtectsDirectReplenishment() public {
        _useDecrementingTokens();
        (ISwapVM.Order memory first,, bytes32 firstHash, bytes32 secondHash) = _createPair();
        _fundAndApprove(5000);
        assertEq(tokenB.allowance(address(vault), address(aqua)), type(uint256).max);
        // Fault injection models an allowance reached after cumulative max-decrement trading.
        // Production vault exposes no arbitrary approval operation.
        vm.prank(address(vault));
        tokenB.approve(address(aqua), 1499);
        ISwapVM viewRouter = router.asView();
        vm.expectRevert(abi.encodeWithSelector(AquaQoSVault.InsufficientCapacity.selector, 1499, 1500));
        viewRouter.quote(first, 500, _takerData(false, true, true));
        vm.prank(taker);
        vm.expectRevert(abi.encodeWithSelector(AquaQoSVault.InsufficientCapacity.selector, 1499, 1500));
        router.swap(first, 500, _takerData(false, true, true));
        assertEq(vault.reservation(firstHash, address(tokenB)), 0);

        vm.prank(address(vault));
        tokenB.approve(address(aqua), 1500);
        vm.prank(taker);
        router.swap(first, 500, _takerData(false, true, true));
        assertEq(tokenB.allowance(address(vault), address(aqua)), 1000);
        tokenB.mint(address(this), 500);
        tokenB.approve(address(aqua), 500);
        aqua.push(address(vault), address(router), firstHash, address(tokenB), 500);
        (uint256 restored,) = aqua.rawBalances(address(vault), address(router), firstHash, address(tokenB));
        assertEq(restored, 1000);
        assertEq(vault.inventory(address(tokenB)), 1000, "both full guarantees backed after direct push");
        assertEq(vault.reservation(firstHash, address(tokenB)), 500);
        vm.expectRevert(abi.encodeWithSelector(AquaQoSVault.InsufficientCapacity.selector, 1000, 1501));
        vault.checkCapacity(secondHash, address(tokenB), 1);
    }

    function test_nestedSuccessfulOutputsPreserveAllowanceFloor() public {
        _useDecrementingTokens();
        (ISwapVM.Order memory first, ISwapVM.Order memory second, bytes32 firstHash, bytes32 secondHash) = _createPair(2000, 500);
        tokenA.mint(address(this), 5000);
        tokenA.approve(address(router), type(uint256).max);
        vm.prank(address(vault));
        tokenB.approve(address(aqua), 2000);
        taker = address(this);
        _nestedOrder = second;
        _nestedAmount = 500;
        _nestedData = _takerData(false, true, true);
        _attemptNested = true;
        router.swap(first, 500, _callbackData(true));
        assertEq(tokenB.balanceOf(address(this)), 1000, "both nested outputs settled");
        assertEq(tokenB.allowance(address(vault), address(aqua)), 1000);
        assertEq(vault.reservation(firstHash, address(tokenB)), 500);
        assertEq(vault.reservation(secondHash, address(tokenB)), 500);
    }

    function test_failedSettlementRollsBackReservationAndTouchedFlag() public {
        (ISwapVM.Order memory first,, bytes32 firstHash,) = _createPair();
        _fundAndApprove(5000);
        vm.prank(taker);
        tokenA.approve(address(router), 0);
        vm.prank(taker);
        vm.expectRevert(SafeERC20.SafeTransferFromFailed.selector);
        router.swap(first, 500, _takerData(false, true, false));
        assertEq(tokenA.balanceOf(address(vault)), 1000);
        assertEq(tokenB.balanceOf(address(vault)), 1000);
        assertEq(tokenB.balanceOf(taker), 5000);
        (uint256 virtualB,) = aqua.rawBalances(address(vault), address(router), firstHash, address(tokenB));
        assertEq(virtualB, 1000);
        assertEq(vault.reservation(firstHash, address(tokenB)), 0);
        vault.pause(); // A reverted fill must not leave lifecycle locked.
        assertTrue(vault.paused());
    }

    function test_activationChecksBackingAndResetsAllBaselines() public {
        bytes32 hash = vault.createStrategy(1, 1000, 1000, 500, 500);
        tokenA.mint(address(vault), 500);
        tokenB.mint(address(vault), 499);
        vm.expectRevert(abi.encodeWithSelector(AquaQoSVault.InsufficientCapacity.selector, 499, 500));
        vault.activate();
        assertTrue(vault.paused());
        tokenB.mint(address(vault), 1);
        vault.setGuarantees(hash, 400, 400);
        vault.activate();
        (,, uint256 baselineA, uint256 baselineB,) = vault.strategies(hash);
        assertEq(baselineA, 600);
        assertEq(baselineB, 600);
        vm.expectRevert(AquaQoSVault.UnknownStrategy.selector);
        vault.checkCapacity(bytes32(uint256(1)), address(tokenB), 1);
        vm.expectRevert(AquaQoSVault.VirtualCapacityExceeded.selector);
        vault.checkCapacity(hash, address(tokenB), type(uint256).max);
    }

    function test_ownerCallbackCannotPauseAndNestedSiblingIsRejectedBeforeTransfer() public {
        _callbackGuardTest(true, 1000);
    }

    function test_ownerCallbackCannotPauseAndNestedSiblingIsRejectedAfterOutputDebit() public {
        _callbackGuardTest(false, 500);
    }

    function _callbackGuardTest(bool takerFirst, uint256 expectedInventoryDuringCallback) internal {
        (ISwapVM.Order memory first, ISwapVM.Order memory second,,) = _createPair();
        tokenA.mint(address(this), 5000);
        tokenA.approve(address(router), type(uint256).max);
        _nestedOrder = second;
        _nestedAmount = 501;
        _nestedData = _takerData(false, true, true);
        _attemptNested = true;
        _attemptPause = true;
        _nestedSelector = bytes4(0);
        _pauseSelector = bytes4(0);

        router.swap(first, 500, _callbackData(takerFirst));
        assertEq(_nestedSelector, AquaQoSVault.InsufficientCapacity.selector);
        assertEq(_pauseSelector, AquaQoSVault.TransactionInProgress.selector);
        assertEq(_inventoryDuringCallback, expectedInventoryDuringCallback);
        assertEq(tokenB.balanceOf(address(this)), 500);
    }

    function _callbackData(bool takerFirst) internal view returns (bytes memory) {
        TakerTraitsLib.Args memory args;
        args.taker = address(this);
        args.isAToB = true;
        args.isFirstTransferFromTaker = takerFirst;
        args.hasPreTransferInCallback = true;
        return TakerTraitsLib.build(args);
    }

    function preTransferInCallback(
        address maker,
        address,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256,
        bytes32 orderHash,
        bytes calldata
    ) external override {
        require(msg.sender == address(router));
        _inventoryDuringCallback = vault.inventory(tokenOut);
        if (_attemptPause) {
            try vault.pause() {} catch (bytes memory reason) { _pauseSelector = _selector(reason); }
        }
        if (_attemptNested) {
            try router.swap(_nestedOrder, _nestedAmount, _nestedData) {} catch (bytes memory reason) {
                _nestedSelector = _selector(reason);
            }
        }
        IERC20(tokenIn).approve(address(aqua), amountIn);
        aqua.push(maker, address(router), orderHash, tokenIn, amountIn);
    }

    function preTransferOutCallback(
        address, address, address, address, uint256, uint256, bytes32, bytes calldata
    ) external override {}

    function _selector(bytes memory reason) private pure returns (bytes4 selector) {
        if (reason.length >= 4) assembly ("memory-safe") { selector := mload(add(reason, 32)) }
    }
}
