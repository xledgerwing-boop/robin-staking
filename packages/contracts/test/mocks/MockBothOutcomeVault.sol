// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { PolymarketAaveStakingVault } from '../../src/PolymarketAaveStakingVault.sol';
import { PolymarketStakingVault } from '../../src/PolymarketStakingVault.sol';
import { RobinStakingVault } from '../../src/RobinStakingVault.sol';

/// @notice Test-only vault that simulates a BOTH (50/50) resolution and stubs out PM/Aave hooks.
contract MockBothOutcomeVault is PolymarketAaveStakingVault {
    function _pmCheckResolved()
        internal
        pure
        override(PolymarketStakingVault, RobinStakingVault)
        returns (bool resolved, WinningPosition winningPosition_)
    {
        return (true, WinningPosition.BOTH);
    }
}
