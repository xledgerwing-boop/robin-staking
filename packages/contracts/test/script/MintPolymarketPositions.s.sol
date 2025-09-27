// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Script, console2 } from 'forge-std/Script.sol';
import { StdCheats } from 'forge-std/StdCheats.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { Constants } from '../helpers/Constants.t.sol';
import { IConditionalTokens } from '../../src/interfaces/IConditionalTokens.sol';
import { INegRiskAdapter } from '../../src/interfaces/INegRiskAdapter.sol';
import { IRegistry } from '../../src/interfaces/IRegistry.sol';
import { ISafeProxyFactory } from '../interfaces/ISafeProxyFactory.sol';

/// @title MintPolymarketPositions
/// @notice Local fork helper that transfers USDC.e to a target and mints Polymarket ConditionalTokens to it
/// @dev Required env vars: TARGET (address), CONDITION_ID (bytes32). Optional: AMOUNT_USDC (uint, default 100e6)
contract MintPolymarketPositions is Script, Constants, StdCheats {
    // Polymarket constants
    uint256 public constant YES_INDEX_SET = 1;
    uint256 public constant NO_INDEX_SET = 2;
    bytes32 public constant PARENT_COLLECTION_ID = 0x0;

    function run() external {
        address target = vm.envAddress('TARGET');
        bytes32 conditionId = vm.envBytes32('CONDITION_ID');

        // Default mint amount: 100 USDC (6 decimals)
        uint256 amountUsdc = 100e6;

        // 2) Detect whether the market is NegRisk (WCOL collateral) or Regular (USDC collateral)
        (bool isNegRisk, address collateralToken) = _decideVaultMode(conditionId);
        if (isNegRisk) {
            console2.log('Detected mode: NegRisk (WCOL)');
        } else {
            console2.log('Detected mode: Regular (USDC)');
        }

        // 3) Approve and split as target (mint directly to target)
        vm.startBroadcast(target);
        _approveAndSplitAsTarget(conditionId, isNegRisk, amountUsdc);
        (uint256 yesPositionId, uint256 noPositionId) = _getPositionIds(conditionId, collateralToken);
        _sendToProxy(target, yesPositionId, noPositionId);
        vm.stopBroadcast();
        // 4) Log balances
        _logPositionBalances(target, yesPositionId, noPositionId);
    }

    // ---------- internals ----------

    function _approveAndSplitAsTarget(bytes32 conditionId, bool isNegRisk, uint256 amountUsdc) internal {
        IConditionalTokens ctf = IConditionalTokens(CTF);
        IERC20 usdc = IERC20(UNDERLYING_USD);

        // Partition [YES, NO]
        uint256[] memory partition = new uint256[](2);
        partition[0] = YES_INDEX_SET;
        partition[1] = NO_INDEX_SET;

        // Approvals and split from the current broadcaster (set to target)
        if (isNegRisk) {
            usdc.approve(NEG_RISK_ADAPTER, amountUsdc);
            ctf.setApprovalForAll(NEG_RISK_ADAPTER, true);
            INegRiskAdapter(NEG_RISK_ADAPTER).splitPosition(UNDERLYING_USD, PARENT_COLLECTION_ID, conditionId, partition, amountUsdc);
        } else {
            usdc.approve(CTF, amountUsdc);
            ctf.splitPosition(UNDERLYING_USD, PARENT_COLLECTION_ID, conditionId, partition, amountUsdc);
        }
        console2.log('Minted positions to target for conditionId:', vm.toString(conditionId));
    }

    function _sendToProxy(address target, uint256 yesPositionId, uint256 noPositionId) internal {
        IConditionalTokens ctf = IConditionalTokens(CTF);
        address proxy = ISafeProxyFactory(SAFE_PROXY_FACTORY).computeProxyAddress(target);
        uint256 balYes = ctf.balanceOf(tx.origin, yesPositionId);
        uint256 balNo = ctf.balanceOf(tx.origin, noPositionId);
        ctf.safeTransferFrom(tx.origin, proxy, yesPositionId, balYes, '');
        ctf.safeTransferFrom(tx.origin, proxy, noPositionId, balNo, '');
    }

    function _getPositionIds(bytes32 conditionId, address collateralToken) internal view returns (uint256 yesPositionId, uint256 noPositionId) {
        IConditionalTokens ctf = IConditionalTokens(CTF);
        bytes32 yesColl = ctf.getCollectionId(PARENT_COLLECTION_ID, conditionId, YES_INDEX_SET);
        bytes32 noColl = ctf.getCollectionId(PARENT_COLLECTION_ID, conditionId, NO_INDEX_SET);
        yesPositionId = ctf.getPositionId(collateralToken, yesColl);
        noPositionId = ctf.getPositionId(collateralToken, noColl);
    }

    function _logPositionBalances(address target, uint256 yesPositionId, uint256 noPositionId) internal view {
        IConditionalTokens ctf = IConditionalTokens(CTF);

        uint256 yesBal = ctf.balanceOf(target, yesPositionId);
        uint256 noBal = ctf.balanceOf(target, noPositionId);
        console2.log('YES positionId:', yesPositionId, 'balance:', yesBal);
        console2.log('NO  positionId:', noPositionId, 'balance:', noBal);
    }

    function _decideVaultMode(bytes32 conditionId) internal view returns (bool isNegRisk, address collateralToken) {
        IConditionalTokens ictf = IConditionalTokens(CTF);

        bytes32 yesColl = ictf.getCollectionId(PARENT_COLLECTION_ID, conditionId, YES_INDEX_SET);
        bytes32 noColl = ictf.getCollectionId(PARENT_COLLECTION_ID, conditionId, NO_INDEX_SET);

        uint256 yesId = ictf.getPositionId(WCOL, yesColl);
        uint256 noId = ictf.getPositionId(WCOL, noColl);
        bool negRiskListed = _listedOn(NEG_RISK_CTF_EXCHANGE, yesId, noId, conditionId) || _listedOn(NEG_RISK_CTF_EXCHANGE, noId, yesId, conditionId);

        yesId = ictf.getPositionId(UNDERLYING_USD, yesColl);
        noId = ictf.getPositionId(UNDERLYING_USD, noColl);
        bool regularListed = _listedOn(CTF_EXCHANGE, yesId, noId, conditionId) || _listedOn(CTF_EXCHANGE, noId, yesId, conditionId);

        require(!(negRiskListed && regularListed), 'Listed on both exchanges');
        if (negRiskListed) {
            return (true, WCOL);
        } else if (regularListed) {
            return (false, UNDERLYING_USD);
        }
        revert('Condition not listed on either exchange');
    }

    function _listedOn(address ex, uint256 id, uint256 complement, bytes32 cond) internal view returns (bool) {
        if (ex == address(0)) return false;
        try IRegistry(ex).getConditionId(id) returns (bytes32 c) {
            if (c != cond) return false;
        } catch {
            return false;
        }

        try IRegistry(ex).getComplement(id) returns (uint256 comp) {
            if (comp == 0 || comp != complement) return false;
            try IRegistry(ex).getConditionId(comp) returns (bytes32 c2) {
                return c2 == cond;
            } catch {
                return false;
            }
        } catch {
            return false;
        }
    }
}
