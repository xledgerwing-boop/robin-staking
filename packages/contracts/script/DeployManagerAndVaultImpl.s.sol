// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';
import { Upgrades } from 'openzeppelin-foundry-upgrades/Upgrades.sol';

// === Your contracts ===
import { RobinVaultManager } from '../src/RobinVaultManager.sol';
import { PolymarketAaveStakingVault } from '../src/PolymarketAaveStakingVault.sol';

contract DeployManagerAndVaultImpl is Script {
    // --------- HARD-CODED CONSTANTS (EDIT THESE) ---------
    // Protocol fee for *newly created* vaults (in BPS; 1000 = 10%)
    uint256 constant PROTOCOL_FEE_BPS = 1000;
    // Addresses (Polygon mainnet or your target network)
    address constant UNDERLYING_USD = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // USDC
    address constant CONDITIONAL_TOKENS = 0x4D97DCd97eC945f40cF65F87097ACe5EA0476045; // Polymarket CTF
    //address constant SAFE_PROXY_FACTORY = 0xaacFeEa03eb1561C4e67d661e40682Bd20E3541b; // Polymarket Safe/Proxy factory (for proxy address compute)
    address constant AAVE_V3_POOL = 0x794a61358D6845594F94dc1DB02A252b5b4814aD; // Aave v3 Pool
    address constant AAVE_DATA_PROVIDER = 0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5; // Aave v3 Data Provider

    string constant MANAGER_ARTIFACT = 'RobinVaultManager.sol:RobinVaultManager';

    function run() external {
        // Use the default private key from your env/config, or pass one via CLI
        vm.startBroadcast();

        // 1) Deploy the Polymarket+Aave vault *implementation* (clone target used by the manager)
        PolymarketAaveStakingVault vaultImpl = new PolymarketAaveStakingVault();
        address vaultImplementation = address(vaultImpl);
        console2.log('PolymarketAaveStakingVault Impl:', vaultImplementation);

        // 2) Prepare initializer calldata for the UUPS Manager proxy
        bytes memory initData = abi.encodeCall(
            RobinVaultManager.initialize,
            (vaultImplementation, PROTOCOL_FEE_BPS, UNDERLYING_USD, CONDITIONAL_TOKENS, AAVE_V3_POOL, AAVE_DATA_PROVIDER)
        );

        // 3) Deploy the UUPS proxy for the manager using OZ upgrades helper
        //    This deploys the manager implementation, the proxy, then calls initialize on the proxy.
        address managerProxy = Upgrades.deployUUPSProxy(MANAGER_ARTIFACT, initData);
        console2.log('RobinVaultManager Proxy:', managerProxy);

        vm.stopBroadcast();
    }
}
