// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { IERC1155 } from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IConditionalTokens is IERC1155 {
    // Core CTF ops
    function splitPosition(IERC20 collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] calldata partition, uint256 amount)
        external;

    function mergePositions(IERC20 collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] calldata partition, uint256 amount)
        external;

    function redeemPositions(IERC20 collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint256[] calldata indexSets) external;

    // Helpers / views
    function getCollectionId(bytes32 parentCollectionId, bytes32 conditionId, uint256 indexSet) external pure returns (bytes32);

    function getPositionId(IERC20 collateralToken, bytes32 collectionId) external pure returns (uint256);

    function getOutcomeSlotCount(bytes32 conditionId) external view returns (uint256);

    function payoutDenominator(bytes32 conditionId) external view returns (uint256);

    function payoutNumerators(bytes32 conditionId, uint256 index) external view returns (uint256);

    // Standard ERC1155
    function isApprovedForAll(address account, address operator) external view returns (bool);
}
