import { createUseReadContract, createUseSimulateContract, createUseWatchContractEvent } from 'wagmi/codegen';
import { createUseWriteContract } from './createUseWriteContract';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RobinGenesisVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const robinGenesisVaultAbi = [
    {
        type: 'constructor',
        inputs: [
            { name: '_ctf', internalType: 'address', type: 'address' },
            { name: '_usdc', internalType: 'address', type: 'address' },
            { name: '_tvlCapUsd', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'CTF',
        outputs: [{ name: '', internalType: 'contract IConditionalTokens', type: 'address' }],
        stateMutability: 'view',
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
    {
        type: 'function',
        inputs: [],
        name: 'USDC',
        outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
        stateMutability: 'view',
    },
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
        inputs: [
            { name: 'marketIndex', internalType: 'uint256', type: 'uint256' },
            { name: 'isA', internalType: 'bool', type: 'bool' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'deposit',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'emergencyMode', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
        name: 'emergencySweepUsdc',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'emergencyWithdrawAll', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'enableEmergencyMode', outputs: [], stateMutability: 'nonpayable' },
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
        inputs: [
            { name: '_capUsd', internalType: 'uint256', type: 'uint256' },
            { name: '_newBaseRewardPool', internalType: 'uint256', type: 'uint256' },
        ],
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
    { type: 'function', inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable' },
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
        inputs: [
            { name: 'account', internalType: 'address', type: 'address' },
            { name: 'threshold', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'viewUserActiveWalletBalancesAboveThreshold',
        outputs: [
            { name: 'marketIndices', internalType: 'uint256[]', type: 'uint256[]' },
            { name: 'walletABalances', internalType: 'uint256[]', type: 'uint256[]' },
            { name: 'walletBBalances', internalType: 'uint256[]', type: 'uint256[]' },
        ],
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
        inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
        name: 'viewUserStakedMarkets',
        outputs: [
            { name: 'marketIndices', internalType: 'uint256[]', type: 'uint256[]' },
            { name: 'stakedABalances', internalType: 'uint256[]', type: 'uint256[]' },
            { name: 'stakedBBalances', internalType: 'uint256[]', type: 'uint256[]' },
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
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'tokenAmount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'BatchDeposit',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'tokenAmount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'BatchWithdraw',
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
        inputs: [{ name: 'timestamp', internalType: 'uint256', type: 'uint256', indexed: false }],
        name: 'EmergencyModeEnabled',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'user', internalType: 'address', type: 'address', indexed: true }],
        name: 'EmergencyWithdrawal',
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
            { name: 'conditionId', internalType: 'bytes32', type: 'bytes32', indexed: false },
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
            { name: 'newCapUsd', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'newBaseRewardPool', internalType: 'uint256', type: 'uint256', indexed: false },
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
    { type: 'error', inputs: [], name: 'BaseRewardCantDecrease' },
    { type: 'error', inputs: [], name: 'CampaignNotActive' },
    { type: 'error', inputs: [], name: 'CampaignNotEnded' },
    { type: 'error', inputs: [], name: 'CampaignNotFinalized' },
    { type: 'error', inputs: [], name: 'DuplicateTokenId' },
    { type: 'error', inputs: [], name: 'EnforcedPause' },
    { type: 'error', inputs: [], name: 'ExpectedPause' },
    { type: 'error', inputs: [], name: 'InEmergency' },
    { type: 'error', inputs: [], name: 'InsufficientBalance' },
    { type: 'error', inputs: [{ name: 'outcomeSlotCount', internalType: 'uint256', type: 'uint256' }], name: 'InvalidOutcomeSlotCount' },
    { type: 'error', inputs: [], name: 'LengthMismatch' },
    { type: 'error', inputs: [], name: 'MarketIndexOutOfBounds' },
    { type: 'error', inputs: [], name: 'MarketNotActive' },
    { type: 'error', inputs: [], name: 'NotInEmergency' },
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__
 */
export const useReadRobinGenesisVault = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"CTF"`
 */
export const useReadRobinGenesisVaultCtf = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'CTF' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"NO_INDEX"`
 */
export const useReadRobinGenesisVaultNoIndex = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'NO_INDEX' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"NO_INDEX_SET"`
 */
export const useReadRobinGenesisVaultNoIndexSet = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'NO_INDEX_SET' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"PARENT_COLLECTION_ID"`
 */
export const useReadRobinGenesisVaultParentCollectionId = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'PARENT_COLLECTION_ID',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"PRICE_SCALE"`
 */
export const useReadRobinGenesisVaultPriceScale = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'PRICE_SCALE' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"USDC"`
 */
export const useReadRobinGenesisVaultUsdc = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'USDC' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"YES_INDEX"`
 */
export const useReadRobinGenesisVaultYesIndex = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'YES_INDEX' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"YES_INDEX_SET"`
 */
export const useReadRobinGenesisVaultYesIndexSet = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'YES_INDEX_SET' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"baseRewardPool"`
 */
export const useReadRobinGenesisVaultBaseRewardPool = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'baseRewardPool',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"campaignEndTimestamp"`
 */
export const useReadRobinGenesisVaultCampaignEndTimestamp = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'campaignEndTimestamp',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"campaignFinalized"`
 */
export const useReadRobinGenesisVaultCampaignFinalized = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'campaignFinalized',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"campaignRewardSize"`
 */
export const useReadRobinGenesisVaultCampaignRewardSize = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'campaignRewardSize',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"campaignStartTimestamp"`
 */
export const useReadRobinGenesisVaultCampaignStartTimestamp = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'campaignStartTimestamp',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"campaignStarted"`
 */
export const useReadRobinGenesisVaultCampaignStarted = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'campaignStarted',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"emergencyMode"`
 */
export const useReadRobinGenesisVaultEmergencyMode = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'emergencyMode' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"finalizedBasePool"`
 */
export const useReadRobinGenesisVaultFinalizedBasePool = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'finalizedBasePool',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"finalizedExtraPool"`
 */
export const useReadRobinGenesisVaultFinalizedExtraPool = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'finalizedExtraPool',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"lastRewardTimestamp"`
 */
export const useReadRobinGenesisVaultLastRewardTimestamp = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'lastRewardTimestamp',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"marketCount"`
 */
export const useReadRobinGenesisVaultMarketCount = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'marketCount' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"markets"`
 */
export const useReadRobinGenesisVaultMarkets = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'markets' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadRobinGenesisVaultOwner = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'owner' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"paused"`
 */
export const useReadRobinGenesisVaultPaused = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'paused' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadRobinGenesisVaultSupportsInterface = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'supportsInterface',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"totalExtraValueTime"`
 */
export const useReadRobinGenesisVaultTotalExtraValueTime = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'totalExtraValueTime',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"totalExtraValueUsd"`
 */
export const useReadRobinGenesisVaultTotalExtraValueUsd = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'totalExtraValueUsd',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"totalValueTime"`
 */
export const useReadRobinGenesisVaultTotalValueTime = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'totalValueTime',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"totalValueUsd"`
 */
export const useReadRobinGenesisVaultTotalValueUsd = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'totalValueUsd' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"tvlCapUsd"`
 */
export const useReadRobinGenesisVaultTvlCapUsd = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'tvlCapUsd' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"userMarketBalances"`
 */
export const useReadRobinGenesisVaultUserMarketBalances = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'userMarketBalances',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"users"`
 */
export const useReadRobinGenesisVaultUsers = /*#__PURE__*/ createUseReadContract({ abi: robinGenesisVaultAbi, functionName: 'users' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"viewCurrentApyBps"`
 */
export const useReadRobinGenesisVaultViewCurrentApyBps = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'viewCurrentApyBps',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"viewUserActiveWalletBalancesAboveThreshold"`
 */
export const useReadRobinGenesisVaultViewUserActiveWalletBalancesAboveThreshold = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'viewUserActiveWalletBalancesAboveThreshold',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"viewUserCurrentValues"`
 */
export const useReadRobinGenesisVaultViewUserCurrentValues = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'viewUserCurrentValues',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"viewUserEstimatedEarnings"`
 */
export const useReadRobinGenesisVaultViewUserEstimatedEarnings = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'viewUserEstimatedEarnings',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"viewUserStakeableValue"`
 */
export const useReadRobinGenesisVaultViewUserStakeableValue = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'viewUserStakeableValue',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"viewUserStakedMarkets"`
 */
export const useReadRobinGenesisVaultViewUserStakedMarkets = /*#__PURE__*/ createUseReadContract({
    abi: robinGenesisVaultAbi,
    functionName: 'viewUserStakedMarkets',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__
 */
export const useWriteRobinGenesisVault = /*#__PURE__*/ createUseWriteContract({ abi: robinGenesisVaultAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"addMarket"`
 */
export const useWriteRobinGenesisVaultAddMarket = /*#__PURE__*/ createUseWriteContract({ abi: robinGenesisVaultAbi, functionName: 'addMarket' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"batchDeposit"`
 */
export const useWriteRobinGenesisVaultBatchDeposit = /*#__PURE__*/ createUseWriteContract({ abi: robinGenesisVaultAbi, functionName: 'batchDeposit' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"batchUpdatePrices"`
 */
export const useWriteRobinGenesisVaultBatchUpdatePrices = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'batchUpdatePrices',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"batchWithdraw"`
 */
export const useWriteRobinGenesisVaultBatchWithdraw = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'batchWithdraw',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"claimRewards"`
 */
export const useWriteRobinGenesisVaultClaimRewards = /*#__PURE__*/ createUseWriteContract({ abi: robinGenesisVaultAbi, functionName: 'claimRewards' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteRobinGenesisVaultDeposit = /*#__PURE__*/ createUseWriteContract({ abi: robinGenesisVaultAbi, functionName: 'deposit' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"emergencySweepUsdc"`
 */
export const useWriteRobinGenesisVaultEmergencySweepUsdc = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'emergencySweepUsdc',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"emergencyWithdrawAll"`
 */
export const useWriteRobinGenesisVaultEmergencyWithdrawAll = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'emergencyWithdrawAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"enableEmergencyMode"`
 */
export const useWriteRobinGenesisVaultEnableEmergencyMode = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'enableEmergencyMode',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"endAndReplaceMarket"`
 */
export const useWriteRobinGenesisVaultEndAndReplaceMarket = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'endAndReplaceMarket',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"finalizeCampaign"`
 */
export const useWriteRobinGenesisVaultFinalizeCampaign = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'finalizeCampaign',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useWriteRobinGenesisVaultOnErc1155BatchReceived = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'onERC1155BatchReceived',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useWriteRobinGenesisVaultOnErc1155Received = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'onERC1155Received',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteRobinGenesisVaultPause = /*#__PURE__*/ createUseWriteContract({ abi: robinGenesisVaultAbi, functionName: 'pause' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteRobinGenesisVaultRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"setTvlCap"`
 */
export const useWriteRobinGenesisVaultSetTvlCap = /*#__PURE__*/ createUseWriteContract({ abi: robinGenesisVaultAbi, functionName: 'setTvlCap' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"startCampaign"`
 */
export const useWriteRobinGenesisVaultStartCampaign = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'startCampaign',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteRobinGenesisVaultTransferOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: robinGenesisVaultAbi,
    functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteRobinGenesisVaultUnpause = /*#__PURE__*/ createUseWriteContract({ abi: robinGenesisVaultAbi, functionName: 'unpause' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteRobinGenesisVaultWithdraw = /*#__PURE__*/ createUseWriteContract({ abi: robinGenesisVaultAbi, functionName: 'withdraw' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__
 */
export const useSimulateRobinGenesisVault = /*#__PURE__*/ createUseSimulateContract({ abi: robinGenesisVaultAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"addMarket"`
 */
export const useSimulateRobinGenesisVaultAddMarket = /*#__PURE__*/ createUseSimulateContract({ abi: robinGenesisVaultAbi, functionName: 'addMarket' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"batchDeposit"`
 */
export const useSimulateRobinGenesisVaultBatchDeposit = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'batchDeposit',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"batchUpdatePrices"`
 */
export const useSimulateRobinGenesisVaultBatchUpdatePrices = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'batchUpdatePrices',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"batchWithdraw"`
 */
export const useSimulateRobinGenesisVaultBatchWithdraw = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'batchWithdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"claimRewards"`
 */
export const useSimulateRobinGenesisVaultClaimRewards = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'claimRewards',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateRobinGenesisVaultDeposit = /*#__PURE__*/ createUseSimulateContract({ abi: robinGenesisVaultAbi, functionName: 'deposit' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"emergencySweepUsdc"`
 */
export const useSimulateRobinGenesisVaultEmergencySweepUsdc = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'emergencySweepUsdc',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"emergencyWithdrawAll"`
 */
export const useSimulateRobinGenesisVaultEmergencyWithdrawAll = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'emergencyWithdrawAll',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"enableEmergencyMode"`
 */
export const useSimulateRobinGenesisVaultEnableEmergencyMode = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'enableEmergencyMode',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"endAndReplaceMarket"`
 */
export const useSimulateRobinGenesisVaultEndAndReplaceMarket = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'endAndReplaceMarket',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"finalizeCampaign"`
 */
export const useSimulateRobinGenesisVaultFinalizeCampaign = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'finalizeCampaign',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useSimulateRobinGenesisVaultOnErc1155BatchReceived = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'onERC1155BatchReceived',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useSimulateRobinGenesisVaultOnErc1155Received = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'onERC1155Received',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateRobinGenesisVaultPause = /*#__PURE__*/ createUseSimulateContract({ abi: robinGenesisVaultAbi, functionName: 'pause' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateRobinGenesisVaultRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"setTvlCap"`
 */
export const useSimulateRobinGenesisVaultSetTvlCap = /*#__PURE__*/ createUseSimulateContract({ abi: robinGenesisVaultAbi, functionName: 'setTvlCap' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"startCampaign"`
 */
export const useSimulateRobinGenesisVaultStartCampaign = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'startCampaign',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateRobinGenesisVaultTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: robinGenesisVaultAbi,
    functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateRobinGenesisVaultUnpause = /*#__PURE__*/ createUseSimulateContract({ abi: robinGenesisVaultAbi, functionName: 'unpause' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateRobinGenesisVaultWithdraw = /*#__PURE__*/ createUseSimulateContract({ abi: robinGenesisVaultAbi, functionName: 'withdraw' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__
 */
export const useWatchRobinGenesisVaultEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinGenesisVaultAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"BatchDeposit"`
 */
export const useWatchRobinGenesisVaultBatchDepositEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'BatchDeposit',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"BatchWithdraw"`
 */
export const useWatchRobinGenesisVaultBatchWithdrawEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'BatchWithdraw',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"CampaignFinalized"`
 */
export const useWatchRobinGenesisVaultCampaignFinalizedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'CampaignFinalized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"CampaignStarted"`
 */
export const useWatchRobinGenesisVaultCampaignStartedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'CampaignStarted',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"Claim"`
 */
export const useWatchRobinGenesisVaultClaimEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinGenesisVaultAbi, eventName: 'Claim' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchRobinGenesisVaultDepositEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinGenesisVaultAbi, eventName: 'Deposit' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"EmergencyModeEnabled"`
 */
export const useWatchRobinGenesisVaultEmergencyModeEnabledEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'EmergencyModeEnabled',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"EmergencyWithdrawal"`
 */
export const useWatchRobinGenesisVaultEmergencyWithdrawalEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'EmergencyWithdrawal',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"LeftoversSwept"`
 */
export const useWatchRobinGenesisVaultLeftoversSweptEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'LeftoversSwept',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"MarketAdded"`
 */
export const useWatchRobinGenesisVaultMarketAddedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'MarketAdded',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"MarketEnded"`
 */
export const useWatchRobinGenesisVaultMarketEndedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'MarketEnded',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchRobinGenesisVaultOwnershipTransferredEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'OwnershipTransferred',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchRobinGenesisVaultPausedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinGenesisVaultAbi, eventName: 'Paused' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"PricesUpdated"`
 */
export const useWatchRobinGenesisVaultPricesUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'PricesUpdated',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"TvlCapUpdated"`
 */
export const useWatchRobinGenesisVaultTvlCapUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinGenesisVaultAbi,
    eventName: 'TvlCapUpdated',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchRobinGenesisVaultUnpausedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinGenesisVaultAbi, eventName: 'Unpaused' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinGenesisVaultAbi}__ and `eventName` set to `"Withdraw"`
 */
export const useWatchRobinGenesisVaultWithdrawEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinGenesisVaultAbi, eventName: 'Withdraw' })
