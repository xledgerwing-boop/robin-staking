// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import { ReentrancyGuard } from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { Pausable } from '@openzeppelin/contracts/utils/Pausable.sol';
import { ERC1155Holder } from '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import { IConditionalTokens } from './interfaces/IConditionalTokens.sol';

contract PromotionVault is ReentrancyGuard, Ownable, Pausable, ERC1155Holder {
    using SafeERC20 for IERC20;

    // ---------- Constants & scales ----------
    uint256 public constant PRICE_SCALE = 1e6; // price: 6 decimals (UsdC-like)
    uint256 public constant YES_INDEX = 0;
    uint256 public constant NO_INDEX = 1;
    uint256 public constant YES_INDEX_SET = 1; // YES is always the first index set for us
    uint256 public constant NO_INDEX_SET = 2; // NO is always the second index set for us
    bytes32 public constant PARENT_COLLECTION_ID = 0x0; // Always 0x0 for Polymarket

    // ---------- Tokens ----------
    IConditionalTokens public immutable ctf;
    IERC20 public immutable usdc; // UsdC (6 decimals)

    // ---------- Reward & TVL state ----------
    uint256 public baseRewardPool; // funded at start (UsdC 6 decimals)
    uint256 public tvlCapUsd; // TVL cap (UsdC 6 decimals)

    uint256 public totalValueUsd; // current total vault value (UsdC 6 decimals)
    uint256 public totalExtraValueUsd; // current total extra vault value (UsdC 6 decimals)

    // ---------- Time-weighted accumulators ----------
    uint256 public totalValueTime; // sum(totalValueUsd * deltaSeconds)
    uint256 public totalExtraValueTime; // sum(totalExtraValueUsd * deltaSeconds)

    // ---------- Campaign lifecycle ----------
    uint256 public campaignStartTimestamp;
    uint256 public campaignEndTimestamp;
    bool public campaignStarted;
    bool public campaignFinalized;

    // finalized pools at finalizeCampaign
    uint256 public finalizedBasePool; // how much base actually distributed (UsdC 6-dec)
    uint256 public finalizedExtraPool; // extra pool to be split among extra (UsdC 6-dec)

    // ---------- Market & user tracking ----------
    struct Market {
        uint256 tokenIdA;
        uint256 tokenIdB;
        uint256 totalAmountA; // amount uses 6 decimals (micro-shares)
        uint256 totalAmountB; // amount uses 6 decimals (micro-shares)
        uint256 priceA; // UsdC per base unit (6 decimals)
        bool active;
        bool extraEligible;
        // value-per-amount accumulators for BASE (units: PRICE_SCALE * seconds per amount unit)
        // Note: historically named rewardPerAmount*, now repurposed to track price * delta over time.
        uint256 rewardPerAmountA;
        uint256 rewardPerAmountB;
    }
    Market[] public markets;

    struct User {
        uint256 valueTime; // accrued BASE USD-seconds (pre-scale)
        uint256 extraValueTime; // user extra USD-seconds
        // per-user balances per market
        mapping(uint256 => uint256) amountsA;
        mapping(uint256 => uint256) amountsB;
        // per-user per-market paid snapshots for BASE value-per-amount accumulators
        mapping(uint256 => uint256) lastRewardPerAmountA;
        mapping(uint256 => uint256) lastRewardPerAmountB;
    }

    mapping(address => User) public users;

    // rewardRate-time bookkeeping
    uint256 public lastRewardTimestamp;

    // ---------- Events ----------
    event CampaignStarted(address indexed starter, uint256 baseFunded, uint256 startTs, uint256 endTs);
    event PricesUpdated(uint256 timestamp);
    event Deposit(address indexed user, uint256 indexed marketIndex, bool isA, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed marketIndex, bool isA, uint256 amount);
    event Claim(address indexed user, uint256 basePaid, uint256 extraPaid);
    event MarketAdded(uint256 index, bytes32 conditionId, uint256 tokenIdA, uint256 tokenIdB, bool extraEligible);
    event MarketEnded(uint256 index);
    event CampaignFinalized(uint256 timestamp, uint256 totalValueTime, uint256 totalExtraValueTime, uint256 baseDistributed, uint256 extraPool);
    event TvlCapUpdated(uint256 oldCapUsd, uint256 newCapUsd);
    event LeftoversSwept(address indexed to, uint256 amount);

    // ---------- Errors ----------
    error ZeroAddress();
    error PriceOutOfRange();
    error InvalidOutcomeSlotCount(uint256 outcomeSlotCount);
    error AlreadyStarted();
    error LengthMismatch();
    error DuplicateTokenId();
    error ToEarlierThanLast();
    error CampaignNotActive();
    error MarketIndexOutOfBounds();
    error ZeroAmount();
    error MarketNotActive();
    error TvlCapExceeded();
    error InsufficientBalance();
    error CampaignNotEnded();
    error CampaignNotFinalized();

    // ---------- Constructor ----------
    constructor(address _ctf, address _usdc, uint256 _tvlCapUsd) Ownable(msg.sender) {
        if (_ctf == address(0) || _usdc == address(0)) revert ZeroAddress();
        ctf = IConditionalTokens(_ctf);
        usdc = IERC20(_usdc);
        tvlCapUsd = _tvlCapUsd;
        _pause();
    }

    // ---------- Admin: market management ----------
    function addMarket(bytes32 conditionId, uint256 priceA, bool extraEligible, address polymarketCollateral) public onlyOwner {
        if (priceA > PRICE_SCALE) revert PriceOutOfRange();

        //Only allow Polymarket binary markets
        uint256 outcomeSlotCount = ctf.getOutcomeSlotCount(conditionId);
        if (outcomeSlotCount != 2) revert InvalidOutcomeSlotCount(outcomeSlotCount); //also checks that market is created (prepared)

        bytes32 yesColl = ctf.getCollectionId(PARENT_COLLECTION_ID, conditionId, YES_INDEX_SET);
        bytes32 noColl = ctf.getCollectionId(PARENT_COLLECTION_ID, conditionId, NO_INDEX_SET);
        uint256 tokenIdA = ctf.getPositionId(polymarketCollateral, yesColl);
        uint256 tokenIdB = ctf.getPositionId(polymarketCollateral, noColl);

        _validateNoDuplicateTokenIds(tokenIdA, tokenIdB);
        uint256 pA = priceA;
        markets.push(
            Market({
                tokenIdA: tokenIdA,
                tokenIdB: tokenIdB,
                totalAmountA: 0,
                totalAmountB: 0,
                priceA: pA,
                active: true,
                extraEligible: extraEligible,
                rewardPerAmountA: 0,
                rewardPerAmountB: 0
            })
        );
        emit MarketAdded(markets.length - 1, conditionId, tokenIdA, tokenIdB, extraEligible);
    }

    function setTvlCap(uint256 _capUsd) external onlyOwner {
        uint256 old = tvlCapUsd;
        tvlCapUsd = _capUsd;
        emit TvlCapUpdated(old, _capUsd);
    }

    // Expose owner pause control
    function pause() external onlyOwner {
        _pause();
    }

    // ---------- Campaign lifecycle ----------
    // startCampaign pulls baseRewardPool from caller (owner) via transferFrom
    function startCampaign(uint256 _baseRewardPool, uint256 _duration) external onlyOwner whenPaused {
        if (campaignStarted) revert AlreadyStarted();
        if (_baseRewardPool == 0) revert ZeroAmount();
        usdc.safeTransferFrom(msg.sender, address(this), _baseRewardPool);
        baseRewardPool = _baseRewardPool;
        campaignStartTimestamp = block.timestamp;
        campaignEndTimestamp = block.timestamp + _duration;
        campaignStarted = true;
        lastRewardTimestamp = block.timestamp;
        // initialize totals to current state:
        totalValueTime = 0;
        totalExtraValueTime = 0;
        totalValueUsd = 0;
        totalExtraValueUsd = 0;
        _unpause();
        emit CampaignStarted(msg.sender, _baseRewardPool, block.timestamp, campaignEndTimestamp);
    }

    // Admin must push prices for all markets in a batch
    function batchUpdatePrices(uint256[] calldata pricesA) external onlyOwner whenNotPaused {
        if (pricesA.length != markets.length) revert LengthMismatch();
        // advance global accumulators and per-market RPMs to now
        _advanceTime();

        // update prices and recompute totalValueUsd & extra totals
        uint256 newTotalValue = 0;
        uint256 newExtraTotal = 0;
        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            uint256 pA = pricesA[i];
            if (pA > PRICE_SCALE) revert PriceOutOfRange();
            m.priceA = pA;
            if (m.active) {
                uint256 vA = (m.totalAmountA * m.priceA) / PRICE_SCALE;
                uint256 pBNow = PRICE_SCALE - pA;
                uint256 vB = (m.totalAmountB * pBNow) / PRICE_SCALE;
                uint256 mVal = vA + vB;
                newTotalValue += mVal;
                if (m.extraEligible) newExtraTotal += mVal;
            }
        }
        totalValueUsd = newTotalValue;
        totalExtraValueUsd = newExtraTotal;

        emit PricesUpdated(block.timestamp);
    }

    // End a market and append a replacement in same call
    function endAndReplaceMarket(
        uint256 endIndex,
        bytes32 conditionId,
        uint256 newPriceA,
        bool newExtraEligible,
        address newPolymarketCollateral
    ) external onlyOwner whenNotPaused {
        if (endIndex >= markets.length) revert MarketIndexOutOfBounds();
        _advanceTime();

        Market storage old = markets[endIndex];
        if (old.active) {
            uint256 oldVal = (old.totalAmountA * old.priceA) / PRICE_SCALE + (old.totalAmountB * (PRICE_SCALE - old.priceA)) / PRICE_SCALE;
            if (totalValueUsd >= oldVal) totalValueUsd -= oldVal;
            else totalValueUsd = 0;
            if (old.extraEligible) {
                if (totalExtraValueUsd >= oldVal) totalExtraValueUsd -= oldVal;
                else totalExtraValueUsd = 0;
            }
            old.active = false;
        }
        emit MarketEnded(endIndex);

        addMarket(conditionId, newPriceA, newExtraEligible, newPolymarketCollateral);
    }

    // Validate that neither tokenId conflicts with any currently active market,
    // and that tokenIdA != tokenIdB for the new market definition.
    function _validateNoDuplicateTokenIds(uint256 tokenIdA, uint256 tokenIdB) internal view {
        if (tokenIdA == tokenIdB) revert DuplicateTokenId();
        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            if (!m.active) continue;
            if (m.tokenIdA == tokenIdA || m.tokenIdB == tokenIdA || m.tokenIdA == tokenIdB || m.tokenIdB == tokenIdB) {
                revert DuplicateTokenId();
            }
        }
    }

    // ---------- Core: time advancement & RPM updates ----------
    // Advance global state to now, distributing base rewards into per-market RPM accumulators.
    function _advanceTime() internal {
        uint256 to = _getMaxTimeToAdvance(block.timestamp);
        _advanceTimeTo(to);
    }

    // Advance to a specific timestamp (used in finalize)
    function _advanceTimeTo(uint256 toTimestamp) internal {
        toTimestamp = _getMaxTimeToAdvance(toTimestamp);
        if (toTimestamp < lastRewardTimestamp) revert ToEarlierThanLast();
        uint256 delta = toTimestamp - lastRewardTimestamp;
        if (delta == 0) return;

        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            if (!m.active) continue;
            m.rewardPerAmountA += m.priceA * delta;
            uint256 pBNow = PRICE_SCALE - m.priceA;
            m.rewardPerAmountB += pBNow * delta;
        }

        if (totalValueUsd > 0) {
            totalValueTime += totalValueUsd * delta;
        }
        if (totalExtraValueUsd > 0) {
            totalExtraValueTime += totalExtraValueUsd * delta;
        }

        lastRewardTimestamp = toTimestamp;
    }

    function _getMaxTimeToAdvance(uint256 toTimestamp) internal view returns (uint256) {
        if (campaignStarted && toTimestamp > campaignEndTimestamp) {
            return campaignEndTimestamp;
        }
        return toTimestamp;
    }

    // ---------- User flows ----------
    // deposit outcome token A/B
    function deposit(uint256 marketIndex, bool isA, uint256 amount) external nonReentrant whenNotPaused {
        _advanceTime();
        depositInner(marketIndex, isA, amount);
    }

    function depositInner(uint256 marketIndex, bool isA, uint256 amount) internal {
        if (!campaignStarted || block.timestamp >= campaignEndTimestamp) revert CampaignNotActive();
        if (marketIndex >= markets.length) revert MarketIndexOutOfBounds();
        if (amount == 0) revert ZeroAmount();

        Market storage m = markets[marketIndex];
        if (!m.active) revert MarketNotActive();

        _settleUserRewardsForMarketSideCommit(msg.sender, marketIndex, isA);

        if (isA) {
            // TVL cap: compute delta before transfer to fail early if exceeded
            uint256 deltaUsd = (amount * m.priceA) / PRICE_SCALE;
            if (totalValueUsd + deltaUsd > tvlCapUsd) revert TvlCapExceeded();
            // transfer tokens in after cap check
            ctf.safeTransferFrom(msg.sender, address(this), m.tokenIdA, amount, '');
            m.totalAmountA += amount;
            users[msg.sender].amountsA[marketIndex] += amount;

            totalValueUsd += deltaUsd;
            if (m.extraEligible) {
                totalExtraValueUsd += deltaUsd;
            }
        } else {
            uint256 pBNow = PRICE_SCALE - m.priceA;
            uint256 deltaUsd = (amount * pBNow) / PRICE_SCALE;
            if (totalValueUsd + deltaUsd > tvlCapUsd) revert TvlCapExceeded();
            ctf.safeTransferFrom(msg.sender, address(this), m.tokenIdB, amount, '');
            m.totalAmountB += amount;
            users[msg.sender].amountsB[marketIndex] += amount;

            totalValueUsd += deltaUsd;
            if (m.extraEligible) {
                totalExtraValueUsd += deltaUsd;
            }
        }

        // TVL cap is checked before token transfers to fail early
        emit Deposit(msg.sender, marketIndex, isA, amount);
    }

    // withdraw tokens (no immediate UsdC reward). Stops earning further after withdraw.
    function withdraw(uint256 marketIndex, bool isA, uint256 amount) external nonReentrant whenNotPaused {
        _advanceTime();
        withdrawInner(marketIndex, isA, amount);
    }

    function withdrawInner(uint256 marketIndex, bool isA, uint256 amount) internal {
        if (marketIndex >= markets.length) revert MarketIndexOutOfBounds();
        if (amount == 0) revert ZeroAmount();

        Market storage m = markets[marketIndex];
        User storage u = users[msg.sender];

        _settleUserRewardsForMarketSideCommit(msg.sender, marketIndex, isA);

        if (isA) {
            uint256 bal = u.amountsA[marketIndex];
            if (bal < amount) revert InsufficientBalance();
            u.amountsA[marketIndex] = bal - amount;
            m.totalAmountA -= amount;

            uint256 deltaUsd = (amount * m.priceA) / PRICE_SCALE;
            if (m.active) {
                if (totalValueUsd >= deltaUsd) totalValueUsd -= deltaUsd;
                else totalValueUsd = 0;
                if (m.extraEligible) {
                    if (totalExtraValueUsd >= deltaUsd) totalExtraValueUsd -= deltaUsd;
                    else totalExtraValueUsd = 0;
                }
            }

            ctf.safeTransferFrom(address(this), msg.sender, m.tokenIdA, amount, '');
        } else {
            uint256 bal = u.amountsB[marketIndex];
            if (bal < amount) revert InsufficientBalance();
            u.amountsB[marketIndex] = bal - amount;
            m.totalAmountB -= amount;

            uint256 pBNow = PRICE_SCALE - m.priceA;
            uint256 deltaUsd = (amount * pBNow) / PRICE_SCALE;
            if (m.active) {
                if (totalValueUsd >= deltaUsd) totalValueUsd -= deltaUsd;
                else totalValueUsd = 0;
                if (m.extraEligible) {
                    if (totalExtraValueUsd >= deltaUsd) totalExtraValueUsd -= deltaUsd;
                    else totalExtraValueUsd = 0;
                }
            }

            ctf.safeTransferFrom(address(this), msg.sender, m.tokenIdB, amount, '');
        }

        emit Withdraw(msg.sender, marketIndex, isA, amount);
    }

    // Batch deposit across multiple markets/sides. Reverts atomically if any item fails.
    // Only needs to call _advanceTime once.
    function batchDeposit(
        uint256[] calldata marketIndexes,
        bool[] calldata sidesIsA,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        uint256 n = marketIndexes.length;
        if (n == 0 || sidesIsA.length != n || amounts.length != n) revert LengthMismatch();
        if (!campaignStarted || block.timestamp >= campaignEndTimestamp) revert CampaignNotActive();

        _advanceTime();

        for (uint256 i = 0; i < n; i++) {
            uint256 idx = marketIndexes[i];
            uint256 amt = amounts[i];
            bool isA = sidesIsA[i];
            depositInner(idx, isA, amt);
        }
    }

    // Batch withdraw across multiple markets/sides. Reverts atomically if any item fails.
    // Only needs to call _advanceTime once.
    function batchWithdraw(
        uint256[] calldata marketIndexes,
        bool[] calldata sidesIsA,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        uint256 n = marketIndexes.length;
        if (n == 0 || sidesIsA.length != n || amounts.length != n) revert LengthMismatch();

        _advanceTime();

        for (uint256 i = 0; i < n; i++) {
            uint256 idx = marketIndexes[i];
            uint256 amt = amounts[i];
            bool isA = sidesIsA[i];
            withdrawInner(idx, isA, amt);
        }
    }

    // ---------- Per-user settlement ----------
    // Settle pending RPM-based rewards for a user by looping markets (up to N small, e.g. 20).
    function _settleUserRewards(address user) internal {
        User storage u = users[user];
        uint256 valueTime = 0;
        uint256 extraValueTime = 0;

        for (uint256 i = 0; i < markets.length; i++) {
            (uint256 deltaValueTime, uint256 deltaExtraValueTime) = _settleUserRewardsForMarketSide(user, i, true);
            valueTime += deltaValueTime;
            extraValueTime += deltaExtraValueTime;
            (deltaValueTime, deltaExtraValueTime) = _settleUserRewardsForMarketSide(user, i, false);
            valueTime += deltaValueTime;
            extraValueTime += deltaExtraValueTime;
        }

        if (valueTime > 0) u.valueTime += valueTime; // UsdC 6-dec
        if (extraValueTime > 0) u.extraValueTime += extraValueTime;
    }

    function _settleUserRewardsForMarketSideCommit(address user, uint256 marketIndex, bool isA) internal {
        User storage u = users[user];
        (uint256 deltaValueTime, uint256 deltaExtraValueTime) = _settleUserRewardsForMarketSide(user, marketIndex, isA);
        u.valueTime += deltaValueTime;
        u.extraValueTime += deltaExtraValueTime;
    }

    // Settle pending rewards for a single side (A or B) of a market to save gas.
    function _settleUserRewardsForMarketSide(
        address user,
        uint256 marketIndex,
        bool isA
    ) internal returns (uint256 deltaValueTime, uint256 deltaExtraValueTime) {
        User storage u = users[user];
        Market storage m = markets[marketIndex];

        if (isA) {
            uint256 balA = u.amountsA[marketIndex];
            uint256 lastPerA = u.lastRewardPerAmountA[marketIndex];
            uint256 rpa = m.rewardPerAmountA;
            if (rpa > lastPerA) {
                if (balA > 0) {
                    uint256 diffA = rpa - lastPerA;
                    uint256 addA = (balA * diffA) / PRICE_SCALE;
                    deltaValueTime += addA;
                    if (m.extraEligible) deltaExtraValueTime += addA;
                }
                u.lastRewardPerAmountA[marketIndex] = rpa;
            }
        } else {
            uint256 balB = u.amountsB[marketIndex];
            uint256 lastPerB = u.lastRewardPerAmountB[marketIndex];
            uint256 rpb = m.rewardPerAmountB;
            if (rpb > lastPerB) {
                if (balB > 0) {
                    uint256 diffB = rpb - lastPerB;
                    uint256 addB = (balB * diffB) / PRICE_SCALE;
                    deltaValueTime += addB;
                    if (m.extraEligible) deltaExtraValueTime += addB;
                }
                u.lastRewardPerAmountB[marketIndex] = rpb;
            }
        }
    }

    // finalizeCampaign: owner-only after campaign end timestamp
    function finalizeCampaign() external onlyOwner whenNotPaused {
        if (!campaignStarted || campaignFinalized) revert CampaignNotActive();
        if (block.timestamp < campaignEndTimestamp) revert CampaignNotEnded();

        // advance all accumulators to exact campaign end
        _advanceTimeTo(campaignEndTimestamp);

        uint256 totalAvailable = usdc.balanceOf(address(this));

        if (totalExtraValueTime == 0) {
            // no extra participants -> distribute everything as base
            finalizedBasePool = totalAvailable;
            finalizedExtraPool = 0;
        } else {
            // allocate full base pool (clamped by available balance)
            finalizedBasePool = baseRewardPool <= totalAvailable ? baseRewardPool : totalAvailable;
            finalizedExtraPool = totalAvailable - finalizedBasePool;
        }

        campaignFinalized = true;

        emit CampaignFinalized(block.timestamp, totalValueTime, totalExtraValueTime, finalizedBasePool, finalizedExtraPool);
    }

    // claimRewards: only after finalize; settle user RPM rewards up to campaign end then pay scaled base + extra share
    function claimRewards() external nonReentrant whenNotPaused {
        if (!campaignFinalized) revert CampaignNotFinalized();

        User storage u = users[msg.sender];

        // ensure user's extra accrual and RPM settlement reflect campaign end:
        _settleUserRewards(msg.sender);

        uint256 baseScaled = 0;
        uint256 extraShare = 0;
        if (u.valueTime > 0 && finalizedBasePool > 0 && totalValueTime > 0) {
            baseScaled = (u.valueTime * finalizedBasePool) / totalValueTime;
        } else {
            baseScaled = 0;
        }

        if (u.extraValueTime > 0 && finalizedExtraPool > 0 && totalExtraValueTime > 0) {
            extraShare = (u.extraValueTime * finalizedExtraPool) / totalExtraValueTime;
        } else {
            extraShare = 0;
        }

        if (baseScaled == 0 && extraShare == 0) revert ZeroAmount();

        u.valueTime = 0;
        u.extraValueTime = 0;

        uint256 totalPayout = baseScaled + extraShare;
        usdc.safeTransfer(msg.sender, totalPayout);

        emit Claim(msg.sender, baseScaled, extraShare);
    }

    // ---------- Views ----------
    function marketCount() external view returns (uint256) {
        return markets.length;
    }

    // Return the user's raw ERC-1155 balances for a given market index
    function userMarketBalances(address account, uint256 marketIndex) external view returns (uint256 amountA, uint256 amountB) {
        if (marketIndex >= markets.length) revert MarketIndexOutOfBounds();
        User storage u = users[account];
        amountA = u.amountsA[marketIndex];
        amountB = u.amountsB[marketIndex];
    }

    // Compute user's current USD values using latest prices and active/extra flags
    function viewUserCurrentValues(address account) external view returns (uint256 valueUsd, uint256 extraValueUsd) {
        User storage u = users[account];
        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            if (!m.active) continue;
            uint256 vA = (u.amountsA[i] * m.priceA) / PRICE_SCALE;
            uint256 pBNow = PRICE_SCALE - m.priceA;
            uint256 vB = (u.amountsB[i] * pBNow) / PRICE_SCALE;
            uint256 v = vA + vB;
            valueUsd += v;
            if (m.extraEligible) {
                extraValueUsd += v;
            }
        }
    }

    // Current APY view (basis points, 1e4 = 100%)
    // APY = (baseRewardPool / effectiveTVL) * (secondsPerYear / campaignDuration) * 100%
    // effectiveTVL uses current totalValueUsd; if zero, assumes tvlCapUsd.
    function viewCurrentApyBps() external view returns (uint256 apyBps) {
        uint256 startTs = campaignStartTimestamp;
        uint256 endTs = campaignEndTimestamp;
        if (endTs <= startTs) return 0;
        uint256 duration = endTs - startTs;
        uint256 effTvl = totalValueUsd > 0 ? totalValueUsd : tvlCapUsd;
        if (effTvl == 0 || baseRewardPool == 0) return 0;
        // 365 days
        uint256 secondsPerYear = 365 days;
        // scale to bps
        apyBps = (baseRewardPool * secondsPerYear * 10_000) / duration / effTvl;
    }

    // Computes how much a user could currently stake (value and tokens) across all active markets.
    // Returns:
    // - totalTokens: sum of ERC-1155 amounts across active market A and B tokens (6 decimals)
    // - totalUsd   : USD value at current prices (6 decimals)
    function viewUserStakeableValue(address account) external view returns (uint256 totalTokens, uint256 totalUsd, uint256 eligibleUsd) {
        // count active markets
        uint256 activeCount = 0;
        for (uint256 i = 0; i < markets.length; i++) {
            if (markets[i].active) activeCount++;
        }
        if (activeCount == 0) return (0, 0, 0);

        uint256 pairCount = activeCount * 2;
        address[] memory accounts = new address[](pairCount);
        uint256[] memory ids = new uint256[](pairCount);

        // fill batch arrays
        uint256 k = 0;
        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            if (!m.active) continue;
            accounts[k] = account;
            ids[k] = m.tokenIdA;
            k++;
            accounts[k] = account;
            ids[k] = m.tokenIdB;
            k++;
        }

        uint256[] memory balances = ctf.balanceOfBatch(accounts, ids);

        // compute totals aligning with current prices
        k = 0;
        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            if (!m.active) continue;
            uint256 balA = balances[k];
            uint256 balB = balances[k + 1];
            totalTokens += balA + balB;
            uint256 pA = m.priceA;
            uint256 pB = PRICE_SCALE - pA;
            uint256 mVal = (balA > 0 ? (balA * pA) / PRICE_SCALE : 0) + (balB > 0 ? (balB * pB) / PRICE_SCALE : 0);
            totalUsd += mVal;
            if (m.extraEligible) {
                eligibleUsd += mVal;
            }
            k += 2;
        }
    }

    function campaignRewardSize() external view returns (uint256 total, uint256 extra) {
        total = usdc.balanceOf(address(this));
        extra = total > baseRewardPool ? (total - baseRewardPool) : 0;
    }

    // View: estimate user's earnings so far (as if the campaign ended right now).
    // Returns:
    // - total: base + extra payout now
    // - base:  user's share of time-linear base budget so far
    // - extra: user's share of extra budget so far
    function viewUserEstimatedEarnings(address account) external view returns (uint256 total, uint256 base, uint256 extra) {
        if (!campaignStarted) return (0, 0, 0);

        uint256 toTs = _getMaxTimeToAdvance(block.timestamp);
        uint256 delta = toTs > lastRewardTimestamp ? (toTs - lastRewardTimestamp) : 0;

        User storage u = users[account];

        // 1) Simulate user USD-seconds to now (base and extra), reconciling against current accumulators
        uint256 userBaseUsdSeconds = u.valueTime;
        uint256 userExtraUsdSeconds = u.extraValueTime;
        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            uint256 addA = (delta > 0 && m.active && m.priceA > 0) ? (m.priceA * delta) : 0;
            uint256 pBNow = PRICE_SCALE - m.priceA;
            uint256 addB = (delta > 0 && m.active && pBNow > 0) ? (pBNow * delta) : 0;

            uint256 rpaNow = m.rewardPerAmountA + addA;
            uint256 rpbNow = m.rewardPerAmountB + addB;

            // token A
            uint256 lastPerA = u.lastRewardPerAmountA[i];
            if (rpaNow > lastPerA) {
                uint256 diffA = rpaNow - lastPerA;
                uint256 balA = u.amountsA[i];
                if (balA > 0) {
                    uint256 add = (balA * diffA) / PRICE_SCALE;
                    userBaseUsdSeconds += add;
                    if (m.extraEligible) userExtraUsdSeconds += add;
                }
            }
            // token B
            uint256 lastPerB = u.lastRewardPerAmountB[i];
            if (rpbNow > lastPerB) {
                uint256 diffB = rpbNow - lastPerB;
                uint256 balB = u.amountsB[i];
                if (balB > 0) {
                    uint256 add = (balB * diffB) / PRICE_SCALE;
                    userBaseUsdSeconds += add;
                    if (m.extraEligible) userExtraUsdSeconds += add;
                }
            }
        }

        // 2) Denominators to now
        uint256 baseUsdSecondsTotal = totalValueTime;
        if (delta > 0 && totalValueUsd > 0) {
            baseUsdSecondsTotal += totalValueUsd * delta;
        }
        uint256 extraUsdSecondsTotal = totalExtraValueTime;
        if (delta > 0 && totalExtraValueUsd > 0) {
            extraUsdSecondsTotal += totalExtraValueUsd * delta;
        }

        // 3) Budgets so far (time-linear)
        uint256 elapsed = toTs > campaignStartTimestamp ? (toTs - campaignStartTimestamp) : 0;
        uint256 duration = campaignEndTimestamp > campaignStartTimestamp ? (campaignEndTimestamp - campaignStartTimestamp) : 0;

        uint256 totalAvailable = usdc.balanceOf(address(this));

        // Base budget so far: linear vest of baseRewardPool, clamped to balance
        uint256 baseBudget = 0;
        if (duration > 0) {
            baseBudget = ((baseRewardPool * elapsed) / duration);
            if (baseBudget > totalAvailable) baseBudget = totalAvailable;
        }
        // Extra budget so far is any extra that is in the vault right now, since it accumulates gradually
        uint256 extraBudget = totalAvailable > baseRewardPool ? (totalAvailable - baseRewardPool) : 0;

        // 4) Scale user shares
        if (userBaseUsdSeconds > 0 && baseBudget > 0 && baseUsdSecondsTotal > 0) {
            base = (userBaseUsdSeconds * baseBudget) / baseUsdSecondsTotal;
        }
        if (userExtraUsdSeconds > 0 && extraBudget > 0 && extraUsdSecondsTotal > 0) {
            extra = (userExtraUsdSeconds * extraBudget) / extraUsdSecondsTotal;
        }
        total = base + extra;
    }

    // Return market indices and the user's external (wallet) balances per market (A+B) for
    // markets that are currently active AND whose combined wallet balance is greater than `threshold`.
    function viewUserActiveWalletBalancesAboveThreshold(
        address account,
        uint256 threshold
    ) external view returns (uint256[] memory marketIndices, uint256[] memory walletABalances, uint256[] memory walletBBalances) {
        // count active markets
        uint256 activeCount = 0;
        for (uint256 i = 0; i < markets.length; i++) {
            if (markets[i].active) activeCount++;
        }
        if (activeCount == 0) {
            return (new uint256[](0), new uint256[](0), new uint256[](0));
        }

        // batch query wallet balances for active markets
        uint256 pairCount = activeCount * 2;
        address[] memory accounts = new address[](pairCount);
        uint256[] memory ids = new uint256[](pairCount);
        uint256 k = 0;
        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            if (!m.active) continue;
            accounts[k] = account;
            ids[k] = m.tokenIdA;
            k++;
            accounts[k] = account;
            ids[k] = m.tokenIdB;
            k++;
        }
        uint256[] memory balances = ctf.balanceOfBatch(accounts, ids);

        // first pass: count how many markets exceed threshold
        k = 0;
        uint256 matchCount = 0;
        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            if (!m.active) continue;
            if (balances[k] > threshold || balances[k + 1] > threshold) {
                matchCount++;
            }
            k += 2;
        }
        if (matchCount == 0) {
            return (new uint256[](0), new uint256[](0), new uint256[](0));
        }

        // second pass: fill results
        marketIndices = new uint256[](matchCount);
        walletABalances = new uint256[](matchCount);
        walletBBalances = new uint256[](matchCount);
        k = 0;
        uint256 out = 0;
        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            if (!m.active) continue;
            uint256 balA = balances[k];
            uint256 balB = balances[k + 1];
            if (balA > threshold || balB > threshold) {
                marketIndices[out] = i;
                walletABalances[out] = balA;
                walletBBalances[out] = balB;
                out++;
            }
            k += 2;
        }
    }

    // Return market indices and the user's staked balances for any market (active or inactive)
    // where the user currently has a non-zero staked balance in the vault.
    function viewUserStakedMarkets(
        address account
    ) external view returns (uint256[] memory marketIndices, uint256[] memory stakedABalances, uint256[] memory stakedBBalances) {
        User storage u = users[account];
        // first pass: count
        uint256 count = 0;
        for (uint256 i = 0; i < markets.length; i++) {
            if (u.amountsA[i] > 0 || u.amountsB[i] > 0) count++;
        }
        if (count == 0) {
            return (new uint256[](0), new uint256[](0), new uint256[](0));
        }
        // second pass: fill
        marketIndices = new uint256[](count);
        stakedABalances = new uint256[](count);
        stakedBBalances = new uint256[](count);
        uint256 out = 0;
        for (uint256 i = 0; i < markets.length; i++) {
            uint256 balA = u.amountsA[i];
            uint256 balB = u.amountsB[i];
            if (balA == 0 && balB == 0) continue;
            marketIndices[out] = i;
            stakedABalances[out] = balA;
            stakedBBalances[out] = balB;
            out++;
        }
    }
}
