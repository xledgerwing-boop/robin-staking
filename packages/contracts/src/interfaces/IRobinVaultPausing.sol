// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IRobinVaultPausing {
    function pauseAll() external;
    function unpauseAll() external;

    function pauseDeposits() external;
    function unpauseDeposits() external;

    function pauseWithdrawals() external;
    function unpauseWithdrawals() external;

    function pauseUnlockYield() external;
    function unpauseUnlockYield() external;
}
