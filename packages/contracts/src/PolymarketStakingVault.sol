// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { ERC1155HolderUpgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol';

import { RobinStakingVault } from './RobinStakingVault.sol';
import { IConditionalTokens } from './interfaces/IConditionalTokens.sol';
import { IWcol } from './interfaces/IWcol.sol';
import { INegRiskAdapter } from './interfaces/INegRiskAdapter.sol';

/// @title PolymarketStakingVault
/// @notice PM adapter for Polymarket (Gnosis CTF) that implements the prediction-market hooks of RobinStakingVault.
/// @dev Yield strategy hooks remain abstract and must be implemented in a subclass (e.g., Aave/Dolomite).
abstract contract PolymarketStakingVault is RobinStakingVault, ERC1155HolderUpgradeable {
    uint256 public constant YES_INDEX = 0;
    uint256 public constant NO_INDEX = 1;
    uint256 public constant YES_INDEX_SET = 1; // YES is always the first index set for us
    uint256 public constant NO_INDEX_SET = 2; // NO is always the second index set for us
    bytes32 public constant PARENT_COLLECTION_ID = 0x0; // Always 0x0 for Polymarket

    IConditionalTokens public ctf;

    // Condition wiring
    bytes32 public conditionId;
    uint256 public yesPositionId; // ERC-1155 id
    uint256 public noPositionId; // ERC-1155 id
    bool public negRisk;
    INegRiskAdapter public negRiskAdapter;
    IERC20 public polymarketCollateral;

    error InvalidOutcomeSlotCount(uint256 outcomeSlotCount);
    error MarketAlreadyResolved();

    /// @param _ctf                 Address of Polymarket's Conditional Tokens contract (Polygon mainnet: 0x4D97...6045)
    /// @param _conditionId         CTF conditionId for this market
    /// @param _negRisk             True if the market uses WCOL as collateral
    /// @param _negRiskAdapter      Address of the WCOL adapter; only needed for negRisk markets
    /// @param _collateral          Address of the collateral token
    /// @param _checkResolved       True if the market should be checked for resolution when created, necessary for tests, always true in production
    /// forge-lint: disable-next-line(mixed-case-function)
    function __PolymarketStakingVault_init(
        address _ctf,
        bytes32 _conditionId,
        address _negRiskAdapter,
        bool _negRisk,
        address _collateral,
        bool _checkResolved
    ) internal onlyInitializing {
        __ERC1155Holder_init();

        ctf = IConditionalTokens(_ctf);
        conditionId = _conditionId;
        negRisk = _negRisk;
        negRiskAdapter = INegRiskAdapter(_negRiskAdapter);
        polymarketCollateral = IERC20(_collateral);

        //Only allow Polymarket binary markets
        uint256 outcomeSlotCount = ctf.getOutcomeSlotCount(conditionId);
        if (outcomeSlotCount != 2) revert InvalidOutcomeSlotCount(outcomeSlotCount); //also checks that market is created (prepared)

        bytes32 yesColl = ctf.getCollectionId(PARENT_COLLECTION_ID, conditionId, YES_INDEX_SET);
        bytes32 noColl = ctf.getCollectionId(PARENT_COLLECTION_ID, conditionId, NO_INDEX_SET);
        yesPositionId = ctf.getPositionId(address(polymarketCollateral), yesColl);
        noPositionId = ctf.getPositionId(address(polymarketCollateral), noColl);

        if (_checkResolved) {
            //check that market isn't already resolved
            (bool resolved,) = _pmCheckResolved();
            if (resolved) revert MarketAlreadyResolved();
        }

        // Allow CTF to pull USDC for splits/merges/redemptions
        polymarketCollateral.approve(address(ctf), type(uint256).max);
        if (negRisk) {
            ctf.setApprovalForAll(address(negRiskAdapter), true);
            underlyingUsd.approve(address(negRiskAdapter), type(uint256).max); // If negRisk, the collateral is Polymarket's WCOL which needs to be approved for wrapping USDC.
        }
    }

    // ---------- PM hook implementations ----------

    function _pmTakeYes(address from, uint256 amount) internal override {
        // requires that the `from` address has setApprovalForAll(this vault) on CTF
        require(ctf.isApprovedForAll(from, address(this)), 'CTF: not approved');
        ctf.safeTransferFrom(from, address(this), yesPositionId, amount, '');
    }

    function _pmTakeNo(address from, uint256 amount) internal override {
        require(ctf.isApprovedForAll(from, address(this)), 'CTF: not approved');
        ctf.safeTransferFrom(from, address(this), noPositionId, amount, '');
    }

    function _pmGiveYes(address to, uint256 amount) internal override {
        ctf.safeTransferFrom(address(this), to, yesPositionId, amount, '');
    }

    function _pmGiveNo(address to, uint256 amount) internal override {
        ctf.safeTransferFrom(address(this), to, noPositionId, amount, '');
    }

    function _pmMerge(uint256 pairs) internal override {
        // Merge pairs of YES/NO into USDC. Amount is in collateral units (1:1 with outcome units for CTF).
        uint256[] memory partition = new uint256[](2);
        partition[0] = YES_INDEX_SET;
        partition[1] = NO_INDEX_SET;

        //If market uses WCOL, we use the negRiskAdapter to merge the positions.
        if (negRisk) {
            //interestingly, we have to give the underlyingUsd to the negRiskAdapter to merge, because it's the collateral token
            negRiskAdapter.mergePositions(address(underlyingUsd), PARENT_COLLECTION_ID, conditionId, partition, pairs);
        } else {
            ctf.mergePositions(address(polymarketCollateral), PARENT_COLLECTION_ID, conditionId, partition, pairs);
        }
        // USDC arrives in this contract
    }

    function _pmSplit(uint256 pairs) internal override {
        // Split USDC -> equal YES/NO positions (requires prior USDC in this contract and approval to CTF).
        uint256[] memory partition = new uint256[](2);
        partition[0] = YES_INDEX_SET;
        partition[1] = NO_INDEX_SET;

        //If market uses WCOL, we use the negRiskAdapter to split the positions.
        if (negRisk) {
            //interestingly, we have to give the underlyingUsd to the negRiskAdapter to split, because it's the collateral token
            negRiskAdapter.splitPosition(address(underlyingUsd), PARENT_COLLECTION_ID, conditionId, partition, pairs);
        } else {
            ctf.splitPosition(address(polymarketCollateral), PARENT_COLLECTION_ID, conditionId, partition, pairs);
        }
        // Outcome tokens minted to this contract
    }

    function _pmRedeemWinningToUsd() internal override returns (uint256 redeemedUsd) {
        // CTF's redeemPositions burns ALL valuable tokens for the given indexSets.
        // We redemption-all during unlock, so that's what we want.
        uint256 beforeBal = underlyingUsd.balanceOf(address(this));

        uint256[] memory indexSets = new uint256[](winningPosition == WinningPosition.BOTH ? 2 : 1);
        if (winningPosition == WinningPosition.YES) {
            indexSets[0] = YES_INDEX_SET;
        } else if (winningPosition == WinningPosition.NO) {
            indexSets[0] = NO_INDEX_SET;
        } else if (winningPosition == WinningPosition.BOTH) {
            indexSets[0] = YES_INDEX_SET;
            indexSets[1] = NO_INDEX_SET;
        }
        ctf.redeemPositions(address(polymarketCollateral), PARENT_COLLECTION_ID, conditionId, indexSets);

        //If market uses WCOL, we have to unwrap the WCOL into USDC after redemption.
        if (negRisk) {
            uint256 wcolBal = IWcol(address(polymarketCollateral)).balanceOf(address(this));
            IWcol(address(polymarketCollateral)).unwrap(address(this), wcolBal);
        }
        uint256 afterBal = underlyingUsd.balanceOf(address(this));
        redeemedUsd = afterBal - beforeBal;
        return redeemedUsd;
    }

    function _pmCheckResolved() internal view virtual override returns (bool resolved, WinningPosition winningPosition_) {
        uint256 denom = ctf.payoutDenominator(conditionId);
        if (denom == 0) {
            return (false, WinningPosition.UNRESOLVED);
        }
        // Binary: winner has numerator == denom, loser == 0 (Polymarket pays $1 to winner per share).
        uint256 numYes = ctf.payoutNumerators(conditionId, YES_INDEX);
        uint256 numNo = ctf.payoutNumerators(conditionId, NO_INDEX);
        // Be tolerant: if fractions ever show up, pick the larger numerator.
        if (numYes == numNo) {
            // Can happen, idk if it ever did on Polymarket; Can not happen on NegRisk markets
            return (true, WinningPosition.BOTH);
        }
        return (true, numYes > numNo ? WinningPosition.YES : WinningPosition.NO);
    }

    // For Polymarket CTF, outcome token units equal collateral units (USDC) -> identity mapping.
    function _pmUsdAmountForOutcome(uint256 outcomeAmount) internal pure override returns (uint256) {
        return outcomeAmount;
    }

    function _pmOutcomeAmountForUsd(uint256 usdAmount) internal pure override returns (uint256) {
        return usdAmount;
    }
}
