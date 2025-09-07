// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test } from 'forge-std/Test.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { IConditionalTokens } from '../src/interfaces/IConditionalTokens.sol';
import { MockPolyMarketAaveVault } from './mocks/MockPolyMarketAaveVault.sol';
import { Addresses } from './helpers/Addresses.t.sol';
import { ForkFixture } from './helpers/ForkFixture.t.sol';

contract PolymarketStakingVaultForkTest is Test, ForkFixture, Addresses {
    // Fork settings
    uint256 internal constant FORK_BLOCK = 76163124; // e.g., 61500000

    // Amounts (USDC has 6 decimals on Polygon). Example: 1_000_000 = 1 USDC
    uint256 internal constant AMOUNT_TO_SPLIT = 1_000_000_000; // e.g., 1_000_000

    // ========= End of fillable constants =========

    IConditionalTokens internal ctf;

    function setUp() public virtual {
        // Create fork only when configured
        _selectPolygonFork(FORK_BLOCK);
        if (CTF != address(0)) {
            ctf = IConditionalTokens(CTF);
        }
    }

    function _deployVault(BettingMarketInfo memory market) internal returns (MockPolyMarketAaveVault vault) {
        require(UNDERLYING_USD != address(0) && CTF != address(0), 'Fill USDC/CTF');
        vault = new MockPolyMarketAaveVault();
        vault.initialize(UNDERLYING_USD, AAVE_POOL, DATA_PROVIDER, 0, CTF, market.conditionId, NEG_RISK_ADAPTER, market.negRisk, market.collateral);
    }

    function _fundVaultWithUsdc(address vault, uint256 amount) internal {
        require(USDC_WHALE != address(0) && amount > 0, 'Fill whale/amount');
        vm.startPrank(USDC_WHALE);
        bool success = IERC20(UNDERLYING_USD).transfer(vault, amount);
        require(success, 'Transfer failed');
        vm.stopPrank();
    }

    // ====== Tests ======

    function test_PositionIds_ComputedCorrectly() public {
        if (resolvedMarket.conditionId == bytes32(0)) revert('Fill constants');

        MockPolyMarketAaveVault vault = _deployVault(resolvedMarket);
        assertEq(vault.yesPositionId(), resolvedMarket.yesPositionId, 'yesPositionId mismatch');
        assertEq(vault.noPositionId(), resolvedMarket.noPositionId, 'noPositionId mismatch');

        MockPolyMarketAaveVault vault2 = _deployVault(runningMarket);
        assertEq(vault2.yesPositionId(), runningMarket.yesPositionId, 'yesPositionId mismatch');
        assertEq(vault2.noPositionId(), runningMarket.noPositionId, 'noPositionId mismatch');
    }

    function test_Split_And_Merge_Works_Running() public {
        splitAndMergeWorks(runningMarket);
    }

    function test_Split_And_Merge_Works_Resolved() public {
        splitAndMergeWorks(resolvedMarket);
    }

    function test_Split_And_Merge_Works_Resolved_NegRisk() public {
        splitAndMergeWorks(resolvedNegRiskMarket);
    }

    function splitAndMergeWorks(BettingMarketInfo memory market) public {
        if (market.conditionId == bytes32(0) || AMOUNT_TO_SPLIT == 0) revert('Fill constants');

        MockPolyMarketAaveVault vault = _deployVault(market);

        _fundVaultWithUsdc(address(vault), AMOUNT_TO_SPLIT);

        uint256 yesId = vault.yesPositionId();
        uint256 noId = vault.noPositionId();

        uint256 usdcBefore = IERC20(UNDERLYING_USD).balanceOf(address(vault));
        assertEq(usdcBefore, AMOUNT_TO_SPLIT, 'pre: vault USDC');

        // Split USDC -> YES/NO
        vault.harnessPmSplit(AMOUNT_TO_SPLIT);

        uint256 yesAfterSplit = ctf.balanceOf(address(vault), yesId);
        uint256 noAfterSplit = ctf.balanceOf(address(vault), noId);
        uint256 usdcAfterSplit = IERC20(UNDERLYING_USD).balanceOf(address(vault));

        assertEq(yesAfterSplit, AMOUNT_TO_SPLIT, 'split: YES amount');
        assertEq(noAfterSplit, AMOUNT_TO_SPLIT, 'split: NO amount');
        assertEq(usdcAfterSplit, 0, 'split: USDC deducted');

        // Merge YES/NO -> USDC
        vault.harnessPmMerge(AMOUNT_TO_SPLIT);

        uint256 yesAfterMerge = ctf.balanceOf(address(vault), yesId);
        uint256 noAfterMerge = ctf.balanceOf(address(vault), noId);
        uint256 usdcAfterMerge = IERC20(UNDERLYING_USD).balanceOf(address(vault));

        assertEq(yesAfterMerge, 0, 'merge: YES burned');
        assertEq(noAfterMerge, 0, 'merge: NO burned');
        assertEq(usdcAfterMerge, AMOUNT_TO_SPLIT, 'merge: USDC returned');
    }

    function test_Redeem_Winning_Tokens_On_Resolved_Market() public {
        redeemWinningTokensOnResolvedMarket(resolvedMarket);
    }

    function test_Redeem_Winning_Tokens_On_Resolved_NegRisk_Market() public {
        redeemWinningTokensOnResolvedMarket(resolvedNegRiskMarket);
    }

    function redeemWinningTokensOnResolvedMarket(BettingMarketInfo memory market) public {
        if (resolvedMarket.conditionId == bytes32(0) || AMOUNT_TO_SPLIT == 0) revert('Fill constants');

        MockPolyMarketAaveVault vault = _deployVault(market);

        _fundVaultWithUsdc(address(vault), AMOUNT_TO_SPLIT);

        // Mint both sides
        vault.harnessPmSplit(AMOUNT_TO_SPLIT);

        // Verify resolved and determine winner
        (bool resolved, bool yesWon) = vault.harnessPmCheckResolved();
        assertTrue(resolved, 'market not resolved');

        uint256 yesId = vault.yesPositionId();
        uint256 noId = vault.noPositionId();
        uint256 beforeUsd = IERC20(UNDERLYING_USD).balanceOf(address(vault));
        uint256 beforeYes = ctf.balanceOf(address(vault), yesId);
        uint256 beforeNo = ctf.balanceOf(address(vault), noId);

        // Redeem ALL winning tokens directly via hook
        uint256 redeemed = vault.harnessPmRedeemWinningToUsd(yesWon);

        uint256 afterUsd = IERC20(UNDERLYING_USD).balanceOf(address(vault));
        uint256 afterYes = ctf.balanceOf(address(vault), yesId);
        uint256 afterNo = ctf.balanceOf(address(vault), noId);

        // Winner’s tokens burned; loser’s remain; USDC increased by winning amount
        if (yesWon) {
            assertEq(beforeYes, AMOUNT_TO_SPLIT, 'pre: YES amount');
            assertEq(beforeNo, AMOUNT_TO_SPLIT, 'pre: NO amount');
            assertEq(afterYes, 0, 'post: YES burned');
            assertEq(afterNo, AMOUNT_TO_SPLIT, 'post: NO kept');
        } else {
            assertEq(beforeYes, AMOUNT_TO_SPLIT, 'pre: YES amount');
            assertEq(beforeNo, AMOUNT_TO_SPLIT, 'pre: NO amount');
            assertEq(afterNo, 0, 'post: NO burned');
            assertEq(afterYes, AMOUNT_TO_SPLIT, 'post: YES kept');
        }

        assertEq(redeemed, AMOUNT_TO_SPLIT, 'redeemed amount');
        assertEq(afterUsd - beforeUsd, AMOUNT_TO_SPLIT, 'USDC increased');
    }

    function test_CheckResolved_Both_Cases() public {
        if (runningMarket.conditionId == bytes32(0) || resolvedMarket.conditionId == bytes32(0)) revert('Fill constants');

        // Unresolved should report false
        MockPolyMarketAaveVault vaultUnres = _deployVault(runningMarket);
        (bool resolvedUnres,) = vaultUnres.harnessPmCheckResolved();
        assertFalse(resolvedUnres, 'expected unresolved');

        // Resolved should report true and the winner should match the expected winner
        MockPolyMarketAaveVault vaultRes = _deployVault(resolvedMarket);
        (bool resolved, bool yesWon) = vaultRes.harnessPmCheckResolved();
        assertTrue(resolved, 'expected resolved');
        assertEq(yesWon, resolvedMarket.yesTokenWon, 'winner mismatch');
    }
}
