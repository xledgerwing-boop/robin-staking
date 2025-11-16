// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import { Script, console2 } from 'forge-std/Script.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { PromotionVault } from '../../src/PromotionVault.sol';
import { IConditionalTokens } from '../../src/interfaces/IConditionalTokens.sol';
import { PromotionConstants } from '../../test/helpers/PromotionConstants.sol';
import { ISafeProxyFactory } from '../interfaces/ISafeProxyFactory.sol';
import { PolymarketScriptLib } from './PolymarketScriptLib.sol';

contract TestPromotionVault is Script, PromotionConstants {
    uint256 public constant YES_INDEX_SET = 1;
    uint256 public constant NO_INDEX_SET = 2;
    bytes32 public constant PARENT_COLLECTION_ID = 0x0;

    function run() external {
        // Env
        address target = vm.envAddress('TARGET'); // user to receive positions
        uint256 tvlCapUsd = 100_000e6;
        uint256 baseRewardUsd = 500e6;
        uint256 duration = 30 days;

        // Broadcast as deployer (from --private-key)
        vm.startBroadcast();

        // 1) Deploy the PromotionVault
        PromotionVault vault = new PromotionVault(CTF, UNDERLYING_USD, tvlCapUsd);
        console2.log('PromotionVault deployed at:', address(vault));

        // 2) Add all 20 markets with an initial priceA (use 0.5 USD as default)
        PromotionMarketInfo[20] memory infos = getPromotionMarkets();
        uint256 defaultPriceA = 500_000; // 0.5 USD with 6 decimals
        for (uint256 i = 0; i < infos.length; i++) {
            vault.addMarket(infos[i].conditionId, defaultPriceA, infos[i].extraEligible, infos[i].collateral);
            console2.log('Added market', i);
        }

        // 3) Fund and start campaign
        IERC20 usdc = IERC20(UNDERLYING_USD);
        IConditionalTokens ctf = IConditionalTokens(CTF);
        usdc.approve(address(vault), baseRewardUsd);
        vault.startCampaign(baseRewardUsd, duration);
        console2.log('Campaign started. Base funded:', baseRewardUsd, 'duration (s):', duration);

        vm.stopBroadcast();

        // 4) Mint 100e6 positions to TARGET for each market (from TARGET)
        // Ensure TARGET has enough USDC on the fork (use sh-scripts.sh send-usdc)
        uint256 amountUsdc = 100e6; // 100 USDC with 6 decimals

        vm.startBroadcast(target);
        for (uint256 i = 0; i < infos.length; i++) {
            PolymarketScriptLib.approveAndSplitAsTarget(ctf, usdc, NEG_RISK_ADAPTER, infos[i].conditionId, infos[i].negRisk, amountUsdc);
            (uint256 yesPositionId, uint256 noPositionId) = PolymarketScriptLib.getPositionIds(ctf, infos[i].conditionId, infos[i].collateral);
            PolymarketScriptLib.sendAllToProxy(ctf, ISafeProxyFactory(SAFE_PROXY_FACTORY), target, yesPositionId, noPositionId);
        }
        vm.stopBroadcast();
        console2.log('Positions minted and sent to proxy');

        console2.log('Setup complete. Vault:', address(vault));
    }
}
