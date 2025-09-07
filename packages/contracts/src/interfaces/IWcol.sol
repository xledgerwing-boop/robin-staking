// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IWcol is IERC20 {
    function wrap(address _to, uint256 _amount) external;
    function unwrap(address _to, uint256 _amount) external;
}
