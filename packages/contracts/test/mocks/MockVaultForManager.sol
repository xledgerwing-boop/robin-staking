// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { PolymarketAaveStakingVault } from '../../src/PolymarketAaveStakingVault.sol';

contract MockVaultForManager is Initializable, PolymarketAaveStakingVault {
    // --- helpers for tests ---
    function setProtocolYieldForTest(uint256 amount) external {
        protocolYield = amount;
    }
}
