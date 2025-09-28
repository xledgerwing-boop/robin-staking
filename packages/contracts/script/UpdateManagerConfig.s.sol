// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';

import { RobinVaultManager } from '../src/RobinVaultManager.sol';
import { ChangeConstants } from './Constants.s.sol';

/// @notice Script to update RobinVaultManager configuration values.
/// - Calls owner-only setters on the manager proxy
/// - Any of the values can be left as "do not change" by keeping zero values
contract UpdateManagerConfig is Script, ChangeConstants {
    function run() external {
        vm.startBroadcast();

        RobinVaultManager manager = RobinVaultManager(MANAGER_PROXY);

        if (NEW_PROTOCOL_FEE_BPS != type(uint256).max) {
            manager.setProtocolFeeBps(NEW_PROTOCOL_FEE_BPS);
            console2.log('Updated protocolFeeBps to', NEW_PROTOCOL_FEE_BPS);
        }

        if (NEW_UNDERLYING_USD != address(0)) {
            manager.setUnderlyingUsd(NEW_UNDERLYING_USD);
            console2.log('Updated underlyingUsd to', NEW_UNDERLYING_USD);
        }

        if (NEW_WCOL != address(0)) {
            manager.setPolymarketWcol(NEW_WCOL);
            console2.log('Updated polymarketWcol to', NEW_WCOL);
        }

        if (NEW_CTF != address(0)) {
            manager.setCtf(NEW_CTF);
            console2.log('Updated ctf to', NEW_CTF);
        }

        if (NEW_NEG_RISK_ADAPTER != address(0)) {
            manager.setNegRiskAdapter(NEW_NEG_RISK_ADAPTER);
            console2.log('Updated negRiskAdapter to', NEW_NEG_RISK_ADAPTER);
        }

        if (NEW_NEG_RISK_CTF_EXCHANGE != address(0)) {
            manager.setNegRiskCtfExchange(NEW_NEG_RISK_CTF_EXCHANGE);
            console2.log('Updated negRiskCtfExchange to', NEW_NEG_RISK_CTF_EXCHANGE);
        }

        if (NEW_CTF_EXCHANGE != address(0)) {
            manager.setCtfExchange(NEW_CTF_EXCHANGE);
            console2.log('Updated ctfExchange to', NEW_CTF_EXCHANGE);
        }

        if (NEW_AAVE_POOL != address(0)) {
            manager.setAavePool(NEW_AAVE_POOL);
            console2.log('Updated aavePool to', NEW_AAVE_POOL);
        }

        if (NEW_AAVE_DATA_PROVIDER != address(0)) {
            manager.setAaveDataProv(NEW_AAVE_DATA_PROVIDER);
            console2.log('Updated aaveDataProv to', NEW_AAVE_DATA_PROVIDER);
        }

        vm.stopBroadcast();
    }
}
