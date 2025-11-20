// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';
import { Constants } from './Constants.s.sol';
import { RobinGenesisVault } from '../src/RobinGenesisVault.sol';

contract EndAndReplaceGenesisMarkets is Script, Constants {
    struct MarketReplacement {
        uint256 endIndex; // Index of the market to end
        bytes32 conditionId; // Condition ID of the new market
        uint256 priceA; // Initial price A for the new market (6 decimals, e.g., 500_000 = 0.5)
        bool extraEligible; // Whether the new market is eligible for extra rewards
        address collateral; // Polymarket collateral address (usually UNDERLYING_USD or WCOL)
    }

    function run() external {
        address vaultAddr = 0xAa489b4F076ce1459B48a730eFb981641A91B7c7;
        RobinGenesisVault vault = RobinGenesisVault(vaultAddr);

        // Define market replacements (example list; replace with your actual list)
        MarketReplacement[] memory replacements = new MarketReplacement[](2);
        replacements[0] = MarketReplacement({
            endIndex: 43, // Index of market to end
            conditionId: 0x50ddb9cd80d5c271664a2ebb7fcaed1d0a148d82c8e8d314d830f75a944c3dcc,
            priceA: 700000,
            extraEligible: false,
            collateral: UNDERLYING_USD
        });
        replacements[1] = MarketReplacement({
            endIndex: 44, // Index of market to end
            conditionId: 0x9c1a953fe92c8357f1b646ba25d983aa83e90c525992db14fb726fa895cb5763,
            priceA: 635000,
            extraEligible: false,
            collateral: UNDERLYING_USD
        });

        vm.startBroadcast();

        for (uint256 i = 0; i < replacements.length; i++) {
            MarketReplacement memory replacement = replacements[i];

            console2.log('Ending and replacing market at index:', replacement.endIndex);

            vault.endAndReplaceMarket(
                replacement.endIndex,
                replacement.conditionId,
                replacement.priceA,
                replacement.extraEligible,
                replacement.collateral
            );

            console2.log('Market replaced successfully');
        }

        vm.stopBroadcast();
    }
}
