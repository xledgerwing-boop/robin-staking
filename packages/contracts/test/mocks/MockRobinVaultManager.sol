// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { RobinVaultManager } from '../../src/RobinVaultManager.sol';

contract MockRobinVaultManager is RobinVaultManager {
    function setCheckPoolResolved(bool value) external {
        checkPoolResolved = value;
    }
}
