// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { IConditionalTokens } from '../../src/interfaces/IConditionalTokens.sol';
import { IRegistry } from '../../src/interfaces/IRegistry.sol';
import { ISafeProxyFactory } from '../interfaces/ISafeProxyFactory.sol';
import { INegRiskAdapter } from '../../src/interfaces/INegRiskAdapter.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

library PolymarketScriptLib {
    uint256 internal constant YES_INDEX_SET = 1;
    uint256 internal constant NO_INDEX_SET = 2;
    bytes32 internal constant PARENT_COLLECTION_ID = 0x0;

    function buildPartition() internal pure returns (uint256[] memory partition) {
        partition = new uint256[](2);
        partition[0] = YES_INDEX_SET;
        partition[1] = NO_INDEX_SET;
    }

    function getPositionIds(
        IConditionalTokens ctf,
        bytes32 conditionId,
        address collateral
    ) internal view returns (uint256 yesPositionId, uint256 noPositionId) {
        bytes32 yesColl = ctf.getCollectionId(PARENT_COLLECTION_ID, conditionId, YES_INDEX_SET);
        bytes32 noColl = ctf.getCollectionId(PARENT_COLLECTION_ID, conditionId, NO_INDEX_SET);
        yesPositionId = ctf.getPositionId(collateral, yesColl);
        noPositionId = ctf.getPositionId(collateral, noColl);
    }

    function decideMode(
        IConditionalTokens ictf,
        address negRiskExchange,
        address ctfExchange,
        address wcol,
        address usdc,
        bytes32 conditionId
    ) internal view returns (bool isNegRisk, address collateralToken) {
        // NegRisk listing?
        (bool negRiskListed, ) = _listedOn(negRiskExchange, ictf, wcol, conditionId);
        // Regular listing?
        (bool regularListed, ) = _listedOn(ctfExchange, ictf, usdc, conditionId);

        require(!(negRiskListed && regularListed), 'Listed on both exchanges');
        if (negRiskListed) {
            return (true, wcol);
        } else if (regularListed) {
            return (false, usdc);
        }
        revert('Condition not listed on either exchange');
    }

    function computeProxyAddress(ISafeProxyFactory factory, address owner) internal view returns (address) {
        return factory.computeProxyAddress(owner);
    }

    function approveAndSplitAsTarget(
        IConditionalTokens ctf,
        IERC20 usdc,
        address negRiskAdapter,
        bytes32 conditionId,
        bool isNegRisk,
        uint256 amountUsdc
    ) internal {
        uint256[] memory partition = buildPartition();
        if (isNegRisk) {
            usdc.approve(negRiskAdapter, amountUsdc);
            ctf.setApprovalForAll(negRiskAdapter, true);
            INegRiskAdapter(negRiskAdapter).splitPosition(address(usdc), PARENT_COLLECTION_ID, conditionId, partition, amountUsdc);
        } else {
            usdc.approve(address(ctf), amountUsdc);
            ctf.splitPosition(address(usdc), PARENT_COLLECTION_ID, conditionId, partition, amountUsdc);
        }
    }

    function sendAllToProxy(IConditionalTokens ctf, ISafeProxyFactory factory, address owner, uint256 yesPositionId, uint256 noPositionId) internal {
        address proxy = factory.computeProxyAddress(owner);
        uint256 balYes = ctf.balanceOf(tx.origin, yesPositionId);
        uint256 balNo = ctf.balanceOf(tx.origin, noPositionId);
        if (balYes > 0) {
            ctf.safeTransferFrom(tx.origin, proxy, yesPositionId, balYes, '');
        }
        if (balNo > 0) {
            ctf.safeTransferFrom(tx.origin, proxy, noPositionId, balNo, '');
        }
    }

    function _listedOn(address ex, IConditionalTokens ictf, address collateral, bytes32 cond) private view returns (bool listed, uint256 yesId) {
        if (ex == address(0)) return (false, 0);
        IRegistry reg = IRegistry(ex);
        bytes32 yesColl = ictf.getCollectionId(PARENT_COLLECTION_ID, cond, YES_INDEX_SET);
        bytes32 noColl = ictf.getCollectionId(PARENT_COLLECTION_ID, cond, NO_INDEX_SET);
        uint256 id = ictf.getPositionId(collateral, yesColl);
        uint256 complement = ictf.getPositionId(collateral, noColl);
        try reg.getConditionId(id) returns (bytes32 c) {
            if (c != cond) return (false, 0);
        } catch {
            return (false, 0);
        }
        try reg.getComplement(id) returns (uint256 comp) {
            if (comp == 0 || comp != complement) return (false, 0);
            try reg.getConditionId(comp) returns (bytes32 c2) {
                return (c2 == cond, id);
            } catch {
                return (false, 0);
            }
        } catch {
            return (false, 0);
        }
    }
}
