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
        MarketReplacement[] memory replacements = new MarketReplacement[](1);
        replacements[0] = MarketReplacement({
            endIndex: 0, // Index of market to end
            conditionId: 0x84f8b70331323c2fba97d7ceaa9a35fb645a0770d0dbff169d07f24f376766e9,
            priceA: 515_000,
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
