// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Test } from 'forge-std/Test.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import { IAToken } from '@aave-dao/aave-v3-origin/src/contracts/interfaces/IAToken.sol';

import { RobinVaultManager } from '../src/RobinVaultManager.sol';
import { PolymarketAaveStakingVault } from '../src/PolymarketAaveStakingVault.sol';
import { IConditionalTokens } from '../src/interfaces/IConditionalTokens.sol';
import { INegRiskAdapter } from '../src/interfaces/INegRiskAdapter.sol';
import { MockPartialExitVault } from './mocks/MockPartialExitVault.sol';
import { RobinStakingVault } from '../src/RobinStakingVault.sol';
import { VaultPausable } from '../src/VaultPausable.sol';
import { UnsafeUpgrades } from 'openzeppelin-foundry-upgrades/Upgrades.sol';
import { MockRobinVaultManager } from './mocks/MockRobinVaultManager.sol';

import { Constants } from './helpers/Constants.t.sol';
import { ForkFixture } from './helpers/ForkFixture.t.sol';

contract PolymarketAaveStakingVaultTest is Test, ForkFixture, Constants {
    uint256 internal constant FORK_BLOCK = 76163124;
    BettingMarketInfo internal resolvedMarketUsed = resolvedMarket; //quickly switch between negRisk, non-negRisk and equalAmount markets

    // actors
    address internal owner;
    address internal alice;
    address internal bob;
    address internal treasury;

    // env
    IERC20 internal usdc;
    IConditionalTokens internal ctf;
    INegRiskAdapter internal adapter;

    MockRobinVaultManager internal manager;
    PolymarketAaveStakingVault internal logic;

    function setUp() public {
        _selectPolygonFork(FORK_BLOCK);

        owner = makeAddr('owner');
        alice = makeAddr('alice');
        bob = makeAddr('bob');
        treasury = makeAddr('treasury');
        vm.label(owner, 'owner');
        vm.label(alice, 'alice');
        vm.label(bob, 'bob');
        vm.label(treasury, 'treasury');

        vm.deal(owner, 100 ether);
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(treasury, 100 ether);

        usdc = IERC20(UNDERLYING_USD);
        ctf = IConditionalTokens(CTF);
        adapter = INegRiskAdapter(NEG_RISK_ADAPTER);

        // fund users with USDC
        vm.startPrank(USDC_WHALE);
        bool success = usdc.transfer(owner, 10_000_000_000); // 10,000 USDC
        assertTrue(success);
        success = usdc.transfer(alice, 5_000_000_000); // 5,000 USDC
        assertTrue(success);
        success = usdc.transfer(bob, 5_000_000_000); // 5,000 USDC
        assertTrue(success);
        vm.stopPrank();

        // deploy logic and manager
        logic = new PolymarketAaveStakingVault();
        vm.startPrank(owner);
        bytes memory initData = abi.encodeCall(
            RobinVaultManager.initialize,
            (
                address(logic),
                PROTOCOL_FEE_BPS,
                UNDERLYING_USD,
                WCOL,
                CTF,
                NEG_RISK_ADAPTER,
                NEG_RISK_CTF_EXCHANGE,
                CTF_EXCHANGE,
                AAVE_POOL,
                DATA_PROVIDER
            )
        );
        address implementation = address(new MockRobinVaultManager());
        manager = MockRobinVaultManager(UnsafeUpgrades.deployUUPSProxy(implementation, initData)); //UnsafeUpgrades only for tests
        manager.setCheckPoolResolved(false);
        vm.stopPrank();
    }

    // ========== Scoring (TimeWeighedScorer) ==========
    function test_Scoring_TimeAccrual_And_Updates() public {
        PolymarketAaveStakingVault vault = _createVault(runningMarket);

        uint256 a = 1_000_000; // alice YES
        uint256 b = 2_000_000; // bob NO

        // mint for both
        _mintOutcome(alice, vault, a + 100_000); // extra for later
        _mintOutcome(bob, vault, b);

        // t0: alice deposits YES
        vm.prank(alice);
        vault.deposit(true, a);

        // warp T1 = 3600s
        uint256 t1 = 3600;
        vm.warp(block.timestamp + t1);

        // t1: bob deposits NO
        vm.prank(bob);
        vault.deposit(false, b);

        // warp T2 = 1800s
        uint256 t2 = 1800;
        vm.warp(block.timestamp + t2);

        // per-user scores
        uint256 scoreAlice = vault.getScore(alice);
        uint256 scoreBob = vault.getScore(bob);
        assertEq(scoreAlice, a * (t1 + t2));
        assertEq(scoreBob, b * t2);
        assertEq(vault.getGlobalScore(), scoreAlice + scoreBob);

        // Trigger an update on Alice to materialize cumulative and update lastUpdated
        // Deposit a small extra amount; need YES tokens available
        vm.prank(alice);
        vault.deposit(true, 100_000);
        (uint256 balA, uint256 lastA, uint256 cumA) = vault.getUserState(alice);
        assertEq(balA, a + 100_000);
        assertEq(cumA, a * (t1 + t2));
        assertEq(lastA, block.timestamp);
    }

    function test_Scoring_FreezeAtFinalization_UsingMock() public {
        // Use resolved market via mock so we can initialize after resolution
        PolymarketAaveStakingVault vault = _createVault(resolvedMarketUsed);
        _mintOutcome(alice, vault, 1_000_000);

        // deposit and accrue some time
        vm.prank(alice);
        vault.deposit(true, 1_000_000);
        vm.warp(block.timestamp + 3600);
        uint256 before = vault.getScore(alice);

        // finalize (resolved market)
        vault.finalizeMarket();
        assertTrue(vault.finalized());

        // warp more time — score should remain the same
        vm.warp(block.timestamp + 7200);
        uint256 afterScore = vault.getScore(alice);
        assertEq(afterScore, before);
    }

    // ========== Finalization ==========
    function test_Finalize_FromResolvedPolymarket_UsingMock() public {
        PolymarketAaveStakingVault vault = _createVault(resolvedMarketUsed);

        // expect event and state updates
        vm.expectEmit(true, true, true, true, address(vault));
        emit RobinStakingVault.MarketFinalized(resolvedMarketUsed.winningPosition);
        vault.finalizeMarket();

        assertTrue(vault.finalized());
        assertEq(uint8(vault.winningPosition()), uint8(resolvedMarketUsed.winningPosition));
        assertGt(vault.finalizationTime(), 0);

        uint256 g1 = vault.getGlobalScore();
        vm.warp(block.timestamp + 3600);
        uint256 g2 = vault.getGlobalScore();
        assertEq(g1, g2); // frozen
    }

    function test_Finalize_Negatives_RunningMarket_And_DoubleCall() public {
        // unresolved market vault via manager
        PolymarketAaveStakingVault v = _createVault(runningMarket);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.MarketNotResolved.selector));
        v.finalizeMarket();

        // resolved mock: finalize twice reverts
        PolymarketAaveStakingVault vault = _createVault(resolvedMarketUsed);
        vault.finalizeMarket();
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.VaultAlreadyFinalized.selector));
        vault.finalizeMarket();
    }

    // ========== Unlocking Yield ==========
    function _setupResolvedVaultWithPrincipal(uint256 amount) internal returns (PolymarketAaveStakingVault vault) {
        vault = _createVault(resolvedMarketUsed);

        // mint equal positions so deposit pairs and supplies to Aave
        _mintOutcome(alice, vault, amount);
        _mintOutcome(bob, vault, amount);

        vm.prank(alice);
        vault.deposit(true, amount);
        vm.prank(bob);
        vault.deposit(false, amount);
    }

    function test_Unlock_FirstCall_Emits_And_Progress() public {
        uint256 amount = 2_000_000; // 2 USDC each -> 2 supplied
        PolymarketAaveStakingVault vault = _setupResolvedVaultWithPrincipal(amount);

        uint256 principal = vault.getVaultPairedPrincipalUsd();
        assertEq(principal, amount);

        // Expect events sequence: MarketFinalized -> YieldUnlockStarted -> YieldUnlockProgress -> YieldUnlocked
        vm.expectEmit(true, true, true, true, address(vault));
        emit RobinStakingVault.MarketFinalized(resolvedMarketUsed.winningPosition);
        vm.expectEmit(true, true, true, true, address(vault));
        emit RobinStakingVault.YieldUnlockStarted(0, principal);
        vm.expectEmit(true, false, false, false, address(vault));
        emit RobinStakingVault.YieldUnlockProgress(0, 0, 0); // data unchecked
        vm.expectEmit(true, false, false, false, address(vault));
        emit RobinStakingVault.YieldUnlocked(0, 0, 0, 0); // data unchecked

        vault.finalizeMarket();

        // After finalize, unlock likely completed in one call on Aave
        assertTrue(vault.yieldUnlocked());
        assertFalse(vault.unlocking());
        assertEq(vault.getVaultPairedPrincipalUsd(), 0);
        assertGt(vault.unlockedUsd(), 0);
    }

    function test_Unlock_Completion_State_And_Yields() public {
        uint256 amount = 3_000_000;
        PolymarketAaveStakingVault vault = _setupResolvedVaultWithPrincipal(amount);
        uint256 principalBefore = vault.getVaultPairedPrincipalUsd();

        vm.warp(block.timestamp + 3600 * 12);

        vault.finalizeMarket();

        // State after completion
        assertTrue(vault.yieldUnlocked());
        assertFalse(vault.unlocking());
        assertEq(vault.getVaultPairedPrincipalUsd(), 0);

        uint256 unlocked = vault.unlockedUsd();
        uint256 totalYield = vault.totalYield();
        uint256 protocolYield = vault.protocolYield();
        uint256 userYield = vault.userYield();

        if (unlocked >= principalBefore) {
            assertEq(totalYield, unlocked - principalBefore);
        } else {
            assertEq(totalYield, 0);
        }
        assertEq(protocolYield + userYield, totalYield);
        assertEq(protocolYield, (totalYield * PROTOCOL_FEE_BPS) / 10_000);

        // No unpaired tokens should remain in this scenario
        (uint256 uY, uint256 uN) = vault.getVaultUnpaired();
        assertEq(uY, 0);
        assertEq(uN, 0);
    }

    function test_Unlock_BeforeFinalize_Reverts() public {
        // unresolved vault via manager
        PolymarketAaveStakingVault v = _createVault(runningMarket);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.VaultNotFinalized.selector));
        v.unlockYield();
    }

    function test_Unlock_CannotRunTwice() public {
        uint256 amount = 1_000_000;
        PolymarketAaveStakingVault vault = _setupResolvedVaultWithPrincipal(amount);
        vault.finalizeMarket(); // performs unlock once
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.YieldAlreadyUnlocked.selector));
        vault.unlockYield();
    }

    struct Winner {
        address winner;
        uint256 winnerAmount;
    }

    // ========== Redeeming Winners ==========
    function _setupResolvedVaultWithWinners(uint256 amountYes, uint256 amountNo)
        internal
        returns (PolymarketAaveStakingVault vault, Winner[] memory winners)
    {
        // NO is winner on resolvedMarket per Constants
        vault = _createVault(resolvedMarketUsed);

        // mint outcome tokens to each
        _mintOutcome(alice, vault, amountNo); // alice will deposit NO
        _mintOutcome(bob, vault, amountYes); // bob will deposit YES

        // deposit so they pair and supply
        vm.prank(alice);
        vault.deposit(false, amountNo);
        vm.prank(bob);
        vault.deposit(true, amountYes);

        // finalize (unlock happens too)
        vm.warp(block.timestamp + 500); //need a little bit of warp, otherwise 1 gwei might be missing from aave due to rounding
        vault.finalizeMarket();

        bool isBoth = resolvedMarketUsed.winningPosition == RobinStakingVault.WinningPosition.BOTH;
        Winner[] memory winnersTmp = isBoth ? new Winner[](2) : new Winner[](1);
        if (resolvedMarketUsed.winningPosition == RobinStakingVault.WinningPosition.YES) {
            (uint256 bobYes,) = vault.getUserBalances(bob);
            winnersTmp[0] = Winner({ winner: bob, winnerAmount: bobYes });
        } else if (resolvedMarketUsed.winningPosition == RobinStakingVault.WinningPosition.NO) {
            (, uint256 aliceNo) = vault.getUserBalances(alice);
            winnersTmp[0] = Winner({ winner: alice, winnerAmount: aliceNo });
        } else if (isBoth) {
            (uint256 bobYes, uint256 bobNo) = vault.getUserBalances(bob);
            (uint256 aliceYes, uint256 aliceNo) = vault.getUserBalances(alice);
            winnersTmp[0] = Winner({ winner: bob, winnerAmount: (bobYes + bobNo) / 2 });
            winnersTmp[1] = Winner({ winner: alice, winnerAmount: (aliceYes + aliceNo) / 2 });
        }

        return (vault, winnersTmp);
    }

    function test_Redeem_DuringOrAfterUnlock_Sufficient_And_InsufficientUSD() public {
        uint256 amount = 1_000_000;
        (PolymarketAaveStakingVault vault, Winner[] memory winners) = _setupResolvedVaultWithWinners(amount, amount);
        address winner = winners[0].winner;

        // simulate limited on-hand USDC via cheatcode to exercise InsufficientUSD path
        // put only 300k USDC on hand
        deal(address(usdc), address(vault), 300_000, true);

        // trying to redeem more than on-hand now should revert
        vm.prank(winner);
        uint256 neededAmount = winners[0].winnerAmount;
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.InsufficientUSD.selector, uint256(300_000), uint256(neededAmount)));
        // request 300k but only 100k left on hand (since 200k paid)
        vault.redeemWinningForUsd();

        // scores remain frozen across warps
        uint256 s1 = vault.getScore(winner);
        vm.warp(block.timestamp + 3600);
        uint256 s2 = vault.getScore(winner);
        assertEq(s1, s2);
    }

    function test_Redeem_AfterUnlock_FullWinner() public {
        (PolymarketAaveStakingVault vault, Winner[] memory winners) = _setupResolvedVaultWithWinners(2_000_000, 2_000_000);

        for (uint256 i = 0; i < winners.length; i++) {
            address winner = winners[i].winner;
            uint256 winnerAmt = winners[i].winnerAmount;
            // ensure vault has enough on-hand (default after finalize is fully drained for Aave)
            uint256 balBefore = usdc.balanceOf(winner);

            vm.prank(winner);
            vault.redeemWinningForUsd(); // request more than winning; contract clamps

            uint256 balAfter = usdc.balanceOf(winner);
            assertEq(balAfter - balBefore, winnerAmt);

            // user's winning balance reduced to zero
            (, uint256 noAfter) = vault.getUserBalances(winner);
            assertEq(noAfter, 0);
        }
    }

    // ========== Harvesting Yield ==========
    function _setupHarvestScenario(uint256 a, uint256 t1, uint256 t2) internal returns (PolymarketAaveStakingVault vault) {
        // resolved market so we can finalize later
        vault = _createVault(resolvedMarketUsed);

        // mint outcomes
        _mintOutcome(alice, vault, a);
        _mintOutcome(bob, vault, a);

        // t0: alice YES
        vm.prank(alice);
        vault.deposit(true, a);
        vm.warp(block.timestamp + t1);

        // t1: bob NO
        vm.prank(bob);
        vault.deposit(false, a);
        vm.warp(block.timestamp + t2);

        return vault;
    }

    function test_Harvest_UserYield_ShareAndEvent() public {
        uint256 a = 2_000_000;
        uint256 t1 = 2 days;
        uint256 t2 = 30 days;
        PolymarketAaveStakingVault vault = _setupHarvestScenario(a, t1, t2);

        // finalize -> unlock -> compute yields
        vault.finalizeMarket();
        assertTrue(vault.yieldUnlocked());

        // ensure there is some userYield
        uint256 userY = vault.userYield();
        assertGt(userY, 0);

        // expected shares from frozen scores
        uint256 scoreA = vault.getScore(alice);
        uint256 gScore = vault.getGlobalScore();
        uint256 expectedA = (scoreA * userY) / gScore;

        uint256 balBefore = usdc.balanceOf(alice);
        vm.expectEmit(true, true, true, true, address(vault));
        emit RobinStakingVault.HarvestedYield(alice, expectedA);
        vm.prank(alice);
        vault.harvestYield();
        uint256 balAfter = usdc.balanceOf(alice);
        assertEq(balAfter - balBefore, expectedA);
    }

    function test_Harvest_BeforeUnlock_Reverts() public {
        // unresolved vault via manager
        PolymarketAaveStakingVault v = _createVault(runningMarket);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.YieldNotUnlocked.selector));
        v.harvestYield();
    }

    function test_Harvest_DoubleHarvest_Reverts_NoYield() public {
        uint256 a = 2_000_000;
        uint256 t1 = 1 days;
        uint256 t2 = 20 days;
        PolymarketAaveStakingVault vault = _setupHarvestScenario(a, t1, t2);
        vault.finalizeMarket();
        assertTrue(vault.userYield() > 0);

        vm.prank(alice);
        vault.harvestYield();

        // second harvest should revert NoYield due to score reset
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.NoYield.selector));
        vault.harvestYield();
    }

    function test_ProtocolFeeHarvest_Via_Manager() public {
        // create vault via manager for resolved market
        PolymarketAaveStakingVault v = _createVault(resolvedMarketUsed);
        bytes32 cid = v.conditionId();

        uint256 a = 2_000_000;
        _mintOutcome(alice, v, a);
        _mintOutcome(bob, v, a);
        vm.prank(alice);
        v.deposit(true, a);
        vm.prank(bob);
        v.deposit(false, a);

        // accrue some interest
        vm.warp(block.timestamp + 20 days);

        // finalize triggers unlock
        v.finalizeMarket();
        assertTrue(v.userYield() + v.protocolYield() > 0);

        uint256 treBefore = usdc.balanceOf(treasury);
        vm.prank(owner);
        manager.claimProtocolFee(cid, treasury);
        uint256 treAfter = usdc.balanceOf(treasury);
        assertEq(treAfter - treBefore, v.protocolYield());

        // non-owner cannot claim
        vm.prank(alice);
        vm.expectRevert();
        manager.claimProtocolFee(cid, treasury);

        // claiming again reverts AlreadyHarvested from vault
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.AlreadyHarvested.selector));
        manager.claimProtocolFee(cid, treasury);
    }

    function test_ProtocolFeeHarvest_BeforeUnlock_Reverts() public {
        // vault via manager on running market
        _createVault(runningMarket);
        bytes32 cid = runningMarket.conditionId;
        // try to claim before finalize/unlock
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.YieldNotUnlocked.selector));
        manager.claimProtocolFee(cid, treasury);
    }

    // ========== Views & Accounting ==========
    function test_YieldEstimates_PreUnlock_And_PostUnlock() public {
        // Use running market vault to avoid auto-unlock
        PolymarketAaveStakingVault v = _createVault(runningMarket);

        // mint and deposit equal amounts so supply happens
        uint256 amt = 2_000_000;
        _mintOutcome(alice, v, amt);
        _mintOutcome(bob, v, amt);
        vm.prank(alice);
        v.deposit(true, amt);
        vm.prank(bob);
        v.deposit(false, amt);

        // Immediately after, estimate may be zero or near zero. After warp it should be > 0
        (uint256 eTot0,,) = v.getCurrentYieldBreakdown();
        vm.warp(block.timestamp + 20 days);
        (uint256 eTot1, uint256 eUser1, uint256 eProt1) = v.getCurrentYieldBreakdown();
        assertGe(eTot1, eTot0);
        // if interest accrued, est > 0 and splits add up
        if (eTot1 > 0) {
            assertEq(eUser1 + eProt1, eTot1);
        }

        // Now finalize on a resolved market to unlock and compare against final numbers
        PolymarketAaveStakingVault vmock = _createVault(resolvedMarketUsed);
        _mintOutcome(alice, vmock, amt);
        _mintOutcome(bob, vmock, amt);
        vm.prank(alice);
        vmock.deposit(true, amt);
        vm.prank(bob);
        vmock.deposit(false, amt);
        vm.warp(block.timestamp + 15 days);
        vmock.finalizeMarket();

        (uint256 eTotF, uint256 eUserF, uint256 eProtF) = vmock.getCurrentYieldBreakdown();
        assertEq(eTotF, vmock.totalYield());
        assertEq(eUserF, vmock.userYield());
        assertEq(eProtF, vmock.protocolYield());
    }

    function test_TVL_PreFinalize_And_PostUnlock() public {
        PolymarketAaveStakingVault v = _createVault(runningMarket);

        uint256 yesAmt = 1_500_000;
        uint256 noAmt = 1_000_000;

        _mintOutcome(alice, v, yesAmt);
        _mintOutcome(bob, v, noAmt);

        vm.prank(alice);
        v.deposit(true, yesAmt);
        vm.prank(bob);
        v.deposit(false, noAmt);

        // After deposits: inStrategy ≈ noAmt (paired portion), unpairedYes ≈ yesAmt - noAmt, unpairedNo = 0
        (uint256 onHand1, uint256 inStrat1, uint256 conv1, uint256 tvl1) = v.getTvlUsd();
        assertEq(conv1, 0);
        assertEq(tvl1, onHand1 + inStrat1 + conv1);

        // Post-unlock TVL equals on-hand only
        PolymarketAaveStakingVault vmock = _createVault(resolvedMarketUsed);
        _mintOutcome(alice, vmock, 2_000_000);
        _mintOutcome(bob, vmock, 2_000_000);
        vm.prank(alice);
        vmock.deposit(true, 2_000_000);
        vm.prank(bob);
        vmock.deposit(false, 2_000_000);
        vmock.finalizeMarket();

        (uint256 onHand2, uint256 inStrat2, uint256 conv2, uint256 tvl2) = vmock.getTvlUsd();
        assertEq(inStrat2, 0);
        assertEq(conv2, 0);
        assertEq(tvl2, onHand2);
    }

    function test_UserBalances_View_Consistency() public {
        PolymarketAaveStakingVault v = _createVault(runningMarket);
        uint256 y = 900_000;
        uint256 n = 300_000;
        _mintOutcome(alice, v, y);
        _mintOutcome(bob, v, n);

        vm.prank(alice);
        v.deposit(true, y);
        vm.prank(bob);
        v.deposit(false, n);

        (uint256 userYes, uint256 userNo) = v.getUserBalances(alice);
        assertEq(userYes, y);
        // inferred no equals scorer total minus yes; since alice deposited only YES, her NO is 0
        assertEq(userNo, 0);
    }

    // ========== Pausable ==========
    function test_Pausable_Toggle_Deposit_And_Withdraw() public {
        // create running vault via manager
        PolymarketAaveStakingVault v = _createVault(runningMarket);

        // mint outcome tokens
        _mintOutcome(alice, v, 1_000_000);
        _mintOutcome(bob, v, 1_000_000);

        // pause deposits via manager
        vm.prank(owner);
        vm.expectEmit(true, true, true, true, address(v));
        emit VaultPausable.PausedDepositsSet(true);
        manager.pauseDepositsFrom(address(v));

        // deposit reverts
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(VaultPausable.PausedDeposits.selector));
        v.deposit(true, 1);

        // unpause deposits and deposit succeeds
        vm.prank(owner);
        vm.expectEmit(true, true, true, true, address(v));
        emit VaultPausable.PausedDepositsSet(false);
        manager.unpauseDepositsFrom(address(v));
        vm.prank(alice);
        v.deposit(true, 1_000_000);
        vm.prank(bob);
        v.deposit(false, 1_000_000);

        // deposit from alice; now pause withdrawals and attempt a small withdraw
        vm.prank(owner);
        vm.expectEmit(true, true, true, true, address(v));
        emit VaultPausable.PausedWithdrawalsSet(true);
        manager.pauseWithdrawalsFrom(address(v));

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(VaultPausable.PausedWithdrawals.selector));
        v.withdraw(1, 0);

        // finalize/unlock/harvest/redeem still callable when only deposits/withdrawals are paused
        // switch to resolved mock for finalization
        PolymarketAaveStakingVault vmock = _createVault(resolvedMarketUsed);
        _mintOutcome(alice, vmock, 1_000_000);
        _mintOutcome(bob, vmock, 1_000_000);
        vm.prank(alice);
        vmock.deposit(false, 1_000_000);
        vm.prank(bob);
        vmock.deposit(true, 1_000_000);
        // pause deposits and withdrawals directly as owner (this test is owner for vmock)
        vm.prank(owner);
        vm.expectEmit(true, true, true, true, address(vmock));
        emit VaultPausable.PausedDepositsSet(true);
        manager.pauseDepositsFrom(address(vmock));
        vm.prank(owner);
        vm.expectEmit(true, true, true, true, address(vmock));
        emit VaultPausable.PausedWithdrawalsSet(true);
        manager.pauseWithdrawalsFrom(address(vmock));

        vm.warp(block.timestamp + 10 days);
        // finalize allowed
        vmock.finalizeMarket();
        // unlock allowed (already done inside finalize in our implementation)
        assertTrue(vmock.yieldUnlocked());
        // harvest allowed (if any userYield; may be zero depending on APY/time)
        // redeem allowed
        if (resolvedMarketUsed.winningPosition == RobinStakingVault.WinningPosition.YES) {
            vm.prank(bob);
            vmock.redeemWinningForUsd(); // no-op allowed
        } else {
            vm.prank(alice);
            vmock.redeemWinningForUsd(); // no-op allowed
        }
    }

    function test_Pausable_GlobalPauseBlocks_All_And_UnpauseByOwner() public {
        // resolved vault for exercising all entry points
        //Using Partial exit vault ot be able to call unlockYield
        vm.prank(address(manager));
        MockPartialExitVault v = new MockPartialExitVault();
        vm.prank(address(manager));
        v.initialize(
            PROTOCOL_FEE_BPS,
            UNDERLYING_USD,
            CTF,
            resolvedMarket.conditionId,
            NEG_RISK_ADAPTER,
            resolvedMarket.negRisk,
            resolvedMarket.collateral,
            false,
            AAVE_POOL,
            DATA_PROVIDER
        );
        vm.prank(address(manager));
        v.setExitFractionBps(5000);
        vm.prank(alice);
        IConditionalTokens(CTF).setApprovalForAll(address(v), true);
        vm.prank(bob);
        IConditionalTokens(CTF).setApprovalForAll(address(v), true);

        _mintOutcome(alice, v, 1_000_000);
        _mintOutcome(bob, v, 1_000_000);

        vm.prank(alice);
        v.deposit(true, 1_000_000);
        vm.prank(bob);
        v.deposit(false, 1_000_000);

        // pause all via vault owner -> blocks everything
        vm.prank(owner);
        vm.expectEmit(true, true, true, true, address(v));
        emit VaultPausable.PausedAllSet(true);
        manager.pauseAllFrom(address(v));

        // deposit blocked
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(VaultPausable.PausedAll.selector));
        v.deposit(true, 1);
        // withdraw blocked
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(VaultPausable.PausedAll.selector));
        v.withdraw(0, 1);
        // finalize blocked
        vm.expectRevert(abi.encodeWithSelector(VaultPausable.PausedAll.selector));
        v.finalizeMarket();

        //Finalize and unlock partially
        vm.prank(owner);
        manager.unpauseAllFrom(address(v));
        vm.warp(block.timestamp + 10 days); //yield accrual
        v.finalizeMarket();
        assertTrue(v.finalized());
        assertFalse(v.yieldUnlocked());
        vm.prank(owner);
        manager.pauseAllFrom(address(v));

        // unlock blocked
        vm.expectRevert(abi.encodeWithSelector(VaultPausable.PausedAll.selector));
        v.unlockYield();

        //unlock fully
        vm.prank(owner);
        manager.unpauseAllFrom(address(v));
        v.unlockYield();
        assertTrue(v.yieldUnlocked());
        vm.prank(owner);
        manager.pauseAllFrom(address(v));

        // harvest blocked
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(VaultPausable.PausedAll.selector));
        v.harvestYield();
        // redeem blocked
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(VaultPausable.PausedAll.selector));
        v.redeemWinningForUsd();

        // unpause all via vault owner
        vm.expectEmit(true, true, true, true, address(v));
        emit VaultPausable.PausedAllSet(false);
        vm.prank(owner);
        manager.unpauseAllFrom(address(v));

        //Harvesting now succeeds
        vm.prank(alice);
        v.harvestYield();
    }

    function test_ManagerLevelPause_BlocksCreateVault_NotVaultOps() public {
        // running vault exists
        PolymarketAaveStakingVault v = _createVault(runningMarket);
        // pause manager
        vm.prank(owner);
        manager.pause();

        // createVault blocked for new condition (use resolved)
        vm.expectRevert();
        manager.createVault(resolvedMarket.conditionId);

        // existing vault operations unaffected
        _mintOutcome(alice, v, 1_000);
        vm.prank(alice);
        v.deposit(true, 1_000);

        // unpause manager and create allowed again for a different conditionId (use running again but different id may be required)
        vm.prank(owner);
        manager.unpause();
    }

    // ========== Errors & Edge Cases ==========
    function test_Deposit_Zero_Reverts() public {
        PolymarketAaveStakingVault v = _createVault(runningMarket);
        _mintOutcome(alice, v, 1);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.InsufficientAmounts.selector));
        v.deposit(true, 0);
    }

    function test_TinyAmounts_DoNotOverflow_And_RespectDust() public {
        PolymarketAaveStakingVault v = _createVault(runningMarket);

        // minuscule deposits
        _mintOutcome(alice, v, 4);
        _mintOutcome(bob, v, 2);

        vm.prank(alice);
        v.deposit(true, 4);
        vm.prank(bob);
        v.deposit(false, 2);

        // principal equals min(2,1)=1; unpairedYes = 1; unpairedNo = 0
        assertEq(v.getVaultPairedPrincipalUsd(), 2);
        (uint256 uY, uint256 uN) = v.getVaultUnpaired();
        assertEq(uY, 2);
        assertEq(uN, 0);

        // withdraw 1 YES requiring split of 1 pair -> reduces principal to 0
        vm.prank(alice);
        v.withdraw(2, 0);
        assertEq(v.getVaultPairedPrincipalUsd(), 2);
    }

    // ========== Fuzz & Property Tests ==========
    function testFuzz_DepositWithdraw_Integral(uint256 seed) public {
        PolymarketAaveStakingVault v = _createVault(runningMarket);

        // approvals already set in _createVault. Mint large supplies
        _mintOutcome(alice, v, 50_000_000);
        _mintOutcome(bob, v, 50_000_000);

        // local expected model for integral
        uint256 aBal = 0;
        uint256 bBal = 0;
        uint256 aScore = 0;
        uint256 bScore = 0;
        uint256 gBal = 0;
        uint256 gScore = 0;

        // simple PRNG
        bytes32 st = keccak256(abi.encodePacked(seed));
        for (uint256 i = 0; i < 12; i++) {
            st = keccak256(abi.encodePacked(st, i));
            uint256 r = uint256(st);
            uint256 delta = r % 3600; // up to 1 hour between ops
            if (delta > 0) {
                vm.warp(block.timestamp + delta);
                aScore += aBal * delta;
                bScore += bBal * delta;
                gScore += gBal * delta;
            }

            uint256 op = (r >> 8) % 4; // 0..3
            if (op == 0) {
                // alice deposit YES
                uint256 amt = 1 + ((r >> 16) % 1_000_000);
                vm.prank(alice);
                v.deposit(true, amt);
                aBal += amt;
                gBal += amt;
            } else if (op == 1) {
                // bob deposit NO
                uint256 amt = 1 + ((r >> 32) % 1_000_000);
                vm.prank(bob);
                v.deposit(false, amt);
                bBal += amt;
                gBal += amt;
            } else if (op == 2) {
                // alice withdraw YES but only from unpaired to avoid splits
                (uint256 uY,) = v.getVaultUnpaired();
                (uint256 uYes,) = v.getUserBalances(alice);
                uint256 maxYes = uY < uYes ? uY : uYes;
                if (maxYes <= 1) continue;
                uint256 amtCandidate = 1 + ((r >> 48) % maxYes);
                if (maxYes - amtCandidate == 1) {
                    amtCandidate = maxYes; // avoid leaving exactly 1 unpaired
                }
                vm.prank(alice);
                v.withdraw(amtCandidate, 0);
                aBal -= amtCandidate;
                gBal -= amtCandidate;
            } else {
                // bob withdraw NO from unpaired only
                (, uint256 uN2) = v.getVaultUnpaired();
                (, uint256 bNo) = v.getUserBalances(bob);
                uint256 maxNo = uN2 < bNo ? uN2 : bNo;
                if (maxNo <= 1) continue;
                uint256 amtCandidate = 1 + ((r >> 56) % maxNo);
                if (maxNo - amtCandidate == 1) {
                    amtCandidate = maxNo; // avoid leaving exactly 1 unpaired
                }
                vm.prank(bob);
                v.withdraw(0, amtCandidate);
                bBal -= amtCandidate;
                gBal -= amtCandidate;
            }
        }

        // Compare contract scores vs expected integrals
        assertEq(v.getScore(alice), aScore);
        assertEq(v.getScore(bob), bScore);
        assertEq(v.getGlobalScore(), gScore);
    }

    function testFuzz_Unlock_Consistency(uint248 aRaw, uint248 bRaw) public {
        uint256 a = bound(uint256(aRaw), 1_000, 5_000_000);
        uint256 b = bound(uint256(bRaw), 1_000, 5_000_000);

        // resolved mock so we can finalize
        PolymarketAaveStakingVault v = _createVault(resolvedMarketUsed);

        // mint and deposit
        _mintOutcome(alice, v, a);
        _mintOutcome(bob, v, b);
        vm.prank(alice);
        v.deposit(true, a);
        vm.prank(bob);
        v.deposit(false, b);

        uint256 principalBefore = v.getVaultPairedPrincipalUsd();
        // warp some time so there is likely some yield
        vm.warp(block.timestamp + 7 days);

        v.finalizeMarket();
        uint256 unlocked = v.unlockedUsd();
        uint256 totalYield = v.totalYield();

        if (unlocked >= principalBefore) {
            assertEq(totalYield, unlocked - principalBefore);
        } else {
            assertEq(totalYield, 0);
        }

        assertEq(v.getVaultPairedPrincipalUsd(), 0);
        assertTrue(v.yieldUnlocked());
    }

    // ========== Draining Aave in Stages ==========
    function test_Unlock_MultipleIterations_PartialExitVault() public {
        // Use special mock that only withdraws a fraction each call
        MockPartialExitVault v = new MockPartialExitVault();
        v.initialize(
            PROTOCOL_FEE_BPS,
            UNDERLYING_USD,
            CTF,
            resolvedMarket.conditionId,
            NEG_RISK_ADAPTER,
            resolvedMarket.negRisk,
            resolvedMarket.collateral,
            false,
            AAVE_POOL,
            DATA_PROVIDER
        );

        vm.prank(alice);
        IConditionalTokens(CTF).setApprovalForAll(address(v), true);
        vm.prank(bob);
        IConditionalTokens(CTF).setApprovalForAll(address(v), true);

        uint256 amt = 5_000_000; // 5 USDC
        _mintOutcome(alice, v, amt);
        _mintOutcome(bob, v, amt);
        vm.prank(alice);
        v.deposit(true, amt);
        vm.prank(bob);
        v.deposit(false, amt);

        // make sure we withdraw in 25% chunks to force multiple iterations
        v.setExitFractionBps(2500);

        // finalize (first unlock iteration happens)
        v.finalizeMarket();
        assertTrue(v.unlocking());
        assertFalse(v.yieldUnlocked());

        // iterate unlocks until dust
        uint256 safety = 0;
        while (!v.yieldUnlocked() && safety < 20) {
            v.unlockYield();
            safety++;
        }
        assertTrue(v.yieldUnlocked());
        assertEq(v.getVaultPairedPrincipalUsd(), 0);
    }

    function _partitionYesNo() internal pure returns (uint256[] memory p) {
        p = new uint256[](2);
        p[0] = 1; // YES_INDEX_SET
        p[1] = 2; // NO_INDEX_SET
    }

    function _mintOutcome(address user, PolymarketAaveStakingVault vault, uint256 amount) internal {
        uint256[] memory partition = _partitionYesNo();

        bool isNegRisk = vault.negRisk();
        vm.startPrank(user);
        if (isNegRisk) {
            usdc.approve(address(adapter), amount);
            adapter.splitPosition(address(usdc), bytes32(0), vault.conditionId(), partition, amount);
        } else {
            usdc.approve(address(ctf), amount);
            ctf.splitPosition(address(usdc), bytes32(0), vault.conditionId(), partition, amount);
        }
        vm.stopPrank();
    }

    function _createVault(BettingMarketInfo memory market) internal returns (PolymarketAaveStakingVault vault) {
        vm.prank(owner);
        address v = manager.createVault(market.conditionId);
        vault = PolymarketAaveStakingVault(payable(v));
        // holders approve vault to pull ERC1155 outcome tokens
        vm.prank(alice);
        ctf.setApprovalForAll(address(vault), true);
        vm.prank(bob);
        ctf.setApprovalForAll(address(vault), true);

        // if market is equal outcome, report payouts (resolve)
        if (market.conditionId == toBeEqualOutcomeMarket.conditionId) {
            vm.prank(toBeEqualOutcomeMarket.resolver);
            uint256[] memory payouts = new uint256[](2);
            payouts[0] = 1;
            payouts[1] = 1;
            ctf.reportPayouts(toBeEqualOutcomeMarket.questionId, payouts);
        }
    }

    // ========== Initialization ==========
    function test_VaultInitialization_StateAndConfig() public {
        PolymarketAaveStakingVault vault = _createVault(runningMarket);

        // references from config
        assertEq(address(vault.underlyingUsd()), UNDERLYING_USD);
        assertEq(vault.protocolFeeBps(), PROTOCOL_FEE_BPS);
        assertEq(address(vault.ctf()), CTF);
        assertEq(address(vault.aavePool()), AAVE_POOL);
        assertEq(address(vault.dataProvider()), DATA_PROVIDER);

        // initial state
        assertFalse(vault.finalized());
        assertFalse(vault.yieldUnlocked());
        assertFalse(vault.unlocking());
        assertEq(vault.getVaultPairedPrincipalUsd(), 0);
        (uint256 yup, uint256 nup) = vault.getVaultUnpaired();
        assertEq(yup, 0);
        assertEq(nup, 0);
        // leftoverUsd is private; verify via TVL on-hand which should be 0
        (uint256 onHand,,,) = vault.getTvlUsd();
        assertEq(onHand, 0);
        assertFalse(vault.protocolYieldHarvested());

        // scores zero
        assertEq(vault.getGlobalScore(), 0);
        (uint256 bal,, uint256 score) = vault.getUserState(alice);
        assertEq(bal, 0);
        assertEq(score, 0);

        // owner is manager
        assertEq(vault.owner(), address(manager));
    }

    // ========== Deposits, Pairing, Supplying ==========

    function test_Deposit_SingleSide_Yes_Only() public {
        PolymarketAaveStakingVault vault = _createVault(runningMarket);
        uint256 amount = 1_000_000; // 1 USDC worth

        // Give alice outcome tokens via adapter
        _mintOutcome(alice, vault, amount);

        // Expect deposit event from vault
        vm.expectEmit(true, true, true, true, address(vault));
        emit RobinStakingVault.Deposited(alice, true, amount);

        vm.prank(alice);
        vault.deposit(true, amount);

        // unpaired YES increased; no supply; principal unchanged
        (uint256 unpairedYes, uint256 unpairedNo) = vault.getVaultUnpaired();
        assertEq(unpairedYes, amount);
        assertEq(unpairedNo, 0);
        assertEq(vault.getVaultPairedPrincipalUsd(), 0);
        assertEq(IAToken(address(vault.aToken())).balanceOf(address(vault)), 0);

        // score/balances updated for alice
        assertEq(vault.getBalance(alice), amount);
    }

    function test_OppositeSideDeposit_TriggersPairing_And_AaveSupply() public {
        PolymarketAaveStakingVault vault = _createVault(runningMarket);
        uint256 amount = 2_000_000; // 2 USDC worth

        // mint outcome tokens for both users
        _mintOutcome(alice, vault, amount);
        _mintOutcome(bob, vault, amount);

        // alice deposits YES only
        vm.prank(alice);
        vault.deposit(true, amount);

        uint256 principalBefore = vault.getVaultPairedPrincipalUsd();
        (uint256 yupBefore, uint256 nupBefore) = vault.getVaultUnpaired();
        assertEq(yupBefore, amount);
        assertEq(nupBefore, 0);

        // bob deposits NO equal to alice YES -> pair and supply
        vm.prank(bob);
        vault.deposit(false, amount);

        (uint256 yupAfter, uint256 nupAfter) = vault.getVaultUnpaired();
        assertEq(yupAfter, 0);
        assertEq(nupAfter, 0);

        uint256 principalAfter = vault.getVaultPairedPrincipalUsd();
        assertEq(principalAfter, principalBefore + amount);

        // aToken balance ~= principal
        uint256 aBal = IAToken(address(vault.aToken())).balanceOf(address(vault));
        assertApproxEqAbs(aBal, principalAfter, 1);

        // score for bob updated
        assertEq(vault.getBalance(bob), amount);
        // global balance equals sum
        // use getGlobalScore() only to access view path; globalLastBalance not exposed. Instead, compare user balances sum
        (uint256 yesBal, uint256 noBal) = vault.getUserBalances(alice);
        // after pairing, accounting still tracks user balances, so they must remain equal to deposited amounts
        assertEq(yesBal, amount);
        assertEq(noBal, 0); // alice deposited only YES
    }

    function test_UnbalancedDeposits_OnlyMinPairs_LeftoverUnpairedRemains() public {
        PolymarketAaveStakingVault vault = _createVault(runningMarket);

        uint256 amtNo = 500_000; // 0.5 USDC NO from bob
        uint256 amtYes = 1_500_000; // 1.5 USDC YES from alice

        // mint outcome tokens
        _mintOutcome(alice, vault, amtYes);
        _mintOutcome(bob, vault, amtNo);

        // first deposit some NO from bob so that vault has smaller NO pool
        vm.prank(bob);
        vault.deposit(false, amtNo);
        (uint256 yup0, uint256 nup0) = vault.getVaultUnpaired();
        assertEq(yup0, 0);
        assertEq(nup0, amtNo);

        uint256 principalBefore = vault.getVaultPairedPrincipalUsd();
        uint256 aBalBefore = IAToken(address(vault.aToken())).balanceOf(address(vault));

        // now deposit a larger YES from alice -> only min(YES, NO)=amtNo pairs
        vm.prank(alice);
        vault.deposit(true, amtYes);

        (uint256 yupAfter, uint256 nupAfter) = vault.getVaultUnpaired();
        // YES leftover should be amtYes - amtNo
        assertEq(yupAfter, amtYes - amtNo);
        assertEq(nupAfter, 0);

        uint256 principalAfter = vault.getVaultPairedPrincipalUsd();
        assertEq(principalAfter, principalBefore + amtNo);

        uint256 aBalAfter = IAToken(address(vault.aToken())).balanceOf(address(vault));
        assertApproxEqAbs(aBalAfter, aBalBefore + amtNo, 1);
    }

    // ========== Withdrawals (pre-finalization) ==========
    function test_Withdraw_FromUnpairedOnly_Yes() public {
        PolymarketAaveStakingVault vault = _createVault(runningMarket);
        uint256 amount = 1_100_000; // 1.1 USDC worth YES

        // mint YES/NO to alice and deposit only YES so unpairedYes is sufficient
        _mintOutcome(alice, vault, amount);
        vm.prank(alice);
        vault.deposit(true, amount);

        uint256 yesToWithdraw = 600_000; // withdraw less than unpairedYes
        uint256 preUserBal = vault.getBalance(alice);
        (uint256 preYes, uint256 preNo) = vault.getUserBalances(alice);
        (uint256 uYesPre, uint256 uNoPre) = vault.getVaultUnpaired();

        vm.expectEmit(true, true, true, true, address(vault));
        emit RobinStakingVault.Withdrawn(alice, yesToWithdraw, 0);
        vm.prank(alice);
        vault.withdraw(yesToWithdraw, 0);

        // unpaired decreased
        (uint256 uYesPost, uint256 uNoPost) = vault.getVaultUnpaired();
        assertEq(uYesPost, uYesPre - yesToWithdraw);
        assertEq(uNoPost, uNoPre);

        // user mapping and balances decreased
        (uint256 postYes, uint256 postNo) = vault.getUserBalances(alice);
        assertEq(postYes, preYes - yesToWithdraw);
        assertEq(postNo, preNo);
        assertEq(vault.getBalance(alice), preUserBal - yesToWithdraw);

        // outcome tokens transferred to user
        uint256 yesId = vault.yesPositionId();
        assertEq(ctf.balanceOf(alice, yesId), yesToWithdraw);
    }

    function test_Withdraw_RequiresSplit_NO_Path() public {
        PolymarketAaveStakingVault vault = _createVault(runningMarket);
        uint256 amount = 1_000_000; // 1 USDC YES and NO

        // prepare equal deposits so everything pairs and gets supplied
        _mintOutcome(alice, vault, amount);
        _mintOutcome(bob, vault, amount);
        vm.prank(alice);
        vault.deposit(true, amount);
        vm.prank(bob);
        vault.deposit(false, amount);
        vm.warp(block.timestamp + 500); //need a little bit of warp, otherwise 1 gwei might be missing from aave due to rounding

        // all unpaired should be zero now
        (uint256 uY0, uint256 uN0) = vault.getVaultUnpaired();
        assertEq(uY0, 0);
        assertEq(uN0, 0);
        uint256 principalBefore = vault.getVaultPairedPrincipalUsd();
        uint256 aBefore = IAToken(address(vault.aToken())).balanceOf(address(vault));

        // bob withdraws NO forcing split
        vm.expectEmit(true, true, true, true, address(vault));
        emit RobinStakingVault.Withdrawn(bob, 0, amount);
        vm.prank(bob);
        vault.withdraw(0, amount);

        // principal decreased by amount; aToken decreased
        uint256 principalAfter = vault.getVaultPairedPrincipalUsd();
        assertEq(principalAfter, principalBefore - amount);
        uint256 aAfter = IAToken(address(vault.aToken())).balanceOf(address(vault));
        assertApproxEqAbs(aAfter, aBefore - amount, 1);

        // after split: unpaired YES increased by pairsNeeded (amount); NO consumed by withdrawal
        (uint256 uY1, uint256 uN1) = vault.getVaultUnpaired();
        assertEq(uY1, amount);
        assertEq(uN1, 0);

        // bob's implied NO balance decreased
        (uint256 bobYes, uint256 bobNo) = vault.getUserBalances(bob);
        assertEq(bobYes, 0);
        assertEq(bobNo, 0);
    }

    function test_Withdraw_RequiresSplit_InsufficientPrincipal_Reverts() public {
        PolymarketAaveStakingVault vault = _createVault(runningMarket);
        uint256 amount = 1_000_000; // 1 USDC each

        _mintOutcome(alice, vault, amount);
        _mintOutcome(bob, vault, amount);
        vm.prank(alice);
        vault.deposit(true, amount);
        vm.prank(bob);
        vault.deposit(false, amount);

        // strategy principal is amount; request more should revert with InsufficientUserNo
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.InsufficientUserNo.selector, uint256(1_000_000)));
        vault.withdraw(0, 2_000_000);
    }

    function test_Withdraw_Reverts_InsufficientBalances_And_Zero() public {
        PolymarketAaveStakingVault vault = _createVault(runningMarket);

        uint256 amount = 800_000;
        _mintOutcome(alice, vault, amount);
        vm.prank(alice);
        vault.deposit(true, amount);

        // zero amounts
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.InsufficientAmounts.selector));
        vault.withdraw(0, 0);

        // withdraw more YES than owned
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.InsufficientUserYes.selector, amount));
        vault.withdraw(amount + 1, 0);

        // withdraw some NO when user has only YES
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.InsufficientUserNo.selector, uint256(0)));
        vault.withdraw(0, 1);
    }

    function test_Withdraw_AfterFinalize_Reverts_UsingMock() public {
        // Use mock so we can initialize with resolved market and finalize
        PolymarketAaveStakingVault vault = _createVault(resolvedMarketUsed);

        // deposit some to have non-zero balances then finalize and test gate
        // mint outcome tokens to alice for resolved condition
        _mintOutcome(alice, vault, 500_000);
        vm.prank(alice);
        vault.deposit(true, 500_000);

        // finalize should succeed because condition is resolved on-chain
        vault.finalizeMarket();

        vm.prank(alice);
        vm.expectRevert(); // onlyBeforeFinalize
        vault.withdraw(1, 0);
    }

    // ========== Deposit Limits ==========
    function test_DepositLimit_PerSide_Yes_EnforcedAcrossUsers() public {
        PolymarketAaveStakingVault v = _createVault(runningMarket);

        // set per-side limit to 1 USDC (1_000_000)
        vm.prank(owner);
        manager.setVaultDepositLimit(address(v), 1_000_000);

        // mint YES outcome tokens for alice and bob
        _mintOutcome(alice, v, 600_000);
        _mintOutcome(bob, v, 500_000);

        // alice deposits 0.6 — below limit
        vm.prank(alice);
        v.deposit(true, 600_000);

        // bob attempting additional 0.5 exceeds side limit -> revert
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.DepositLimitExceeded.selector));
        v.deposit(true, 500_000);
    }

    function test_DepositLimit_PerSide_No_EnforcedAcrossUsers() public {
        PolymarketAaveStakingVault v = _createVault(runningMarket);

        // set per-side limit to 1 USDC (1_000_000)
        vm.prank(owner);
        manager.setVaultDepositLimit(address(v), 1_000_000);

        // mint NO outcome tokens for alice and bob
        _mintOutcome(alice, v, 600_000);
        _mintOutcome(bob, v, 500_000);

        // alice deposits 0.6 NO — below limit
        vm.prank(alice);
        v.deposit(false, 600_000);

        // bob attempting additional 0.5 NO exceeds side limit -> revert
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.DepositLimitExceeded.selector));
        v.deposit(false, 500_000);
    }

    function test_Deposit_ExceedAaveSupplyCap_MapsToDepositLimitExceeded() public {
        // Create running vault so deposit triggers pairing and Aave supply
        PolymarketAaveStakingVault v = _createVault(runningMarket);

        // Determine headroom to Aave supply cap in outcome units
        (,,, uint256 strategySupply, uint256 strategyLimit) = v.getCurrentSupplyAndLimit();
        if (strategyLimit == 0) {
            // Unlimited cap on strategy — nothing to test here
            revert('Aave cap mapping test: strategyLimit == 0');
        }

        uint256 headroom = strategySupply < strategyLimit ? (strategyLimit - strategySupply) : 0;
        // Ensure we attempt to supply beyond cap by at least 1 unit
        uint256 attempt = headroom + 1;
        if (attempt < 2) attempt = 2; // need non-zero pairs

        // Fund users with enough USDC to mint outcome tokens
        deal(address(usdc), alice, attempt, true);
        deal(address(usdc), bob, attempt, true);

        // Mint YES/NO so deposits will pair and try to supply attempt amount
        _mintOutcome(alice, v, attempt);
        _mintOutcome(bob, v, attempt);

        // First deposit accumulates unpaired on YES
        vm.prank(alice);
        v.deposit(true, attempt);

        // Second deposit (NO) pairs and tries to supply over the cap -> mapped to DepositLimitExceeded
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(RobinStakingVault.DepositLimitExceeded.selector));
        v.deposit(false, attempt);
    }

    // ========== BOTH (50/50) Outcome Simulation ==========
    function test_BOTH_Finalize_EmitsAndFreezes() public {
        PolymarketAaveStakingVault v = _createVault(toBeEqualOutcomeMarket);

        _mintOutcome(alice, v, 1_000_000);
        _mintOutcome(bob, v, 1_000_000);

        // t0: alice deposits YES
        vm.prank(alice);
        v.deposit(true, 1_000_000);

        // warp T1
        uint256 t1 = 3600;
        vm.warp(block.timestamp + t1);

        // t1: bob deposits NO
        vm.prank(bob);
        v.deposit(false, 1_000_000);

        // warp T2
        uint256 t2 = 1800;
        vm.warp(block.timestamp + t2);

        // check scores before finalize
        uint256 sAlice = v.getScore(alice);
        uint256 sBob = v.getScore(bob);
        assertEq(sAlice, 1_000_000 * (t1 + t2));
        assertEq(sBob, 1_000_000 * t2);
        assertEq(v.getGlobalScore(), sAlice + sBob);

        // check user balances before finalize
        {
            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(ay, 1_000_000);
            assertEq(an, 0);
            assertEq(by, 0);
            assertEq(bn, 1_000_000);
        }

        // expect BOTH event
        vm.expectEmit(true, true, true, true, address(v));
        emit RobinStakingVault.MarketFinalized(RobinStakingVault.WinningPosition.BOTH);
        v.finalizeMarket();
        assertTrue(v.finalized());
        assertTrue(v.yieldUnlocked());

        uint256 g1 = v.getGlobalScore();
        uint256 a1 = v.getScore(alice);
        uint256 b1 = v.getScore(bob);

        // balances unchanged by finalize
        {
            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(ay, 1_000_000);
            assertEq(an, 0);
            assertEq(by, 0);
            assertEq(bn, 1_000_000);
        }
        vm.warp(block.timestamp + 1 hours);
        uint256 g2 = v.getGlobalScore();
        uint256 a2 = v.getScore(alice);
        uint256 b2 = v.getScore(bob);
        assertEq(g1, g2);
        assertEq(a1, a2);
        assertEq(b1, b2);
    }

    function test_BOTH_Redeem_Splits_EqualDeposits() public {
        PolymarketAaveStakingVault v = _createVault(toBeEqualOutcomeMarket);

        uint256 depositAmount = 2_000_000;

        _mintOutcome(alice, v, depositAmount);
        _mintOutcome(bob, v, depositAmount);

        // t0: Alice YES 2M
        vm.prank(alice);
        v.deposit(true, depositAmount);
        // warp
        uint256 t1 = 1200;
        vm.warp(block.timestamp + t1);
        // t1: Bob NO 2M
        vm.prank(bob);
        v.deposit(false, depositAmount);

        // scores pre-finalize
        uint256 sA0 = v.getScore(alice);
        uint256 sB0 = v.getScore(bob);
        // bob deposited later; sA0 > sB0
        assertGt(sA0, sB0);

        uint256 t3 = 5000;
        vm.warp(block.timestamp + t3);
        v.finalizeMarket();

        // user balances before redeem
        {
            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(ay, depositAmount);
            assertEq(an, 0);
            assertEq(by, 0);
            assertEq(bn, depositAmount);
        }

        // redemption (50% each)
        {
            uint256 aBefore = usdc.balanceOf(alice);
            vm.prank(alice);
            v.redeemWinningForUsd();
            assertEq(usdc.balanceOf(alice) - aBefore, depositAmount / 2);
        }
        // after Alice redeem: Alice balances zero; Bob unchanged
        {
            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(ay, 0);
            assertEq(an, 0);
            assertEq(by, 0);
            assertEq(bn, depositAmount);
        }
        {
            uint256 bBefore = usdc.balanceOf(bob);
            vm.prank(bob);
            v.redeemWinningForUsd();
            assertEq(usdc.balanceOf(bob) - bBefore, depositAmount / 2);
        }

        // user balances after redeem should be zero for BOTH case
        {
            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(ay, 0);
            assertEq(an, 0);
            assertEq(by, 0);
            assertEq(bn, 0);
        }

        // scores remain frozen across redeems
        assertEq(v.getScore(alice), sA0 + t3 * depositAmount);
        assertEq(v.getScore(bob), sB0 + t3 * depositAmount);
        uint256 g1 = v.getGlobalScore();
        vm.warp(block.timestamp + 3600);
        assertEq(v.getGlobalScore(), g1);
    }

    function test_BOTH_Redeem_Splits_UnbalancedDeposits() public {
        PolymarketAaveStakingVault v = _createVault(toBeEqualOutcomeMarket);

        uint256 depositAmountAlice = 2_000_000;
        uint256 depositAmountBob = 6_000_000;

        _mintOutcome(alice, v, depositAmountAlice);
        _mintOutcome(bob, v, depositAmountBob);

        // staggered deposits
        vm.prank(alice);
        v.deposit(true, depositAmountAlice);
        uint256 t1 = 2400;
        vm.warp(block.timestamp + t1);
        vm.prank(bob);
        v.deposit(false, depositAmountBob);

        // baseline scores pre-finalize
        uint256 sA0 = v.getScore(alice);
        uint256 sB0 = v.getScore(bob);
        assertEq(sA0, depositAmountAlice * t1);
        assertEq(sB0, 0);

        uint256 t2 = 500;
        vm.warp(block.timestamp + t2);
        v.finalizeMarket();

        // balances before
        {
            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(ay, depositAmountAlice);
            assertEq(an, 0);
            assertEq(by, 0);
            assertEq(bn, depositAmountBob);
        }

        // 50% payout of each side: 1M and 3M
        {
            uint256 aBefore = usdc.balanceOf(alice);
            vm.prank(alice);
            v.redeemWinningForUsd();
            assertEq(usdc.balanceOf(alice) - aBefore, depositAmountAlice / 2);
        }
        // after Alice redeem: Alice zero; Bob unchanged at 6M NO
        {
            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(ay, 0);
            assertEq(an, 0);
            assertEq(by, 0);
            assertEq(bn, depositAmountBob);
        }
        {
            uint256 bBefore = usdc.balanceOf(bob);
            vm.prank(bob);
            v.redeemWinningForUsd();
            assertEq(usdc.balanceOf(bob) - bBefore, depositAmountBob / 2);
        }

        // all balances consumed
        {
            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(ay, 0);
            assertEq(an, 0);
            assertEq(by, 0);
            assertEq(bn, 0);
        }

        // scores frozen unchanged
        assertEq(v.getScore(alice), sA0 + t2 * depositAmountAlice);
        assertEq(v.getScore(bob), sB0 + t2 * depositAmountBob);
    }

    function test_BOTH_Redeem_Splits_BothSides_UnequalDeposits() public {
        PolymarketAaveStakingVault v = _createVault(toBeEqualOutcomeMarket);

        uint256 depositAmountAlice = 2_000_000;
        uint256 depositAmountBob = 6_000_000;
        uint256 depositAliceYes = 2_000_000;
        uint256 depositAliceNo = 1_000_000;
        uint256 depositBobYes = 1_500_000;
        uint256 depositBobNo = 4_500_000;

        // Ensure users hold enough YES/NO outcome tokens
        _mintOutcome(alice, v, depositAmountAlice);
        _mintOutcome(bob, v, depositAmountBob);

        // Alice deposits YES=2M, NO=1M
        vm.prank(alice);
        v.deposit(true, depositAliceYes);
        vm.prank(alice);
        v.deposit(false, depositAliceNo);

        // Bob deposits YES=1.5M, NO=4.5M
        vm.prank(bob);
        v.deposit(true, depositBobYes);
        vm.prank(bob);
        v.deposit(false, depositBobNo);

        // Check balances prior to finalize
        {
            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(ay, depositAliceYes);
            assertEq(an, depositAliceNo);
            assertEq(by, depositBobYes);
            assertEq(bn, depositBobNo);
        }

        // Finalize equal outcome (50/50)
        uint256 t1 = 1000;
        vm.warp(block.timestamp + t1);
        v.finalizeMarket();

        // USD Balance before redeem
        uint256 aliceUsdBalanceBefore = usdc.balanceOf(alice);
        uint256 bobUsdBalanceBefore = usdc.balanceOf(bob);

        // Expected payouts = 50% of each user's total (YES+NO)
        uint256 alicePay = (depositAliceYes + depositAliceNo) / 2; // 1.5M
        uint256 bobPay = (depositBobYes + depositBobNo) / 2; // 3.0M

        // Redeem Alice then Bob; verify intermediate balances via getUserBalances
        {
            uint256 aBefore = usdc.balanceOf(alice);
            vm.prank(alice);
            v.redeemWinningForUsd();
            assertEq(usdc.balanceOf(alice) - aBefore, alicePay);

            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            assertEq(ay, 0);
            assertEq(an, 0);
        }
        {
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(by, depositBobYes);
            assertEq(bn, depositBobNo);
        }

        {
            uint256 bBefore = usdc.balanceOf(bob);
            vm.prank(bob);
            v.redeemWinningForUsd();
            assertEq(usdc.balanceOf(bob) - bBefore, bobPay);

            (uint256 ay, uint256 an) = v.getUserBalances(alice);
            assertEq(ay, 0);
            assertEq(an, 0);
        }
        {
            (uint256 by, uint256 bn) = v.getUserBalances(bob);
            assertEq(by, 0);
            assertEq(bn, 0);
        }

        // USD Balance after redeem
        uint256 aliceUsdBalanceAfter = usdc.balanceOf(alice);
        uint256 bobUsdBalanceAfter = usdc.balanceOf(bob);
        assertEq(aliceUsdBalanceAfter - aliceUsdBalanceBefore, alicePay);
        assertEq(bobUsdBalanceAfter - bobUsdBalanceBefore, bobPay);
    }
}
