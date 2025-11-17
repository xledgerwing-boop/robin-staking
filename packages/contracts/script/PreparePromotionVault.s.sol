// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { Constants } from './Constants.s.sol';
import { PromotionVault } from '../src/PromotionVault.sol';

contract PreparePromotionVault is Script, Constants {
    struct MarketDef {
        bytes32 conditionId;
        uint256 priceA;
        bool extraEligible;
        address collateral;
    }

    function run() external {
        address vaultAddr = 0x6449520995546e8835049E92981622717074e630;
        uint256 baseRewardPool = 1_000_000;
        uint256 campaignDuration = 1 hours;

        PromotionVault vault = PromotionVault(vaultAddr);

        // Define markets to add (example list; replace with your actual list)
        MarketDef[] memory markets = new MarketDef[](3);
        markets[0] = MarketDef({
            conditionId: 0x777c48a36a064675a0a95112c12f54cda0b1caf9a64f7450fde31a8a8212af5a,
            priceA: 830_000,
            extraEligible: false,
            collateral: WCOL
        });
        markets[1] = MarketDef({
            conditionId: 0xbea5d5174cb5355eaf0f8cee780e67d0b22a6ff614ef7ec82cc2fe6ce8f4b111,
            priceA: 195_000,
            extraEligible: false,
            collateral: UNDERLYING_USD
        });
        markets[2] = MarketDef({
            conditionId: 0x0f4dfe035668cd6ad279370a02f50915b63046d2568574aa5e3df969424948e0,
            priceA: 640_000,
            extraEligible: false,
            collateral: UNDERLYING_USD
        });

        vm.startBroadcast();

        uint256[] memory prices = new uint256[](markets.length);
        for (uint256 i = 0; i < markets.length; i++) {
            vault.addMarket(markets[i].conditionId, markets[i].priceA, markets[i].extraEligible, markets[i].collateral);
            prices[i] = markets[i].priceA;
            console2.log('Market added idx=', i);
            console2.log('priceA=', markets[i].priceA);
            console2.log('eligible=', markets[i].extraEligible);
        }

        // Push prices to sync totals
        vault.batchUpdatePrices(prices);
        console2.log('Initial prices pushed');

        // Fund base reward and start
        IERC20 usdc = IERC20(UNDERLYING_USD);
        bool ok = usdc.approve(address(vault), baseRewardPool);
        require(ok, 'USDC approve failed');
        vault.startCampaign(baseRewardPool, campaignDuration);
        console2.log('Campaign started. Base=%s, Duration=%s seconds', baseRewardPool, campaignDuration);

        vm.stopBroadcast();
    }
}
