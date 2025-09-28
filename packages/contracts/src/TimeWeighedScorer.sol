// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

/**
 * @title TimeWeighedScorer
 * @notice Abstract module that tracks per-user and global time-weighted balances
 *         (integral of balance over time). Useful for fairly allocating a single
 *         pot of rewards/yield among participants proportionally to how much and
 *         how long they were participating in the system.
 */
abstract contract TimeWeighedScorer is Initializable, OwnableUpgradeable {
    // ====== Global State ======
    uint256 public globalScore;
    uint256 public globalLastUpdated;
    uint256 public globalLastBalance;

    uint256 public finalizationTime;

    // ====== User State ======
    struct ScoreInfo {
        uint256 lastBalance;
        uint256 lastUpdated;
        uint256 cumulativeScore;
    }

    mapping(address => ScoreInfo) internal scoreInfos;

    // ====== Errors ======
    error NotFinalized();
    error AlreadyFinalized();

    // ====== Events ======
    event UserFinalized(address user, uint256 finalizationTime, uint256 score);
    event GlobalFinalized(uint256 finalizationTime, uint256 globalScore);

    // ====== Modifiers ======
    modifier onlyAfterGlobalFinalization() {
        if (finalizationTime == 0) revert NotFinalized();
        _;
    }

    /// forge-lint: disable-next-line(mixed-case-function)
    function __TimeWeighedScorer_init() internal onlyInitializing {
        __Ownable_init(msg.sender);
        globalScore = 0;
        globalLastUpdated = block.timestamp;
        globalLastBalance = 0;
        finalizationTime = 0;
    }

    /// @dev This function has to be called whenever any change to user balance occurs
    function updateScore(address user, uint256 balanceDelta, bool increase) public onlyOwner returns (uint256) {
        return _updateScore(user, balanceDelta, increase);
    }

    /// @dev This function has to be called whenever any change to global supply occurs
    function updateGlobalScore(uint256 supplyDelta, bool increase) public onlyOwner {
        _updateGlobalScore(supplyDelta, increase);
    }

    function finalizeUserScore(address user) external onlyOwner returns (uint256) {
        return _finalizeUserScore(user);
    }

    function finalizeGlobalScore() external onlyOwner {
        _finalizeGlobalScore();
    }

    // ====== View Functions ======
    function getUserState(address user) external view returns (uint256 balance, uint256 lastUpdated, uint256 cumulativeScore) {
        ScoreInfo memory info = scoreInfos[user];
        return (info.lastBalance, info.lastUpdated, info.cumulativeScore);
    }

    function getScore(address user) public view returns (uint256) {
        ScoreInfo memory info = scoreInfos[user];
        uint256 currentTime = _getCurrentScorableTime();
        uint256 timeElapsed = currentTime - info.lastUpdated;
        return info.cumulativeScore + (info.lastBalance * timeElapsed); //equals info.cumulativeScore if user score is finalized
    }

    function getBalance(address user) public view returns (uint256) {
        return scoreInfos[user].lastBalance;
    }

    function getGlobalScore() public view returns (uint256) {
        uint256 currentTime = _getCurrentScorableTime();
        uint256 timeElapsed = currentTime - globalLastUpdated;
        return globalScore + (globalLastBalance * timeElapsed); //equals globalScore if global score is finalized
    }

    // ====== Internal Logic ======

    function _updateScore(address user, uint256 balanceDelta, bool increase) internal returns (uint256) {
        assert(increase || balanceDelta <= scoreInfos[user].lastBalance);

        ScoreInfo storage info = scoreInfos[user];
        uint256 currentTime = _getCurrentScorableTime(); //equals finalizationTime if finalized
        uint256 timeElapsed = currentTime - info.lastUpdated;
        info.cumulativeScore += info.lastBalance * timeElapsed; // unitinialized users will get 0 score added here
        info.lastUpdated = currentTime;

        if (increase) info.lastBalance += balanceDelta;
        else info.lastBalance -= balanceDelta;

        return info.cumulativeScore;
    }

    function _updateGlobalScore(uint256 supplyDelta, bool increase) internal {
        assert(increase || supplyDelta <= globalLastBalance);
        uint256 currentTime = _getCurrentScorableTime(); //equals finalizationTime if finalized
        uint256 timeElapsed = currentTime - globalLastUpdated;
        globalScore += globalLastBalance * timeElapsed;
        globalLastUpdated = currentTime;

        if (increase) globalLastBalance += supplyDelta;
        else globalLastBalance -= supplyDelta;
    }

    function _getCurrentScorableTime() internal view returns (uint256) {
        uint256 currentTime = block.timestamp;
        if (finalizationTime != 0 && currentTime > finalizationTime) {
            currentTime = finalizationTime; // finalizationTime is the last time the score is accounted for (increased)
        }
        return currentTime;
    }

    /// @dev This function also resets the user's score to 0, so it should only be called when the score of the user is
    ///      to be used for distribution/etc and therefore "destroy" the claim the user has in the system
    ///      No need to call before that because the finalizationTime will cap the score after finalizeGlobalScore was called
    function _finalizeUserScore(address user) internal onlyAfterGlobalFinalization returns (uint256) {
        //if updateScore is called multiple times after finalization, the score will not change because
        //timeElapsed will be 0 (because currentTime == finalizationTime == lastUpdated)
        uint256 currentScore = _updateScore(user, 0, false); //no need to set balance to 0 because the finalizationTime will cap the score
        scoreInfos[user].cumulativeScore = 0;
        emit UserFinalized(user, finalizationTime, currentScore);
        return currentScore;
    }

    function _finalizeGlobalScore() internal {
        if (finalizationTime != 0) revert AlreadyFinalized();
        finalizationTime = block.timestamp;
        _updateGlobalScore(0, false); //no need to set score to 0 because the finalizationTime will cap the score
        emit GlobalFinalized(finalizationTime, globalScore);
    }
}
