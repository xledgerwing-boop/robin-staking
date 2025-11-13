import { createUseReadContract, createUseSimulateContract, createUseWatchContractEvent } from 'wagmi/codegen';
import { createUseWriteContract } from './createUseWriteContract';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PromotionVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const promotionVaultAbi = [
    {
        type: 'constructor',
        inputs: [
            { name: '_ctf', internalType: 'address', type: 'address' },
            { name: '_usdc', internalType: 'address', type: 'address' },
            { name: '_tvlCapUsd', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'NO_INDEX', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'NO_INDEX_SET',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'PARENT_COLLECTION_ID',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'PRICE_SCALE', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'YES_INDEX', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'YES_INDEX_SET',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'conditionId', internalType: 'bytes32', type: 'bytes32' },
            { name: 'priceA', internalType: 'uint256', type: 'uint256' },
            { name: 'extraEligible', internalType: 'bool', type: 'bool' },
            { name: 'polymarketCollateral', internalType: 'address', type: 'address' },
        ],
        name: 'addMarket',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'baseRewardPool',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'marketIndexes', internalType: 'uint256[]', type: 'uint256[]' },
            { name: 'sidesIsA', internalType: 'bool[]', type: 'bool[]' },
            { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
        ],
        name: 'batchDeposit',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'pricesA', internalType: 'uint256[]', type: 'uint256[]' }],
        name: 'batchUpdatePrices',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'marketIndexes', internalType: 'uint256[]', type: 'uint256[]' },
            { name: 'sidesIsA', internalType: 'bool[]', type: 'bool[]' },
            { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
        ],
        name: 'batchWithdraw',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'campaignEndTimestamp',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'campaignFinalized', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'campaignRewardSize',
        outputs: [
            { name: 'total', internalType: 'uint256', type: 'uint256' },
            { name: 'extra', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'campaignStartTimestamp',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'campaignStarted', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'claimRewards', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [],
        name: 'ctf',
        outputs: [{ name: '', internalType: 'contract IConditionalTokens', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'marketIndex', internalType: 'uint256', type: 'uint256' },
            { name: 'isA', internalType: 'bool', type: 'bool' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'deposit',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'endIndex', internalType: 'uint256', type: 'uint256' },
            { name: 'conditionId', internalType: 'bytes32', type: 'bytes32' },
            { name: 'newPriceA', internalType: 'uint256', type: 'uint256' },
            { name: 'newExtraEligible', internalType: 'bool', type: 'bool' },
            { name: 'newPolymarketCollateral', internalType: 'address', type: 'address' },
        ],
        name: 'endAndReplaceMarket',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'finalizeCampaign', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [],
        name: 'finalizedBasePool',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'finalizedExtraPool',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'lastRewardTimestamp',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'marketCount', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        name: 'markets',
        outputs: [
            { name: 'tokenIdA', internalType: 'uint256', type: 'uint256' },
            { name: 'tokenIdB', internalType: 'uint256', type: 'uint256' },
            { name: 'totalAmountA', internalType: 'uint256', type: 'uint256' },
            { name: 'totalAmountB', internalType: 'uint256', type: 'uint256' },
            { name: 'priceA', internalType: 'uint256', type: 'uint256' },
            { name: 'active', internalType: 'bool', type: 'bool' },
            { name: 'extraEligible', internalType: 'bool', type: 'bool' },
            { name: 'rewardPerAmountA', internalType: 'uint256', type: 'uint256' },
            { name: 'rewardPerAmountB', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: '', internalType: 'address', type: 'address' },
            { name: '', internalType: 'address', type: 'address' },
            { name: '', internalType: 'uint256[]', type: 'uint256[]' },
            { name: '', internalType: 'uint256[]', type: 'uint256[]' },
            { name: '', internalType: 'bytes', type: 'bytes' },
        ],
        name: 'onERC1155BatchReceived',
        outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '', internalType: 'address', type: 'address' },
            { name: '', internalType: 'address', type: 'address' },
            { name: '', internalType: 'uint256', type: 'uint256' },
            { name: '', internalType: 'uint256', type: 'uint256' },
            { name: '', internalType: 'bytes', type: 'bytes' },
        ],
        name: 'onERC1155Received',
        outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'owner', outputs: [{ name: '', internalType: 'address', type: 'address' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'paused', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [{ name: '_capUsd', internalType: 'uint256', type: 'uint256' }],
        name: 'setTvlCap',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '_baseRewardPool', internalType: 'uint256', type: 'uint256' },
            { name: '_duration', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'startCampaign',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'totalExtraValueTime',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'totalExtraValueUsd',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'totalValueTime',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'totalValueUsd',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'tvlCapUsd', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'usdc',
        outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'account', internalType: 'address', type: 'address' },
            { name: 'marketIndex', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'userMarketBalances',
        outputs: [
            { name: 'amountA', internalType: 'uint256', type: 'uint256' },
            { name: 'amountB', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: '', internalType: 'address', type: 'address' }],
        name: 'users',
        outputs: [
            { name: 'valueTime', internalType: 'uint256', type: 'uint256' },
            { name: 'extraValueTime', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'viewCurrentApyBps',
        outputs: [{ name: 'apyBps', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
        name: 'viewUserCurrentValues',
        outputs: [
            { name: 'valueUsd', internalType: 'uint256', type: 'uint256' },
            { name: 'extraValueUsd', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
        name: 'viewUserEstimatedEarnings',
        outputs: [
            { name: 'total', internalType: 'uint256', type: 'uint256' },
            { name: 'base', internalType: 'uint256', type: 'uint256' },
            { name: 'extra', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
        name: 'viewUserStakeableValue',
        outputs: [
            { name: 'totalTokens', internalType: 'uint256', type: 'uint256' },
            { name: 'totalUsd', internalType: 'uint256', type: 'uint256' },
            { name: 'eligibleUsd', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'marketIndex', internalType: 'uint256', type: 'uint256' },
            { name: 'isA', internalType: 'bool', type: 'bool' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'timestamp', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'totalValueTime', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'totalExtraValueTime', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'baseDistributed', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'extraPool', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'CampaignFinalized',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'starter', internalType: 'address', type: 'address', indexed: true },
            { name: 'baseFunded', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'startTs', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'endTs', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'CampaignStarted',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'basePaid', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'extraPaid', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'Claim',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'marketIndex', internalType: 'uint256', type: 'uint256', indexed: true },
            { name: 'isA', internalType: 'bool', type: 'bool', indexed: false },
            { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'Deposit',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'to', internalType: 'address', type: 'address', indexed: true },
            { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'LeftoversSwept',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'index', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'tokenIdA', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'tokenIdB', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'extraEligible', internalType: 'bool', type: 'bool', indexed: false },
        ],
        name: 'MarketAdded',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256', indexed: false }], name: 'MarketEnded' },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
            { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
        ],
        name: 'OwnershipTransferred',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: false }], name: 'Paused' },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'timestamp', internalType: 'uint256', type: 'uint256', indexed: false }],
        name: 'PricesUpdated',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'oldCapUsd', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'newCapUsd', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'TvlCapUpdated',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: false }], name: 'Unpaused' },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'marketIndex', internalType: 'uint256', type: 'uint256', indexed: true },
            { name: 'isA', internalType: 'bool', type: 'bool', indexed: false },
            { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'Withdraw',
    },
    { type: 'error', inputs: [], name: 'AlreadyStarted' },
    { type: 'error', inputs: [], name: 'CampaignNotActive' },
    { type: 'error', inputs: [], name: 'CampaignNotEnded' },
    { type: 'error', inputs: [], name: 'CampaignNotFinalized' },
    { type: 'error', inputs: [], name: 'DuplicateTokenId' },
    { type: 'error', inputs: [], name: 'EnforcedPause' },
    { type: 'error', inputs: [], name: 'ExpectedPause' },
    { type: 'error', inputs: [], name: 'InsufficientBalance' },
    { type: 'error', inputs: [{ name: 'outcomeSlotCount', internalType: 'uint256', type: 'uint256' }], name: 'InvalidOutcomeSlotCount' },
    { type: 'error', inputs: [], name: 'LengthMismatch' },
    { type: 'error', inputs: [], name: 'MarketIndexOutOfBounds' },
    { type: 'error', inputs: [], name: 'MarketNotActive' },
    { type: 'error', inputs: [{ name: 'owner', internalType: 'address', type: 'address' }], name: 'OwnableInvalidOwner' },
    { type: 'error', inputs: [{ name: 'account', internalType: 'address', type: 'address' }], name: 'OwnableUnauthorizedAccount' },
    { type: 'error', inputs: [], name: 'PriceOutOfRange' },
    { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
    { type: 'error', inputs: [{ name: 'token', internalType: 'address', type: 'address' }], name: 'SafeERC20FailedOperation' },
    { type: 'error', inputs: [], name: 'ToEarlierThanLast' },
    { type: 'error', inputs: [], name: 'TvlCapExceeded' },
    { type: 'error', inputs: [], name: 'ZeroAddress' },
    { type: 'error', inputs: [], name: 'ZeroAmount' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__
 */
export const useReadPromotionVault = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"NO_INDEX"`
 */
export const useReadPromotionVaultNoIndex = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'NO_INDEX' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"NO_INDEX_SET"`
 */
export const useReadPromotionVaultNoIndexSet = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'NO_INDEX_SET' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"PARENT_COLLECTION_ID"`
 */
export const useReadPromotionVaultParentCollectionId = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'PARENT_COLLECTION_ID',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"PRICE_SCALE"`
 */
export const useReadPromotionVaultPriceScale = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'PRICE_SCALE' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"YES_INDEX"`
 */
export const useReadPromotionVaultYesIndex = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'YES_INDEX' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"YES_INDEX_SET"`
 */
export const useReadPromotionVaultYesIndexSet = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'YES_INDEX_SET' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"baseRewardPool"`
 */
export const useReadPromotionVaultBaseRewardPool = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'baseRewardPool' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"campaignEndTimestamp"`
 */
export const useReadPromotionVaultCampaignEndTimestamp = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'campaignEndTimestamp',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"campaignFinalized"`
 */
export const useReadPromotionVaultCampaignFinalized = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'campaignFinalized',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"campaignRewardSize"`
 */
export const useReadPromotionVaultCampaignRewardSize = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'campaignRewardSize',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"campaignStartTimestamp"`
 */
export const useReadPromotionVaultCampaignStartTimestamp = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'campaignStartTimestamp',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"campaignStarted"`
 */
export const useReadPromotionVaultCampaignStarted = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'campaignStarted' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"ctf"`
 */
export const useReadPromotionVaultCtf = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'ctf' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"finalizedBasePool"`
 */
export const useReadPromotionVaultFinalizedBasePool = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'finalizedBasePool',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"finalizedExtraPool"`
 */
export const useReadPromotionVaultFinalizedExtraPool = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'finalizedExtraPool',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"lastRewardTimestamp"`
 */
export const useReadPromotionVaultLastRewardTimestamp = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'lastRewardTimestamp',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"marketCount"`
 */
export const useReadPromotionVaultMarketCount = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'marketCount' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"markets"`
 */
export const useReadPromotionVaultMarkets = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'markets' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadPromotionVaultOwner = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'owner' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"paused"`
 */
export const useReadPromotionVaultPaused = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'paused' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadPromotionVaultSupportsInterface = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'supportsInterface',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"totalExtraValueTime"`
 */
export const useReadPromotionVaultTotalExtraValueTime = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'totalExtraValueTime',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"totalExtraValueUsd"`
 */
export const useReadPromotionVaultTotalExtraValueUsd = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'totalExtraValueUsd',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"totalValueTime"`
 */
export const useReadPromotionVaultTotalValueTime = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'totalValueTime' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"totalValueUsd"`
 */
export const useReadPromotionVaultTotalValueUsd = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'totalValueUsd' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"tvlCapUsd"`
 */
export const useReadPromotionVaultTvlCapUsd = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'tvlCapUsd' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"usdc"`
 */
export const useReadPromotionVaultUsdc = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'usdc' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"userMarketBalances"`
 */
export const useReadPromotionVaultUserMarketBalances = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'userMarketBalances',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"users"`
 */
export const useReadPromotionVaultUsers = /*#__PURE__*/ createUseReadContract({ abi: promotionVaultAbi, functionName: 'users' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"viewCurrentApyBps"`
 */
export const useReadPromotionVaultViewCurrentApyBps = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'viewCurrentApyBps',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"viewUserCurrentValues"`
 */
export const useReadPromotionVaultViewUserCurrentValues = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'viewUserCurrentValues',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"viewUserEstimatedEarnings"`
 */
export const useReadPromotionVaultViewUserEstimatedEarnings = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'viewUserEstimatedEarnings',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"viewUserStakeableValue"`
 */
export const useReadPromotionVaultViewUserStakeableValue = /*#__PURE__*/ createUseReadContract({
    abi: promotionVaultAbi,
    functionName: 'viewUserStakeableValue',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__
 */
export const useWritePromotionVault = /*#__PURE__*/ createUseWriteContract({ abi: promotionVaultAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"addMarket"`
 */
export const useWritePromotionVaultAddMarket = /*#__PURE__*/ createUseWriteContract({ abi: promotionVaultAbi, functionName: 'addMarket' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"batchDeposit"`
 */
export const useWritePromotionVaultBatchDeposit = /*#__PURE__*/ createUseWriteContract({ abi: promotionVaultAbi, functionName: 'batchDeposit' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"batchUpdatePrices"`
 */
export const useWritePromotionVaultBatchUpdatePrices = /*#__PURE__*/ createUseWriteContract({
    abi: promotionVaultAbi,
    functionName: 'batchUpdatePrices',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"batchWithdraw"`
 */
export const useWritePromotionVaultBatchWithdraw = /*#__PURE__*/ createUseWriteContract({ abi: promotionVaultAbi, functionName: 'batchWithdraw' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"claimRewards"`
 */
export const useWritePromotionVaultClaimRewards = /*#__PURE__*/ createUseWriteContract({ abi: promotionVaultAbi, functionName: 'claimRewards' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useWritePromotionVaultDeposit = /*#__PURE__*/ createUseWriteContract({ abi: promotionVaultAbi, functionName: 'deposit' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"endAndReplaceMarket"`
 */
export const useWritePromotionVaultEndAndReplaceMarket = /*#__PURE__*/ createUseWriteContract({
    abi: promotionVaultAbi,
    functionName: 'endAndReplaceMarket',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"finalizeCampaign"`
 */
export const useWritePromotionVaultFinalizeCampaign = /*#__PURE__*/ createUseWriteContract({
    abi: promotionVaultAbi,
    functionName: 'finalizeCampaign',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useWritePromotionVaultOnErc1155BatchReceived = /*#__PURE__*/ createUseWriteContract({
    abi: promotionVaultAbi,
    functionName: 'onERC1155BatchReceived',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useWritePromotionVaultOnErc1155Received = /*#__PURE__*/ createUseWriteContract({
    abi: promotionVaultAbi,
    functionName: 'onERC1155Received',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useWritePromotionVaultPause = /*#__PURE__*/ createUseWriteContract({ abi: promotionVaultAbi, functionName: 'pause' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWritePromotionVaultRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: promotionVaultAbi,
    functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"setTvlCap"`
 */
export const useWritePromotionVaultSetTvlCap = /*#__PURE__*/ createUseWriteContract({ abi: promotionVaultAbi, functionName: 'setTvlCap' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"startCampaign"`
 */
export const useWritePromotionVaultStartCampaign = /*#__PURE__*/ createUseWriteContract({ abi: promotionVaultAbi, functionName: 'startCampaign' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWritePromotionVaultTransferOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: promotionVaultAbi,
    functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWritePromotionVaultWithdraw = /*#__PURE__*/ createUseWriteContract({ abi: promotionVaultAbi, functionName: 'withdraw' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__
 */
export const useSimulatePromotionVault = /*#__PURE__*/ createUseSimulateContract({ abi: promotionVaultAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"addMarket"`
 */
export const useSimulatePromotionVaultAddMarket = /*#__PURE__*/ createUseSimulateContract({ abi: promotionVaultAbi, functionName: 'addMarket' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"batchDeposit"`
 */
export const useSimulatePromotionVaultBatchDeposit = /*#__PURE__*/ createUseSimulateContract({ abi: promotionVaultAbi, functionName: 'batchDeposit' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"batchUpdatePrices"`
 */
export const useSimulatePromotionVaultBatchUpdatePrices = /*#__PURE__*/ createUseSimulateContract({
    abi: promotionVaultAbi,
    functionName: 'batchUpdatePrices',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"batchWithdraw"`
 */
export const useSimulatePromotionVaultBatchWithdraw = /*#__PURE__*/ createUseSimulateContract({
    abi: promotionVaultAbi,
    functionName: 'batchWithdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"claimRewards"`
 */
export const useSimulatePromotionVaultClaimRewards = /*#__PURE__*/ createUseSimulateContract({ abi: promotionVaultAbi, functionName: 'claimRewards' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulatePromotionVaultDeposit = /*#__PURE__*/ createUseSimulateContract({ abi: promotionVaultAbi, functionName: 'deposit' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"endAndReplaceMarket"`
 */
export const useSimulatePromotionVaultEndAndReplaceMarket = /*#__PURE__*/ createUseSimulateContract({
    abi: promotionVaultAbi,
    functionName: 'endAndReplaceMarket',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"finalizeCampaign"`
 */
export const useSimulatePromotionVaultFinalizeCampaign = /*#__PURE__*/ createUseSimulateContract({
    abi: promotionVaultAbi,
    functionName: 'finalizeCampaign',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useSimulatePromotionVaultOnErc1155BatchReceived = /*#__PURE__*/ createUseSimulateContract({
    abi: promotionVaultAbi,
    functionName: 'onERC1155BatchReceived',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useSimulatePromotionVaultOnErc1155Received = /*#__PURE__*/ createUseSimulateContract({
    abi: promotionVaultAbi,
    functionName: 'onERC1155Received',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulatePromotionVaultPause = /*#__PURE__*/ createUseSimulateContract({ abi: promotionVaultAbi, functionName: 'pause' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulatePromotionVaultRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: promotionVaultAbi,
    functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"setTvlCap"`
 */
export const useSimulatePromotionVaultSetTvlCap = /*#__PURE__*/ createUseSimulateContract({ abi: promotionVaultAbi, functionName: 'setTvlCap' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"startCampaign"`
 */
export const useSimulatePromotionVaultStartCampaign = /*#__PURE__*/ createUseSimulateContract({
    abi: promotionVaultAbi,
    functionName: 'startCampaign',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulatePromotionVaultTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: promotionVaultAbi,
    functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link promotionVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulatePromotionVaultWithdraw = /*#__PURE__*/ createUseSimulateContract({ abi: promotionVaultAbi, functionName: 'withdraw' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__
 */
export const useWatchPromotionVaultEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: promotionVaultAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"CampaignFinalized"`
 */
export const useWatchPromotionVaultCampaignFinalizedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: promotionVaultAbi,
    eventName: 'CampaignFinalized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"CampaignStarted"`
 */
export const useWatchPromotionVaultCampaignStartedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: promotionVaultAbi,
    eventName: 'CampaignStarted',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"Claim"`
 */
export const useWatchPromotionVaultClaimEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: promotionVaultAbi, eventName: 'Claim' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchPromotionVaultDepositEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: promotionVaultAbi, eventName: 'Deposit' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"LeftoversSwept"`
 */
export const useWatchPromotionVaultLeftoversSweptEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: promotionVaultAbi,
    eventName: 'LeftoversSwept',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"MarketAdded"`
 */
export const useWatchPromotionVaultMarketAddedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: promotionVaultAbi, eventName: 'MarketAdded' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"MarketEnded"`
 */
export const useWatchPromotionVaultMarketEndedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: promotionVaultAbi, eventName: 'MarketEnded' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchPromotionVaultOwnershipTransferredEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: promotionVaultAbi,
    eventName: 'OwnershipTransferred',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchPromotionVaultPausedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: promotionVaultAbi, eventName: 'Paused' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"PricesUpdated"`
 */
export const useWatchPromotionVaultPricesUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: promotionVaultAbi,
    eventName: 'PricesUpdated',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"TvlCapUpdated"`
 */
export const useWatchPromotionVaultTvlCapUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: promotionVaultAbi,
    eventName: 'TvlCapUpdated',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchPromotionVaultUnpausedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: promotionVaultAbi, eventName: 'Unpaused' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link promotionVaultAbi}__ and `eventName` set to `"Withdraw"`
 */
export const useWatchPromotionVaultWithdrawEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: promotionVaultAbi, eventName: 'Withdraw' })
