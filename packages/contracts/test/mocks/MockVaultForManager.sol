// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { IPolymarketAaveStakingVault } from '../../src/interfaces/IPolymarketAaveStakingVault.sol';
import { PolymarketAaveStakingVault } from '../../src/PolymarketAaveStakingVault.sol';

contract MockVaultForManager is Initializable, PolymarketAaveStakingVault {
    // --- helpers for tests ---
    function setProtocolYieldForTest(uint256 amount) external {
        protocolYield = amount;
    }
}
