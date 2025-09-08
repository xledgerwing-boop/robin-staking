// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { Initializable } from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import { ReentrancyGuardUpgradeable } from '@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol';
import { Math } from '@openzeppelin/contracts/utils/math/Math.sol';

import { TimeWeighedScorer } from './TimeWeighedScorer.sol';
import { VaultPausable } from './VaultPausable.sol';

/**
 * @title RobinStakingVault
 * @notice Abstract vault for a single prediction market (e.g., one Polymarket market).
 *         Users deposit YES/NO outcome tokens. Equal parts are merged to USD and farmed in a yield strategy.
 *         Before resolution, users can withdraw YES/NO at any time (strategy USD is split back into YES/NO as needed).
 *         After on-chain resolution is verified, the vault records the outcome, exits the strategy, unlocks yield,
 *         and allows: (1) harvesting of time-weighted yield (minus protocol fee), and
 *         (2) redeeming winning tokens for USD directly in this contract.
 *
 * @dev All yield protocol and prediction-market interactions are abstract.
 *      Implementors MUST define the underlying USD token transfers, strategy supply/withdraw/exit,
 *      and PM-specific merge/split/transfer/resolution logic.
 */
abstract contract RobinStakingVault is Initializable, ReentrancyGuardUpgradeable, TimeWeighedScorer, VaultPausable {
    using SafeERC20 for IERC20;

    // ====== Parameters / Config ======
    IERC20 public underlyingUsd;
    uint256 public protocolFeeBps; // e.g. 1000 = 10%
    uint256 internal constant BPS_DENOM = 10_000;

    // ====== Market & Lifecycle ======
    bool public finalized; // set once the market end has been verified on-chain (resolution known)
    bool public unlocking; // draining in progress
    uint256 public unlockedUsd; // cumulative USD withdrawn from strategy since unlock started
    bool public yieldUnlocked; // set after strategy exit & yield computation
    uint256 internal constant STRATEGY_EXIT_DUST = 1;

    enum WinningPosition {
        UNRESOLVED,
        YES,
        NO,
        BOTH
    }

    WinningPosition public winningPosition; // winning side after resolution (true=YES, false=NO)

    // ====== Accounting (Outcome Tokens & USD) ======
    // Unpaired outcome tokens held by the vault (awaiting a matching opposite to merge).
    uint256 public unpairedYes;
    uint256 public unpairedNo;

    // USD principal supplied to the yield strategy (paired YES/NO merged => USD, supplied).
    uint256 public pairedUsdPrincipal;

    // USD that is temporarily in the vault (e.g., from withdrawals) awaiting next supply.
    uint256 public leftoverUsd;

    //amount of YES the user has deposited and still holds claim to in the vault.
    //can be used together with getBalance of TimeWeighedScorer to calculate the user's no balance
    //getBalance of TimeWeighedScorer is used instead of storing yes and no balances of user to save user storage space and reduce gas costs
    mapping(address => uint256) internal yesBalance;

    // Total YES (sum over all users); can be used together with globalLastBalance of TimeWeighedScorer to calculate the total NO
    uint256 public totalUserYes;

    // ====== Yield & Fees ======
    // Computed once at unlock (after finalize & strategy exit)
    uint256 public totalYield; // total net yield realized from strategy
    uint256 public userYield; // total yield allocated to users (after fee)
    uint256 public protocolYield; // protocol fee portion
    bool public protocolYieldHarvested;

    // ====== Limits ======
    // Per-side deposit limit (applies equally to YES and NO). 0 = unlimited
    uint256 public depositLimit;

    // ====== Errors ======
    error VaultAlreadyFinalized();
    error VaultNotFinalized();
    error YieldAlreadyUnlocked();
    error YieldNotUnlocked();
    error InvalidBps(uint256 bps);
    error InsufficientUserYes(uint256 have);
    error InsufficientUserNo(uint256 have);
    error InsufficientAmounts();
    error DepositLimitExceeded();
    error InsufficientWithdrawalUSD(uint256 needed, uint256 withdrawn);
    error InsufficientUSD(uint256 holding, uint256 needed);
    error NoYield();
    error AlreadyHarvested();
    error MarketNotResolved();
    error RedeemMismatch();

    // ====== Events ======
    event Deposited(address indexed user, bool isYes, uint256 amount);
    event Withdrawn(address indexed user, uint256 yesAmount, uint256 noAmount);

    event MarketFinalized(WinningPosition winningPosition);
    event YieldUnlockStarted(uint256 leftoverUsd, uint256 principalAtStart);
    event YieldUnlockProgress(uint256 withdrawnThisCall, uint256 cumulativeWithdrawn, uint256 remainingInStrategy);
    event YieldUnlocked(uint256 totalWithdrawnUsd, uint256 totalYield, uint256 userYield, uint256 protocolYield);

    event HarvestedYield(address indexed user, uint256 amount);
    event RedeemedWinningForUSD(address indexed user, uint256 winningAmount, uint256 usdPaid);

    event HarvestedProtocolYield(address indexed receiver, uint256 amount);

    // ====== Modifiers ======
    modifier onlyBeforeFinalize() {
        if (finalized) revert VaultAlreadyFinalized();
        _;
    }

    modifier onlyAfterFinalize() {
        if (!finalized) revert VaultNotFinalized();
        _;
    }

    modifier onlyBeforeUnlock() {
        if (yieldUnlocked) revert YieldAlreadyUnlocked();
        _;
    }

    modifier onlyAfterUnlock() {
        if (!yieldUnlocked) revert YieldNotUnlocked();
        _;
    }

    // ====== Initializer ======
    /// forge-lint: disable-next-line(mixed-case-function)
    function __RobinStakingVault_init(uint256 _protocolFeeBps, address _underlyingAsset) internal onlyInitializing {
        __ReentrancyGuard_init();
        __TimeWeighedScorer_init();
        __VaultPausable_init();
        if (_protocolFeeBps > BPS_DENOM) revert InvalidBps(_protocolFeeBps);
        protocolFeeBps = _protocolFeeBps;
        underlyingUsd = IERC20(_underlyingAsset);

        finalized = false;
        yieldUnlocked = false;

        unpairedYes = 0;
        unpairedNo = 0;
        pairedUsdPrincipal = 0;
        leftoverUsd = 0;

        totalYield = 0;
        userYield = 0;
        protocolYield = 0;
        protocolYieldHarvested = false;

        winningPosition = WinningPosition.UNRESOLVED;

        totalUserYes = 0;
    }

    // ========= USER ACTIONS (Pre-Finalization) =========

    /**
     * @notice Deposit outcome tokens.
     * @param isYes true to deposit YES, false to deposit NO.
     * @param amount amount of outcome tokens to deposit.
     */
    function deposit(bool isYes, uint256 amount) external nonReentrant whenDepositsNotPaused onlyBeforeFinalize {
        if (amount == 0) revert InsufficientAmounts();

        address sender = msg.sender;

        // Enforce per-side deposit limits if set
        // Strategy limit is not checked to save gas, will revert anyways if it's reached
        if (depositLimit != 0) {
            if (isYes) {
                uint256 newYesTotal = totalUserYes + amount;
                if (newYesTotal > depositLimit) revert DepositLimitExceeded();
            } else {
                uint256 totalNo = globalLastBalance - totalUserYes;
                uint256 newNoTotal = totalNo + amount;
                if (newNoTotal > depositLimit) revert DepositLimitExceeded();
            }
        }

        // Pull outcome tokens from user (abstract hook)
        if (isYes) {
            _pmTakeYes(sender, amount);
            yesBalance[sender] += amount;
            totalUserYes += amount;
            unpairedYes += amount;
        } else {
            _pmTakeNo(sender, amount);
            // NO is implied: we don't store userNo directly
            unpairedNo += amount;
        }

        // Update user/global balances & time-weighted scores
        _updateScore(sender, amount, true);
        _updateGlobalScore(amount, true);

        emit Deposited(sender, isYes, amount);

        // Try to pair and supply to strategy
        _pairAndSupply();
    }

    /**
     * @notice Withdraw YES/NO tokens before market resolution.
     * @dev Pulls USD from strategy and splits if we can't satisfy from unpaired pools.
     */
    function withdraw(uint256 yesAmount, uint256 noAmount) external nonReentrant whenWithdrawalsNotPaused onlyBeforeFinalize {
        if (yesAmount == 0 && noAmount == 0) revert InsufficientAmounts();

        address sender = msg.sender;

        // Check user balances
        uint256 userYes = yesBalance[sender];
        if (yesAmount > userYes) revert InsufficientUserYes(userYes);

        uint256 userTotal = getBalance(sender);
        uint256 userNo = userTotal - userYes;
        if (noAmount > userNo) revert InsufficientUserNo(userNo);

        // We will return (yesAmount, noAmount) to the user.
        // Ensure we have enough unpaired tokens; otherwise split USD.
        _ensureUnpairedForWithdrawal(yesAmount, noAmount);

        // Send tokens out (abstract hooks because pm could use ERC-20 or ERC-1155)
        if (yesAmount > 0) {
            unpairedYes -= yesAmount;
            yesBalance[sender] = userYes - yesAmount;
            totalUserYes -= yesAmount;
            _pmGiveYes(sender, yesAmount);
        }
        if (noAmount > 0) {
            unpairedNo -= noAmount;
            _pmGiveNo(sender, noAmount);
        }

        // Update user/global balances & scores
        uint256 totalOut = yesAmount + noAmount;
        _updateScore(sender, totalOut, false);
        _updateGlobalScore(totalOut, false);

        emit Withdrawn(sender, yesAmount, noAmount);
    }

    // ========= FINALIZATION & YIELD UNLOCK =========

    /**
     * @notice Finalize the market by checking the on-chain oracle result.
     *         Records the winning side, finalizes all scores at market end time,
     *         exits strategy (unlock yield), and opens harvesting/redemption.
     */
    function finalizeMarket() external nonReentrant whenGlobalNotPaused onlyBeforeFinalize {
        // Confirm resolution from PM (abstract read)
        (bool resolved_, WinningPosition winningPosition_) = _pmCheckResolved();
        if (!resolved_) revert MarketNotResolved();

        winningPosition = winningPosition_;
        finalized = true;
        emit MarketFinalized(winningPosition);

        // Stop time for scoring (at finalization time inside TimeWeighedScorer)
        _finalizeGlobalScore();

        // Exit strategy and compute yield; enable harvesting
        _unlockYield();
    }

    /**
     * @dev Finalize and unlock yield: exit strategy, compute realized yield, split into user pool and protocol fee,
     *     and mark harvesting as enabled.
     * In case the yield startegy is not liquid enough to withdraw the entire principal, the draining will happen in batches.
     * UnlockYield will be called multiple times in that case.
     */
    function unlockYield() public nonReentrant whenUnlockYieldNotPaused onlyAfterFinalize onlyBeforeUnlock {
        _unlockYield();
    }

    /**
     * @notice Harvest time-weighted yield (single pool) after unlock.
     */
    function harvestYield() external nonReentrant whenGlobalNotPaused onlyAfterUnlock {
        address sender = msg.sender;

        uint256 score = _finalizeUserScore(sender); // calculates user score at finalization, resets and returns it
        uint256 globalScore = getGlobalScore();
        if (score == 0 || globalScore == 0) revert NoYield();
        if (userYield == 0) revert NoYield();

        uint256 userShare = Math.mulDiv(score, userYield, globalScore);
        if (userShare == 0) revert NoYield();
        uint256 usdBalance = _usdBalanceOfThis();
        if (userShare > usdBalance) revert InsufficientUSD(usdBalance, userShare);

        // Pay user in USD
        _usdTransfer(sender, userShare);

        emit HarvestedYield(sender, userShare);
    }

    /**
     * @notice Harvest protocol fee after unlock.
     */
    function harvestProtocolYield(address receiver) external nonReentrant whenGlobalNotPaused onlyAfterUnlock onlyOwner {
        if (protocolYield == 0) revert NoYield();
        if (protocolYieldHarvested) revert AlreadyHarvested();
        protocolYieldHarvested = true;
        uint256 usdBalance = _usdBalanceOfThis();
        if (protocolYield > usdBalance) revert InsufficientUSD(usdBalance, protocolYield);
        _usdTransfer(receiver, protocolYield);
        emit HarvestedProtocolYield(receiver, protocolYield);
    }

    /**
     * @notice After resolution, redeem the user's winning tokens for USD directly here.
     *         This consumes the user's winning token balances tracked in the vault.
     * redeeming tokens is subject to availability of USD in the vault while strategy is still draining.
     */
    function redeemWinningForUsd() external nonReentrant whenGlobalNotPaused onlyAfterFinalize {
        address sender = msg.sender;

        // Determine user's winning balance
        uint256 userYes = yesBalance[sender];
        uint256 userTotal = getBalance(sender);
        uint256 userNo = userTotal - userYes;

        uint256 toPayUsd = winningPosition == WinningPosition.YES ? userYes : userNo;
        uint256 tokensConsumed = toPayUsd;
        //if both tokens equally won, we payout 0.5 for each from both sides and burn both
        if (winningPosition == WinningPosition.BOTH) {
            toPayUsd = (userYes + userNo) / 2;
            tokensConsumed = userYes + userNo;
        }
        if (toPayUsd == 0) revert InsufficientAmounts();

        // Burn user’s claim to those winning tokens in vault accounting
        if (winningPosition == WinningPosition.YES || winningPosition == WinningPosition.BOTH) {
            yesBalance[sender] = 0;
            totalUserYes -= userYes;
        }
        // This will only change the users and global balances and not the scores because the scorer is already finalized
        _updateScore(sender, tokensConsumed, false);
        _updateGlobalScore(tokensConsumed, false);

        // Provide USD to the user:
        uint256 toPay = _pmUsdAmountForOutcome(toPayUsd);
        uint256 usdBalance = _usdBalanceOfThis();
        if (toPay > usdBalance) revert InsufficientUSD(usdBalance, toPay);
        _usdTransfer(sender, toPay);

        emit RedeemedWinningForUSD(sender, toPayUsd, toPay);
    }

    /// @notice Set the per-side deposit limit (in outcome units). 0 = unlimited.
    function setDepositLimit(uint256 newLimit) external onlyOwner {
        depositLimit = newLimit;
    }

    // ========= VIEWS / HELPERS =========

    function getUserBalances(address user) external view returns (uint256 userYes_, uint256 userNo_) {
        userYes_ = yesBalance[user];
        uint256 total_ = getBalance(user);
        userNo_ = total_ - userYes_;
    }

    function getVaultUnpaired() external view returns (uint256 yes_, uint256 no_) {
        yes_ = unpairedYes;
        no_ = unpairedNo;
    }

    function getVaultPairedPrincipalUsd() external view returns (uint256) {
        return pairedUsdPrincipal;
    }

    /**
     * @notice Estimated yield breakdown (pre-unlock) or final numbers (post-unlock).
     * @dev If not unlocked: estimates based on strategy balance vs principal (+ leftoverUsd).
     */
    function getCurrentYieldBreakdown() external view returns (uint256 estTotalYield, uint256 estUserYield, uint256 estProtocolYield) {
        if (yieldUnlocked) {
            return (totalYield, userYield, protocolYield);
        }

        // Estimate based on current strategy balance + leftoverUsd vs pairedUsdPrincipal
        uint256 stratBal = _yieldStrategyBalance();
        uint256 grossUsd = stratBal + leftoverUsd + unlockedUsd;
        if (grossUsd <= pairedUsdPrincipal) {
            return (0, 0, 0);
        }
        uint256 estYield = grossUsd - pairedUsdPrincipal;
        uint256 fee = Math.mulDiv(estYield, protocolFeeBps, BPS_DENOM);
        uint256 userPart = estYield - fee;
        return (estYield, userPart, fee);
    }

    function getTvlUsd() external view returns (uint256 onHandUsd, uint256 inStrategyUsd, uint256 convertibleUsd, uint256 tvlUsd) {
        onHandUsd = _usdBalanceOfThis();
        if (!yieldUnlocked) {
            inStrategyUsd = _yieldStrategyBalance();
            uint256 convertibleTokens = 0;
            if (!finalized) {
                convertibleTokens = unpairedYes < unpairedNo ? unpairedYes : unpairedNo; // pre-resolution: pairs can be merged 1:1 to USD
            } else if (winningPosition == WinningPosition.YES) {
                convertibleTokens = unpairedYes;
            } else if (winningPosition == WinningPosition.NO) {
                convertibleTokens = unpairedNo;
            } else {
                convertibleTokens = (unpairedYes + unpairedNo) / 2;
            }
            convertibleUsd = _pmUsdAmountForOutcome(convertibleTokens);
            tvlUsd = onHandUsd + inStrategyUsd + convertibleUsd;
        } else {
            // after finalizeMarket() we exited the strategy and all unpaired tokens were converted to USD
            tvlUsd = onHandUsd;
        }
    }

    /// @notice Effective per-side deposit limit in outcome units: min(vault limit, strategy limit converted to outcome units). 0 if unlimited.
    function getCurrentSupplyAndLimit()
        public
        view
        returns (uint256 supplyYes, uint256 supplyNo, uint256 supplyLimit, uint256 strategySupply, uint256 strategyLimit)
    {
        (uint256 _strategySupply, uint256 _strategyLimit) = _yieldStrategySupplyAndLimitUsd();

        strategySupply = _strategySupply == 0 ? 0 : _pmOutcomeAmountForUsd(_strategySupply);
        strategyLimit = _strategyLimit == 0 ? 0 : _pmOutcomeAmountForUsd(_strategyLimit);
        supplyYes = totalUserYes;
        supplyNo = globalLastBalance - totalUserYes;
        supplyLimit = depositLimit;

        return (supplyYes, supplyNo, supplyLimit, strategySupply, strategyLimit);
    }

    // ========= INTERNAL LOGIC =========

    /**
     * @dev Tries to pair unpaired YES/NO, merges to USD, and supplies to strategy.
     *      Also re-supplies any leftoverUsd.
     */
    function _pairAndSupply() internal {
        uint256 pairable = unpairedYes < unpairedNo ? unpairedYes : unpairedNo;
        if (pairable > 0) {
            // Merge pairable YES+NO => USD (abstract)
            _pmMerge(pairable);
            unpairedYes -= pairable;
            unpairedNo -= pairable;

            uint256 usdFromPairs = _pmUsdAmountForOutcome(pairable);
            uint256 toSupplyUsd = usdFromPairs + leftoverUsd;
            leftoverUsd = 0;

            // Supply to yield strategy (abstract)
            _yieldStrategySupply(toSupplyUsd);

            // Increase recorded principal
            pairedUsdPrincipal += usdFromPairs;
        } else if (leftoverUsd > 0) {
            // No pairs but we have USD to (re-)supply
            _yieldStrategySupply(leftoverUsd);
            leftoverUsd = 0;
        }
    }

    /**
     * @dev Ensures we have enough unpaired YES/NO for a withdrawal.
     *      Withdraws USD from strategy and splits when needed.
     */
    function _ensureUnpairedForWithdrawal(uint256 needYes, uint256 needNo) internal {
        uint256 shortYes = needYes > unpairedYes ? (needYes - unpairedYes) : 0;
        uint256 shortNo = needNo > unpairedNo ? (needNo - unpairedNo) : 0;

        if (shortYes == 0 && shortNo == 0) {
            return; // already sufficient
        }

        // We can split USD -> YES+NO only in equal pairs, so withdraw the max shortfall.
        uint256 pairsNeeded = shortYes > shortNo ? shortYes : shortNo;
        uint256 usdNeeded = _pmUsdAmountForOutcome(pairsNeeded);

        // Withdraw USD from strategy; principal decreases by the amount derived from pairs
        uint256 withdrawnUsd = _yieldStrategyWithdraw(usdNeeded);
        if (withdrawnUsd < usdNeeded) revert InsufficientWithdrawalUSD(usdNeeded, withdrawnUsd);
        // Record principal decrease (we are reversing merges for user withdrawal)
        if (pairedUsdPrincipal >= usdNeeded) {
            pairedUsdPrincipal -= usdNeeded;
        } else {
            // Shouldn't happen in a well-formed state, but guard anyway
            pairedUsdPrincipal = 0;
        }

        // If protocol interest got pulled along, capture any excess over requested pairs as leftoverUsd
        if (withdrawnUsd > usdNeeded) {
            leftoverUsd += (withdrawnUsd - usdNeeded);
        }

        // Split the required pairs back into YES+NO (abstract)
        _pmSplit(pairsNeeded);

        // Increase unpaired pools accordingly
        unpairedYes += pairsNeeded;
        unpairedNo += pairsNeeded;

        // After this, we must be able to satisfy the user’s withdrawal from unpaired pools.
    }

    function _unlockYield() internal whenUnlockYieldNotPaused onlyAfterFinalize onlyBeforeUnlock {
        // First call: initialize draining state
        if (!unlocking) {
            unlocking = true;
            unlockedUsd = leftoverUsd; //already include in final amount of unlockedUsd because we want to allow token redemption while draining
            leftoverUsd = 0;
            emit YieldUnlockStarted(unlockedUsd, pairedUsdPrincipal);
        }

        // Exit strategy completely (principal + interest to this contract)
        // Drains as much as possible
        uint256 withdrawnUsd = _yieldStrategyExit();
        unlockedUsd += withdrawnUsd;

        // Check remaining strategy balance
        uint256 remaining = _yieldStrategyBalance();
        emit YieldUnlockProgress(withdrawnUsd, unlockedUsd, remaining);

        // Not done yet — exit early, keep draining in future calls
        if (remaining > STRATEGY_EXIT_DUST) return;

        // ====== Draining complete — finalize yield and enable payouts ======

        // Compute yield using ALL withdrawn (leftoverUsd is already included), minus principal
        if (unlockedUsd >= pairedUsdPrincipal) {
            totalYield = unlockedUsd - pairedUsdPrincipal;
        } else {
            //We only support strategies that can't loose money.
            //In the future we can calculate a lossRatio here like
            //lossRatio = (unlockedUsd * 10_000) / pairedUsdPrincipal;
            //then every redemption will multiply the amount by lossRatio so every redemption becomes proportionally smaller
            //We would also have to disable redemption while vault is still draining to make it fair for everyone
            totalYield = 0;
        }

        // Split yield into user pool and protocol fee
        protocolYield = Math.mulDiv(totalYield, protocolFeeBps, BPS_DENOM);
        userYield = totalYield - protocolYield;

        // After exit, strategy principal and leftover is zeroed
        pairedUsdPrincipal = 0;
        unlocking = false;

        // Redeem all leftover winning tokens to USDC so all liabilities are in USDC
        uint256 winLeft = winningPosition == WinningPosition.YES ? unpairedYes : unpairedNo;
        if (winningPosition == WinningPosition.BOTH) {
            winLeft = (unpairedYes + unpairedNo) / 2;
        }
        if (winLeft > 0) {
            uint256 got = _pmRedeemWinningToUsd();
            if (got != _pmUsdAmountForOutcome(winLeft)) revert RedeemMismatch();
            if (winningPosition == WinningPosition.YES) {
                unpairedYes = 0;
            } else if (winningPosition == WinningPosition.NO) {
                unpairedNo = 0;
            } else {
                unpairedYes = 0;
                unpairedNo = 0;
            }
        }

        // Enable harvesting
        yieldUnlocked = true;

        emit YieldUnlocked(unlockedUsd, totalYield, userYield, protocolYield);
    }

    /// @dev Transfer USD held by this contract to `to`.
    function _usdTransfer(address to, uint256 amountUsd) internal {
        underlyingUsd.safeTransfer(to, amountUsd);
    }

    /// @dev USD token balance held by this contract.
    function _usdBalanceOfThis() internal view returns (uint256) {
        return underlyingUsd.balanceOf(address(this));
    }

    // ========= ABSTRACT HOOKS =========
    // ----- Prediction Market (Outcome Tokens & Resolution) -----

    /// @dev Pull YES tokens from user into the vault.
    function _pmTakeYes(address from, uint256 amount) internal virtual;

    /// @dev Pull NO tokens from user into the vault.
    function _pmTakeNo(address from, uint256 amount) internal virtual;

    /// @dev Send YES tokens from the vault to user.
    function _pmGiveYes(address to, uint256 amount) internal virtual;

    /// @dev Send NO tokens from the vault to user.
    function _pmGiveNo(address to, uint256 amount) internal virtual;

    /// @dev Merge equal YES/NO pairs held by the vault into USD (1:1:1).
    function _pmMerge(uint256 pairs) internal virtual;

    /// @dev Split USD held by the vault into equal YES/NO pairs (1 => 1 YES + 1 NO).
    function _pmSplit(uint256 pairs) internal virtual;

    /// @dev After resolution, redeem all winning outcome tokens for USD.
    /// @return redeemedUsd amount of USD obtained.
    function _pmRedeemWinningToUsd() internal virtual returns (uint256 redeemedUsd);

    /// @dev Read on-chain resolution status & winner from PM.
    /// @return resolved true if resolved, and winningPosition_ the winning side.
    function _pmCheckResolved() internal view virtual returns (bool resolved, WinningPosition winningPosition_);

    /// @notice Convert outcome token amount → USDC amount (both in smallest units).
    function _pmUsdAmountForOutcome(uint256 outcomeAmount) internal pure virtual returns (uint256 usdAmount);

    /// @notice Convert USDC amount → outcome token amount (smallest units).
    function _pmOutcomeAmountForUsd(uint256 usdAmount) internal pure virtual returns (uint256 outcomeAmount);

    // ----- yield Strategy (USD) -----

    /// @dev Supply USD from this contract to the yield strategy.
    function _yieldStrategySupply(uint256 amountUsd) internal virtual;

    /// @dev Withdraw USD from the yield strategy to this contract. Returns actual withdrawn.
    function _yieldStrategyWithdraw(uint256 amountUsd) internal virtual returns (uint256 withdrawnUsd);

    /// @dev Withdraw as much as possible this call. Returns (success, amountWithdrawnUsd).
    function _yieldStrategyExit() internal virtual returns (uint256 withdrawnUsd);

    /// @dev Current USD balance the strategy would pay if exited now (principal+interest), view-only.
    function _yieldStrategyBalance() internal view virtual returns (uint256 balanceUsd);

    /// @dev Current APY of the yield strategy, view-only.
    function _yieldStrategyCurrentApy() internal view virtual returns (uint256 apyBps);

    /// @notice The max supply the strategy has (0 = unlimited) and the currently supplied amount
    function _yieldStrategySupplyAndLimitUsd() internal view virtual returns (uint256 currentSupply, uint256 limit);
}
