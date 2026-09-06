// SPDX-License-Identifier: LicenseRef-Degensoft-SwapVM-1.1
pragma solidity 0.8.30;

// AquaQoS extension created 2026-09-06; upstream SwapVM: © Degensoft Ltd 2025.
// Pinned source and corresponding license: docs/THIRD_PARTY.md and LICENSES/SwapVM-1.1.txt.

import { IAqua } from "@1inch/aqua/src/interfaces/IAqua.sol";
import { ISwapVM } from "@1inch/swap-vm/src/interfaces/ISwapVM.sol";
import { MakerTraitsLib } from "@1inch/swap-vm/src/libs/MakerTraits.sol";
import { XYCSwap } from "@1inch/swap-vm/src/instructions/XYCSwap.sol";
import { Salt } from "@1inch/swap-vm/src/instructions/Controls.sol";
import { SafeERC20, IERC20 } from "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";
import { AquaQoSRouter, ICapacityVault } from "./AquaQoSRouter.sol";

/// @notice One immutable token pair, canonical programs, and a bounded protected group.
/// @dev Only standard ERC-20 tokens are supported. See docs/CAPACITY_GUARD_SPEC.md.
contract AquaQoSVault is ICapacityVault {
    using SafeERC20 for IERC20;
    IAqua public immutable AQUA;
    AquaQoSRouter public immutable ROUTER;
    address public immutable owner;
    address public immutable tokenA;
    address public immutable tokenB;
    uint256 public constant MAX_STRATEGIES = 8;
    bool public paused = true;
    bool transient private _touched;

    struct Strategy {
        uint256 guaranteeA;
        uint256 guaranteeB;
        uint256 baselineA;
        uint256 baselineB;
        bool active;
    }
    mapping(bytes32 => Strategy) public strategies;
    bytes32[] public hashes;
    error Unauthorized();
    error InvalidConfiguration();
    error GroupPaused();
    error GroupActive();
    error TransactionInProgress();
    error UnknownStrategy();
    error InvalidToken();
    error VirtualCapacityExceeded();
    error InsufficientCapacity(uint256 available, uint256 required);
    event StrategyCreated(bytes32 indexed hash, uint256 guaranteeA, uint256 guaranteeB);
    event GroupStateChanged(bool paused);
    event CapacityReserved(bytes32 indexed hash, address indexed token, uint256 debit);

    modifier lifecycle() {
        require(msg.sender == owner, Unauthorized());
        require(!_touched, TransactionInProgress());
        _;
    }
    modifier whilePaused() {
        require(paused, GroupActive());
        _;
    }

    constructor(address aqua, address router, address a, address b, address owner_) {
        require(owner_ != address(0) && aqua.code.length > 0 && router.code.length > 0
            && a.code.length > 0 && b.code.length > 0 && a < b, InvalidConfiguration());
        require(address(AquaQoSRouter(payable(router)).AQUA()) == aqua, InvalidConfiguration());
        AQUA = IAqua(aqua);
        ROUTER = AquaQoSRouter(payable(router));
        tokenA = a;
        tokenB = b;
        owner = owner_;
        IERC20(a).forceApprove(aqua, type(uint256).max);
        IERC20(b).forceApprove(aqua, type(uint256).max);
    }

    function order(uint64 salt) public view returns (ISwapVM.Order memory) {
        MakerTraitsLib.Args memory args;
        args.maker = address(this);
        args.tokenA = tokenA;
        args.tokenB = tokenB;
        args.useAquaInsteadOfSignature = true;
        args.program = bytes.concat(hex"0500", XYCSwap.build(), Salt.build(salt));
        return MakerTraitsLib.build(args);
    }

    function createStrategy(uint64 salt, uint256 virtualA, uint256 virtualB, uint256 gA, uint256 gB)
        external lifecycle whilePaused returns (bytes32 hash)
    {
        require(hashes.length < MAX_STRATEGIES && virtualA > 0 && virtualB > 0
            && gA <= virtualA && gB <= virtualB, InvalidConfiguration());
        bytes memory encoded = abi.encode(order(salt));
        hash = keccak256(encoded);
        require(!strategies[hash].active, InvalidConfiguration());
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = virtualA;
        amounts[1] = virtualB;
        AQUA.ship(address(ROUTER), encoded, _tokens(), amounts);
        strategies[hash] = Strategy(gA, gB, virtualA - gA, virtualB - gB, true);
        hashes.push(hash);
        emit StrategyCreated(hash, gA, gB);
    }

    function setGuarantees(bytes32 hash, uint256 gA, uint256 gB) external lifecycle whilePaused {
        Strategy storage s = strategies[hash];
        require(s.active, UnknownStrategy());
        require(gA <= _virtual(hash, tokenA) && gB <= _virtual(hash, tokenB), InvalidConfiguration());
        s.guaranteeA = gA;
        s.guaranteeB = gB;
        // All baselines reset together on activate(), after backing is rechecked.
    }

    function activate() external lifecycle whilePaused {
        require(hashes.length > 0, InvalidConfiguration());
        uint256 totalA;
        uint256 totalB;
        for (uint256 i; i < hashes.length; i++) {
            Strategy storage s = strategies[hashes[i]];
            uint256 vA = _virtual(hashes[i], tokenA);
            uint256 vB = _virtual(hashes[i], tokenB);
            require(s.guaranteeA <= vA && s.guaranteeB <= vB, InvalidConfiguration());
            s.baselineA = vA - s.guaranteeA;
            s.baselineB = vB - s.guaranteeB;
            totalA += s.guaranteeA;
            totalB += s.guaranteeB;
        }
        _requireCapacity(tokenA, totalA);
        _requireCapacity(tokenB, totalB);
        paused = false;
        emit GroupStateChanged(false);
    }

    function pause() external lifecycle {
        paused = true;
        emit GroupStateChanged(true);
    }

    function dockAll() external lifecycle whilePaused {
        address[] memory tokens = _tokens();
        for (uint256 i; i < hashes.length; i++) {
            AQUA.dock(address(ROUTER), hashes[i], tokens);
            strategies[hashes[i]].active = false;
        }
        delete hashes;
    }

    function withdraw(address token, address to, uint256 amount) external lifecycle whilePaused {
        require(hashes.length == 0 && to != address(0), InvalidConfiguration());
        _validateToken(token);
        IERC20(token).safeTransfer(to, amount);
    }

    function checkCapacity(bytes32 hash, address token, uint256 debit) public view {
        require(!paused, GroupPaused());
        _validateToken(token);
        require(strategies[hash].active, UnknownStrategy());
        require(debit <= _virtual(hash, token), VirtualCapacityExceeded());
        uint256 required = debit;
        uint256 allowanceRequired = debit;
        // ponytail: O(8) reads; raise the bound only after measured gas review.
        for (uint256 i; i < hashes.length; i++) {
            bytes32 sibling = hashes[i];
            Strategy storage s = strategies[sibling];
            uint256 reserved = reservation(sibling, token);
            required += reserved;
            uint256 available = _subtract(_virtual(sibling, token), token == tokenA ? s.baselineA : s.baselineB);
            available = _subtract(available, reserved);
            if (sibling == hash) available = _subtract(available, debit);
            uint256 guarantee = token == tokenA ? s.guaranteeA : s.guaranteeB;
            allowanceRequired += guarantee + reserved;
            required += available < guarantee ? available : guarantee;
        }
        _requireCapacity(token, required);
        // Aqua.push can restore every entitlement but cannot restore transfer allowance.
        // ponytail: retain the full guarantee allowance floor even for infinite-approval tokens.
        uint256 allowed = IERC20(token).allowance(address(this), address(AQUA));
        require(allowed >= allowanceRequired, InsufficientCapacity(allowed, allowanceRequired));
    }

    function reserve(bytes32 hash, address token, uint256 debit) external {
        require(msg.sender == address(ROUTER), Unauthorized());
        checkCapacity(hash, token, debit);
        bytes32 slot = _reservationSlot(hash, token);
        uint256 updated = reservation(hash, token) + debit;
        assembly ("memory-safe") { tstore(slot, updated) }
        _touched = true;
        emit CapacityReserved(hash, token, debit);
    }

    function reservation(bytes32 hash, address token) public view returns (uint256 value) {
        bytes32 slot = _reservationSlot(hash, token);
        assembly ("memory-safe") { value := tload(slot) }
    }

    function inventory(address token) public view returns (uint256) {
        _validateToken(token);
        uint256 balance = IERC20(token).balanceOf(address(this));
        uint256 allowance = IERC20(token).allowance(address(this), address(AQUA));
        return balance < allowance ? balance : allowance;
    }

    function _requireCapacity(address token, uint256 required) private view {
        uint256 available = inventory(token);
        require(available >= required, InsufficientCapacity(available, required));
    }

    function _virtual(bytes32 hash, address token) private view returns (uint256 value) {
        uint8 count;
        (value, count) = AQUA.rawBalances(address(this), address(ROUTER), hash, token);
        require(count == 2, UnknownStrategy());
    }

    function _tokens() private view returns (address[] memory tokens) {
        tokens = new address[](2);
        tokens[0] = tokenA;
        tokens[1] = tokenB;
    }

    function _validateToken(address token) private view {
        require(token == tokenA || token == tokenB, InvalidToken());
    }

    function _reservationSlot(bytes32 hash, address token) private pure returns (bytes32) {
        return keccak256(abi.encode("AquaQoS.reservation.v0", hash, token));
    }

    function _subtract(uint256 a, uint256 b) private pure returns (uint256) {
        return a > b ? a - b : 0;
    }
}
