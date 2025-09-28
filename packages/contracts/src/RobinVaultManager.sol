// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';
import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { UUPSUpgradeable } from '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import { AccessControlUpgradeable } from '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import { PausableUpgradeable } from '@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol';

import { IPolymarketAaveStakingVault } from './interfaces/IPolymarketAaveStakingVault.sol';
import { IRobinVaultPausing } from './interfaces/IRobinVaultPausing.sol';
import { IRegistry } from './interfaces/IRegistry.sol';
import { IConditionalTokens } from './interfaces/IConditionalTokens.sol';

contract RobinVaultManager is Initializable, UUPSUpgradeable, OwnableUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    using Clones for address;

    // ============ Roles ============
    bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');

    // ============ Config (settable by owner) ============
    address public implementation; // PolymarketAaveStakingVault logic contract
    uint256 public protocolFeeBps; // applied to all new vaults
    address public underlyingUsd; // USDC (collateral)
    address public polymarketWcol; // WCOL (collateral)
    address public ctf; // Conditional Tokens Framework
    address public negRiskAdapter; // Polymarket WCOL adapter
    address public negRiskCtfExchange; // Polymarket NegRisk CTF exchange
    address public ctfExchange; // Polymarket CTF exchange
    address public aavePool; // Aave v3 Pool
    address public aaveDataProv; // Aave data provider

    bool public checkPoolResolved; // whether to check if the Aave pool is resolved; only needed for tests

    // ============ Registry ============
    mapping(bytes32 => address) public vaultOf; // conditionId => vault
    address[] public allVaults;

    // ============ Storage Gap ============
    uint256[50] private __gap;

    // ============ Events / Errors ============
    event ConfigUpdated(
        address implementation,
        uint256 protocolFeeBps,
        address underlyingUsd,
        address polymarketWcol,
        address ctf,
        address negRiskAdapter,
        address negRiskCtfExchange,
        address ctfExchange,
        address aavePool,
        address aaveDataProv
    );
    event VaultCreated(bytes32 indexed conditionId, address indexed vault, address indexed creator);
    event ProtocolFeeClaimed(bytes32 indexed conditionId, address indexed vault, address indexed to, uint256 when);

    error VaultExists(bytes32 conditionId, address vault);
    error ZeroAddress();
    error InvalidFee(uint256 bps);
    error UnknownVault(address vault);
    error InvalidCollateral(address collateral);
    error UnlistedCondition(bytes32 conditionId);

    // -------- constructor (logic) --------
    /// @dev Prevent initializing the logic contract directly.
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // -------- initializer (proxy) --------
    function initialize(
        address _implementation,
        uint256 _protocolFeeBps,
        address _underlyingUsd,
        address _polymarketWcol,
        address _ctf,
        address _negRiskAdapter,
        address _negRiskCtfExchange,
        address _ctfExchange,
        address _aavePool,
        address _aaveDataProv
    ) external initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();

        _setImplementation(_implementation);
        _setProtocolFeeBps(_protocolFeeBps);
        _setUnderlyingUsd(_underlyingUsd);
        _setPolymarketWcol(_polymarketWcol);
        _setCtf(_ctf);
        _setNegRiskAdapter(_negRiskAdapter);
        _setNegRiskCtfExchange(_negRiskCtfExchange);
        _setCtfExchange(_ctfExchange);
        _setAavePool(_aavePool);
        _setAaveDataProv(_aaveDataProv);

        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        checkPoolResolved = true;

        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    // ============ Permissionless creation ============
    /// @notice Create a vault for `conditionId`. Reverts if one already exists.
    function createVault(bytes32 conditionId) external whenNotPaused returns (address vault) {
        if (vaultOf[conditionId] != address(0)) revert VaultExists(conditionId, vaultOf[conditionId]);

        // Decide if the vault is a NegRisk vault based on the conditionId
        bool negRisk = _decideVaultMode(conditionId);
        address collateral = negRisk ? polymarketWcol : underlyingUsd;

        // Deterministic address per (implementation, salt, deployer=this manager proxy)
        vault = Clones.cloneDeterministic(implementation, conditionId);

        // Initialize: the vault will set `owner = address(this)` because msg.sender is the manager
        IPolymarketAaveStakingVault(vault).initialize(
            protocolFeeBps, underlyingUsd, ctf, conditionId, negRiskAdapter, negRisk, collateral, checkPoolResolved, aavePool, aaveDataProv
        );

        // Sanity: manager must be the vault owner
        require(IPolymarketAaveStakingVault(vault).owner() == address(this), 'manager not owner');

        vaultOf[conditionId] = vault;
        allVaults.push(vault);

        emit VaultCreated(conditionId, vault, msg.sender);
    }

    // =========== View functions ============

    /// @notice Predict the address for the vault of `conditionId` (before creation).
    function predictVaultAddress(bytes32 conditionId) external view returns (address predicted) {
        predicted = Clones.predictDeterministicAddress(implementation, conditionId, address(this));
    }

    function allVaultsLength() external view returns (uint256) {
        return allVaults.length;
    }

    function vaultForConditionId(bytes32 conditionId) external view returns (address) {
        return vaultOf[conditionId];
    }

    // ============ Protocol fee claim ============
    /// @notice Claim protocol fees from the vault for `conditionId` to `to`.
    function claimProtocolFee(bytes32 conditionId, address to) external onlyOwner {
        address vault = vaultOf[conditionId];
        if (vault == address(0)) revert UnknownVault(vault);
        IPolymarketAaveStakingVault(vault).harvestProtocolYield(to);
        emit ProtocolFeeClaimed(conditionId, vault, to, block.timestamp);
    }

    /// @notice Claim protocol fees from a vault address that is registered.
    function claimProtocolFeeFrom(address vault, address to) external onlyOwner {
        // cheap membership check
        if (vault == address(0)) revert UnknownVault(vault);
        IPolymarketAaveStakingVault(vault).harvestProtocolYield(to);
        emit ProtocolFeeClaimed(bytes32(0), vault, to, block.timestamp);
    }

    // ============ Vault Pause controls (via manager) ============
    // Master switch
    function pauseAllFrom(address vault) external onlyRole(PAUSER_ROLE) {
        if (vault == address(0)) revert UnknownVault(vault);
        IRobinVaultPausing(vault).pauseAll();
    }

    function unpauseAllFrom(address vault) external onlyRole(PAUSER_ROLE) {
        if (vault == address(0)) revert UnknownVault(vault);
        IRobinVaultPausing(vault).unpauseAll();
    }

    // Deposits
    function pauseDepositsFrom(address vault) external onlyRole(PAUSER_ROLE) {
        if (vault == address(0)) revert UnknownVault(vault);
        IRobinVaultPausing(vault).pauseDeposits();
    }

    function unpauseDepositsFrom(address vault) external onlyRole(PAUSER_ROLE) {
        if (vault == address(0)) revert UnknownVault(vault);
        IRobinVaultPausing(vault).unpauseDeposits();
    }

    // Withdrawals
    function pauseWithdrawalsFrom(address vault) external onlyRole(PAUSER_ROLE) {
        if (vault == address(0)) revert UnknownVault(vault);
        IRobinVaultPausing(vault).pauseWithdrawals();
    }

    function unpauseWithdrawalsFrom(address vault) external onlyRole(PAUSER_ROLE) {
        if (vault == address(0)) revert UnknownVault(vault);
        IRobinVaultPausing(vault).unpauseWithdrawals();
    }

    // UnlockYield
    function pauseUnlockYieldFrom(address vault) external onlyRole(PAUSER_ROLE) {
        if (vault == address(0)) revert UnknownVault(vault);
        IRobinVaultPausing(vault).pauseUnlockYield();
    }

    function unpauseUnlockYieldFrom(address vault) external onlyRole(PAUSER_ROLE) {
        if (vault == address(0)) revert UnknownVault(vault);
        IRobinVaultPausing(vault).unpauseUnlockYield();
    }

    // ============ Vault Deposit Limit control ============
    function setVaultDepositLimit(address vault, uint256 newLimit) external onlyOwner {
        if (vault == address(0)) revert UnknownVault(vault);
        IPolymarketAaveStakingVault(vault).setDepositLimit(newLimit);
    }

    // ============ Manager Pause control ============
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ============ Owner config setters ============
    function setImplementation(address _implementation) external onlyOwner {
        _setImplementation(_implementation);
        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    function setProtocolFeeBps(uint256 _bps) external onlyOwner {
        _setProtocolFeeBps(_bps);
        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    function setUnderlyingUsd(address _underlying) external onlyOwner {
        _setUnderlyingUsd(_underlying);
        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    function setPolymarketWcol(address _wcol) external onlyOwner {
        _setPolymarketWcol(_wcol);
        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    function setCtf(address _ctf) external onlyOwner {
        _setCtf(_ctf);
        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    function setNegRiskAdapter(address _negRiskAdapter) external onlyOwner {
        _setNegRiskAdapter(_negRiskAdapter);
        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    function setNegRiskCtfExchange(address _negRiskCtfExchange) external onlyOwner {
        _setNegRiskCtfExchange(_negRiskCtfExchange);
        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    function setCtfExchange(address _ctfExchange) external onlyOwner {
        _setCtfExchange(_ctfExchange);
        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    function setAavePool(address _pool) external onlyOwner {
        _setAavePool(_pool);
        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    function setAaveDataProv(address _dp) external onlyOwner {
        _setAaveDataProv(_dp);
        emit ConfigUpdated(
            implementation,
            protocolFeeBps,
            underlyingUsd,
            polymarketWcol,
            ctf,
            negRiskAdapter,
            negRiskCtfExchange,
            ctfExchange,
            aavePool,
            aaveDataProv
        );
    }

    // ============ Internal setters ============
    function _setImplementation(address _impl) internal {
        if (_impl == address(0)) revert ZeroAddress();
        implementation = _impl;
    }

    function _setProtocolFeeBps(uint256 _bps) internal {
        if (_bps > 10_000) revert InvalidFee(_bps);
        protocolFeeBps = _bps;
    }

    function _setUnderlyingUsd(address _u) internal {
        if (_u == address(0)) revert ZeroAddress();
        underlyingUsd = _u;
    }

    function _setPolymarketWcol(address _wcol) internal {
        if (_wcol == address(0)) revert ZeroAddress();
        polymarketWcol = _wcol;
    }

    function _setCtf(address _c) internal {
        if (_c == address(0)) revert ZeroAddress();
        ctf = _c;
    }

    function _setNegRiskAdapter(address _na) internal {
        if (_na == address(0)) revert ZeroAddress();
        negRiskAdapter = _na;
    }

    function _setNegRiskCtfExchange(address _nre) internal {
        if (_nre == address(0)) revert ZeroAddress();
        negRiskCtfExchange = _nre;
    }

    function _setCtfExchange(address _ce) internal {
        if (_ce == address(0)) revert ZeroAddress();
        ctfExchange = _ce;
    }

    function _setAavePool(address _p) internal {
        if (_p == address(0)) revert ZeroAddress();
        aavePool = _p;
    }

    function _setAaveDataProv(address _dp) internal {
        if (_dp == address(0)) revert ZeroAddress();
        aaveDataProv = _dp;
    }

    // ============ UUPS authorization ============
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner { }

    // ============ Internal ============

    /// @dev Decide vault mode from a conditionId by consulting the exchanges' registries.
    ///      Returns true  = NegRisk (uses WCOL collateral)
    ///              false = Regular  (uses USDC.e collateral)
    function _decideVaultMode(bytes32 conditionId) internal view returns (bool isNegRisk) {
        IConditionalTokens ictf = IConditionalTokens(ctf);

        // Build collections once
        bytes32 yesColl = ictf.getCollectionId(bytes32(0), conditionId, 1); // YES bitmask
        bytes32 noColl = ictf.getCollectionId(bytes32(0), conditionId, 2); // NO  bitmask

        // Check NegRisk (WCOL-backed) first and early-return if listed
        uint256 yesId = ictf.getPositionId(polymarketWcol, yesColl);
        uint256 noId = ictf.getPositionId(polymarketWcol, noColl);
        bool negRiskListed = _listedOn(negRiskCtfExchange, yesId, noId, conditionId) || _listedOn(negRiskCtfExchange, noId, yesId, conditionId);

        // Otherwise check Regular (USDC.e-backed)
        yesId = ictf.getPositionId(underlyingUsd, yesColl);
        noId = ictf.getPositionId(underlyingUsd, noColl);
        bool regularListed = _listedOn(ctfExchange, yesId, noId, conditionId) || _listedOn(ctfExchange, noId, yesId, conditionId);

        assert(!(negRiskListed && regularListed)); // Should never be listed on both exchanges
        if (negRiskListed) {
            return true; // NegRisk → WCOL
        } else if (regularListed) {
            return false; // Regular → USDC.e
        }

        // If neither exchange recognizes the IDs yet, the market isn't listed on-chain.
        revert UnlistedCondition(conditionId);
    }

    function _listedOn(address ex, uint256 id, uint256 complement, bytes32 cond) internal view returns (bool) {
        if (ex == address(0)) return false;
        // Must be registered AND point to the same conditionId
        try IRegistry(ex).getConditionId(id) returns (bytes32 c) {
            if (c != cond) return false;
        } catch {
            return false;
        }

        // Also require a registered complement that maps to the same condition
        try IRegistry(ex).getComplement(id) returns (uint256 comp) {
            if (comp == 0) return false;
            if (comp != complement) return false;
            try IRegistry(ex).getConditionId(comp) returns (bytes32 c2) {
                return c2 == cond;
            } catch {
                return false;
            }
        } catch {
            return false;
        }
    }
}
