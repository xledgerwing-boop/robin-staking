// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import { IRobinVaultPausing } from './interfaces/IRobinVaultPausing.sol';

/**
 * @title VaultPausable
 * @notice Granular pausing controls for vaults. Designed to be inherited by vault implementations.
 *         Provides internal setters and modifiers; external admin functions should be implemented by the inheriting vault (e.g., onlyOwner).
 */
abstract contract VaultPausable is Initializable, OwnableUpgradeable, IRobinVaultPausing {
    // ====== Pause Flags ======
    bool public pausedAll; // master switch: pauses all user-facing actions and admin harvests
    bool public pausedDeposits; // pauses deposit()
    bool public pausedWithdrawals; // pauses withdraw()
    bool public pausedUnlockYield; // pauses unlockYield()

    // ====== Errors ======
    error PausedAll();
    error PausedDeposits();
    error PausedWithdrawals();
    error PausedUnlockYield();

    // ====== Events ======
    event PausedAllSet(bool paused);
    event PausedDepositsSet(bool paused);
    event PausedWithdrawalsSet(bool paused);
    event PausedUnlockYieldSet(bool paused);

    // ====== Initializer ======
    /// forge-lint: disable-next-line(mixed-case-function)
    function __VaultPausable_init() internal onlyInitializing {
        pausedAll = false;
        pausedDeposits = false;
        pausedWithdrawals = false;
        pausedUnlockYield = false;
    }

    // ====== Pause Controls ======
    function pauseAll() external onlyOwner {
        _setPausedAll(true);
    }

    function unpauseAll() external onlyOwner {
        _setPausedAll(false);
    }

    function pauseDeposits() external onlyOwner {
        _setPausedDeposits(true);
    }

    function unpauseDeposits() external onlyOwner {
        _setPausedDeposits(false);
    }

    function pauseWithdrawals() external onlyOwner {
        _setPausedWithdrawals(true);
    }

    function unpauseWithdrawals() external onlyOwner {
        _setPausedWithdrawals(false);
    }

    function pauseUnlockYield() external onlyOwner {
        _setPausedUnlockYield(true);
    }

    function unpauseUnlockYield() external onlyOwner {
        _setPausedUnlockYield(false);
    }

    // ====== Internal Setters ======
    function _setPausedAll(bool paused) internal {
        pausedAll = paused;
        emit PausedAllSet(paused);
    }

    function _setPausedDeposits(bool paused) internal {
        pausedDeposits = paused;
        emit PausedDepositsSet(paused);
    }

    function _setPausedWithdrawals(bool paused) internal {
        pausedWithdrawals = paused;
        emit PausedWithdrawalsSet(paused);
    }

    function _setPausedUnlockYield(bool paused) internal {
        pausedUnlockYield = paused;
        emit PausedUnlockYieldSet(paused);
    }

    // ====== Modifiers ======
    modifier whenGlobalNotPaused() {
        if (pausedAll) revert PausedAll();
        _;
    }

    modifier whenDepositsNotPaused() {
        if (pausedAll) revert PausedAll();
        if (pausedDeposits) revert PausedDeposits();
        _;
    }

    modifier whenWithdrawalsNotPaused() {
        if (pausedAll) revert PausedAll();
        if (pausedWithdrawals) revert PausedWithdrawals();
        _;
    }

    modifier whenUnlockYieldNotPaused() {
        if (pausedAll) revert PausedAll();
        if (pausedUnlockYield) revert PausedUnlockYield();
        _;
    }
}
