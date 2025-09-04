// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Clones } from '@openzeppelin/contracts/proxy/Clones.sol';
import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { UUPSUpgradeable } from '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

import { IPolymarketAaveStakingVault } from './interfaces/IPolymarketAaveStakingVault.sol';

contract VaultManagerUUPS is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    using Clones for address;

    // ============ Config (settable by owner) ============
    address public implementation; // PolymarketAaveStakingVault logic contract
    uint256 public protocolFeeBps; // applied to all new vaults
    address public underlyingUSD; // USDC (collateral)
    address public ctf; // Conditional Tokens Framework
    address public safeProxyFactory; // Polymarket proxy factory used by adapter
    address public aavePool; // Aave v3 Pool
    address public aaveDataProv; // Aave data provider

    // ============ Registry ============
    mapping(bytes32 => address) public vaultOf; // conditionId => vault
    address[] public allVaults;

    // ============ Events / Errors ============
    event ConfigUpdated(
        address implementation,
        uint256 protocolFeeBps,
        address underlyingUSD,
        address ctf,
        address safeProxyFactory,
        address aavePool,
        address aaveDataProv
    );
    event VaultCreated(bytes32 indexed conditionId, address indexed vault, address indexed creator);
    event ProtocolFeeClaimed(bytes32 indexed conditionId, address indexed vault, address indexed to, uint256 when);

    error VaultExists(bytes32 conditionId, address vault);
    error ZeroAddress();
    error InvalidFee(uint256 bps);
    error UnknownVault(address vault);

    // -------- constructor (logic) --------
    /// @dev Prevent initializing the logic contract directly.
    constructor() {
        _disableInitializers();
    }

    // -------- initializer (proxy) --------
    function initialize(
        address _implementation,
        uint256 _protocolFeeBps,
        address _underlyingUSD,
        address _ctf,
        address _safeProxyFactory,
        address _aavePool,
        address _aaveDataProv
    ) external initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        _setImplementation(_implementation);
        _setProtocolFeeBps(_protocolFeeBps);
        _setUnderlyingUSD(_underlyingUSD);
        _setCTF(_ctf);
        _setSafeProxyFactory(_safeProxyFactory);
        _setAavePool(_aavePool);
        _setAaveDataProv(_aaveDataProv);

        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUSD, ctf, safeProxyFactory, aavePool, aaveDataProv);
    }

    // ============ Permissionless creation ============
    /// @notice Create a vault for `conditionId`. Reverts if one already exists.
    function createVault(bytes32 conditionId) external returns (address vault) {
        if (vaultOf[conditionId] != address(0)) revert VaultExists(conditionId, vaultOf[conditionId]);

        // Deterministic address per (implementation, salt, deployer=this manager proxy)
        vault = Clones.cloneDeterministic(implementation, conditionId);

        // Initialize: the vault will set `owner = address(this)` because msg.sender is the manager
        IPolymarketAaveStakingVault(vault).initialize(protocolFeeBps, underlyingUSD, ctf, safeProxyFactory, conditionId, aavePool, aaveDataProv);

        // Sanity: manager must be the vault owner
        require(IPolymarketAaveStakingVault(vault).owner() == address(this), 'manager not owner');

        vaultOf[conditionId] = vault;
        allVaults.push(vault);

        emit VaultCreated(conditionId, vault, msg.sender);
    }

    /// @notice Predict the address for the vault of `conditionId` (before creation).
    function predictVaultAddress(bytes32 conditionId) external view returns (address predicted) {
        predicted = Clones.predictDeterministicAddress(implementation, conditionId, address(this));
    }

    function allVaultsLength() external view returns (uint256) {
        return allVaults.length;
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

    // ============ Owner config setters ============
    function setImplementation(address _implementation) external onlyOwner {
        _setImplementation(_implementation);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUSD, ctf, safeProxyFactory, aavePool, aaveDataProv);
    }

    function setProtocolFeeBps(uint256 _bps) external onlyOwner {
        _setProtocolFeeBps(_bps);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUSD, ctf, safeProxyFactory, aavePool, aaveDataProv);
    }

    function setUnderlyingUSD(address _underlying) external onlyOwner {
        _setUnderlyingUSD(_underlying);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUSD, ctf, safeProxyFactory, aavePool, aaveDataProv);
    }

    function setCTF(address _ctf) external onlyOwner {
        _setCTF(_ctf);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUSD, ctf, safeProxyFactory, aavePool, aaveDataProv);
    }

    function setSafeProxyFactory(address _spf) external onlyOwner {
        _setSafeProxyFactory(_spf);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUSD, ctf, safeProxyFactory, aavePool, aaveDataProv);
    }

    function setAavePool(address _pool) external onlyOwner {
        _setAavePool(_pool);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUSD, ctf, safeProxyFactory, aavePool, aaveDataProv);
    }

    function setAaveDataProv(address _dp) external onlyOwner {
        _setAaveDataProv(_dp);
        emit ConfigUpdated(implementation, protocolFeeBps, underlyingUSD, ctf, safeProxyFactory, aavePool, aaveDataProv);
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

    function _setUnderlyingUSD(address _u) internal {
        if (_u == address(0)) revert ZeroAddress();
        underlyingUSD = _u;
    }

    function _setCTF(address _c) internal {
        if (_c == address(0)) revert ZeroAddress();
        ctf = _c;
    }

    function _setSafeProxyFactory(address _s) internal {
        if (_s == address(0)) revert ZeroAddress();
        safeProxyFactory = _s;
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
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
