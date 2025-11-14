// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test } from 'forge-std/Test.sol';
import { Pausable } from '@openzeppelin/contracts/utils/Pausable.sol';

import { IConditionalTokens } from '../src/interfaces/IConditionalTokens.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { PromotionVault } from '../src/PromotionVault.sol';
import { PromotionConstants } from './helpers/PromotionConstants.sol';
import { ForkFixture } from './helpers/ForkFixture.t.sol';
import { INegRiskAdapter } from '../src/interfaces/INegRiskAdapter.sol';

contract PromotionVaultTest is Test, PromotionConstants, ForkFixture {
    // actors
    address internal owner;
    address internal alice;
    address internal bob;
    address internal carol;

    // tokens
    IERC20 internal usdc;
    IConditionalTokens internal ctf;
    INegRiskAdapter internal adapter;

    // system under test
    PromotionVault internal vault;
    /// forge-lint: disable-next-line(mixed-case-variable)
    PromotionMarketInfo M0 = firstEligible;
    /// forge-lint: disable-next-line(mixed-case-variable)
    PromotionMarketInfo M1 = firstNonEligible;
    /// forge-lint: disable-next-line(mixed-case-variable)
    PromotionMarketInfo NEW_M = secondNonEligible;

    // config
    uint256 internal constant PRICE_SCALE = 1e6;
    uint256 internal constant DAY = 1 days;
    uint256 internal constant HOUR = 1 hours;
    uint256 internal constant CAMPAIGN_DURATION = 60 days;
    uint256 internal constant TVL_CAP = 100_000_000_000; //100k
    uint256 internal constant BASE_REWARD = 1_000_000_000; //1k
    uint256 internal constant EXTRA_REWARD = 100_000_000; //100

    // prices
    uint256[] internal prices; // price of A for each market, priceB implied as 1e6 - priceA

    function setUp() public {
        _selectPolygonFork(PROMOTION_FORK_BLOCK);

        owner = address(this);
        alice = makeAddr('alice2');
        bob = makeAddr('bob2');
        carol = makeAddr('carol');
        vm.label(owner, 'owner');
        vm.label(alice, 'alice2');
        vm.label(bob, 'bob2');
        vm.label(carol, 'carol');
        vm.deal(owner, 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);

        // deploy tokens
        usdc = IERC20(UNDERLYING_USD);
        ctf = IConditionalTokens(CTF);
        adapter = INegRiskAdapter(NEG_RISK_ADAPTER);

        // deploy vault (owner = this test contract)
        vault = new PromotionVault(address(ctf), address(usdc), TVL_CAP);

        // seed USDC to owner for base pool funding and extras
        vm.startPrank(USDC_WHALE);
        bool success = usdc.transfer(owner, 10_000_000_000_000); // 10M USDC (6-dec notion)
        assertTrue(success);
        vm.stopPrank();

        // add two markets while paused
        // market 0: eligible = true
        vm.expectEmit(true, true, true, true, address(vault));
        emit PromotionVault.MarketAdded(0, M0.conditionId, M0.yesPositionId, M0.noPositionId, M0.extraEligible);
        vault.addMarket(M0.conditionId, 600_000, M0.extraEligible, M0.collateral); // A = $0.60, B = $0.40
        // market 1: eligible = false
        vm.expectEmit(true, true, true, true, address(vault));
        emit PromotionVault.MarketAdded(1, M1.conditionId, M1.yesPositionId, M1.noPositionId, M1.extraEligible);
        vault.addMarket(M1.conditionId, 300_000, M1.extraEligible, M1.collateral); // A = $0.30, B = $0.70

        // record prices vector
        prices = new uint256[](2);
        prices[0] = 600_000;
        prices[1] = 300_000;

        // approve and start campaign
        usdc.approve(address(vault), BASE_REWARD);
        vm.expectEmit(true, true, true, true, address(vault));
        emit PromotionVault.CampaignStarted(owner, BASE_REWARD, block.timestamp, block.timestamp + CAMPAIGN_DURATION);
        vault.startCampaign(BASE_REWARD, CAMPAIGN_DURATION);

        // add extra USDC to the vault
        usdc.approve(address(vault), EXTRA_REWARD);
        success = usdc.transfer(address(vault), EXTRA_REWARD);
        assertTrue(success);

        // push initial prices to set initial totals to zero (no deposits yet)
        vm.expectEmit(true, true, true, true, address(vault));
        emit PromotionVault.PricesUpdated(block.timestamp);
        vault.batchUpdatePrices(prices);
    }

    // ---------- Helpers ----------

    function _partitionYesNo() internal pure returns (uint256[] memory p) {
        p = new uint256[](2);
        p[0] = 1; // YES_INDEX_SET
        p[1] = 2; // NO_INDEX_SET
    }

    function _mintOutcome(address user, PromotionMarketInfo memory market, uint256 amount) internal {
        vm.startPrank(USDC_WHALE);
        bool success = usdc.transfer(user, amount);
        assertTrue(success);
        vm.stopPrank();

        uint256[] memory partition = _partitionYesNo();
        bool isNegRisk = market.negRisk;
        vm.startPrank(user);
        if (isNegRisk) {
            usdc.approve(address(adapter), amount);
            adapter.splitPosition(address(usdc), bytes32(0), market.conditionId, partition, amount);
        } else {
            usdc.approve(address(ctf), amount);
            ctf.splitPosition(address(usdc), bytes32(0), market.conditionId, partition, amount);
        }
        vm.stopPrank();
    }

    function _warpAndPush(uint256 secs) internal {
        vm.warp(block.timestamp + secs);
        vault.batchUpdatePrices(prices);
    }

    function _deposit(address user, uint256 marketIndex, bool isA, uint256 amount) internal {
        vm.prank(user);
        ctf.setApprovalForAll(address(vault), true); // not required since user is from, but harmless
        vm.prank(user);
        vm.expectEmit(true, true, true, true, address(vault));
        emit PromotionVault.Deposit(user, marketIndex, isA, amount);
        vault.deposit(marketIndex, isA, amount);
    }

    function _withdraw(address user, uint256 marketIndex, bool isA, uint256 amount) internal {
        vm.prank(user);
        vm.expectEmit(true, true, true, true, address(vault));
        emit PromotionVault.Withdraw(user, marketIndex, isA, amount);
        vault.withdraw(marketIndex, isA, amount);
    }

    function _batchDeposit(address user, uint256[] memory idxs, bool[] memory sides, uint256[] memory amts) internal {
        vm.prank(user);
        ctf.setApprovalForAll(address(vault), true);
        // Expect events for each item, in order
        for (uint256 i = 0; i < idxs.length; i++) {
            vm.expectEmit(true, true, true, true, address(vault));
            emit PromotionVault.Deposit(user, idxs[i], sides[i], amts[i]);
        }
        vm.prank(user);
        vault.batchDeposit(idxs, sides, amts);
    }

    function _batchWithdraw(address user, uint256[] memory idxs, bool[] memory sides, uint256[] memory amts) internal {
        // Expect events for each item, in order
        for (uint256 i = 0; i < idxs.length; i++) {
            vm.expectEmit(true, true, true, true, address(vault));
            emit PromotionVault.Withdraw(user, idxs[i], sides[i], amts[i]);
        }
        vm.prank(user);
        vault.batchWithdraw(idxs, sides, amts);
    }

    // ---------- Basics ----------

    function test_StartCampaign_SetsState_And_Unpauses() public view {
        assertTrue(vault.campaignStarted());
        assertEq(vault.campaignEndTimestamp(), block.timestamp + CAMPAIGN_DURATION);
        assertEq(vault.finalizedBasePool(), 0);
        assertEq(vault.finalizedExtraPool(), 0);
    }

    function test_SetTvlCap_Emits() public {
        uint256 newCap = TVL_CAP / 2;
        vm.expectEmit(true, true, true, true, address(vault));
        emit PromotionVault.TvlCapUpdated(TVL_CAP, newCap);
        vault.setTvlCap(newCap);
        assertEq(vault.tvlCapUsd(), newCap);
    }

    function test_Pause_Blocks_MutatingOps() public {
        vault.pause();
        // deposit blocked
        _mintOutcome(alice, M0, 1_000_000);
        vm.prank(alice);
        vm.expectRevert(Pausable.EnforcedPause.selector); // Pausable revert
        vault.deposit(0, true, 1);
        // price push blocked
        vm.expectRevert(Pausable.EnforcedPause.selector);
        vault.batchUpdatePrices(prices);
        // finalize blocked (warp to end)
        vm.warp(vault.campaignEndTimestamp());
        vm.expectRevert(Pausable.EnforcedPause.selector);
        vault.finalizeCampaign();
    }

    // ---------- Deposits, Withdrawals, Prices ----------

    function test_Deposit_UpdatesTotals_And_TvlCap() public {
        _mintOutcome(alice, M0, 2_000_000); // 2 shares
        _mintOutcome(bob, M0, 3_000_000); // 3 shares
        // deposit A (0.60 each -> $1.20)
        _deposit(alice, 0, true, 2_000_000);
        assertEq(vault.totalValueUsd(), (2_000_000 * prices[0]) / PRICE_SCALE);
        // deposit B (0.40 each -> $1.20), totals double
        _deposit(bob, 0, false, 3_000_000);
        uint256 vA = (2_000_000 * prices[0]) / PRICE_SCALE; // $1.2
        uint256 vB = (3_000_000 * (PRICE_SCALE - prices[0])) / PRICE_SCALE; // $1.2
        assertEq(vault.totalValueUsd(), vA + vB);
    }

    function test_Deposit_Enforces_TvlCap() public {
        vault.setTvlCap(1); // very small cap
        _mintOutcome(alice, M0, 10);
        vm.prank(alice);
        vm.expectRevert(PromotionVault.TvlCapExceeded.selector);
        vault.deposit(0, true, 10);
    }

    function test_BatchDeposit_MultipleMarketsSides_UpdatesTotalsAndBalances() public {
        // mint: market0 A and market1 B to alice
        _mintOutcome(alice, M0, 2_000_000);
        _mintOutcome(alice, M1, 1_000_000);
        uint256[] memory idxs = new uint256[](2);
        bool[] memory sides = new bool[](2);
        uint256[] memory amts = new uint256[](2);
        idxs[0] = 0;
        sides[0] = true;
        amts[0] = 2_000_000; // M0 A
        idxs[1] = 1;
        sides[1] = false;
        amts[1] = 1_000_000; // M1 B

        _batchDeposit(alice, idxs, sides, amts);

        // balances per market
        (uint256 a0, uint256 b0) = vault.userMarketBalances(alice, 0);
        (uint256 a1, uint256 b1) = vault.userMarketBalances(alice, 1);
        assertEq(a0, 2_000_000);
        assertEq(b0, 0);
        assertEq(a1, 0);
        assertEq(b1, 1_000_000);

        // totals
        uint256 v0 = (2_000_000 * prices[0]) / PRICE_SCALE;
        uint256 v1 = (1_000_000 * (PRICE_SCALE - prices[1])) / PRICE_SCALE;
        assertEq(vault.totalValueUsd(), v0 + v1);
    }

    function test_BatchWithdraw_MultipleMarketsSides_UpdatesTotalsAndBalances() public {
        // seed deposits first
        _mintOutcome(alice, M0, 3_000_000);
        _mintOutcome(alice, M1, 2_000_000);
        _deposit(alice, 0, true, 3_000_000);
        _deposit(alice, 1, false, 2_000_000);

        // now batch withdraw parts
        uint256[] memory idxs = new uint256[](2);
        bool[] memory sides = new bool[](2);
        uint256[] memory amts = new uint256[](2);
        idxs[0] = 0;
        sides[0] = true;
        amts[0] = 1_000_000; // withdraw 1M from M0 A
        idxs[1] = 1;
        sides[1] = false;
        amts[1] = 500_000; // withdraw 0.5M from M1 B

        uint256 preVaultA0 = ctf.balanceOf(address(vault), M0.yesPositionId);
        uint256 preVaultB1 = ctf.balanceOf(address(vault), M1.noPositionId);
        uint256 preUserA0 = ctf.balanceOf(alice, M0.yesPositionId);
        uint256 preUserB1 = ctf.balanceOf(alice, M1.noPositionId);

        _batchWithdraw(alice, idxs, sides, amts);

        // balances per market
        (uint256 a0, uint256 b0) = vault.userMarketBalances(alice, 0);
        (uint256 a1, uint256 b1) = vault.userMarketBalances(alice, 1);
        assertEq(a0, 2_000_000); // 3M - 1M
        assertEq(b0, 0);
        assertEq(a1, 0);
        assertEq(b1, 1_500_000); // 2M - 0.5M

        // token balances moved back to user
        assertEq(ctf.balanceOf(address(vault), M0.yesPositionId), preVaultA0 - 1_000_000);
        assertEq(ctf.balanceOf(address(vault), M1.noPositionId), preVaultB1 - 500_000);
        assertEq(ctf.balanceOf(alice, M0.yesPositionId), preUserA0 + 1_000_000);
        assertEq(ctf.balanceOf(alice, M1.noPositionId), preUserB1 + 500_000);
    }

    function test_BatchDeposit_LengthMismatch_Reverts() public {
        uint256[] memory idxs = new uint256[](2);
        bool[] memory sides = new bool[](1);
        uint256[] memory amts = new uint256[](2);
        idxs[0] = 0;
        idxs[1] = 1;
        sides[0] = true;
        amts[0] = 1;
        amts[1] = 1;
        vm.prank(alice);
        vm.expectRevert(PromotionVault.LengthMismatch.selector);
        vault.batchDeposit(idxs, sides, amts);
    }

    function test_BatchWithdraw_LengthMismatch_Reverts() public {
        uint256[] memory idxs = new uint256[](1);
        bool[] memory sides = new bool[](2);
        uint256[] memory amts = new uint256[](1);
        idxs[0] = 0;
        sides[0] = true;
        sides[1] = false;
        amts[0] = 1;
        vm.prank(alice);
        vm.expectRevert(PromotionVault.LengthMismatch.selector);
        vault.batchWithdraw(idxs, sides, amts);
    }

    function test_Withdraw_UpdatesTotals_And_ReturnsTokens() public {
        _mintOutcome(alice, M0, 1_500_000);
        _deposit(alice, 0, true, 1_500_000);
        uint256 pre = ctf.balanceOf(address(vault), M0.yesPositionId);
        _withdraw(alice, 0, true, 500_000);
        assertEq(ctf.balanceOf(address(vault), M0.yesPositionId), pre - 500_000);
        assertEq(ctf.balanceOf(alice, M0.yesPositionId), 500_000);
    }

    function test_BatchUpdatePrices_RecomputesTotals_And_EnforcesBounds() public {
        _mintOutcome(alice, M0, 1_000_000);
        _deposit(alice, 0, true, 1_000_000);
        // change priceA of market 0 to 0.90
        prices[0] = 900_000;
        vault.batchUpdatePrices(prices);
        // total equals new valuation
        assertEq(vault.totalValueUsd(), (1_000_000 * 900_000) / PRICE_SCALE);
        // revert when price out of range
        prices[0] = PRICE_SCALE + 1;
        vm.expectRevert(PromotionVault.PriceOutOfRange.selector);
        vault.batchUpdatePrices(prices);
    }

    // ---------- Rewards and Eligibility ----------

    function test_EarnedBase_And_EligibleAccrual_GrowOverTime() public {
        // Alice deposits in eligible market 0 (A side)
        _mintOutcome(alice, M0, 2_000_000);
        _deposit(alice, 0, true, 2_000_000);
        (uint256 tot0, uint256 base0, uint256 extra0) = vault.viewUserEstimatedEarnings(alice);
        assertEq(tot0, 0);
        assertEq(base0, 0);
        assertEq(extra0, 0);

        // Warp without pushing prices so the view function simulates accrual since lastRewardTimestamp
        _warpAndPush(HOUR);
        //vm.warp(block.timestamp + HOUR);
        (uint256 tot, uint256 base, uint256 extra) = vault.viewUserEstimatedEarnings(alice);
        uint256 expectedBase = (BASE_REWARD * HOUR) / CAMPAIGN_DURATION;
        uint256 expectedExtra = EXTRA_REWARD;
        assertEq(base, expectedBase);
        assertEq(extra, expectedExtra);
        assertEq(tot, expectedBase + expectedExtra);
    }

    function test_EndAndReplaceMarket_StopsAccrual_OnOld_AllowsNew() public {
        // deposit into market 1 to have some totals there
        _mintOutcome(alice, M1, 2_000_000);
        _deposit(alice, 1, false, 2_000_000);
        // end market 1 and replace with a new market 2

        vm.expectEmit(true, true, true, true, address(vault));
        emit PromotionVault.MarketEnded(1);
        vm.expectEmit(true, true, true, true, address(vault));
        emit PromotionVault.MarketAdded(2, NEW_M.conditionId, NEW_M.yesPositionId, NEW_M.noPositionId, NEW_M.extraEligible);
        vault.endAndReplaceMarket(1, NEW_M.conditionId, 500_000, NEW_M.extraEligible, NEW_M.collateral);
        // deposit into ended market shoul d revert
        _mintOutcome(bob, M1, 100_000);
        vm.prank(bob);
        vm.expectRevert(PromotionVault.MarketNotActive.selector);
        vault.deposit(1, false, 100_000);
        // deposit into new market succeeds
        _mintOutcome(bob, NEW_M, 100_000);
        _deposit(bob, 2, false, 100_000);
    }

    function test_DuplicateTokenIds_Rejected() public {
        // Try adding a market overlapping tokenId with an active one (M0_A)
        vm.expectRevert(PromotionVault.DuplicateTokenId.selector);
        vault.addMarket(M0.conditionId, 500_000, M0.extraEligible, M0.collateral);
    }

    // ---------- Finalization and Claims ----------

    function test_Finalize_WithEligible_SplitsBaseAccrued_And_ExtraPool() public {
        uint256 amountAlice = 2_000_000;
        uint256 amountBob = 2_000_000;

        // Alice and Bob deposit in eligible market 0 to create TVL
        _mintOutcome(alice, M0, amountAlice);
        _mintOutcome(bob, M0, amountBob);
        _deposit(alice, 0, true, amountAlice);
        _deposit(bob, 0, false, amountBob);

        // accrue for 2 hours
        _warpAndPush(2 * HOUR);

        // finalize at campaign end
        vm.warp(vault.campaignEndTimestamp());
        vm.expectEmit(true, true, true, true, address(vault));
        emit PromotionVault.CampaignFinalized(
            block.timestamp,
            amountAlice * CAMPAIGN_DURATION,
            amountBob * CAMPAIGN_DURATION,
            BASE_REWARD,
            EXTRA_REWARD
        );
        vault.finalizeCampaign();

        uint256 totalBal = usdc.balanceOf(address(vault));
        uint256 baseDist = vault.finalizedBasePool();
        uint256 extra = vault.finalizedExtraPool();

        // basePool equals min(accrued, balance) when extra > 0
        assertLe(baseDist, totalBal);
        assertEq(baseDist + extra, totalBal);
        assertEq(baseDist, BASE_REWARD);
        assertEq(extra, EXTRA_REWARD);

        // claim for Alice and Bob
        uint256 aBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        vault.claimRewards();
        uint256 aAfter = usdc.balanceOf(alice);
        assertGt(aAfter, aBefore);
        assertEq(aAfter - aBefore, ((BASE_REWARD + EXTRA_REWARD) * prices[0]) / PRICE_SCALE);

        uint256 bBefore = usdc.balanceOf(bob);
        vm.prank(bob);
        vault.claimRewards();
        uint256 bAfter = usdc.balanceOf(bob);
        assertGt(bAfter, bBefore);
        assertEq(bAfter - bBefore, ((BASE_REWARD + EXTRA_REWARD) * (PRICE_SCALE - prices[0])) / PRICE_SCALE);

        // total paid equals vault balance depletion (within integer division tolerance)
        // After both claims, the vault may still have unclaimed amounts for ca^rol=0, but not applicable here.
    }

    function test_Finalize_NoEligible_DistributesAllAsBase() public {
        // Use only market 1 (eligible=false)
        _mintOutcome(alice, M1, 1_000_000);
        _mintOutcome(bob, M1, 1_000_000);
        _deposit(alice, 1, true, 1_000_000);
        _deposit(bob, 1, false, 1_000_000);
        _warpAndPush(3 * HOUR);

        vm.warp(vault.campaignEndTimestamp());
        vault.finalizeCampaign();

        // When no eligible value time, everything is base
        assertEq(vault.finalizedExtraPool(), 0);
        assertEq(vault.finalizedBasePool(), usdc.balanceOf(address(vault)));

        // After claims, total payouts should equal vault balance (scaled by factor > 1 from extra)
        uint256 aBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        vault.claimRewards();
        uint256 bBefore = usdc.balanceOf(bob);
        vm.prank(bob);
        vault.claimRewards();
        assertEq(usdc.balanceOf(alice) - aBefore, ((BASE_REWARD + EXTRA_REWARD) * prices[1]) / PRICE_SCALE);
        assertEq(usdc.balanceOf(bob) - bBefore, ((BASE_REWARD + EXTRA_REWARD) * (PRICE_SCALE - prices[1])) / PRICE_SCALE);
    }

    function test_Claim_Reverts_BeforeFinalize_And_WhenNothingToClaim() public {
        _mintOutcome(alice, M0, 1_000_000);
        _deposit(alice, 0, true, 1_000_000);
        vm.prank(alice);
        vm.expectRevert(PromotionVault.CampaignNotFinalized.selector);
        vault.claimRewards();

        // finalize immediately (no time -> probably zero earned; but guard requires >0 payout)
        vm.warp(vault.campaignEndTimestamp());
        vault.finalizeCampaign();
        vm.prank(carol);
        vm.expectRevert(PromotionVault.ZeroAmount.selector);
        vault.claimRewards();
    }

    // ---------- Views ----------

    function test_UserBalances_And_CurrentValues() public {
        _mintOutcome(alice, M0, 2_000_000);
        _mintOutcome(alice, M1, 1_000_000);
        _deposit(alice, 0, true, 2_000_000);
        _deposit(alice, 1, false, 1_000_000);
        (uint256 a0, uint256 b0) = vault.userMarketBalances(alice, 0);
        assertEq(a0, 2_000_000);
        assertEq(b0, 0);
        (uint256 a1, uint256 b1) = vault.userMarketBalances(alice, 1);
        assertEq(a1, 0);
        assertEq(b1, 1_000_000);
        (uint256 vUsd, uint256 eUsd) = vault.viewUserCurrentValues(alice);
        uint256 expected0 = (2_000_000 * prices[0]) / PRICE_SCALE;
        uint256 expected1 = (1_000_000 * (PRICE_SCALE - prices[1])) / PRICE_SCALE;
        assertEq(vUsd, expected0 + expected1);
        // only market 0 is eligible
        assertEq(eUsd, expected0);
    }

    // ---------- End-to-end scenario ----------
    struct Accrual {
        uint256 totalValueTime;
        uint256 totalExtraValueTime;
        uint256 aliceUsd;
        uint256 aliceEusd;
        uint256 aliceValueTime;
        uint256 aliceExtraValueTime;
        uint256 aliceM0a;
        uint256 aliceM1b;
        uint256 bobUsd;
        uint256 bobEusd;
        uint256 bobValueTime;
        uint256 bobExtraValueTime;
        uint256 bobM0b;
        uint256 carolUsd;
        uint256 carolEusd;
        uint256 carolValueTime;
        uint256 carolExtraValueTime;
        uint256 carolM0a;
        uint256 carolM1a;
    }

    Accrual A;

    function advanceAccrual(uint256 delta) public {
        A.aliceUsd = (A.aliceM0a * prices[0]) / PRICE_SCALE + (A.aliceM1b * (PRICE_SCALE - prices[1])) / PRICE_SCALE;
        A.aliceEusd = (A.aliceM0a * prices[0]) / PRICE_SCALE;
        A.bobUsd = (A.bobM0b * (PRICE_SCALE - prices[0])) / PRICE_SCALE;
        A.bobEusd = (A.bobM0b * (PRICE_SCALE - prices[0])) / PRICE_SCALE;
        A.carolUsd = (A.carolM0a * prices[0]) / PRICE_SCALE + (A.carolM1a * prices[1]) / PRICE_SCALE;
        A.carolEusd = (A.carolM0a * prices[0]) / PRICE_SCALE;
        A.totalValueTime += (A.aliceUsd + A.bobUsd + A.carolUsd) * delta;
        A.totalExtraValueTime += (A.aliceEusd + A.bobEusd + A.carolEusd) * delta;
        A.aliceValueTime += A.aliceUsd * delta;
        A.aliceExtraValueTime += A.aliceEusd * delta;
        A.bobValueTime += A.bobUsd * delta;
        A.bobExtraValueTime += A.bobEusd * delta;
        A.carolValueTime += A.carolUsd * delta;
        A.carolExtraValueTime += A.carolEusd * delta;
    }

    function test_EndToEnd_MultiUser_MultiMarket_MultiPriceUpdates() public {
        // ---- Incremental simulation of USD-seconds across warps/updates ----
        uint256 delta;

        // alice: deposit eligible A, then later B on ineligible market
        _mintOutcome(alice, M0, 5_000_000);
        _mintOutcome(alice, M1, 2_000_000);
        _deposit(alice, 0, true, 3_000_000);
        A.aliceM0a += 3_000_000;
        delta = 2 * HOUR;
        _warpAndPush(delta);

        // S1: t1 -> t2
        advanceAccrual(delta);

        // bob: deposit B on eligible market later, withdraw part before end
        _deposit(alice, 1, false, 2_000_000);
        A.aliceM1b += 2_000_000;
        _mintOutcome(bob, M0, 6_000_000);
        delta = 3 * HOUR;
        _warpAndPush(delta);

        // S2: t2 -> t3 (alice adds m1B 2M)
        advanceAccrual(delta);

        _deposit(bob, 0, false, 4_000_000);
        A.bobM0b += 4_000_000;
        delta = 1 * HOUR;
        _warpAndPush(delta);

        // S3: t3 -> t4 (bob adds m0B 4M)
        advanceAccrual(delta);

        _withdraw(bob, 0, false, 1_000_000);
        A.bobM0b -= 1_000_000;
        prices[0] = 550_000; // 0.55 / 0.45
        prices[1] = 350_000; // 0.35 / 0.65
        vault.batchUpdatePrices(prices);
        delta = 30 * 60;
        _warpAndPush(delta);

        // S4: t4 -> t5
        advanceAccrual(delta);

        // carol: interacts on both markets at different prices
        _mintOutcome(carol, M0, 3_000_000);
        _mintOutcome(carol, M1, 1_000_000);
        _deposit(carol, 0, true, 2_000_000);
        A.carolM0a += 2_000_000;
        _deposit(carol, 1, true, 1_000_000);
        A.carolM1a += 1_000_000;
        // more price changes
        prices[0] = 480_000;
        prices[1] = 420_000;
        delta = 2 * HOUR;
        _warpAndPush(delta);

        // S5: t5 -> t6
        advanceAccrual(delta);

        // top up extras
        uint256 extraReward = 200_000_000;
        vm.prank(USDC_WHALE);
        bool success = usdc.transfer(address(vault), extraReward); // 200 USDC
        assertTrue(success);
        delta = vault.campaignEndTimestamp() - block.timestamp;
        _warpAndPush(delta);

        // S6: t6 -> end
        advanceAccrual(delta);

        // finalize and claim
        vault.finalizeCampaign();
        uint256 baseDist = vault.finalizedBasePool();
        uint256 extra = vault.finalizedExtraPool();
        assertEq(baseDist, BASE_REWARD);
        assertEq(extra, EXTRA_REWARD + extraReward);
        uint256 actualValueTime = vault.totalValueTime();
        uint256 actualExtraValueTime = vault.totalExtraValueTime();
        assertApproxEqRel(A.totalValueTime, actualValueTime, 0.0001e18); // 0.01%
        assertApproxEqRel(A.totalExtraValueTime, actualExtraValueTime, 0.0001e18); // 0.01%

        // Expected payouts
        uint256 expAlice = (A.aliceValueTime * baseDist) / A.totalValueTime + (A.aliceExtraValueTime * extra) / A.totalExtraValueTime;
        uint256 expBob = (A.bobValueTime * baseDist) / A.totalValueTime + (A.bobExtraValueTime * extra) / A.totalExtraValueTime;
        uint256 expCarol = (A.carolValueTime * baseDist) / A.totalValueTime + (A.carolExtraValueTime * extra) / A.totalExtraValueTime;

        uint256 aBefore = usdc.balanceOf(alice);
        uint256 bBefore = usdc.balanceOf(bob);
        uint256 cBefore = usdc.balanceOf(carol);
        vm.prank(alice);
        vault.claimRewards();
        vm.prank(bob);
        vault.claimRewards();
        vm.prank(carol);
        vault.claimRewards();

        uint256 aPaid = usdc.balanceOf(alice) - aBefore;
        uint256 bPaid = usdc.balanceOf(bob) - bBefore;
        uint256 cPaid = usdc.balanceOf(carol) - cBefore;

        assertApproxEqAbs(aPaid + bPaid + cPaid, baseDist + extra, 3);
        // Compare each user's payout to simulated expected payout (allow small rounding tolerance)
        assertApproxEqRel(aPaid, expAlice, 0.00025e18); // allow small rounding drift across segments (0.025%)
        assertApproxEqRel(bPaid, expBob, 0.00025e18);
        assertApproxEqRel(cPaid, expCarol, 0.00025e18);

        // ---------- Withdraw all tokens after claiming ----------
        // Alice: market 0 A
        if (A.aliceM0a > 0) {
            _withdraw(alice, 0, true, A.aliceM0a);
        }
        // Alice: market 1 B
        if (A.aliceM1b > 0) {
            _withdraw(alice, 1, false, A.aliceM1b);
        }
        // Bob: market 0 B
        if (A.bobM0b > 0) {
            _withdraw(bob, 0, false, A.bobM0b);
        }
        // Carol: market 0 A
        if (A.carolM0a > 0) {
            _withdraw(carol, 0, true, A.carolM0a);
        }
        // Carol: market 1 A
        if (A.carolM1a > 0) {
            _withdraw(carol, 1, true, A.carolM1a);
        }
    }
}
