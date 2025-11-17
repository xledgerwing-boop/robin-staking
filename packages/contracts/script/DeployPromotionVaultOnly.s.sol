// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';

import { Constants } from './Constants.s.sol';
import { PromotionVault } from '../src/PromotionVault.sol';

contract DeployPromotionVaultOnly is Script, Constants {
    function run() external {
        uint256 tvlCapUsd = 10_000_000;

        vm.startBroadcast();
        PromotionVault vault = new PromotionVault(CONDITIONAL_TOKENS, UNDERLYING_USD, tvlCapUsd);
        vm.stopBroadcast();

        console2.log('PromotionVault deployed at:', address(vault));
    }
}
