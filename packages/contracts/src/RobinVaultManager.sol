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

contract RobinVaultManager is Initializable, UUPSUpgradeable, OwnableUpgradeable, AccessControlUpgradeable, PausableUpgradeable {
    using Clones for address;

    // ============ Roles ============
    bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');

    // ============ Config (settable by owner) ============
    address public implementation; // PolymarketAaveStakingVault logic contract
    uint256 public protocolFeeBps; // applied to all new vaults
    address public underlyingUsd; // USDC (collateral)
    address public ctf; // Conditional Tokens Framework
    address public aavePool; // Aave v3 Pool
    address public aaveDataProv; // Aave data provider

    // ============ Registry ============
    mapping(bytes32 => address) public vaultOf; // conditionId => vault
    address[] public allVaults;

    // ============ Events / Errors ============
    event ConfigUpdated(address implementation, uint256 protocolFeeBps, address underlyingUsd, address ctf, address aavePool, address aaveDataProv);
    event VaultCreated(bytes32 indexed conditionId, address indexed vault, address indexed creator);
    event ProtocolFeeClaimed(bytes32 indexed conditionId, address indexed vault, address indexed to, uint256 when);

    error VaultExists(bytes32 conditionId, address vault);
    error ZeroAddress();
    error InvalidFee(uint256 bps);
    error UnknownVault(address vault);

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
        address _ctf,
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
        _setCtf(_ctf);
        _setAavePool(_aavePool);
        _setAaveDataProv(_aaveDataProv);

        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUsd, ctf, aavePool, aaveDataProv);
    }

    // ============ Permissionless creation ============
    /// @notice Create a vault for `conditionId`. Reverts if one already exists.
    function createVault(bytes32 conditionId) external whenNotPaused returns (address vault) {
        if (vaultOf[conditionId] != address(0)) revert VaultExists(conditionId, vaultOf[conditionId]);

        // Deterministic address per (implementation, salt, deployer=this manager proxy)
        vault = Clones.cloneDeterministic(implementation, conditionId);

        // Initialize: the vault will set `owner = address(this)` because msg.sender is the manager
        IPolymarketAaveStakingVault(vault).initialize(protocolFeeBps, underlyingUsd, ctf, conditionId, aavePool, aaveDataProv);

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
        if (vault == address(0)) revert VaultExists(conditionId, address(0)); // reuse for "no vault yet"
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
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUsd, ctf, aavePool, aaveDataProv);
    }

    function setProtocolFeeBps(uint256 _bps) external onlyOwner {
        _setProtocolFeeBps(_bps);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUsd, ctf, aavePool, aaveDataProv);
    }

    function setUnderlyingUsd(address _underlying) external onlyOwner {
        _setUnderlyingUsd(_underlying);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUsd, ctf, aavePool, aaveDataProv);
    }

    function setCtf(address _ctf) external onlyOwner {
        _setCtf(_ctf);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUsd, ctf, aavePool, aaveDataProv);
    }

    function setAavePool(address _pool) external onlyOwner {
        _setAavePool(_pool);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUsd, ctf, aavePool, aaveDataProv);
    }

    function setAaveDataProv(address _dp) external onlyOwner {
        _setAaveDataProv(_dp);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUsd, ctf, aavePool, aaveDataProv);
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

    function _setCtf(address _c) internal {
        if (_c == address(0)) revert ZeroAddress();
        ctf = _c;
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
}
