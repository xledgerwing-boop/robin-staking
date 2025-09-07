// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { AaveStakingVault } from '../../src/AaveStakingVault.sol';
import { PolymarketStakingVault } from '../../src/PolymarketStakingVault.sol';

contract MockPolyMarketAaveVault is AaveStakingVault, PolymarketStakingVault {
    function initialize(
        address underlying,
        address pool,
        address dataProv,
        uint256 protocolFeeBps,
        address ctf,
        bytes32 conditionId,
        address negRiskAdapter,
        bool negRisk,
        address collateral
    ) external initializer {
        __RobinStakingVault_init(protocolFeeBps, underlying);
        __AaveStakingVault_init(underlying, pool, dataProv);
        __PolymarketStakingVault_init(ctf, conditionId, negRiskAdapter, negRisk, collateral, false);
    }

    // ----- Expose strategy internals for testing -----
    function harnessSupply(uint256 amount) external {
        _yieldStrategySupply(amount);
    }

    function harnessWithdraw(uint256 amount) external returns (uint256) {
        return _yieldStrategyWithdraw(amount);
    }

    function harnessExit() external returns (uint256) {
        return _yieldStrategyExit();
    }

    function harnessBalance() external view returns (uint256) {
        return _yieldStrategyBalance();
    }

    function harnessCurrentApy() external view returns (uint256) {
        return _yieldStrategyCurrentApy();
    }

    function harnessSupplyAndLimitUsd() external view returns (uint256, uint256) {
        return _yieldStrategySupplyAndLimitUsd();
    }

    function harnessPmTakeYes(address from, uint256 amount) external {
        _pmTakeYes(from, amount);
    }

    function harnessPmTakeNo(address from, uint256 amount) external {
        _pmTakeNo(from, amount);
    }

    function harnessPmGiveYes(address to, uint256 amount) external {
        _pmGiveYes(to, amount);
    }

    function harnessPmGiveNo(address to, uint256 amount) external {
        _pmGiveNo(to, amount);
    }

    function harnessPmMerge(uint256 amount) external {
        _pmMerge(amount);
    }

    function harnessPmSplit(uint256 amount) external {
        _pmSplit(amount);
    }

    function harnessPmRedeemWinningToUsd(bool isYes) external returns (uint256) {
        return _pmRedeemWinningToUsd(isYes);
    }

    function harnessPmCheckResolved() external view returns (bool, bool) {
        return _pmCheckResolved();
    }

    function harnessPmUsdAmountForOutcome(uint256 outcomeAmount) external pure returns (uint256) {
        return _pmUsdAmountForOutcome(outcomeAmount);
    }

    function harnessPmOutcomeAmountForUsd(uint256 usdAmount) external pure returns (uint256) {
        return _pmOutcomeAmountForUsd(usdAmount);
    }
}
