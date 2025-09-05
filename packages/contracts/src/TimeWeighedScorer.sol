// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

abstract contract TimeWeighedScorer is Initializable, OwnableUpgradeable {
    uint256 public globalScore;
    uint256 public globalLastUpdated;
    uint256 public globalLastBalance;

    uint256 public finalizationTime;

    error NotFinalized();
    error AlreadyFinalized();

    event UserFinalized(address user, uint256 finalizationTime, uint256 score);
    event GlobalFinalized(uint256 finalizationTime, uint256 globalScore);

    struct ScoreInfo {
        uint256 lastBalance;
        uint256 lastUpdated;
        uint256 cumulativeScore;
    }

    mapping(address => ScoreInfo) internal scoreInfos;

    modifier onlyAfterGlobalFinalization() {
        if (finalizationTime == 0) revert NotFinalized();
        _;
    }

    function __TimeWeighedScorer_init() internal onlyInitializing {
        __Ownable_init(msg.sender);
        globalScore = 0;
        globalLastUpdated = block.timestamp;
        globalLastBalance = 0;
        finalizationTime = 0;
    }

    /// @dev This function has to be called just AFTER any change to user balance occurs
    function _updateScore(address user, uint256 balanceDelta, bool increase) internal returns (uint256) {
        assert(increase || balanceDelta <= scoreInfos[user].lastBalance);

        ScoreInfo storage info = scoreInfos[user];
        uint256 currentTime = _getCurrentTime(); //equals finalizationTime if finalized
        uint256 timeElapsed = currentTime - info.lastUpdated;
        info.cumulativeScore += info.lastBalance * timeElapsed; // unitinialized users will get 0 score added here
        info.lastUpdated = currentTime;

        if (increase) info.lastBalance += balanceDelta;
        else info.lastBalance -= balanceDelta;

        return info.cumulativeScore;
    }

    /// @dev This function has to be called just AFTER any change to global supply occurs
    function _updateGlobalScore(uint256 supplyDelta, bool increase) internal {
        assert(increase || supplyDelta <= globalLastBalance);
        uint256 currentTime = _getCurrentTime(); //equals finalizationTime if finalized
        uint256 timeElapsed = currentTime - globalLastUpdated;
        globalScore += globalLastBalance * timeElapsed;
        globalLastUpdated = currentTime;

        if (increase) globalLastBalance += supplyDelta;
        else globalLastBalance -= supplyDelta;
    }

    function _getCurrentTime() internal view returns (uint256) {
        uint256 currentTime = block.timestamp;
        if (finalizationTime != 0 && currentTime > finalizationTime) {
            currentTime = finalizationTime; // finalizationTime is the last time the score is updated
        }
        return currentTime;
    }

    function getUserState(address user) external view returns (uint256 balance, uint256 lastUpdated, uint256 cumulativeScore) {
        ScoreInfo memory info = scoreInfos[user];
        return (info.lastBalance, info.lastUpdated, info.cumulativeScore);
    }

    function getScore(address user) public view returns (uint256) {
        ScoreInfo memory info = scoreInfos[user];
        uint256 currentTime = _getCurrentTime();
        uint256 timeElapsed = currentTime - info.lastUpdated;
        return info.cumulativeScore + (info.lastBalance * timeElapsed); //equals info.cumulativeScore if user score is finalized
    }

    function getBalance(address user) public view returns (uint256) {
        return scoreInfos[user].lastBalance;
    }

    function getGlobalScore() public view returns (uint256) {
        uint256 currentTime = _getCurrentTime();
        uint256 timeElapsed = currentTime - globalLastUpdated;
        return globalScore + (globalLastBalance * timeElapsed); //equals globalScore if global score is finalized
    }

    function finalizeUserScore(address user) external onlyOwner returns (uint256) {
        return _finalizeUserScore(user);
    }

    function _finalizeUserScore(address user) internal onlyAfterGlobalFinalization returns (uint256) {
        //if updateScore is called multiple times after finalization, the score will not change because
        //timeElapsed will be 0 (because currentTime == finalizationTime == lastUpdated)
        uint256 currentScore = _updateScore(user, 0, false); //no need to set balance to 0 because the finalizationTime will cap the score
        scoreInfos[user].cumulativeScore = 0;
        emit UserFinalized(user, finalizationTime, currentScore);
        return currentScore;
    }

    function finalizeGlobalScore() external onlyOwner {
        _finalizeGlobalScore();
    }

    function _finalizeGlobalScore() internal {
        if (finalizationTime != 0) revert AlreadyFinalized();
        finalizationTime = block.timestamp;
        _updateGlobalScore(0, false); //no need to set score to 0 because the finalizationTime will cap the score
        emit GlobalFinalized(finalizationTime, globalScore);
    }
}
