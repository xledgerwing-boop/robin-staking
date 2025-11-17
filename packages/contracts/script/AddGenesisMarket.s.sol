// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';
import { Constants } from './Constants.s.sol';
import { RobinGenesisVault } from '../src/RobinGenesisVault.sol';

contract AddGenesisMarket is Script, Constants {
    struct MarketDef {
        bytes32 conditionId;
        uint256 priceA;
        bool extraEligible;
        address collateral;
    }

    function run() external {
        address vaultAddr = 0xd9235C00bc80758B6abEcB0261B865e1d3dBa312;
        RobinGenesisVault vault = RobinGenesisVault(vaultAddr);

        // Define markets to add (example list; replace with your actual list)
        MarketDef memory market = MarketDef({
            conditionId: 0x84f8b70331323c2fba97d7ceaa9a35fb645a0770d0dbff169d07f24f376766e9,
            priceA: 515_000,
            extraEligible: false,
            collateral: UNDERLYING_USD
        });

        vm.startBroadcast();

        vault.addMarket(market.conditionId, market.priceA, market.extraEligible, market.collateral);
        console2.log('Market added');
        console2.log('priceA=', market.priceA);
        console2.log('eligible=', market.extraEligible);

        vm.stopBroadcast();
    }
}
