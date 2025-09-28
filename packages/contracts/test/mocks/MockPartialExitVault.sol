// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { AaveStakingVault } from '../../src/AaveStakingVault.sol';
import { RobinStakingVault } from '../../src/RobinStakingVault.sol';
import { PolymarketAaveStakingVault } from '../../src/PolymarketAaveStakingVault.sol';

/// @notice Test-only vault that withdraws from Aave in partial chunks per unlock call
contract MockPartialExitVault is PolymarketAaveStakingVault {
    uint256 public exitFractionBps; // e.g. 3000 = 30% of remaining per call; 0 => default 30%
    bool private exitStarted;
    uint256 private balAtExitStart;

    function setExitFractionBps(uint256 bps) external onlyOwner {
        require(bps <= 10_000 && bps > 0, 'bad bps');
        exitFractionBps = bps;
    }

    function _yieldStrategyExit() internal override(AaveStakingVault, RobinStakingVault) returns (uint256 withdrawnUsd) {
        uint256 bal = _yieldStrategyBalance();
        if (!exitStarted) {
            exitStarted = true;
            balAtExitStart = bal;
        }
        if (bal == 0) return 0;
        uint256 bps = exitFractionBps == 0 ? 3000 : exitFractionBps;
        uint256 toWithdraw = (balAtExitStart * bps) / 10_000;
        if (toWithdraw == 0) toWithdraw = bal; // ensure progress
        withdrawnUsd = aavePool.withdraw(address(underlyingUsd), toWithdraw, address(this));
        return withdrawnUsd;
    }
}
