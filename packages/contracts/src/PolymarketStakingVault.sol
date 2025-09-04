// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { ERC1155HolderUpgradeable } from '@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol';

import { RobinStakingVault } from './RobinStakingVault.sol';
import { IConditionalTokens } from './interfaces/IConditionalTokens.sol';
import { ISafeProxyFactory } from './interfaces/ISafeProxyFactory.sol';

/// @title PolymarketStakingVault
/// @notice PM adapter for Polymarket (Gnosis CTF) that implements the prediction-market hooks of RobinStakingVault.
/// @dev Yield strategy hooks remain abstract and must be implemented in a subclass (e.g., Aave/Dolomite).
abstract contract PolymarketStakingVault is RobinStakingVault, ERC1155HolderUpgradeable {
    uint256 public constant YES_INDEX = 0;
    uint256 public constant NO_INDEX = 1;
    uint256 public constant YES_INDEX_SET = 1 << YES_INDEX; // YES is always the first index set for us
    uint256 public constant NO_INDEX_SET = 1 << NO_INDEX; // NO is always the second index set for us
    bytes32 public constant PARENT_COLLECTION_ID = 0x0; // Always 0x0 for Polymarket

    IConditionalTokens public ctf;
    ISafeProxyFactory public safeProxyFactory;

    // Condition wiring
    bytes32 public conditionId;
    uint256 public yesPositionId; // ERC-1155 id
    uint256 public noPositionId; // ERC-1155 id

    error InvalidOutcomeSlotCount(uint256 outcomeSlotCount);

    /// @param _ctf                 Address of Polymarket's Conditional Tokens contract (Polygon mainnet: 0x4D97...6045)
    /// @param _safeProxyFactory    Address of SafeProxyFactory contract (Polygon mainnet: 0xaacF...541b)
    /// @param _conditionId         CTF conditionId for this market
    function __PolymarketStakingVault_init(address _ctf, address _safeProxyFactory, bytes32 _conditionId) internal onlyInitializing {
        __ERC1155Holder_init();

        ctf = IConditionalTokens(_ctf);
        safeProxyFactory = ISafeProxyFactory(_safeProxyFactory);
        conditionId = _conditionId;

        //Only allow Polymarket binary markets
        uint256 outcomeSlotCount = ctf.getOutcomeSlotCount(conditionId);
        if (outcomeSlotCount != 2) revert InvalidOutcomeSlotCount(outcomeSlotCount);

        bytes32 yesColl = ctf.getCollectionId(PARENT_COLLECTION_ID, conditionId, YES_INDEX_SET);
        bytes32 noColl = ctf.getCollectionId(PARENT_COLLECTION_ID, conditionId, NO_INDEX_SET);
        yesPositionId = ctf.getPositionId(underlyingUSD, yesColl);
        noPositionId = ctf.getPositionId(underlyingUSD, noColl);

        // Allow CTF to pull USDC for splits/merges/redemptions
        IERC20(address(underlyingUSD)).approve(address(ctf), type(uint256).max);
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
        ctf.mergePositions(underlyingUSD, PARENT_COLLECTION_ID, conditionId, partition, pairs);
        // USDC arrives in this contract
    }

    function _pmSplit(uint256 pairs) internal override {
        // Split USDC -> equal YES/NO positions (requires prior USDC in this contract and approval to CTF).
        uint256[] memory partition = new uint256[](2);
        partition[0] = YES_INDEX_SET;
        partition[1] = NO_INDEX_SET;
        ctf.splitPosition(underlyingUSD, PARENT_COLLECTION_ID, conditionId, partition, pairs);
        // Outcome tokens minted to this contract
    }

    function _pmRedeemWinningToUSD(bool isYes) internal override returns (uint256 redeemedUSD) {
        // CTF's redeemPositions burns ALL valuable tokens for the given indexSets.
        // We redemption-all during unlock, so that's what we want.
        uint256 beforeBal = underlyingUSD.balanceOf(address(this));

        uint256[] memory indexSets = new uint256[](1);
        indexSets[0] = isYes ? YES_INDEX_SET : NO_INDEX_SET;
        ctf.redeemPositions(underlyingUSD, PARENT_COLLECTION_ID, conditionId, indexSets);

        uint256 afterBal = underlyingUSD.balanceOf(address(this));
        redeemedUSD = afterBal - beforeBal;
        return redeemedUSD;
    }

    function _pmCheckResolved() internal view override returns (bool resolved, bool yesWon_) {
        uint256 denom = ctf.payoutDenominator(conditionId);
        if (denom == 0) {
            return (false, false);
        }
        // Binary: winner has numerator == denom, loser == 0 (Polymarket pays $1 to winner per share).
        uint256 numYes = ctf.payoutNumerators(conditionId, YES_INDEX);
        uint256 numNo = ctf.payoutNumerators(conditionId, NO_INDEX);
        // Be tolerant: if fractions ever show up, pick the larger numerator.
        if (numYes == numNo) {
            // Shouldn't happen in binary; default to YES=false
            return (true, false);
        }
        return (true, numYes > numNo);
    }

    // For Polymarket CTF, outcome token units equal collateral units (USDC) -> identity mapping.
    function _pmUSDAmountForOutcome(uint256 outcomeAmount) internal pure override returns (uint256) {
        return outcomeAmount;
    }

    function _pmOutcomeAmountForUSD(uint256 usdAmount) internal pure override returns (uint256) {
        return usdAmount;
    }

    function _proxyFor(address user) internal view override returns (address) {
        address p = safeProxyFactory.computeProxyAddress(user);
        return p == address(0) ? user : p;
    }
}
