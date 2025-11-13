// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';
import { StdCheats } from 'forge-std/StdCheats.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { Constants } from '../helpers/Constants.t.sol';
import { IConditionalTokens } from '../../src/interfaces/IConditionalTokens.sol';
import { INegRiskAdapter } from '../../src/interfaces/INegRiskAdapter.sol';
import { ISafeProxyFactory } from '../interfaces/ISafeProxyFactory.sol';
import { PolymarketScriptLib } from './PolymarketScriptLib.sol';

/// @title MintPolymarketPositions
/// @notice Local fork helper that transfers USDC.e to a target and mints Polymarket ConditionalTokens to it
/// @dev Required env vars: TARGET (address), CONDITION_ID (bytes32). Optional: AMOUNT_USDC (uint, default 100e6)
contract MintPolymarketPositions is Script, Constants, StdCheats {
    function run() external {
        address target = vm.envAddress('TARGET');
        bytes32 conditionId = vm.envBytes32('CONDITION_ID');

        // Default mint amount: 100 USDC (6 decimals)
        uint256 amountUsdc = 100e6;

        // 2) Detect whether the market is NegRisk (WCOL collateral) or Regular (USDC collateral)
        (bool isNegRisk, address collateralToken) = PolymarketScriptLib.decideMode(
            IConditionalTokens(CTF),
            NEG_RISK_CTF_EXCHANGE,
            CTF_EXCHANGE,
            WCOL,
            UNDERLYING_USD,
            conditionId
        );
        if (isNegRisk) {
            console2.log('Detected mode: NegRisk (WCOL)');
        } else {
            console2.log('Detected mode: Regular (USDC)');
        }

        // 3) Approve and split as target (mint directly to target)
        vm.startBroadcast(target);
        PolymarketScriptLib.approveAndSplitAsTarget(
            IConditionalTokens(CTF),
            IERC20(UNDERLYING_USD),
            NEG_RISK_ADAPTER,
            conditionId,
            isNegRisk,
            amountUsdc
        );
        (uint256 yesPositionId, uint256 noPositionId) = PolymarketScriptLib.getPositionIds(IConditionalTokens(CTF), conditionId, collateralToken);
        PolymarketScriptLib.sendAllToProxy(IConditionalTokens(CTF), ISafeProxyFactory(SAFE_PROXY_FACTORY), target, yesPositionId, noPositionId);
        vm.stopBroadcast();
        // 4) Log balances
        _logPositionBalances(target, yesPositionId, noPositionId);
    }

    // ---------- internals ----------

    function _logPositionBalances(address target, uint256 yesPositionId, uint256 noPositionId) internal view {
        IConditionalTokens ctf = IConditionalTokens(CTF);

        uint256 yesBal = ctf.balanceOf(target, yesPositionId);
        uint256 noBal = ctf.balanceOf(target, noPositionId);
        console2.log('YES positionId:', yesPositionId, 'balance:', yesBal);
        console2.log('NO  positionId:', noPositionId, 'balance:', noBal);
    }
}
