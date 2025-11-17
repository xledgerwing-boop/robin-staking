// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';

import { Constants } from './Constants.s.sol';
import { RobinGenesisVault } from '../src/RobinGenesisVault.sol';

contract DeployGenesisVaultOnly is Script, Constants {
    function run() external {
        uint256 tvlCapUsd = 10_000_000;

        vm.startBroadcast();
        RobinGenesisVault vault = new RobinGenesisVault(CONDITIONAL_TOKENS, UNDERLYING_USD, tvlCapUsd);
        vm.stopBroadcast();

        console2.log('RobinGenesisVault deployed at:', address(vault));
    }
}
