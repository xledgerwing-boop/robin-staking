// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from 'forge-std/Test.sol';
import { MockTimeWeighedScorer } from './mocks/MockTimeWeighedScorer.t.sol';

contract TimeWeighedScorerTest is Test {
    MockTimeWeighedScorer mock;

    address owner;
    address user1;
    address user2;
    address user3;

    uint256 constant DECIMALS = 18;

    function setUp() external {
        owner = address(this);
        user1 = makeAddr('user1');
        user2 = makeAddr('user2');
        user3 = makeAddr('user3');

        mock = new MockTimeWeighedScorer();
        mock.initialize(); // __Ownable_init(msg.sender) => owner = this test contract
    }

    /* ----------------------------- Initialization ---------------------------- */

    function test_InitDefaults() external view {
        assertEq(mock.globalScore(), 0);
        assertGt(mock.globalLastUpdated(), 0);
        assertEq(mock.globalLastBalance(), 0);
        assertEq(mock.finalizationTime(), 0);
        assertEq(mock.owner(), owner);
    }

    function test_InitTimestampCloseToNow() external view {
        // we assume initialize() just ran in setUp; allow small tolerance
        uint256 t = block.timestamp;
        uint256 last = mock.globalLastUpdated();
        // allow <= 10s tolerance (same-tx in tests normally 0)
        assertLe(last, t + 10);
        assertGe(last + 10, t);
    }

    /* ------------------------------- Score Updates --------------------------- */

    function test_UpdateUserScore() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600);

        // materialize the score accrual without changing balance
        mock.updateScore(user1, 0, false);

        (uint256 bal,, uint256 cum) = mock.getUserState(user1);
        assertEq(bal, 1000);
        assertEq(cum, 1000 * 3600);
        assertEq(mock.getScore(user1), 1000 * 3600);
    }

    function test_ZeroBalance() external {
        mock.setBalance(user1, 0);
        vm.warp(block.timestamp + 3600);

        mock.updateScore(user1, 0, false);
        (uint256 bal,, uint256 cum) = mock.getUserState(user1);
        assertEq(bal, 0);
        assertEq(cum, 0);
        assertEq(mock.getScore(user1), 0);
    }

    function test_AccumulateMultipleUpdates() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600); // 1h
        mock.setBalance(user1, 2000);
        vm.warp(block.timestamp + 1800); // 30m

        mock.updateScore(user1, 0, false);
        (,, uint256 cum) = mock.getUserState(user1);
        // 1000*3600 + 2000*1800 = 7_200_000
        assertEq(cum, 7_200_000);
    }

    function test_RapidBalanceChanges() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 1);
        mock.updateScore(user1, 0, false);

        mock.setBalance(user1, 2000);
        vm.warp(block.timestamp + 1);
        mock.updateScore(user1, 0, false);

        (,, uint256 cum) = mock.getUserState(user1);
        assertEq(cum, 1000 * 1 + 2000 * 1);
    }

    function test_UpdateGlobalScore() external {
        mock.setGlobalSupply(10_000);
        vm.warp(block.timestamp + 3600);

        mock.updateGlobalScore(0, false);
        assertEq(mock.globalScore(), 10_000 * 3600);
    }

    function test_MultipleUsers() external {
        mock.setBalance(user1, 1000);
        mock.setBalance(user2, 2000);
        vm.warp(block.timestamp + 3600);

        mock.updateScore(user1, 0, false);
        mock.updateScore(user2, 0, false);

        (,, uint256 cum1) = mock.getUserState(user1);
        (,, uint256 cum2) = mock.getUserState(user2);
        assertEq(cum1, 1000 * 3600);
        assertEq(cum2, 2000 * 3600);
    }

    /* --------------------------------- Queries -------------------------------- */

    function test_GetCurrentScoreAfterMoreTime() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600);
        mock.updateScore(user1, 0, false);

        vm.warp(block.timestamp + 1800);
        assertEq(mock.getScore(user1), 1000 * (3600 + 1800)); // 5_400_000
    }

    function test_GetGlobalScoreAfterMoreTime() external {
        mock.setGlobalSupply(10_000);
        vm.warp(block.timestamp + 3600);
        mock.updateGlobalScore(0, false);

        vm.warp(block.timestamp + 1800);
        assertEq(mock.getGlobalScore(), 10_000 * (3600 + 1800)); // 54_000_000
    }

    function test_UninitializedUserHasZeroScore() external view {
        assertEq(mock.getScore(user3), 0);
    }

    /* ------------------------------- Finalization ----------------------------- */

    function test_FinalizeGlobalScore() external {
        mock.setGlobalSupply(10_000);
        vm.warp(block.timestamp + 3600);
        mock.updateGlobalScore(0, false);

        uint256 expectedTime = block.timestamp; // next tx at same timestamp
        // expect the event (topics: emitter, we match full)
        vm.expectEmit(true, true, true, true);
        emit GlobalFinalized(expectedTime, 10_000 * 3600);

        mock.finalizeGlobalScore();

        assertGt(mock.finalizationTime(), 0);
        assertEq(mock.globalScore(), 10_000 * 3600);
    }

    function test_PreventDoubleFinalizeGlobal() external {
        mock.setGlobalSupply(10_000);
        vm.warp(block.timestamp + 3600);
        mock.updateGlobalScore(0, false);

        mock.finalizeGlobalScore();
        vm.expectRevert(abi.encodeWithSignature('AlreadyFinalized()'));
        mock.finalizeGlobalScore();
    }

    function test_FinalizeUserScore() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600);
        mock.updateScore(user1, 0, false);

        mock.finalizeGlobalScore();

        // expect event
        uint256 ftime = mock.finalizationTime();
        vm.expectEmit(true, true, true, true);
        emit UserFinalized(user1, ftime, 1000 * 3600);

        uint256 paid = mock.finalizeUserScore(user1);
        assertEq(paid, 1000 * 3600);

        (,, uint256 cum) = mock.getUserState(user1);
        assertEq(cum, 0);
    }

    function test_PreventUserFinalizeBeforeGlobal() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600);
        mock.updateScore(user1, 0, false);

        vm.expectRevert(abi.encodeWithSignature('NotFinalized()'));
        mock.finalizeUserScore(user1);
    }

    function test_CapTimeAtFinalization() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600);

        mock.finalizeGlobalScore();

        vm.warp(block.timestamp + 7200);
        uint256 s = mock.getScore(user1);
        assertEq(s, 1000 * 3600);

        // calling finalize returns same
        uint256 ret = mock.finalizeUserScore(user1);
        assertEq(ret, s);

        vm.warp(block.timestamp + 3600);
        assertEq(mock.getScore(user1), 0); // after user finalize, score stays zero
        // re-finalize again: stays zero
        uint256 ret2 = mock.finalizeUserScore(user1);
        assertEq(ret2, 0);
    }

    function test_MultipleUserFinalizations() external {
        mock.setBalance(user1, 1000);
        mock.setBalance(user2, 2000);
        vm.warp(block.timestamp + 3600);
        mock.updateScore(user1, 0, false);
        mock.updateScore(user2, 0, false);

        mock.finalizeGlobalScore();

        mock.finalizeUserScore(user1);
        mock.finalizeUserScore(user2);

        (,, uint256 c1) = mock.getUserState(user1);
        (,, uint256 c2) = mock.getUserState(user2);
        assertEq(c1, 0);
        assertEq(c2, 0);
    }

    function test_NoChangeOnRepeatedUserFinalize() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600);
        mock.updateScore(user1, 0, false);

        mock.finalizeGlobalScore();

        uint256 x = mock.finalizeUserScore(user1);
        uint256 y = mock.finalizeUserScore(user1);
        assertEq(x, 1000 * 3600);
        assertEq(y, 0);

        (,, uint256 c) = mock.getUserState(user1);
        assertEq(c, 0);
    }

    /* ------------------------------- Access Control --------------------------- */

    function testOnlyOwner_CanFinalizeGlobal() external {
        address attacker = user1;
        vm.prank(attacker);
        vm.expectRevert(abi.encodeWithSignature('OwnableUnauthorizedAccount(address)', attacker));
        mock.finalizeGlobalScore();
    }

    function testOnlyOwner_CanFinalizeUser() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600);
        mock.updateScore(user1, 0, false);
        mock.finalizeGlobalScore();

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature('OwnableUnauthorizedAccount(address)', user1));
        mock.finalizeUserScore(user1);
    }

    /* ------------------------ Edge Cases / Overflow-ish ----------------------- */

    function test_MaxTimeThirtyYears() external {
        uint256 thirtyYears = 30 * 365 days;
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + thirtyYears);

        mock.updateScore(user1, 0, false);
        assertEq(mock.getScore(user1), 1000 * thirtyYears);
    }

    function test_MaxTokenAmount() external {
        uint256 oneBillion = 1_000_000_000 * (10 ** DECIMALS);
        mock.setBalance(user1, oneBillion);
        vm.warp(block.timestamp + 3600);

        mock.updateScore(user1, 0, false);
        assertEq(mock.getScore(user1), oneBillion * 3600);
    }

    function test_MaxTimeAndAmount() external {
        uint256 thirtyYears = 30 * 365 days;
        uint256 oneBillion = 1_000_000_000 * (10 ** DECIMALS);

        mock.setBalance(user1, oneBillion);
        vm.warp(block.timestamp + thirtyYears);

        mock.updateScore(user1, 0, false);
        assertEq(mock.getScore(user1), oneBillion * thirtyYears);
    }

    function test_ZeroTimeElapsed() external {
        mock.setBalance(user1, 1000);
        // immediately update again with 0 delta
        mock.updateScore(user1, 0, false);
        assertEq(mock.getScore(user1), 0);
    }

    function test_VerySmallTimePeriods() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 1);

        mock.updateScore(user1, 0, false);
        assertEq(mock.getScore(user1), 1000);
    }

    function test_BalanceChangeWithoutTimePassing() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600);
        mock.updateScore(user1, 0, false);

        // change balance instantly
        mock.setBalance(user1, 2000);
        // no time increase
        assertEq(mock.getScore(user1), 1000 * 3600);
    }

    /* ----------------------------------- Events -------------------------------- */

    event UserFinalized(address user, uint256 finalizationTime, uint256 score);
    event GlobalFinalized(uint256 finalizationTime, uint256 globalScore);

    function test_GlobalFinalizedEvent() external {
        mock.setGlobalSupply(10_000);
        vm.warp(block.timestamp + 3600);
        mock.updateGlobalScore(0, false);

        uint256 expectedTime = block.timestamp;
        vm.expectEmit(true, true, true, true);
        emit GlobalFinalized(expectedTime, 10_000 * 3600);

        mock.finalizeGlobalScore();
    }

    function test_UserFinalizedEvent() external {
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600);
        mock.updateScore(user1, 0, false);

        mock.finalizeGlobalScore();
        uint256 fin = mock.finalizationTime();

        vm.expectEmit(true, true, true, true);
        emit UserFinalized(user1, fin, 1000 * 3600);

        mock.finalizeUserScore(user1);
    }

    /* ---------------------------- Integration Scenarios ------------------------ */

    function test_ComplexMultiUserScenario() external {
        // Setup
        mock.setBalance(user1, 1000);
        mock.setBalance(user2, 2000);
        mock.setGlobalSupply(3000);

        // First period
        vm.warp(block.timestamp + 3600);
        mock.updateScore(user1, 0, false);
        mock.updateScore(user2, 0, false);
        mock.updateGlobalScore(0, false);

        // Change balances
        mock.setBalance(user1, 1500);
        mock.setBalance(user2, 2500);
        mock.setGlobalSupply(4000);

        // Second period
        vm.warp(block.timestamp + 1800);
        mock.updateScore(user1, 0, false);
        mock.updateScore(user2, 0, false);
        mock.updateGlobalScore(0, false);

        // Finalize
        mock.finalizeGlobalScore();
        mock.finalizeUserScore(user1);
        mock.finalizeUserScore(user2);

        (,, uint256 c1) = mock.getUserState(user1);
        (,, uint256 c2) = mock.getUserState(user2);
        assertEq(c1, 0);
        assertEq(c2, 0);
    }

    function test_UsersJoiningAndLeaving() external {
        // User1 starts
        mock.setBalance(user1, 1000);
        vm.warp(block.timestamp + 3600);
        mock.updateScore(user1, 0, false);

        // User2 joins
        mock.setBalance(user2, 2000);
        vm.warp(block.timestamp + 1800);
        mock.updateScore(user1, 0, false);
        mock.updateScore(user2, 0, false);

        // User1 leaves (balance = 0)
        mock.setBalance(user1, 0);
        vm.warp(block.timestamp + 1800);
        mock.updateScore(user1, 0, false);
        mock.updateScore(user2, 0, false);

        // Finalize
        mock.finalizeGlobalScore();
        mock.finalizeUserScore(user1);
        mock.finalizeUserScore(user2);

        (,, uint256 c1) = mock.getUserState(user1);
        (,, uint256 c2) = mock.getUserState(user2);
        assertEq(c1, 0);
        assertEq(c2, 0);
    }
}
