// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { PolymarketStakingVault } from './PolymarketStakingVault.sol';
import { AaveStakingVault } from './AaveStakingVault.sol';

contract PolymarketAaveStakingVault is PolymarketStakingVault, AaveStakingVault {
    function initialize(uint256 _protocolFeeBps, address _underlying, address _ctf, bytes32 _conditionId, address _aavePool, address _aaveDataProv)
        external
        initializer
    {
        __RobinStakingVault_init(_protocolFeeBps, _underlying);
        __PolymarketStakingVault_init(_ctf, _conditionId);
        __AaveStakingVault_init(_underlying, _aavePool, _aaveDataProv);
    }
}
