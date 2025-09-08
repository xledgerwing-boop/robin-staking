// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';

import { RobinVaultManager } from '../src/RobinVaultManager.sol';
import { PolymarketAaveStakingVault } from '../src/PolymarketAaveStakingVault.sol';
import { ChangeConstants } from './Constants.s.sol';

/// @notice Script to deploy a new vault implementation and set it in the manager.
/// - Broadcasts a tx that calls manager.setImplementation(newImpl)
/// - Optionally prints predicted clone address for a sample conditionId.
contract UpdateVaultImplementation is Script, ChangeConstants {
    function run() external {
        vm.startBroadcast();

        // Deploy new vault implementation
        PolymarketAaveStakingVault impl = new PolymarketAaveStakingVault();
        address newImpl = address(impl);
        console2.log('New PolymarketAaveStakingVault impl:', newImpl);

        // Point manager to new implementation for future clones
        RobinVaultManager manager = RobinVaultManager(MANAGER_PROXY);
        manager.setImplementation(newImpl);
        console2.log('Manager implementation updated');

        vm.stopBroadcast();
    }
}
