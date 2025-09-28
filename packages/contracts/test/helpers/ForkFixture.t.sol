// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from 'forge-std/Test.sol';

abstract contract ForkFixture is Test {
    uint256 internal forkId;

    function _selectPolygonFork(uint256 blockNumber) internal {
        string memory rpcUrl = vm.envString('POLYGON_RPC_URL');
        require(bytes(rpcUrl).length != 0, 'Set POLYGON_RPC_URL env');

        if (blockNumber > 0) {
            forkId = vm.createFork(rpcUrl, blockNumber);
        } else {
            forkId = vm.createFork(rpcUrl);
        }
        vm.selectFork(forkId);
    }
}
