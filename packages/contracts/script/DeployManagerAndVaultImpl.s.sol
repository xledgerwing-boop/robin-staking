// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';
import { Upgrades } from 'openzeppelin-foundry-upgrades/Upgrades.sol';

import { Constants } from './Constants.s.sol';

// === Your contracts ===
import { RobinVaultManager } from '../src/RobinVaultManager.sol';
import { PolymarketAaveStakingVault } from '../src/PolymarketAaveStakingVault.sol';

contract DeployManagerAndVaultImpl is Script, Constants {
    function run() external {
        // Use the default private key from your env/config, or pass one via CLI
        vm.startBroadcast();

        // Deploy the Polymarket+Aave vault *implementation* (clone target used by the manager)
        PolymarketAaveStakingVault vaultImpl = new PolymarketAaveStakingVault();
        address vaultImplementation = address(vaultImpl);
        console2.log('PolymarketAaveStakingVault Impl:', vaultImplementation);

        // Prepare initializer calldata for the UUPS Manager proxy
        bytes memory initData = abi.encodeCall(
            RobinVaultManager.initialize,
            (
                vaultImplementation,
                PROTOCOL_FEE_BPS,
                UNDERLYING_USD,
                WCOL,
                CONDITIONAL_TOKENS,
                NEG_RISK_ADAPTER,
                NEG_RISK_CTF_EXCHANGE,
                CTF_EXCHANGE,
                AAVE_V3_POOL,
                AAVE_DATA_PROVIDER
            )
        );

        // Deploy the UUPS proxy for the manager using OZ upgrades helper
        address managerProxy = Upgrades.deployUUPSProxy('RobinVaultManager.sol', initData);
        console2.log('RobinVaultManager Proxy:', managerProxy);

        vm.stopBroadcast();
    }
}
