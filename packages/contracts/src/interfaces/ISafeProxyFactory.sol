// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface ISafeProxyFactory {
    function computeProxyAddress(address user) external view returns (address);
}
