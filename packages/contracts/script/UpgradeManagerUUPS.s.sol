// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';
import { Upgrades, Options } from 'openzeppelin-foundry-upgrades/Upgrades.sol';
import { ChangeConstants } from './Constants.s.sol';

/// @notice Upgrades the RobinVaultManager UUPS proxy to a new implementation.
/// - Uses the build artifact name to prepare and perform the upgrade.
/// - Optionally encodes a call during upgrade (e.g., reinitializer) if needed.
contract UpgradeManagerUUPS is Script, ChangeConstants {
    // Artifact name for the new implementation (same as used in Deploy script)
    string public constant MANAGER_ARTIFACT = 'RobinVaultManager.sol:RobinVaultManager';

    // Function to call during upgrade
    bytes public constant UPGRADE_CALL = bytes('');

    function run() external {
        vm.startBroadcast();

        Options memory opts;
        // opts.referenceContract = MANAGER_ARTIFACT; // enable if needed with old build dir

        Upgrades.upgradeProxy(MANAGER_PROXY, MANAGER_ARTIFACT, UPGRADE_CALL, opts);
        console2.log('Manager proxy upgraded:', MANAGER_PROXY);

        vm.stopBroadcast();
    }
}
