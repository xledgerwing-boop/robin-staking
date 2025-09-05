// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { TimeWeighedScorer } from '../TimeWeighedScorer.sol';

contract MockTimeWeighedScorer is TimeWeighedScorer {
    mapping(address => uint256) public mockBalances;
    uint256 public mockGlobalSupply;

    function initialize() external initializer {
        __TimeWeighedScorer_init();
    }

    function setBalance(address user, uint256 balance) external {
        uint256 previousBalance = mockBalances[user];
        bool increase = balance > previousBalance;
        uint256 balanceDelta = 0;
        if (increase) {
            balanceDelta = balance - previousBalance;
        } else {
            balanceDelta = previousBalance - balance;
        }
        mockBalances[user] = balance;
        updateScore(user, balanceDelta, increase);
    }

    function setGlobalSupply(uint256 supply) external {
        uint256 previousSupply = mockGlobalSupply;
        bool increase = supply > previousSupply;
        uint256 supplyDelta = 0;
        if (increase) {
            supplyDelta = supply - previousSupply;
        } else {
            supplyDelta = previousSupply - supply;
        }
        mockGlobalSupply = supply;
        updateGlobalScore(supplyDelta, increase);
    }

    function getCurrentBalance(address user) public view returns (uint256) {
        return mockBalances[user];
    }

    function getCurrentGlobalSupply() public view returns (uint256) {
        return mockGlobalSupply;
    }
}
