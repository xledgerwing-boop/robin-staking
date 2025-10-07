import { createUseReadContract, createUseSimulateContract, createUseWatchContractEvent } from 'wagmi/codegen';
import { createUseWriteContract } from './createUseWriteContract';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConditionalTokens
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const conditionalTokensAbi = [
    {
        constant: true,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'id', type: 'uint256' },
        ],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        constant: false,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'collateralToken', type: 'address' },
            { name: 'parentCollectionId', type: 'bytes32' },
            { name: 'conditionId', type: 'bytes32' },
            { name: 'indexSets', type: 'uint256[]' },
        ],
        name: 'redeemPositions',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        constant: true,
        payable: false,
        type: 'function',
        inputs: [{ name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
    },
    {
        constant: true,
        payable: false,
        type: 'function',
        inputs: [
            { name: '', type: 'bytes32' },
            { name: '', type: 'uint256' },
        ],
        name: 'payoutNumerators',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        constant: false,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'ids', type: 'uint256[]' },
            { name: 'values', type: 'uint256[]' },
            { name: 'data', type: 'bytes' },
        ],
        name: 'safeBatchTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        constant: true,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'collateralToken', type: 'address' },
            { name: 'collectionId', type: 'bytes32' },
        ],
        name: 'getPositionId',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'pure',
    },
    {
        constant: true,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'owners', type: 'address[]' },
            { name: 'ids', type: 'uint256[]' },
        ],
        name: 'balanceOfBatch',
        outputs: [{ name: '', type: 'uint256[]' }],
        stateMutability: 'view',
    },
    {
        constant: false,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'collateralToken', type: 'address' },
            { name: 'parentCollectionId', type: 'bytes32' },
            { name: 'conditionId', type: 'bytes32' },
            { name: 'partition', type: 'uint256[]' },
            { name: 'amount', type: 'uint256' },
        ],
        name: 'splitPosition',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        constant: true,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'oracle', type: 'address' },
            { name: 'questionId', type: 'bytes32' },
            { name: 'outcomeSlotCount', type: 'uint256' },
        ],
        name: 'getConditionId',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'pure',
    },
    {
        constant: true,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'parentCollectionId', type: 'bytes32' },
            { name: 'conditionId', type: 'bytes32' },
            { name: 'indexSet', type: 'uint256' },
        ],
        name: 'getCollectionId',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'view',
    },
    {
        constant: false,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'collateralToken', type: 'address' },
            { name: 'parentCollectionId', type: 'bytes32' },
            { name: 'conditionId', type: 'bytes32' },
            { name: 'partition', type: 'uint256[]' },
            { name: 'amount', type: 'uint256' },
        ],
        name: 'mergePositions',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        constant: false,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'operator', type: 'address' },
            { name: 'approved', type: 'bool' },
        ],
        name: 'setApprovalForAll',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        constant: false,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'questionId', type: 'bytes32' },
            { name: 'payouts', type: 'uint256[]' },
        ],
        name: 'reportPayouts',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        constant: true,
        payable: false,
        type: 'function',
        inputs: [{ name: 'conditionId', type: 'bytes32' }],
        name: 'getOutcomeSlotCount',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        constant: false,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'oracle', type: 'address' },
            { name: 'questionId', type: 'bytes32' },
            { name: 'outcomeSlotCount', type: 'uint256' },
        ],
        name: 'prepareCondition',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        constant: true,
        payable: false,
        type: 'function',
        inputs: [{ name: '', type: 'bytes32' }],
        name: 'payoutDenominator',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        constant: true,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'operator', type: 'address' },
        ],
        name: 'isApprovedForAll',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
    },
    {
        constant: false,
        payable: false,
        type: 'function',
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'id', type: 'uint256' },
            { name: 'value', type: 'uint256' },
            { name: 'data', type: 'bytes' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'conditionId', type: 'bytes32', indexed: true },
            { name: 'oracle', type: 'address', indexed: true },
            { name: 'questionId', type: 'bytes32', indexed: true },
            { name: 'outcomeSlotCount', type: 'uint256', indexed: false },
        ],
        name: 'ConditionPreparation',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'conditionId', type: 'bytes32', indexed: true },
            { name: 'oracle', type: 'address', indexed: true },
            { name: 'questionId', type: 'bytes32', indexed: true },
            { name: 'outcomeSlotCount', type: 'uint256', indexed: false },
            { name: 'payoutNumerators', type: 'uint256[]', indexed: false },
        ],
        name: 'ConditionResolution',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'stakeholder', type: 'address', indexed: true },
            { name: 'collateralToken', type: 'address', indexed: false },
            { name: 'parentCollectionId', type: 'bytes32', indexed: true },
            { name: 'conditionId', type: 'bytes32', indexed: true },
            { name: 'partition', type: 'uint256[]', indexed: false },
            { name: 'amount', type: 'uint256', indexed: false },
        ],
        name: 'PositionSplit',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'stakeholder', type: 'address', indexed: true },
            { name: 'collateralToken', type: 'address', indexed: false },
            { name: 'parentCollectionId', type: 'bytes32', indexed: true },
            { name: 'conditionId', type: 'bytes32', indexed: true },
            { name: 'partition', type: 'uint256[]', indexed: false },
            { name: 'amount', type: 'uint256', indexed: false },
        ],
        name: 'PositionsMerge',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'redeemer', type: 'address', indexed: true },
            { name: 'collateralToken', type: 'address', indexed: true },
            { name: 'parentCollectionId', type: 'bytes32', indexed: true },
            { name: 'conditionId', type: 'bytes32', indexed: false },
            { name: 'indexSets', type: 'uint256[]', indexed: false },
            { name: 'payout', type: 'uint256', indexed: false },
        ],
        name: 'PayoutRedemption',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'operator', type: 'address', indexed: true },
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'id', type: 'uint256', indexed: false },
            { name: 'value', type: 'uint256', indexed: false },
        ],
        name: 'TransferSingle',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'operator', type: 'address', indexed: true },
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'ids', type: 'uint256[]', indexed: false },
            { name: 'values', type: 'uint256[]', indexed: false },
        ],
        name: 'TransferBatch',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'owner', type: 'address', indexed: true },
            { name: 'operator', type: 'address', indexed: true },
            { name: 'approved', type: 'bool', indexed: false },
        ],
        name: 'ApprovalForAll',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'value', type: 'string', indexed: false },
            { name: 'id', type: 'uint256', indexed: true },
        ],
        name: 'URI',
    },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
    {
        type: 'event',
        inputs: [
            { name: 'owner', type: 'address', indexed: true },
            { name: 'spender', type: 'address', indexed: true },
            { name: 'value', type: 'uint256', indexed: false },
        ],
        name: 'Approval',
    },
    {
        type: 'event',
        inputs: [
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'value', type: 'uint256', indexed: false },
        ],
        name: 'Transfer',
    },
    {
        type: 'function',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ type: 'bool' }],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'decimals', outputs: [{ type: 'uint8' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'name', outputs: [{ type: 'string' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'symbol', outputs: [{ type: 'string' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'totalSupply', outputs: [{ type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ type: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'sender', type: 'address' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        name: 'transferFrom',
        outputs: [{ type: 'bool' }],
        stateMutability: 'nonpayable',
    },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GnosisSafeL2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gnosisSafeL2Abi = [
    { type: 'event', anonymous: false, inputs: [{ name: 'owner', internalType: 'address', type: 'address', indexed: false }], name: 'AddedOwner' },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'approvedHash', internalType: 'bytes32', type: 'bytes32', indexed: true },
            { name: 'owner', internalType: 'address', type: 'address', indexed: true },
        ],
        name: 'ApproveHash',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'handler', internalType: 'address', type: 'address', indexed: false }],
        name: 'ChangedFallbackHandler',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'guard', internalType: 'address', type: 'address', indexed: false }], name: 'ChangedGuard' },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'threshold', internalType: 'uint256', type: 'uint256', indexed: false }],
        name: 'ChangedThreshold',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'module', internalType: 'address', type: 'address', indexed: false }],
        name: 'DisabledModule',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'module', internalType: 'address', type: 'address', indexed: false }],
        name: 'EnabledModule',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'txHash', internalType: 'bytes32', type: 'bytes32', indexed: false },
            { name: 'payment', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'ExecutionFailure',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'module', internalType: 'address', type: 'address', indexed: true }],
        name: 'ExecutionFromModuleFailure',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'module', internalType: 'address', type: 'address', indexed: true }],
        name: 'ExecutionFromModuleSuccess',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'txHash', internalType: 'bytes32', type: 'bytes32', indexed: false },
            { name: 'payment', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'ExecutionSuccess',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'owner', internalType: 'address', type: 'address', indexed: false }], name: 'RemovedOwner' },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'module', internalType: 'address', type: 'address', indexed: false },
            { name: 'to', internalType: 'address', type: 'address', indexed: false },
            { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
            { name: 'operation', internalType: 'enum Enum.Operation', type: 'uint8', indexed: false },
        ],
        name: 'SafeModuleTransaction',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'to', internalType: 'address', type: 'address', indexed: false },
            { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
            { name: 'operation', internalType: 'enum Enum.Operation', type: 'uint8', indexed: false },
            { name: 'safeTxGas', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'baseGas', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'gasPrice', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'gasToken', internalType: 'address', type: 'address', indexed: false },
            { name: 'refundReceiver', internalType: 'address payable', type: 'address', indexed: false },
            { name: 'signatures', internalType: 'bytes', type: 'bytes', indexed: false },
            { name: 'additionalInfo', internalType: 'bytes', type: 'bytes', indexed: false },
        ],
        name: 'SafeMultiSigTransaction',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'sender', internalType: 'address', type: 'address', indexed: true },
            { name: 'value', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'SafeReceived',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'initiator', internalType: 'address', type: 'address', indexed: true },
            { name: 'owners', internalType: 'address[]', type: 'address[]', indexed: false },
            { name: 'threshold', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'initializer', internalType: 'address', type: 'address', indexed: false },
            { name: 'fallbackHandler', internalType: 'address', type: 'address', indexed: false },
        ],
        name: 'SafeSetup',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'msgHash', internalType: 'bytes32', type: 'bytes32', indexed: true }], name: 'SignMsg' },
    { type: 'fallback', stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'VERSION', outputs: [{ name: '', internalType: 'string', type: 'string' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [
            { name: 'owner', internalType: 'address', type: 'address' },
            { name: '_threshold', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'addOwnerWithThreshold',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'hashToApprove', internalType: 'bytes32', type: 'bytes32' }],
        name: 'approveHash',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '', internalType: 'address', type: 'address' },
            { name: '', internalType: 'bytes32', type: 'bytes32' },
        ],
        name: 'approvedHashes',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: '_threshold', internalType: 'uint256', type: 'uint256' }],
        name: 'changeThreshold',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'dataHash', internalType: 'bytes32', type: 'bytes32' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
            { name: 'signatures', internalType: 'bytes', type: 'bytes' },
            { name: 'requiredSignatures', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'checkNSignatures',
        outputs: [],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'dataHash', internalType: 'bytes32', type: 'bytes32' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
            { name: 'signatures', internalType: 'bytes', type: 'bytes' },
        ],
        name: 'checkSignatures',
        outputs: [],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'prevModule', internalType: 'address', type: 'address' },
            { name: 'module', internalType: 'address', type: 'address' },
        ],
        name: 'disableModule',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'domainSeparator',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'module', internalType: 'address', type: 'address' }],
        name: 'enableModule',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
            { name: 'operation', internalType: 'enum Enum.Operation', type: 'uint8' },
            { name: 'safeTxGas', internalType: 'uint256', type: 'uint256' },
            { name: 'baseGas', internalType: 'uint256', type: 'uint256' },
            { name: 'gasPrice', internalType: 'uint256', type: 'uint256' },
            { name: 'gasToken', internalType: 'address', type: 'address' },
            { name: 'refundReceiver', internalType: 'address', type: 'address' },
            { name: '_nonce', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'encodeTransactionData',
        outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
            { name: 'operation', internalType: 'enum Enum.Operation', type: 'uint8' },
            { name: 'safeTxGas', internalType: 'uint256', type: 'uint256' },
            { name: 'baseGas', internalType: 'uint256', type: 'uint256' },
            { name: 'gasPrice', internalType: 'uint256', type: 'uint256' },
            { name: 'gasToken', internalType: 'address', type: 'address' },
            { name: 'refundReceiver', internalType: 'address payable', type: 'address' },
            { name: 'signatures', internalType: 'bytes', type: 'bytes' },
        ],
        name: 'execTransaction',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
            { name: 'operation', internalType: 'enum Enum.Operation', type: 'uint8' },
        ],
        name: 'execTransactionFromModule',
        outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
            { name: 'operation', internalType: 'enum Enum.Operation', type: 'uint8' },
        ],
        name: 'execTransactionFromModuleReturnData',
        outputs: [
            { name: 'success', internalType: 'bool', type: 'bool' },
            { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'getChainId', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [
            { name: 'start', internalType: 'address', type: 'address' },
            { name: 'pageSize', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'getModulesPaginated',
        outputs: [
            { name: 'array', internalType: 'address[]', type: 'address[]' },
            { name: 'next', internalType: 'address', type: 'address' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getOwners',
        outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'offset', internalType: 'uint256', type: 'uint256' },
            { name: 'length', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'getStorageAt',
        outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getThreshold',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
            { name: 'operation', internalType: 'enum Enum.Operation', type: 'uint8' },
            { name: 'safeTxGas', internalType: 'uint256', type: 'uint256' },
            { name: 'baseGas', internalType: 'uint256', type: 'uint256' },
            { name: 'gasPrice', internalType: 'uint256', type: 'uint256' },
            { name: 'gasToken', internalType: 'address', type: 'address' },
            { name: 'refundReceiver', internalType: 'address', type: 'address' },
            { name: '_nonce', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'getTransactionHash',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'module', internalType: 'address', type: 'address' }],
        name: 'isModuleEnabled',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
        name: 'isOwner',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'nonce', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [
            { name: 'prevOwner', internalType: 'address', type: 'address' },
            { name: 'owner', internalType: 'address', type: 'address' },
            { name: '_threshold', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'removeOwner',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
            { name: 'operation', internalType: 'enum Enum.Operation', type: 'uint8' },
        ],
        name: 'requiredTxGas',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'handler', internalType: 'address', type: 'address' }],
        name: 'setFallbackHandler',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'guard', internalType: 'address', type: 'address' }],
        name: 'setGuard',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: '_owners', internalType: 'address[]', type: 'address[]' },
            { name: '_threshold', internalType: 'uint256', type: 'uint256' },
            { name: 'to', internalType: 'address', type: 'address' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
            { name: 'fallbackHandler', internalType: 'address', type: 'address' },
            { name: 'paymentToken', internalType: 'address', type: 'address' },
            { name: 'payment', internalType: 'uint256', type: 'uint256' },
            { name: 'paymentReceiver', internalType: 'address payable', type: 'address' },
        ],
        name: 'setup',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        name: 'signedMessages',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'targetContract', internalType: 'address', type: 'address' },
            { name: 'calldataPayload', internalType: 'bytes', type: 'bytes' },
        ],
        name: 'simulateAndRevert',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'prevOwner', internalType: 'address', type: 'address' },
            { name: 'oldOwner', internalType: 'address', type: 'address' },
            { name: 'newOwner', internalType: 'address', type: 'address' },
        ],
        name: 'swapOwner',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    { type: 'receive', stateMutability: 'payable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PolymarketAaveStakingVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const polymarketAaveStakingVaultAbi = [
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
        inputs: [],
        name: 'aToken',
        outputs: [{ name: '', internalType: 'contract IAToken', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'aavePool',
        outputs: [{ name: '', internalType: 'contract IPool', type: 'address' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'conditionId', outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'ctf',
        outputs: [{ name: '', internalType: 'contract IConditionalTokens', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'dataProvider',
        outputs: [{ name: '', internalType: 'contract IPoolDataProvider', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'isYes', internalType: 'bool', type: 'bool' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'deposit',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'depositLimit',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'finalizationTime',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'finalizeGlobalScore', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'finalizeMarket', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'finalizeUserScore',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'finalized', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getCurrentApy',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getCurrentSupplyAndLimit',
        outputs: [
            { name: 'supplyYes', internalType: 'uint256', type: 'uint256' },
            { name: 'supplyNo', internalType: 'uint256', type: 'uint256' },
            { name: 'supplyLimit', internalType: 'uint256', type: 'uint256' },
            { name: 'strategySupply', internalType: 'uint256', type: 'uint256' },
            { name: 'strategyLimit', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getCurrentUserYield',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getCurrentYieldBreakdown',
        outputs: [
            { name: 'estTotalYield', internalType: 'uint256', type: 'uint256' },
            { name: 'estUserYield', internalType: 'uint256', type: 'uint256' },
            { name: 'estProtocolYield', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getGlobalScore',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getScore',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getTvlUsd',
        outputs: [
            { name: 'onHandUsd', internalType: 'uint256', type: 'uint256' },
            { name: 'inStrategyUsd', internalType: 'uint256', type: 'uint256' },
            { name: 'convertibleUsd', internalType: 'uint256', type: 'uint256' },
            { name: 'tvlUsd', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getUserBalances',
        outputs: [
            { name: 'userYes_', internalType: 'uint256', type: 'uint256' },
            { name: 'userNo_', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getUserState',
        outputs: [
            { name: 'balance', internalType: 'uint256', type: 'uint256' },
            { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
            { name: 'cumulativeScore', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getVaultPairedPrincipalUsd',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getVaultUnpaired',
        outputs: [
            { name: 'yes_', internalType: 'uint256', type: 'uint256' },
            { name: 'no_', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'globalLastBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'globalLastUpdated',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'globalScore', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
        name: 'harvestProtocolYield',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'harvestYield', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [
            { name: '_protocolFeeBps', internalType: 'uint256', type: 'uint256' },
            { name: '_underlying', internalType: 'address', type: 'address' },
            { name: '_ctf', internalType: 'address', type: 'address' },
            { name: '_conditionId', internalType: 'bytes32', type: 'bytes32' },
            { name: '_negRiskAdapter', internalType: 'address', type: 'address' },
            { name: '_negRisk', internalType: 'bool', type: 'bool' },
            { name: '_collateral', internalType: 'address', type: 'address' },
            { name: '_checkResolved', internalType: 'bool', type: 'bool' },
            { name: '_aavePool', internalType: 'address', type: 'address' },
            { name: '_aaveDataProv', internalType: 'address', type: 'address' },
        ],
        name: 'initialize',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'leftoverUsd', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'negRisk', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'negRiskAdapter',
        outputs: [{ name: '', internalType: 'contract INegRiskAdapter', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'noPositionId',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    {
        type: 'function',
        inputs: [],
        name: 'pairedUsdPrincipal',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'pauseAll', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'pauseDeposits', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'pauseUnlockYield', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'pauseWithdrawals', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'pausedAll', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'pausedDeposits', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'pausedUnlockYield', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'pausedWithdrawals', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'polymarketCollateral',
        outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'protocolFeeBps',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'protocolYield',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'protocolYieldHarvested',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'redeemWinningForUsd', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [{ name: 'newLimit', internalType: 'uint256', type: 'uint256' }],
        name: 'setDepositLimit',
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
        name: 'totalUserYes',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'totalYield', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'underlyingUsd',
        outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'unlockYield', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'unlockedUsd', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'unlocking', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'unpairedNo', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'unpairedYes', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'unpauseAll', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'unpauseDeposits', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'unpauseUnlockYield', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'unpauseWithdrawals', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [
            { name: 'supplyDelta', internalType: 'uint256', type: 'uint256' },
            { name: 'increase', internalType: 'bool', type: 'bool' },
        ],
        name: 'updateGlobalScore',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'user', internalType: 'address', type: 'address' },
            { name: 'balanceDelta', internalType: 'uint256', type: 'uint256' },
            { name: 'increase', internalType: 'bool', type: 'bool' },
        ],
        name: 'updateScore',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'userYield', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'winningPosition',
        outputs: [{ name: '', internalType: 'enum RobinStakingVault.WinningPosition', type: 'uint8' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'yesAmount', internalType: 'uint256', type: 'uint256' },
            { name: 'noAmount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'yesPositionId',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'yieldUnlocked', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'isYes', internalType: 'bool', type: 'bool', indexed: false },
            { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'Deposited',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'finalizationTime', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'globalScore', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'GlobalFinalized',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'receiver', internalType: 'address', type: 'address', indexed: true },
            { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'HarvestedProtocolYield',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'HarvestedYield',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'version', internalType: 'uint64', type: 'uint64', indexed: false }], name: 'Initialized' },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'winningPosition', internalType: 'enum RobinStakingVault.WinningPosition', type: 'uint8', indexed: false }],
        name: 'MarketFinalized',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
            { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
        ],
        name: 'OwnershipTransferred',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }], name: 'PausedAllSet' },
    { type: 'event', anonymous: false, inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }], name: 'PausedDepositsSet' },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }],
        name: 'PausedUnlockYieldSet',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }],
        name: 'PausedWithdrawalsSet',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'winningAmount', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'usdPaid', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'RedeemedWinningForUSD',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: false },
            { name: 'finalizationTime', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'score', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'UserFinalized',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'yesAmount', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'noAmount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'Withdrawn',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'withdrawnThisCall', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'cumulativeWithdrawn', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'remainingInStrategy', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'YieldUnlockProgress',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'leftoverUsd', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'principalAtStart', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'YieldUnlockStarted',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'totalWithdrawnUsd', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'totalYield', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'userYield', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'protocolYield', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'YieldUnlocked',
    },
    { type: 'error', inputs: [], name: 'AlreadyFinalized' },
    { type: 'error', inputs: [], name: 'AlreadyHarvested' },
    { type: 'error', inputs: [], name: 'DepositLimitExceeded' },
    { type: 'error', inputs: [], name: 'InsufficientAmounts' },
    {
        type: 'error',
        inputs: [
            { name: 'holding', internalType: 'uint256', type: 'uint256' },
            { name: 'needed', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'InsufficientUSD',
    },
    { type: 'error', inputs: [{ name: 'have', internalType: 'uint256', type: 'uint256' }], name: 'InsufficientUserNo' },
    { type: 'error', inputs: [{ name: 'have', internalType: 'uint256', type: 'uint256' }], name: 'InsufficientUserYes' },
    {
        type: 'error',
        inputs: [
            { name: 'needed', internalType: 'uint256', type: 'uint256' },
            { name: 'withdrawn', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'InsufficientWithdrawalUSD',
    },
    { type: 'error', inputs: [{ name: 'bps', internalType: 'uint256', type: 'uint256' }], name: 'InvalidBps' },
    { type: 'error', inputs: [], name: 'InvalidDataProvider' },
    { type: 'error', inputs: [], name: 'InvalidInitialization' },
    { type: 'error', inputs: [{ name: 'outcomeSlotCount', internalType: 'uint256', type: 'uint256' }], name: 'InvalidOutcomeSlotCount' },
    { type: 'error', inputs: [], name: 'InvalidPool' },
    { type: 'error', inputs: [], name: 'InvalidUnderlyingAsset' },
    { type: 'error', inputs: [], name: 'MarketAlreadyResolved' },
    { type: 'error', inputs: [], name: 'MarketNotResolved' },
    { type: 'error', inputs: [], name: 'NoYield' },
    { type: 'error', inputs: [], name: 'NotFinalized' },
    { type: 'error', inputs: [], name: 'NotInitializing' },
    { type: 'error', inputs: [{ name: 'owner', internalType: 'address', type: 'address' }], name: 'OwnableInvalidOwner' },
    { type: 'error', inputs: [{ name: 'account', internalType: 'address', type: 'address' }], name: 'OwnableUnauthorizedAccount' },
    { type: 'error', inputs: [], name: 'PausedAll' },
    { type: 'error', inputs: [], name: 'PausedDeposits' },
    { type: 'error', inputs: [], name: 'PausedUnlockYield' },
    { type: 'error', inputs: [], name: 'PausedWithdrawals' },
    { type: 'error', inputs: [], name: 'RedeemMismatch' },
    { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
    { type: 'error', inputs: [{ name: 'token', internalType: 'address', type: 'address' }], name: 'SafeERC20FailedOperation' },
    { type: 'error', inputs: [], name: 'UnderlyingAssetNotSupported' },
    { type: 'error', inputs: [], name: 'VaultAlreadyFinalized' },
    { type: 'error', inputs: [], name: 'VaultNotFinalized' },
    { type: 'error', inputs: [], name: 'YieldAlreadyUnlocked' },
    { type: 'error', inputs: [], name: 'YieldNotUnlocked' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RobinStakingVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const robinStakingVaultAbi = [
    {
        type: 'function',
        inputs: [
            { name: 'isYes', internalType: 'bool', type: 'bool' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'deposit',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'depositLimit',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'finalizationTime',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'finalizeGlobalScore', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'finalizeMarket', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'finalizeUserScore',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'finalized', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getCurrentApy',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getCurrentSupplyAndLimit',
        outputs: [
            { name: 'supplyYes', internalType: 'uint256', type: 'uint256' },
            { name: 'supplyNo', internalType: 'uint256', type: 'uint256' },
            { name: 'supplyLimit', internalType: 'uint256', type: 'uint256' },
            { name: 'strategySupply', internalType: 'uint256', type: 'uint256' },
            { name: 'strategyLimit', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getCurrentUserYield',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getCurrentYieldBreakdown',
        outputs: [
            { name: 'estTotalYield', internalType: 'uint256', type: 'uint256' },
            { name: 'estUserYield', internalType: 'uint256', type: 'uint256' },
            { name: 'estProtocolYield', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getGlobalScore',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getScore',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getTvlUsd',
        outputs: [
            { name: 'onHandUsd', internalType: 'uint256', type: 'uint256' },
            { name: 'inStrategyUsd', internalType: 'uint256', type: 'uint256' },
            { name: 'convertibleUsd', internalType: 'uint256', type: 'uint256' },
            { name: 'tvlUsd', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getUserBalances',
        outputs: [
            { name: 'userYes_', internalType: 'uint256', type: 'uint256' },
            { name: 'userNo_', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getUserState',
        outputs: [
            { name: 'balance', internalType: 'uint256', type: 'uint256' },
            { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
            { name: 'cumulativeScore', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getVaultPairedPrincipalUsd',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getVaultUnpaired',
        outputs: [
            { name: 'yes_', internalType: 'uint256', type: 'uint256' },
            { name: 'no_', internalType: 'uint256', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'globalLastBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'globalLastUpdated',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'globalScore', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
        name: 'harvestProtocolYield',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'harvestYield', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'leftoverUsd', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'owner', outputs: [{ name: '', internalType: 'address', type: 'address' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'pairedUsdPrincipal',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'pauseAll', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'pauseDeposits', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'pauseUnlockYield', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'pauseWithdrawals', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'pausedAll', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'pausedDeposits', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'pausedUnlockYield', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'pausedWithdrawals', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'protocolFeeBps',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'protocolYield',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'protocolYieldHarvested',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'redeemWinningForUsd', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [{ name: 'newLimit', internalType: 'uint256', type: 'uint256' }],
        name: 'setDepositLimit',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'totalUserYes',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'totalYield', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'underlyingUsd',
        outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'unlockYield', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'unlockedUsd', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'unlocking', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'unpairedNo', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'unpairedYes', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'unpauseAll', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'unpauseDeposits', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'unpauseUnlockYield', outputs: [], stateMutability: 'nonpayable' },
    { type: 'function', inputs: [], name: 'unpauseWithdrawals', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [
            { name: 'supplyDelta', internalType: 'uint256', type: 'uint256' },
            { name: 'increase', internalType: 'bool', type: 'bool' },
        ],
        name: 'updateGlobalScore',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'user', internalType: 'address', type: 'address' },
            { name: 'balanceDelta', internalType: 'uint256', type: 'uint256' },
            { name: 'increase', internalType: 'bool', type: 'bool' },
        ],
        name: 'updateScore',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'userYield', outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'winningPosition',
        outputs: [{ name: '', internalType: 'enum RobinStakingVault.WinningPosition', type: 'uint8' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'yesAmount', internalType: 'uint256', type: 'uint256' },
            { name: 'noAmount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'yieldUnlocked', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'isYes', internalType: 'bool', type: 'bool', indexed: false },
            { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'Deposited',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'finalizationTime', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'globalScore', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'GlobalFinalized',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'receiver', internalType: 'address', type: 'address', indexed: true },
            { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'HarvestedProtocolYield',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'amount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'HarvestedYield',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'version', internalType: 'uint64', type: 'uint64', indexed: false }], name: 'Initialized' },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'winningPosition', internalType: 'enum RobinStakingVault.WinningPosition', type: 'uint8', indexed: false }],
        name: 'MarketFinalized',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
            { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
        ],
        name: 'OwnershipTransferred',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }], name: 'PausedAllSet' },
    { type: 'event', anonymous: false, inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }], name: 'PausedDepositsSet' },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }],
        name: 'PausedUnlockYieldSet',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'paused', internalType: 'bool', type: 'bool', indexed: false }],
        name: 'PausedWithdrawalsSet',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'winningAmount', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'usdPaid', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'RedeemedWinningForUSD',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: false },
            { name: 'finalizationTime', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'score', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'UserFinalized',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'user', internalType: 'address', type: 'address', indexed: true },
            { name: 'yesAmount', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'noAmount', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'Withdrawn',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'withdrawnThisCall', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'cumulativeWithdrawn', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'remainingInStrategy', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'YieldUnlockProgress',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'leftoverUsd', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'principalAtStart', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'YieldUnlockStarted',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'totalWithdrawnUsd', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'totalYield', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'userYield', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'protocolYield', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'YieldUnlocked',
    },
    { type: 'error', inputs: [], name: 'AlreadyFinalized' },
    { type: 'error', inputs: [], name: 'AlreadyHarvested' },
    { type: 'error', inputs: [], name: 'DepositLimitExceeded' },
    { type: 'error', inputs: [], name: 'InsufficientAmounts' },
    {
        type: 'error',
        inputs: [
            { name: 'holding', internalType: 'uint256', type: 'uint256' },
            { name: 'needed', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'InsufficientUSD',
    },
    { type: 'error', inputs: [{ name: 'have', internalType: 'uint256', type: 'uint256' }], name: 'InsufficientUserNo' },
    { type: 'error', inputs: [{ name: 'have', internalType: 'uint256', type: 'uint256' }], name: 'InsufficientUserYes' },
    {
        type: 'error',
        inputs: [
            { name: 'needed', internalType: 'uint256', type: 'uint256' },
            { name: 'withdrawn', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'InsufficientWithdrawalUSD',
    },
    { type: 'error', inputs: [{ name: 'bps', internalType: 'uint256', type: 'uint256' }], name: 'InvalidBps' },
    { type: 'error', inputs: [], name: 'InvalidInitialization' },
    { type: 'error', inputs: [], name: 'MarketNotResolved' },
    { type: 'error', inputs: [], name: 'NoYield' },
    { type: 'error', inputs: [], name: 'NotFinalized' },
    { type: 'error', inputs: [], name: 'NotInitializing' },
    { type: 'error', inputs: [{ name: 'owner', internalType: 'address', type: 'address' }], name: 'OwnableInvalidOwner' },
    { type: 'error', inputs: [{ name: 'account', internalType: 'address', type: 'address' }], name: 'OwnableUnauthorizedAccount' },
    { type: 'error', inputs: [], name: 'PausedAll' },
    { type: 'error', inputs: [], name: 'PausedDeposits' },
    { type: 'error', inputs: [], name: 'PausedUnlockYield' },
    { type: 'error', inputs: [], name: 'PausedWithdrawals' },
    { type: 'error', inputs: [], name: 'RedeemMismatch' },
    { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
    { type: 'error', inputs: [{ name: 'token', internalType: 'address', type: 'address' }], name: 'SafeERC20FailedOperation' },
    { type: 'error', inputs: [], name: 'VaultAlreadyFinalized' },
    { type: 'error', inputs: [], name: 'VaultNotFinalized' },
    { type: 'error', inputs: [], name: 'YieldAlreadyUnlocked' },
    { type: 'error', inputs: [], name: 'YieldNotUnlocked' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RobinVaultManager
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const robinVaultManagerAbi = [
    { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [],
        name: 'DEFAULT_ADMIN_ROLE',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'PAUSER_ROLE', outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'UPGRADE_INTERFACE_VERSION',
        outputs: [{ name: '', internalType: 'string', type: 'string' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'aaveDataProv',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'aavePool', outputs: [{ name: '', internalType: 'address', type: 'address' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        name: 'allVaults',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'allVaultsLength',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'checkPoolResolved', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [
            { name: 'conditionId', internalType: 'bytes32', type: 'bytes32' },
            { name: 'to', internalType: 'address', type: 'address' },
        ],
        name: 'claimProtocolFee',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'vault', internalType: 'address', type: 'address' },
            { name: 'to', internalType: 'address', type: 'address' },
        ],
        name: 'claimProtocolFeeFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'conditionId', internalType: 'bytes32', type: 'bytes32' }],
        name: 'createVault',
        outputs: [{ name: 'vault', internalType: 'address', type: 'address' }],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'ctf', outputs: [{ name: '', internalType: 'address', type: 'address' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'ctfExchange', outputs: [{ name: '', internalType: 'address', type: 'address' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
        name: 'getRoleAdmin',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32' },
            { name: 'account', internalType: 'address', type: 'address' },
        ],
        name: 'grantRole',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32' },
            { name: 'account', internalType: 'address', type: 'address' },
        ],
        name: 'hasRole',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'implementation',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: '_implementation', internalType: 'address', type: 'address' },
            { name: '_protocolFeeBps', internalType: 'uint256', type: 'uint256' },
            { name: '_underlyingUsd', internalType: 'address', type: 'address' },
            { name: '_polymarketWcol', internalType: 'address', type: 'address' },
            { name: '_ctf', internalType: 'address', type: 'address' },
            { name: '_negRiskAdapter', internalType: 'address', type: 'address' },
            { name: '_negRiskCtfExchange', internalType: 'address', type: 'address' },
            { name: '_ctfExchange', internalType: 'address', type: 'address' },
            { name: '_aavePool', internalType: 'address', type: 'address' },
            { name: '_aaveDataProv', internalType: 'address', type: 'address' },
        ],
        name: 'initialize',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'negRiskAdapter',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'negRiskCtfExchange',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'owner', outputs: [{ name: '', internalType: 'address', type: 'address' }], stateMutability: 'view' },
    { type: 'function', inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [{ name: 'vault', internalType: 'address', type: 'address' }],
        name: 'pauseAllFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'vault', internalType: 'address', type: 'address' }],
        name: 'pauseDepositsFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'vault', internalType: 'address', type: 'address' }],
        name: 'pauseUnlockYieldFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'vault', internalType: 'address', type: 'address' }],
        name: 'pauseWithdrawalsFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    { type: 'function', inputs: [], name: 'paused', outputs: [{ name: '', internalType: 'bool', type: 'bool' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'polymarketWcol',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'conditionId', internalType: 'bytes32', type: 'bytes32' }],
        name: 'predictVaultAddress',
        outputs: [{ name: 'predicted', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'protocolFeeBps',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'proxiableUUID',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32' },
            { name: 'callerConfirmation', internalType: 'address', type: 'address' },
        ],
        name: 'renounceRole',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32' },
            { name: 'account', internalType: 'address', type: 'address' },
        ],
        name: 'revokeRole',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '_dp', internalType: 'address', type: 'address' }],
        name: 'setAaveDataProv',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '_pool', internalType: 'address', type: 'address' }],
        name: 'setAavePool',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '_ctf', internalType: 'address', type: 'address' }],
        name: 'setCtf',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '_ctfExchange', internalType: 'address', type: 'address' }],
        name: 'setCtfExchange',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '_implementation', internalType: 'address', type: 'address' }],
        name: 'setImplementation',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '_negRiskAdapter', internalType: 'address', type: 'address' }],
        name: 'setNegRiskAdapter',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '_negRiskCtfExchange', internalType: 'address', type: 'address' }],
        name: 'setNegRiskCtfExchange',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '_wcol', internalType: 'address', type: 'address' }],
        name: 'setPolymarketWcol',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '_bps', internalType: 'uint256', type: 'uint256' }],
        name: 'setProtocolFeeBps',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: '_underlying', internalType: 'address', type: 'address' }],
        name: 'setUnderlyingUsd',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'vault', internalType: 'address', type: 'address' },
            { name: 'newLimit', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'setVaultDepositLimit',
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
        inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'underlyingUsd',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        inputs: [{ name: 'vault', internalType: 'address', type: 'address' }],
        name: 'unpauseAllFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'vault', internalType: 'address', type: 'address' }],
        name: 'unpauseDepositsFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'vault', internalType: 'address', type: 'address' }],
        name: 'unpauseUnlockYieldFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [{ name: 'vault', internalType: 'address', type: 'address' }],
        name: 'unpauseWithdrawalsFrom',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [
            { name: 'newImplementation', internalType: 'address', type: 'address' },
            { name: 'data', internalType: 'bytes', type: 'bytes' },
        ],
        name: 'upgradeToAndCall',
        outputs: [],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        inputs: [{ name: 'conditionId', internalType: 'bytes32', type: 'bytes32' }],
        name: 'vaultForConditionId',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        name: 'vaultOf',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'implementation', internalType: 'address', type: 'address', indexed: false },
            { name: 'protocolFeeBps', internalType: 'uint256', type: 'uint256', indexed: false },
            { name: 'underlyingUsd', internalType: 'address', type: 'address', indexed: false },
            { name: 'polymarketWcol', internalType: 'address', type: 'address', indexed: false },
            { name: 'ctf', internalType: 'address', type: 'address', indexed: false },
            { name: 'negRiskAdapter', internalType: 'address', type: 'address', indexed: false },
            { name: 'negRiskCtfExchange', internalType: 'address', type: 'address', indexed: false },
            { name: 'ctfExchange', internalType: 'address', type: 'address', indexed: false },
            { name: 'aavePool', internalType: 'address', type: 'address', indexed: false },
            { name: 'aaveDataProv', internalType: 'address', type: 'address', indexed: false },
        ],
        name: 'ConfigUpdated',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'version', internalType: 'uint64', type: 'uint64', indexed: false }], name: 'Initialized' },
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
        inputs: [
            { name: 'conditionId', internalType: 'bytes32', type: 'bytes32', indexed: true },
            { name: 'vault', internalType: 'address', type: 'address', indexed: true },
            { name: 'to', internalType: 'address', type: 'address', indexed: true },
            { name: 'when', internalType: 'uint256', type: 'uint256', indexed: false },
        ],
        name: 'ProtocolFeeClaimed',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
            { name: 'previousAdminRole', internalType: 'bytes32', type: 'bytes32', indexed: true },
            { name: 'newAdminRole', internalType: 'bytes32', type: 'bytes32', indexed: true },
        ],
        name: 'RoleAdminChanged',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
            { name: 'account', internalType: 'address', type: 'address', indexed: true },
            { name: 'sender', internalType: 'address', type: 'address', indexed: true },
        ],
        name: 'RoleGranted',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
            { name: 'account', internalType: 'address', type: 'address', indexed: true },
            { name: 'sender', internalType: 'address', type: 'address', indexed: true },
        ],
        name: 'RoleRevoked',
    },
    { type: 'event', anonymous: false, inputs: [{ name: 'account', internalType: 'address', type: 'address', indexed: false }], name: 'Unpaused' },
    {
        type: 'event',
        anonymous: false,
        inputs: [{ name: 'implementation', internalType: 'address', type: 'address', indexed: true }],
        name: 'Upgraded',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'conditionId', internalType: 'bytes32', type: 'bytes32', indexed: true },
            { name: 'vault', internalType: 'address', type: 'address', indexed: true },
            { name: 'creator', internalType: 'address', type: 'address', indexed: true },
        ],
        name: 'VaultCreated',
    },
    { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
    {
        type: 'error',
        inputs: [
            { name: 'account', internalType: 'address', type: 'address' },
            { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
        ],
        name: 'AccessControlUnauthorizedAccount',
    },
    { type: 'error', inputs: [{ name: 'target', internalType: 'address', type: 'address' }], name: 'AddressEmptyCode' },
    { type: 'error', inputs: [{ name: 'implementation', internalType: 'address', type: 'address' }], name: 'ERC1967InvalidImplementation' },
    { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
    { type: 'error', inputs: [], name: 'EnforcedPause' },
    { type: 'error', inputs: [], name: 'ExpectedPause' },
    { type: 'error', inputs: [], name: 'FailedCall' },
    { type: 'error', inputs: [], name: 'FailedDeployment' },
    {
        type: 'error',
        inputs: [
            { name: 'balance', internalType: 'uint256', type: 'uint256' },
            { name: 'needed', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'InsufficientBalance',
    },
    { type: 'error', inputs: [{ name: 'collateral', internalType: 'address', type: 'address' }], name: 'InvalidCollateral' },
    { type: 'error', inputs: [{ name: 'bps', internalType: 'uint256', type: 'uint256' }], name: 'InvalidFee' },
    { type: 'error', inputs: [], name: 'InvalidInitialization' },
    { type: 'error', inputs: [], name: 'NotInitializing' },
    { type: 'error', inputs: [{ name: 'owner', internalType: 'address', type: 'address' }], name: 'OwnableInvalidOwner' },
    { type: 'error', inputs: [{ name: 'account', internalType: 'address', type: 'address' }], name: 'OwnableUnauthorizedAccount' },
    { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
    { type: 'error', inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }], name: 'UUPSUnsupportedProxiableUUID' },
    { type: 'error', inputs: [{ name: 'vault', internalType: 'address', type: 'address' }], name: 'UnknownVault' },
    { type: 'error', inputs: [{ name: 'conditionId', internalType: 'bytes32', type: 'bytes32' }], name: 'UnlistedCondition' },
    {
        type: 'error',
        inputs: [
            { name: 'conditionId', internalType: 'bytes32', type: 'bytes32' },
            { name: 'vault', internalType: 'address', type: 'address' },
        ],
        name: 'VaultExists',
    },
    { type: 'error', inputs: [], name: 'ZeroAddress' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SafeProxyFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const safeProxyFactoryAbi = [
    {
        type: 'constructor',
        inputs: [
            { name: '_masterCopy', internalType: 'address', type: 'address' },
            { name: '_fallbackHandler', internalType: 'address', type: 'address' },
        ],
        stateMutability: 'nonpayable',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            { name: 'proxy', internalType: 'contract GnosisSafe', type: 'address', indexed: false },
            { name: 'owner', internalType: 'address', type: 'address', indexed: false },
        ],
        name: 'ProxyCreation',
    },
    {
        type: 'function',
        inputs: [],
        name: 'CREATE_PROXY_TYPEHASH',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'DOMAIN_TYPEHASH',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'view',
    },
    { type: 'function', inputs: [], name: 'NAME', outputs: [{ name: '', internalType: 'string', type: 'string' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'computeProxyAddress',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [
            { name: 'paymentToken', internalType: 'address', type: 'address' },
            { name: 'payment', internalType: 'uint256', type: 'uint256' },
            { name: 'paymentReceiver', internalType: 'address payable', type: 'address' },
            {
                name: 'createSig',
                internalType: 'struct SafeProxyFactory.Sig',
                type: 'tuple',
                components: [
                    { name: 'v', internalType: 'uint8', type: 'uint8' },
                    { name: 'r', internalType: 'bytes32', type: 'bytes32' },
                    { name: 's', internalType: 'bytes32', type: 'bytes32' },
                ],
            },
        ],
        name: 'createProxy',
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        inputs: [],
        name: 'domainSeparator',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'fallbackHandler',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [],
        name: 'getContractBytecode',
        outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getSalt',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
        stateMutability: 'pure',
    },
    { type: 'function', inputs: [], name: 'masterCopy', outputs: [{ name: '', internalType: 'address', type: 'address' }], stateMutability: 'view' },
    {
        type: 'function',
        inputs: [],
        name: 'proxyCreationCode',
        outputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
        stateMutability: 'pure',
    },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const useReadConditionalTokens = /*#__PURE__*/ createUseReadContract({ abi: conditionalTokensAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadConditionalTokensBalanceOf = /*#__PURE__*/ createUseReadContract({ abi: conditionalTokensAbi, functionName: 'balanceOf' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadConditionalTokensSupportsInterface = /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'supportsInterface',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"payoutNumerators"`
 */
export const useReadConditionalTokensPayoutNumerators = /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'payoutNumerators',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getPositionId"`
 */
export const useReadConditionalTokensGetPositionId = /*#__PURE__*/ createUseReadContract({ abi: conditionalTokensAbi, functionName: 'getPositionId' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"balanceOfBatch"`
 */
export const useReadConditionalTokensBalanceOfBatch = /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'balanceOfBatch',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getConditionId"`
 */
export const useReadConditionalTokensGetConditionId = /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getConditionId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getCollectionId"`
 */
export const useReadConditionalTokensGetCollectionId = /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getCollectionId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getOutcomeSlotCount"`
 */
export const useReadConditionalTokensGetOutcomeSlotCount = /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getOutcomeSlotCount',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"payoutDenominator"`
 */
export const useReadConditionalTokensPayoutDenominator = /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'payoutDenominator',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadConditionalTokensIsApprovedForAll = /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'isApprovedForAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const useWriteConditionalTokens = /*#__PURE__*/ createUseWriteContract({ abi: conditionalTokensAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"redeemPositions"`
 */
export const useWriteConditionalTokensRedeemPositions = /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'redeemPositions',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useWriteConditionalTokensSafeBatchTransferFrom = /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'safeBatchTransferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"splitPosition"`
 */
export const useWriteConditionalTokensSplitPosition = /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'splitPosition',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"mergePositions"`
 */
export const useWriteConditionalTokensMergePositions = /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'mergePositions',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteConditionalTokensSetApprovalForAll = /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'setApprovalForAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"reportPayouts"`
 */
export const useWriteConditionalTokensReportPayouts = /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'reportPayouts',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"prepareCondition"`
 */
export const useWriteConditionalTokensPrepareCondition = /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'prepareCondition',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteConditionalTokensSafeTransferFrom = /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'safeTransferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const useSimulateConditionalTokens = /*#__PURE__*/ createUseSimulateContract({ abi: conditionalTokensAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"redeemPositions"`
 */
export const useSimulateConditionalTokensRedeemPositions = /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'redeemPositions',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useSimulateConditionalTokensSafeBatchTransferFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'safeBatchTransferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"splitPosition"`
 */
export const useSimulateConditionalTokensSplitPosition = /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'splitPosition',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"mergePositions"`
 */
export const useSimulateConditionalTokensMergePositions = /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'mergePositions',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateConditionalTokensSetApprovalForAll = /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'setApprovalForAll',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"reportPayouts"`
 */
export const useSimulateConditionalTokensReportPayouts = /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'reportPayouts',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"prepareCondition"`
 */
export const useSimulateConditionalTokensPrepareCondition = /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'prepareCondition',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateConditionalTokensSafeTransferFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'safeTransferFrom',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const useWatchConditionalTokensEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: conditionalTokensAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"ConditionPreparation"`
 */
export const useWatchConditionalTokensConditionPreparationEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'ConditionPreparation',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"ConditionResolution"`
 */
export const useWatchConditionalTokensConditionResolutionEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'ConditionResolution',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"PositionSplit"`
 */
export const useWatchConditionalTokensPositionSplitEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'PositionSplit',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"PositionsMerge"`
 */
export const useWatchConditionalTokensPositionsMergeEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'PositionsMerge',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"PayoutRedemption"`
 */
export const useWatchConditionalTokensPayoutRedemptionEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'PayoutRedemption',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"TransferSingle"`
 */
export const useWatchConditionalTokensTransferSingleEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'TransferSingle',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"TransferBatch"`
 */
export const useWatchConditionalTokensTransferBatchEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'TransferBatch',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchConditionalTokensApprovalForAllEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'ApprovalForAll',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"URI"`
 */
export const useWatchConditionalTokensUriEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: conditionalTokensAbi, eventName: 'URI' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20 = /*#__PURE__*/ createUseReadContract({ abi: erc20Abi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({ abi: erc20Abi, functionName: 'allowance' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({ abi: erc20Abi, functionName: 'balanceOf' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({ abi: erc20Abi, functionName: 'decimals' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({ abi: erc20Abi, functionName: 'name' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({ abi: erc20Abi, functionName: 'symbol' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({ abi: erc20Abi, functionName: 'totalSupply' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20 = /*#__PURE__*/ createUseWriteContract({ abi: erc20Abi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({ abi: erc20Abi, functionName: 'approve' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({ abi: erc20Abi, functionName: 'transfer' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({ abi: erc20Abi, functionName: 'transferFrom' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20 = /*#__PURE__*/ createUseSimulateContract({ abi: erc20Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({ abi: erc20Abi, functionName: 'approve' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract({ abi: erc20Abi, functionName: 'transfer' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom = /*#__PURE__*/ createUseSimulateContract({ abi: erc20Abi, functionName: 'transferFrom' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Event = /*#__PURE__*/ createUseWatchContractEvent({ abi: erc20Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20ApprovalEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: erc20Abi, eventName: 'Approval' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20TransferEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: erc20Abi, eventName: 'Transfer' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__
 */
export const useReadGnosisSafeL2 = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"VERSION"`
 */
export const useReadGnosisSafeL2Version = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'VERSION' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"approvedHashes"`
 */
export const useReadGnosisSafeL2ApprovedHashes = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'approvedHashes' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"checkNSignatures"`
 */
export const useReadGnosisSafeL2CheckNSignatures = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'checkNSignatures' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"checkSignatures"`
 */
export const useReadGnosisSafeL2CheckSignatures = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'checkSignatures' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"domainSeparator"`
 */
export const useReadGnosisSafeL2DomainSeparator = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'domainSeparator' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"encodeTransactionData"`
 */
export const useReadGnosisSafeL2EncodeTransactionData = /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'encodeTransactionData',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getChainId"`
 */
export const useReadGnosisSafeL2GetChainId = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'getChainId' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getModulesPaginated"`
 */
export const useReadGnosisSafeL2GetModulesPaginated = /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'getModulesPaginated',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getOwners"`
 */
export const useReadGnosisSafeL2GetOwners = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'getOwners' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getStorageAt"`
 */
export const useReadGnosisSafeL2GetStorageAt = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'getStorageAt' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getThreshold"`
 */
export const useReadGnosisSafeL2GetThreshold = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'getThreshold' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getTransactionHash"`
 */
export const useReadGnosisSafeL2GetTransactionHash = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'getTransactionHash' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"isModuleEnabled"`
 */
export const useReadGnosisSafeL2IsModuleEnabled = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'isModuleEnabled' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"isOwner"`
 */
export const useReadGnosisSafeL2IsOwner = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'isOwner' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"nonce"`
 */
export const useReadGnosisSafeL2Nonce = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'nonce' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"signedMessages"`
 */
export const useReadGnosisSafeL2SignedMessages = /*#__PURE__*/ createUseReadContract({ abi: gnosisSafeL2Abi, functionName: 'signedMessages' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__
 */
export const useWriteGnosisSafeL2 = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"addOwnerWithThreshold"`
 */
export const useWriteGnosisSafeL2AddOwnerWithThreshold = /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'addOwnerWithThreshold',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"approveHash"`
 */
export const useWriteGnosisSafeL2ApproveHash = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'approveHash' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"changeThreshold"`
 */
export const useWriteGnosisSafeL2ChangeThreshold = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'changeThreshold' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"disableModule"`
 */
export const useWriteGnosisSafeL2DisableModule = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'disableModule' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"enableModule"`
 */
export const useWriteGnosisSafeL2EnableModule = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'enableModule' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransaction"`
 */
export const useWriteGnosisSafeL2ExecTransaction = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'execTransaction' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransactionFromModule"`
 */
export const useWriteGnosisSafeL2ExecTransactionFromModule = /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransactionFromModule',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransactionFromModuleReturnData"`
 */
export const useWriteGnosisSafeL2ExecTransactionFromModuleReturnData = /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransactionFromModuleReturnData',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"removeOwner"`
 */
export const useWriteGnosisSafeL2RemoveOwner = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'removeOwner' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"requiredTxGas"`
 */
export const useWriteGnosisSafeL2RequiredTxGas = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'requiredTxGas' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setFallbackHandler"`
 */
export const useWriteGnosisSafeL2SetFallbackHandler = /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'setFallbackHandler',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setGuard"`
 */
export const useWriteGnosisSafeL2SetGuard = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'setGuard' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setup"`
 */
export const useWriteGnosisSafeL2Setup = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'setup' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"simulateAndRevert"`
 */
export const useWriteGnosisSafeL2SimulateAndRevert = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'simulateAndRevert' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"swapOwner"`
 */
export const useWriteGnosisSafeL2SwapOwner = /*#__PURE__*/ createUseWriteContract({ abi: gnosisSafeL2Abi, functionName: 'swapOwner' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__
 */
export const useSimulateGnosisSafeL2 = /*#__PURE__*/ createUseSimulateContract({ abi: gnosisSafeL2Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"addOwnerWithThreshold"`
 */
export const useSimulateGnosisSafeL2AddOwnerWithThreshold = /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'addOwnerWithThreshold',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"approveHash"`
 */
export const useSimulateGnosisSafeL2ApproveHash = /*#__PURE__*/ createUseSimulateContract({ abi: gnosisSafeL2Abi, functionName: 'approveHash' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"changeThreshold"`
 */
export const useSimulateGnosisSafeL2ChangeThreshold = /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'changeThreshold',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"disableModule"`
 */
export const useSimulateGnosisSafeL2DisableModule = /*#__PURE__*/ createUseSimulateContract({ abi: gnosisSafeL2Abi, functionName: 'disableModule' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"enableModule"`
 */
export const useSimulateGnosisSafeL2EnableModule = /*#__PURE__*/ createUseSimulateContract({ abi: gnosisSafeL2Abi, functionName: 'enableModule' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransaction"`
 */
export const useSimulateGnosisSafeL2ExecTransaction = /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransaction',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransactionFromModule"`
 */
export const useSimulateGnosisSafeL2ExecTransactionFromModule = /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransactionFromModule',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransactionFromModuleReturnData"`
 */
export const useSimulateGnosisSafeL2ExecTransactionFromModuleReturnData = /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransactionFromModuleReturnData',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"removeOwner"`
 */
export const useSimulateGnosisSafeL2RemoveOwner = /*#__PURE__*/ createUseSimulateContract({ abi: gnosisSafeL2Abi, functionName: 'removeOwner' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"requiredTxGas"`
 */
export const useSimulateGnosisSafeL2RequiredTxGas = /*#__PURE__*/ createUseSimulateContract({ abi: gnosisSafeL2Abi, functionName: 'requiredTxGas' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setFallbackHandler"`
 */
export const useSimulateGnosisSafeL2SetFallbackHandler = /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'setFallbackHandler',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setGuard"`
 */
export const useSimulateGnosisSafeL2SetGuard = /*#__PURE__*/ createUseSimulateContract({ abi: gnosisSafeL2Abi, functionName: 'setGuard' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setup"`
 */
export const useSimulateGnosisSafeL2Setup = /*#__PURE__*/ createUseSimulateContract({ abi: gnosisSafeL2Abi, functionName: 'setup' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"simulateAndRevert"`
 */
export const useSimulateGnosisSafeL2SimulateAndRevert = /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'simulateAndRevert',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"swapOwner"`
 */
export const useSimulateGnosisSafeL2SwapOwner = /*#__PURE__*/ createUseSimulateContract({ abi: gnosisSafeL2Abi, functionName: 'swapOwner' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__
 */
export const useWatchGnosisSafeL2Event = /*#__PURE__*/ createUseWatchContractEvent({ abi: gnosisSafeL2Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"AddedOwner"`
 */
export const useWatchGnosisSafeL2AddedOwnerEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: gnosisSafeL2Abi, eventName: 'AddedOwner' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ApproveHash"`
 */
export const useWatchGnosisSafeL2ApproveHashEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: gnosisSafeL2Abi, eventName: 'ApproveHash' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ChangedFallbackHandler"`
 */
export const useWatchGnosisSafeL2ChangedFallbackHandlerEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ChangedFallbackHandler',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ChangedGuard"`
 */
export const useWatchGnosisSafeL2ChangedGuardEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: gnosisSafeL2Abi, eventName: 'ChangedGuard' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ChangedThreshold"`
 */
export const useWatchGnosisSafeL2ChangedThresholdEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ChangedThreshold',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"DisabledModule"`
 */
export const useWatchGnosisSafeL2DisabledModuleEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'DisabledModule',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"EnabledModule"`
 */
export const useWatchGnosisSafeL2EnabledModuleEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: gnosisSafeL2Abi, eventName: 'EnabledModule' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ExecutionFailure"`
 */
export const useWatchGnosisSafeL2ExecutionFailureEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ExecutionFailure',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ExecutionFromModuleFailure"`
 */
export const useWatchGnosisSafeL2ExecutionFromModuleFailureEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ExecutionFromModuleFailure',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ExecutionFromModuleSuccess"`
 */
export const useWatchGnosisSafeL2ExecutionFromModuleSuccessEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ExecutionFromModuleSuccess',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ExecutionSuccess"`
 */
export const useWatchGnosisSafeL2ExecutionSuccessEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ExecutionSuccess',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"RemovedOwner"`
 */
export const useWatchGnosisSafeL2RemovedOwnerEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: gnosisSafeL2Abi, eventName: 'RemovedOwner' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"SafeModuleTransaction"`
 */
export const useWatchGnosisSafeL2SafeModuleTransactionEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'SafeModuleTransaction',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"SafeMultiSigTransaction"`
 */
export const useWatchGnosisSafeL2SafeMultiSigTransactionEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'SafeMultiSigTransaction',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"SafeReceived"`
 */
export const useWatchGnosisSafeL2SafeReceivedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: gnosisSafeL2Abi, eventName: 'SafeReceived' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"SafeSetup"`
 */
export const useWatchGnosisSafeL2SafeSetupEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: gnosisSafeL2Abi, eventName: 'SafeSetup' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"SignMsg"`
 */
export const useWatchGnosisSafeL2SignMsgEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: gnosisSafeL2Abi, eventName: 'SignMsg' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__
 */
export const useReadPolymarketAaveStakingVault = /*#__PURE__*/ createUseReadContract({ abi: polymarketAaveStakingVaultAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"NO_INDEX"`
 */
export const useReadPolymarketAaveStakingVaultNoIndex = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'NO_INDEX',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"NO_INDEX_SET"`
 */
export const useReadPolymarketAaveStakingVaultNoIndexSet = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'NO_INDEX_SET',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"PARENT_COLLECTION_ID"`
 */
export const useReadPolymarketAaveStakingVaultParentCollectionId = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'PARENT_COLLECTION_ID',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"YES_INDEX"`
 */
export const useReadPolymarketAaveStakingVaultYesIndex = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'YES_INDEX',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"YES_INDEX_SET"`
 */
export const useReadPolymarketAaveStakingVaultYesIndexSet = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'YES_INDEX_SET',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"aToken"`
 */
export const useReadPolymarketAaveStakingVaultAToken = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'aToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"aavePool"`
 */
export const useReadPolymarketAaveStakingVaultAavePool = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'aavePool',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"conditionId"`
 */
export const useReadPolymarketAaveStakingVaultConditionId = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'conditionId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"ctf"`
 */
export const useReadPolymarketAaveStakingVaultCtf = /*#__PURE__*/ createUseReadContract({ abi: polymarketAaveStakingVaultAbi, functionName: 'ctf' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"dataProvider"`
 */
export const useReadPolymarketAaveStakingVaultDataProvider = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'dataProvider',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"depositLimit"`
 */
export const useReadPolymarketAaveStakingVaultDepositLimit = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'depositLimit',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"finalizationTime"`
 */
export const useReadPolymarketAaveStakingVaultFinalizationTime = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'finalizationTime',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"finalized"`
 */
export const useReadPolymarketAaveStakingVaultFinalized = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'finalized',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getBalance"`
 */
export const useReadPolymarketAaveStakingVaultGetBalance = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getBalance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getCurrentApy"`
 */
export const useReadPolymarketAaveStakingVaultGetCurrentApy = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getCurrentApy',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getCurrentSupplyAndLimit"`
 */
export const useReadPolymarketAaveStakingVaultGetCurrentSupplyAndLimit = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getCurrentSupplyAndLimit',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getCurrentUserYield"`
 */
export const useReadPolymarketAaveStakingVaultGetCurrentUserYield = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getCurrentUserYield',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getCurrentYieldBreakdown"`
 */
export const useReadPolymarketAaveStakingVaultGetCurrentYieldBreakdown = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getCurrentYieldBreakdown',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getGlobalScore"`
 */
export const useReadPolymarketAaveStakingVaultGetGlobalScore = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getGlobalScore',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getScore"`
 */
export const useReadPolymarketAaveStakingVaultGetScore = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getScore',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getTvlUsd"`
 */
export const useReadPolymarketAaveStakingVaultGetTvlUsd = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getTvlUsd',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getUserBalances"`
 */
export const useReadPolymarketAaveStakingVaultGetUserBalances = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getUserBalances',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getUserState"`
 */
export const useReadPolymarketAaveStakingVaultGetUserState = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getUserState',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getVaultPairedPrincipalUsd"`
 */
export const useReadPolymarketAaveStakingVaultGetVaultPairedPrincipalUsd = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getVaultPairedPrincipalUsd',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"getVaultUnpaired"`
 */
export const useReadPolymarketAaveStakingVaultGetVaultUnpaired = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'getVaultUnpaired',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"globalLastBalance"`
 */
export const useReadPolymarketAaveStakingVaultGlobalLastBalance = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'globalLastBalance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"globalLastUpdated"`
 */
export const useReadPolymarketAaveStakingVaultGlobalLastUpdated = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'globalLastUpdated',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"globalScore"`
 */
export const useReadPolymarketAaveStakingVaultGlobalScore = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'globalScore',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"leftoverUsd"`
 */
export const useReadPolymarketAaveStakingVaultLeftoverUsd = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'leftoverUsd',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"negRisk"`
 */
export const useReadPolymarketAaveStakingVaultNegRisk = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'negRisk',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"negRiskAdapter"`
 */
export const useReadPolymarketAaveStakingVaultNegRiskAdapter = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'negRiskAdapter',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"noPositionId"`
 */
export const useReadPolymarketAaveStakingVaultNoPositionId = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'noPositionId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadPolymarketAaveStakingVaultOwner = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pairedUsdPrincipal"`
 */
export const useReadPolymarketAaveStakingVaultPairedUsdPrincipal = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pairedUsdPrincipal',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pausedAll"`
 */
export const useReadPolymarketAaveStakingVaultPausedAll = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pausedAll',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pausedDeposits"`
 */
export const useReadPolymarketAaveStakingVaultPausedDeposits = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pausedDeposits',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pausedUnlockYield"`
 */
export const useReadPolymarketAaveStakingVaultPausedUnlockYield = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pausedUnlockYield',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pausedWithdrawals"`
 */
export const useReadPolymarketAaveStakingVaultPausedWithdrawals = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pausedWithdrawals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"polymarketCollateral"`
 */
export const useReadPolymarketAaveStakingVaultPolymarketCollateral = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'polymarketCollateral',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"protocolFeeBps"`
 */
export const useReadPolymarketAaveStakingVaultProtocolFeeBps = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'protocolFeeBps',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"protocolYield"`
 */
export const useReadPolymarketAaveStakingVaultProtocolYield = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'protocolYield',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"protocolYieldHarvested"`
 */
export const useReadPolymarketAaveStakingVaultProtocolYieldHarvested = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'protocolYieldHarvested',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadPolymarketAaveStakingVaultSupportsInterface = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'supportsInterface',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"totalUserYes"`
 */
export const useReadPolymarketAaveStakingVaultTotalUserYes = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'totalUserYes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"totalYield"`
 */
export const useReadPolymarketAaveStakingVaultTotalYield = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'totalYield',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"underlyingUsd"`
 */
export const useReadPolymarketAaveStakingVaultUnderlyingUsd = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'underlyingUsd',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unlockedUsd"`
 */
export const useReadPolymarketAaveStakingVaultUnlockedUsd = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unlockedUsd',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unlocking"`
 */
export const useReadPolymarketAaveStakingVaultUnlocking = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unlocking',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unpairedNo"`
 */
export const useReadPolymarketAaveStakingVaultUnpairedNo = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unpairedNo',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unpairedYes"`
 */
export const useReadPolymarketAaveStakingVaultUnpairedYes = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unpairedYes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"userYield"`
 */
export const useReadPolymarketAaveStakingVaultUserYield = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'userYield',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"winningPosition"`
 */
export const useReadPolymarketAaveStakingVaultWinningPosition = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'winningPosition',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"yesPositionId"`
 */
export const useReadPolymarketAaveStakingVaultYesPositionId = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'yesPositionId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"yieldUnlocked"`
 */
export const useReadPolymarketAaveStakingVaultYieldUnlocked = /*#__PURE__*/ createUseReadContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'yieldUnlocked',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__
 */
export const useWritePolymarketAaveStakingVault = /*#__PURE__*/ createUseWriteContract({ abi: polymarketAaveStakingVaultAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useWritePolymarketAaveStakingVaultDeposit = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'deposit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"finalizeGlobalScore"`
 */
export const useWritePolymarketAaveStakingVaultFinalizeGlobalScore = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'finalizeGlobalScore',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"finalizeMarket"`
 */
export const useWritePolymarketAaveStakingVaultFinalizeMarket = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'finalizeMarket',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"finalizeUserScore"`
 */
export const useWritePolymarketAaveStakingVaultFinalizeUserScore = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'finalizeUserScore',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"harvestProtocolYield"`
 */
export const useWritePolymarketAaveStakingVaultHarvestProtocolYield = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'harvestProtocolYield',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"harvestYield"`
 */
export const useWritePolymarketAaveStakingVaultHarvestYield = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'harvestYield',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"initialize"`
 */
export const useWritePolymarketAaveStakingVaultInitialize = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useWritePolymarketAaveStakingVaultOnErc1155BatchReceived = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'onERC1155BatchReceived',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useWritePolymarketAaveStakingVaultOnErc1155Received = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'onERC1155Received',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pauseAll"`
 */
export const useWritePolymarketAaveStakingVaultPauseAll = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pauseAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pauseDeposits"`
 */
export const useWritePolymarketAaveStakingVaultPauseDeposits = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pauseDeposits',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pauseUnlockYield"`
 */
export const useWritePolymarketAaveStakingVaultPauseUnlockYield = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pauseUnlockYield',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pauseWithdrawals"`
 */
export const useWritePolymarketAaveStakingVaultPauseWithdrawals = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pauseWithdrawals',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"redeemWinningForUsd"`
 */
export const useWritePolymarketAaveStakingVaultRedeemWinningForUsd = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'redeemWinningForUsd',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWritePolymarketAaveStakingVaultRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"setDepositLimit"`
 */
export const useWritePolymarketAaveStakingVaultSetDepositLimit = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'setDepositLimit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWritePolymarketAaveStakingVaultTransferOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unlockYield"`
 */
export const useWritePolymarketAaveStakingVaultUnlockYield = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unlockYield',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unpauseAll"`
 */
export const useWritePolymarketAaveStakingVaultUnpauseAll = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unpauseAll',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unpauseDeposits"`
 */
export const useWritePolymarketAaveStakingVaultUnpauseDeposits = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unpauseDeposits',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unpauseUnlockYield"`
 */
export const useWritePolymarketAaveStakingVaultUnpauseUnlockYield = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unpauseUnlockYield',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unpauseWithdrawals"`
 */
export const useWritePolymarketAaveStakingVaultUnpauseWithdrawals = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unpauseWithdrawals',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"updateGlobalScore"`
 */
export const useWritePolymarketAaveStakingVaultUpdateGlobalScore = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'updateGlobalScore',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"updateScore"`
 */
export const useWritePolymarketAaveStakingVaultUpdateScore = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'updateScore',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWritePolymarketAaveStakingVaultWithdraw = /*#__PURE__*/ createUseWriteContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'withdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__
 */
export const useSimulatePolymarketAaveStakingVault = /*#__PURE__*/ createUseSimulateContract({ abi: polymarketAaveStakingVaultAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulatePolymarketAaveStakingVaultDeposit = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'deposit',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"finalizeGlobalScore"`
 */
export const useSimulatePolymarketAaveStakingVaultFinalizeGlobalScore = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'finalizeGlobalScore',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"finalizeMarket"`
 */
export const useSimulatePolymarketAaveStakingVaultFinalizeMarket = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'finalizeMarket',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"finalizeUserScore"`
 */
export const useSimulatePolymarketAaveStakingVaultFinalizeUserScore = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'finalizeUserScore',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"harvestProtocolYield"`
 */
export const useSimulatePolymarketAaveStakingVaultHarvestProtocolYield = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'harvestProtocolYield',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"harvestYield"`
 */
export const useSimulatePolymarketAaveStakingVaultHarvestYield = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'harvestYield',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulatePolymarketAaveStakingVaultInitialize = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'initialize',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useSimulatePolymarketAaveStakingVaultOnErc1155BatchReceived = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'onERC1155BatchReceived',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useSimulatePolymarketAaveStakingVaultOnErc1155Received = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'onERC1155Received',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pauseAll"`
 */
export const useSimulatePolymarketAaveStakingVaultPauseAll = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pauseAll',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pauseDeposits"`
 */
export const useSimulatePolymarketAaveStakingVaultPauseDeposits = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pauseDeposits',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pauseUnlockYield"`
 */
export const useSimulatePolymarketAaveStakingVaultPauseUnlockYield = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pauseUnlockYield',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"pauseWithdrawals"`
 */
export const useSimulatePolymarketAaveStakingVaultPauseWithdrawals = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'pauseWithdrawals',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"redeemWinningForUsd"`
 */
export const useSimulatePolymarketAaveStakingVaultRedeemWinningForUsd = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'redeemWinningForUsd',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulatePolymarketAaveStakingVaultRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"setDepositLimit"`
 */
export const useSimulatePolymarketAaveStakingVaultSetDepositLimit = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'setDepositLimit',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulatePolymarketAaveStakingVaultTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unlockYield"`
 */
export const useSimulatePolymarketAaveStakingVaultUnlockYield = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unlockYield',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unpauseAll"`
 */
export const useSimulatePolymarketAaveStakingVaultUnpauseAll = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unpauseAll',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unpauseDeposits"`
 */
export const useSimulatePolymarketAaveStakingVaultUnpauseDeposits = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unpauseDeposits',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unpauseUnlockYield"`
 */
export const useSimulatePolymarketAaveStakingVaultUnpauseUnlockYield = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unpauseUnlockYield',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"unpauseWithdrawals"`
 */
export const useSimulatePolymarketAaveStakingVaultUnpauseWithdrawals = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'unpauseWithdrawals',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"updateGlobalScore"`
 */
export const useSimulatePolymarketAaveStakingVaultUpdateGlobalScore = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'updateGlobalScore',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"updateScore"`
 */
export const useSimulatePolymarketAaveStakingVaultUpdateScore = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'updateScore',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulatePolymarketAaveStakingVaultWithdraw = /*#__PURE__*/ createUseSimulateContract({
    abi: polymarketAaveStakingVaultAbi,
    functionName: 'withdraw',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__
 */
export const useWatchPolymarketAaveStakingVaultEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: polymarketAaveStakingVaultAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"Deposited"`
 */
export const useWatchPolymarketAaveStakingVaultDepositedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'Deposited',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"GlobalFinalized"`
 */
export const useWatchPolymarketAaveStakingVaultGlobalFinalizedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'GlobalFinalized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"HarvestedProtocolYield"`
 */
export const useWatchPolymarketAaveStakingVaultHarvestedProtocolYieldEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'HarvestedProtocolYield',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"HarvestedYield"`
 */
export const useWatchPolymarketAaveStakingVaultHarvestedYieldEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'HarvestedYield',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchPolymarketAaveStakingVaultInitializedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'Initialized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"MarketFinalized"`
 */
export const useWatchPolymarketAaveStakingVaultMarketFinalizedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'MarketFinalized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchPolymarketAaveStakingVaultOwnershipTransferredEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'OwnershipTransferred',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"PausedAllSet"`
 */
export const useWatchPolymarketAaveStakingVaultPausedAllSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'PausedAllSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"PausedDepositsSet"`
 */
export const useWatchPolymarketAaveStakingVaultPausedDepositsSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'PausedDepositsSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"PausedUnlockYieldSet"`
 */
export const useWatchPolymarketAaveStakingVaultPausedUnlockYieldSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'PausedUnlockYieldSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"PausedWithdrawalsSet"`
 */
export const useWatchPolymarketAaveStakingVaultPausedWithdrawalsSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'PausedWithdrawalsSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"RedeemedWinningForUSD"`
 */
export const useWatchPolymarketAaveStakingVaultRedeemedWinningForUsdEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'RedeemedWinningForUSD',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"UserFinalized"`
 */
export const useWatchPolymarketAaveStakingVaultUserFinalizedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'UserFinalized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"Withdrawn"`
 */
export const useWatchPolymarketAaveStakingVaultWithdrawnEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'Withdrawn',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"YieldUnlockProgress"`
 */
export const useWatchPolymarketAaveStakingVaultYieldUnlockProgressEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'YieldUnlockProgress',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"YieldUnlockStarted"`
 */
export const useWatchPolymarketAaveStakingVaultYieldUnlockStartedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'YieldUnlockStarted',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link polymarketAaveStakingVaultAbi}__ and `eventName` set to `"YieldUnlocked"`
 */
export const useWatchPolymarketAaveStakingVaultYieldUnlockedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: polymarketAaveStakingVaultAbi,
    eventName: 'YieldUnlocked',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__
 */
export const useReadRobinStakingVault = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"depositLimit"`
 */
export const useReadRobinStakingVaultDepositLimit = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'depositLimit' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"finalizationTime"`
 */
export const useReadRobinStakingVaultFinalizationTime = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'finalizationTime',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"finalized"`
 */
export const useReadRobinStakingVaultFinalized = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'finalized' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getBalance"`
 */
export const useReadRobinStakingVaultGetBalance = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'getBalance' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getCurrentApy"`
 */
export const useReadRobinStakingVaultGetCurrentApy = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'getCurrentApy' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getCurrentSupplyAndLimit"`
 */
export const useReadRobinStakingVaultGetCurrentSupplyAndLimit = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'getCurrentSupplyAndLimit',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getCurrentUserYield"`
 */
export const useReadRobinStakingVaultGetCurrentUserYield = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'getCurrentUserYield',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getCurrentYieldBreakdown"`
 */
export const useReadRobinStakingVaultGetCurrentYieldBreakdown = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'getCurrentYieldBreakdown',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getGlobalScore"`
 */
export const useReadRobinStakingVaultGetGlobalScore = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'getGlobalScore',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getScore"`
 */
export const useReadRobinStakingVaultGetScore = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'getScore' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getTvlUsd"`
 */
export const useReadRobinStakingVaultGetTvlUsd = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'getTvlUsd' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getUserBalances"`
 */
export const useReadRobinStakingVaultGetUserBalances = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'getUserBalances',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getUserState"`
 */
export const useReadRobinStakingVaultGetUserState = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'getUserState' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getVaultPairedPrincipalUsd"`
 */
export const useReadRobinStakingVaultGetVaultPairedPrincipalUsd = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'getVaultPairedPrincipalUsd',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"getVaultUnpaired"`
 */
export const useReadRobinStakingVaultGetVaultUnpaired = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'getVaultUnpaired',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"globalLastBalance"`
 */
export const useReadRobinStakingVaultGlobalLastBalance = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'globalLastBalance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"globalLastUpdated"`
 */
export const useReadRobinStakingVaultGlobalLastUpdated = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'globalLastUpdated',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"globalScore"`
 */
export const useReadRobinStakingVaultGlobalScore = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'globalScore' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"leftoverUsd"`
 */
export const useReadRobinStakingVaultLeftoverUsd = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'leftoverUsd' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadRobinStakingVaultOwner = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'owner' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pairedUsdPrincipal"`
 */
export const useReadRobinStakingVaultPairedUsdPrincipal = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'pairedUsdPrincipal',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pausedAll"`
 */
export const useReadRobinStakingVaultPausedAll = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'pausedAll' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pausedDeposits"`
 */
export const useReadRobinStakingVaultPausedDeposits = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'pausedDeposits',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pausedUnlockYield"`
 */
export const useReadRobinStakingVaultPausedUnlockYield = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'pausedUnlockYield',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pausedWithdrawals"`
 */
export const useReadRobinStakingVaultPausedWithdrawals = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'pausedWithdrawals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"protocolFeeBps"`
 */
export const useReadRobinStakingVaultProtocolFeeBps = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'protocolFeeBps',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"protocolYield"`
 */
export const useReadRobinStakingVaultProtocolYield = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'protocolYield' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"protocolYieldHarvested"`
 */
export const useReadRobinStakingVaultProtocolYieldHarvested = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'protocolYieldHarvested',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"totalUserYes"`
 */
export const useReadRobinStakingVaultTotalUserYes = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'totalUserYes' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"totalYield"`
 */
export const useReadRobinStakingVaultTotalYield = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'totalYield' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"underlyingUsd"`
 */
export const useReadRobinStakingVaultUnderlyingUsd = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'underlyingUsd' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unlockedUsd"`
 */
export const useReadRobinStakingVaultUnlockedUsd = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'unlockedUsd' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unlocking"`
 */
export const useReadRobinStakingVaultUnlocking = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'unlocking' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unpairedNo"`
 */
export const useReadRobinStakingVaultUnpairedNo = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'unpairedNo' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unpairedYes"`
 */
export const useReadRobinStakingVaultUnpairedYes = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'unpairedYes' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"userYield"`
 */
export const useReadRobinStakingVaultUserYield = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'userYield' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"winningPosition"`
 */
export const useReadRobinStakingVaultWinningPosition = /*#__PURE__*/ createUseReadContract({
    abi: robinStakingVaultAbi,
    functionName: 'winningPosition',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"yieldUnlocked"`
 */
export const useReadRobinStakingVaultYieldUnlocked = /*#__PURE__*/ createUseReadContract({ abi: robinStakingVaultAbi, functionName: 'yieldUnlocked' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__
 */
export const useWriteRobinStakingVault = /*#__PURE__*/ createUseWriteContract({ abi: robinStakingVaultAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteRobinStakingVaultDeposit = /*#__PURE__*/ createUseWriteContract({ abi: robinStakingVaultAbi, functionName: 'deposit' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"finalizeGlobalScore"`
 */
export const useWriteRobinStakingVaultFinalizeGlobalScore = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'finalizeGlobalScore',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"finalizeMarket"`
 */
export const useWriteRobinStakingVaultFinalizeMarket = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'finalizeMarket',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"finalizeUserScore"`
 */
export const useWriteRobinStakingVaultFinalizeUserScore = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'finalizeUserScore',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"harvestProtocolYield"`
 */
export const useWriteRobinStakingVaultHarvestProtocolYield = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'harvestProtocolYield',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"harvestYield"`
 */
export const useWriteRobinStakingVaultHarvestYield = /*#__PURE__*/ createUseWriteContract({ abi: robinStakingVaultAbi, functionName: 'harvestYield' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pauseAll"`
 */
export const useWriteRobinStakingVaultPauseAll = /*#__PURE__*/ createUseWriteContract({ abi: robinStakingVaultAbi, functionName: 'pauseAll' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pauseDeposits"`
 */
export const useWriteRobinStakingVaultPauseDeposits = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'pauseDeposits',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pauseUnlockYield"`
 */
export const useWriteRobinStakingVaultPauseUnlockYield = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'pauseUnlockYield',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pauseWithdrawals"`
 */
export const useWriteRobinStakingVaultPauseWithdrawals = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'pauseWithdrawals',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"redeemWinningForUsd"`
 */
export const useWriteRobinStakingVaultRedeemWinningForUsd = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'redeemWinningForUsd',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteRobinStakingVaultRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"setDepositLimit"`
 */
export const useWriteRobinStakingVaultSetDepositLimit = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'setDepositLimit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteRobinStakingVaultTransferOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unlockYield"`
 */
export const useWriteRobinStakingVaultUnlockYield = /*#__PURE__*/ createUseWriteContract({ abi: robinStakingVaultAbi, functionName: 'unlockYield' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unpauseAll"`
 */
export const useWriteRobinStakingVaultUnpauseAll = /*#__PURE__*/ createUseWriteContract({ abi: robinStakingVaultAbi, functionName: 'unpauseAll' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unpauseDeposits"`
 */
export const useWriteRobinStakingVaultUnpauseDeposits = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'unpauseDeposits',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unpauseUnlockYield"`
 */
export const useWriteRobinStakingVaultUnpauseUnlockYield = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'unpauseUnlockYield',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unpauseWithdrawals"`
 */
export const useWriteRobinStakingVaultUnpauseWithdrawals = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'unpauseWithdrawals',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"updateGlobalScore"`
 */
export const useWriteRobinStakingVaultUpdateGlobalScore = /*#__PURE__*/ createUseWriteContract({
    abi: robinStakingVaultAbi,
    functionName: 'updateGlobalScore',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"updateScore"`
 */
export const useWriteRobinStakingVaultUpdateScore = /*#__PURE__*/ createUseWriteContract({ abi: robinStakingVaultAbi, functionName: 'updateScore' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteRobinStakingVaultWithdraw = /*#__PURE__*/ createUseWriteContract({ abi: robinStakingVaultAbi, functionName: 'withdraw' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__
 */
export const useSimulateRobinStakingVault = /*#__PURE__*/ createUseSimulateContract({ abi: robinStakingVaultAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateRobinStakingVaultDeposit = /*#__PURE__*/ createUseSimulateContract({ abi: robinStakingVaultAbi, functionName: 'deposit' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"finalizeGlobalScore"`
 */
export const useSimulateRobinStakingVaultFinalizeGlobalScore = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'finalizeGlobalScore',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"finalizeMarket"`
 */
export const useSimulateRobinStakingVaultFinalizeMarket = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'finalizeMarket',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"finalizeUserScore"`
 */
export const useSimulateRobinStakingVaultFinalizeUserScore = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'finalizeUserScore',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"harvestProtocolYield"`
 */
export const useSimulateRobinStakingVaultHarvestProtocolYield = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'harvestProtocolYield',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"harvestYield"`
 */
export const useSimulateRobinStakingVaultHarvestYield = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'harvestYield',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pauseAll"`
 */
export const useSimulateRobinStakingVaultPauseAll = /*#__PURE__*/ createUseSimulateContract({ abi: robinStakingVaultAbi, functionName: 'pauseAll' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pauseDeposits"`
 */
export const useSimulateRobinStakingVaultPauseDeposits = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'pauseDeposits',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pauseUnlockYield"`
 */
export const useSimulateRobinStakingVaultPauseUnlockYield = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'pauseUnlockYield',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"pauseWithdrawals"`
 */
export const useSimulateRobinStakingVaultPauseWithdrawals = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'pauseWithdrawals',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"redeemWinningForUsd"`
 */
export const useSimulateRobinStakingVaultRedeemWinningForUsd = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'redeemWinningForUsd',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateRobinStakingVaultRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"setDepositLimit"`
 */
export const useSimulateRobinStakingVaultSetDepositLimit = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'setDepositLimit',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateRobinStakingVaultTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unlockYield"`
 */
export const useSimulateRobinStakingVaultUnlockYield = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'unlockYield',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unpauseAll"`
 */
export const useSimulateRobinStakingVaultUnpauseAll = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'unpauseAll',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unpauseDeposits"`
 */
export const useSimulateRobinStakingVaultUnpauseDeposits = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'unpauseDeposits',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unpauseUnlockYield"`
 */
export const useSimulateRobinStakingVaultUnpauseUnlockYield = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'unpauseUnlockYield',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"unpauseWithdrawals"`
 */
export const useSimulateRobinStakingVaultUnpauseWithdrawals = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'unpauseWithdrawals',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"updateGlobalScore"`
 */
export const useSimulateRobinStakingVaultUpdateGlobalScore = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'updateGlobalScore',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"updateScore"`
 */
export const useSimulateRobinStakingVaultUpdateScore = /*#__PURE__*/ createUseSimulateContract({
    abi: robinStakingVaultAbi,
    functionName: 'updateScore',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateRobinStakingVaultWithdraw = /*#__PURE__*/ createUseSimulateContract({ abi: robinStakingVaultAbi, functionName: 'withdraw' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__
 */
export const useWatchRobinStakingVaultEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinStakingVaultAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"Deposited"`
 */
export const useWatchRobinStakingVaultDepositedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'Deposited',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"GlobalFinalized"`
 */
export const useWatchRobinStakingVaultGlobalFinalizedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'GlobalFinalized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"HarvestedProtocolYield"`
 */
export const useWatchRobinStakingVaultHarvestedProtocolYieldEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'HarvestedProtocolYield',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"HarvestedYield"`
 */
export const useWatchRobinStakingVaultHarvestedYieldEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'HarvestedYield',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchRobinStakingVaultInitializedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'Initialized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"MarketFinalized"`
 */
export const useWatchRobinStakingVaultMarketFinalizedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'MarketFinalized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchRobinStakingVaultOwnershipTransferredEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'OwnershipTransferred',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"PausedAllSet"`
 */
export const useWatchRobinStakingVaultPausedAllSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'PausedAllSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"PausedDepositsSet"`
 */
export const useWatchRobinStakingVaultPausedDepositsSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'PausedDepositsSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"PausedUnlockYieldSet"`
 */
export const useWatchRobinStakingVaultPausedUnlockYieldSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'PausedUnlockYieldSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"PausedWithdrawalsSet"`
 */
export const useWatchRobinStakingVaultPausedWithdrawalsSetEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'PausedWithdrawalsSet',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"RedeemedWinningForUSD"`
 */
export const useWatchRobinStakingVaultRedeemedWinningForUsdEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'RedeemedWinningForUSD',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"UserFinalized"`
 */
export const useWatchRobinStakingVaultUserFinalizedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'UserFinalized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"Withdrawn"`
 */
export const useWatchRobinStakingVaultWithdrawnEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'Withdrawn',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"YieldUnlockProgress"`
 */
export const useWatchRobinStakingVaultYieldUnlockProgressEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'YieldUnlockProgress',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"YieldUnlockStarted"`
 */
export const useWatchRobinStakingVaultYieldUnlockStartedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'YieldUnlockStarted',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinStakingVaultAbi}__ and `eventName` set to `"YieldUnlocked"`
 */
export const useWatchRobinStakingVaultYieldUnlockedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinStakingVaultAbi,
    eventName: 'YieldUnlocked',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__
 */
export const useReadRobinVaultManager = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadRobinVaultManagerDefaultAdminRole = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useReadRobinVaultManagerPauserRole = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'PAUSER_ROLE' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadRobinVaultManagerUpgradeInterfaceVersion = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"aaveDataProv"`
 */
export const useReadRobinVaultManagerAaveDataProv = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'aaveDataProv' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"aavePool"`
 */
export const useReadRobinVaultManagerAavePool = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'aavePool' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"allVaults"`
 */
export const useReadRobinVaultManagerAllVaults = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'allVaults' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"allVaultsLength"`
 */
export const useReadRobinVaultManagerAllVaultsLength = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'allVaultsLength',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"checkPoolResolved"`
 */
export const useReadRobinVaultManagerCheckPoolResolved = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'checkPoolResolved',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"ctf"`
 */
export const useReadRobinVaultManagerCtf = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'ctf' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"ctfExchange"`
 */
export const useReadRobinVaultManagerCtfExchange = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'ctfExchange' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadRobinVaultManagerGetRoleAdmin = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'getRoleAdmin' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadRobinVaultManagerHasRole = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'hasRole' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"implementation"`
 */
export const useReadRobinVaultManagerImplementation = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'implementation',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"negRiskAdapter"`
 */
export const useReadRobinVaultManagerNegRiskAdapter = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'negRiskAdapter',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"negRiskCtfExchange"`
 */
export const useReadRobinVaultManagerNegRiskCtfExchange = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'negRiskCtfExchange',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"owner"`
 */
export const useReadRobinVaultManagerOwner = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'owner' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"paused"`
 */
export const useReadRobinVaultManagerPaused = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'paused' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"polymarketWcol"`
 */
export const useReadRobinVaultManagerPolymarketWcol = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'polymarketWcol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"predictVaultAddress"`
 */
export const useReadRobinVaultManagerPredictVaultAddress = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'predictVaultAddress',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"protocolFeeBps"`
 */
export const useReadRobinVaultManagerProtocolFeeBps = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'protocolFeeBps',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadRobinVaultManagerProxiableUuid = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'proxiableUUID' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadRobinVaultManagerSupportsInterface = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'supportsInterface',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"underlyingUsd"`
 */
export const useReadRobinVaultManagerUnderlyingUsd = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'underlyingUsd' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"vaultForConditionId"`
 */
export const useReadRobinVaultManagerVaultForConditionId = /*#__PURE__*/ createUseReadContract({
    abi: robinVaultManagerAbi,
    functionName: 'vaultForConditionId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"vaultOf"`
 */
export const useReadRobinVaultManagerVaultOf = /*#__PURE__*/ createUseReadContract({ abi: robinVaultManagerAbi, functionName: 'vaultOf' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__
 */
export const useWriteRobinVaultManager = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"claimProtocolFee"`
 */
export const useWriteRobinVaultManagerClaimProtocolFee = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'claimProtocolFee',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"claimProtocolFeeFrom"`
 */
export const useWriteRobinVaultManagerClaimProtocolFeeFrom = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'claimProtocolFeeFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"createVault"`
 */
export const useWriteRobinVaultManagerCreateVault = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi, functionName: 'createVault' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteRobinVaultManagerGrantRole = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi, functionName: 'grantRole' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteRobinVaultManagerInitialize = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi, functionName: 'initialize' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteRobinVaultManagerPause = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi, functionName: 'pause' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"pauseAllFrom"`
 */
export const useWriteRobinVaultManagerPauseAllFrom = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi, functionName: 'pauseAllFrom' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"pauseDepositsFrom"`
 */
export const useWriteRobinVaultManagerPauseDepositsFrom = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'pauseDepositsFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"pauseUnlockYieldFrom"`
 */
export const useWriteRobinVaultManagerPauseUnlockYieldFrom = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'pauseUnlockYieldFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"pauseWithdrawalsFrom"`
 */
export const useWriteRobinVaultManagerPauseWithdrawalsFrom = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'pauseWithdrawalsFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteRobinVaultManagerRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteRobinVaultManagerRenounceRole = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi, functionName: 'renounceRole' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteRobinVaultManagerRevokeRole = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi, functionName: 'revokeRole' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setAaveDataProv"`
 */
export const useWriteRobinVaultManagerSetAaveDataProv = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'setAaveDataProv',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setAavePool"`
 */
export const useWriteRobinVaultManagerSetAavePool = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi, functionName: 'setAavePool' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setCtf"`
 */
export const useWriteRobinVaultManagerSetCtf = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi, functionName: 'setCtf' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setCtfExchange"`
 */
export const useWriteRobinVaultManagerSetCtfExchange = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'setCtfExchange',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setImplementation"`
 */
export const useWriteRobinVaultManagerSetImplementation = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'setImplementation',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setNegRiskAdapter"`
 */
export const useWriteRobinVaultManagerSetNegRiskAdapter = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'setNegRiskAdapter',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setNegRiskCtfExchange"`
 */
export const useWriteRobinVaultManagerSetNegRiskCtfExchange = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'setNegRiskCtfExchange',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setPolymarketWcol"`
 */
export const useWriteRobinVaultManagerSetPolymarketWcol = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'setPolymarketWcol',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setProtocolFeeBps"`
 */
export const useWriteRobinVaultManagerSetProtocolFeeBps = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'setProtocolFeeBps',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setUnderlyingUsd"`
 */
export const useWriteRobinVaultManagerSetUnderlyingUsd = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'setUnderlyingUsd',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setVaultDepositLimit"`
 */
export const useWriteRobinVaultManagerSetVaultDepositLimit = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'setVaultDepositLimit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteRobinVaultManagerTransferOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteRobinVaultManagerUnpause = /*#__PURE__*/ createUseWriteContract({ abi: robinVaultManagerAbi, functionName: 'unpause' })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"unpauseAllFrom"`
 */
export const useWriteRobinVaultManagerUnpauseAllFrom = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'unpauseAllFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"unpauseDepositsFrom"`
 */
export const useWriteRobinVaultManagerUnpauseDepositsFrom = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'unpauseDepositsFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"unpauseUnlockYieldFrom"`
 */
export const useWriteRobinVaultManagerUnpauseUnlockYieldFrom = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'unpauseUnlockYieldFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"unpauseWithdrawalsFrom"`
 */
export const useWriteRobinVaultManagerUnpauseWithdrawalsFrom = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'unpauseWithdrawalsFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteRobinVaultManagerUpgradeToAndCall = /*#__PURE__*/ createUseWriteContract({
    abi: robinVaultManagerAbi,
    functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__
 */
export const useSimulateRobinVaultManager = /*#__PURE__*/ createUseSimulateContract({ abi: robinVaultManagerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"claimProtocolFee"`
 */
export const useSimulateRobinVaultManagerClaimProtocolFee = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'claimProtocolFee',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"claimProtocolFeeFrom"`
 */
export const useSimulateRobinVaultManagerClaimProtocolFeeFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'claimProtocolFeeFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"createVault"`
 */
export const useSimulateRobinVaultManagerCreateVault = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'createVault',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateRobinVaultManagerGrantRole = /*#__PURE__*/ createUseSimulateContract({ abi: robinVaultManagerAbi, functionName: 'grantRole' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateRobinVaultManagerInitialize = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'initialize',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateRobinVaultManagerPause = /*#__PURE__*/ createUseSimulateContract({ abi: robinVaultManagerAbi, functionName: 'pause' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"pauseAllFrom"`
 */
export const useSimulateRobinVaultManagerPauseAllFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'pauseAllFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"pauseDepositsFrom"`
 */
export const useSimulateRobinVaultManagerPauseDepositsFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'pauseDepositsFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"pauseUnlockYieldFrom"`
 */
export const useSimulateRobinVaultManagerPauseUnlockYieldFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'pauseUnlockYieldFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"pauseWithdrawalsFrom"`
 */
export const useSimulateRobinVaultManagerPauseWithdrawalsFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'pauseWithdrawalsFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateRobinVaultManagerRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'renounceOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateRobinVaultManagerRenounceRole = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'renounceRole',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateRobinVaultManagerRevokeRole = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'revokeRole',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setAaveDataProv"`
 */
export const useSimulateRobinVaultManagerSetAaveDataProv = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'setAaveDataProv',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setAavePool"`
 */
export const useSimulateRobinVaultManagerSetAavePool = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'setAavePool',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setCtf"`
 */
export const useSimulateRobinVaultManagerSetCtf = /*#__PURE__*/ createUseSimulateContract({ abi: robinVaultManagerAbi, functionName: 'setCtf' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setCtfExchange"`
 */
export const useSimulateRobinVaultManagerSetCtfExchange = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'setCtfExchange',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setImplementation"`
 */
export const useSimulateRobinVaultManagerSetImplementation = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'setImplementation',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setNegRiskAdapter"`
 */
export const useSimulateRobinVaultManagerSetNegRiskAdapter = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'setNegRiskAdapter',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setNegRiskCtfExchange"`
 */
export const useSimulateRobinVaultManagerSetNegRiskCtfExchange = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'setNegRiskCtfExchange',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setPolymarketWcol"`
 */
export const useSimulateRobinVaultManagerSetPolymarketWcol = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'setPolymarketWcol',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setProtocolFeeBps"`
 */
export const useSimulateRobinVaultManagerSetProtocolFeeBps = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'setProtocolFeeBps',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setUnderlyingUsd"`
 */
export const useSimulateRobinVaultManagerSetUnderlyingUsd = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'setUnderlyingUsd',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"setVaultDepositLimit"`
 */
export const useSimulateRobinVaultManagerSetVaultDepositLimit = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'setVaultDepositLimit',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateRobinVaultManagerTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'transferOwnership',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateRobinVaultManagerUnpause = /*#__PURE__*/ createUseSimulateContract({ abi: robinVaultManagerAbi, functionName: 'unpause' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"unpauseAllFrom"`
 */
export const useSimulateRobinVaultManagerUnpauseAllFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'unpauseAllFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"unpauseDepositsFrom"`
 */
export const useSimulateRobinVaultManagerUnpauseDepositsFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'unpauseDepositsFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"unpauseUnlockYieldFrom"`
 */
export const useSimulateRobinVaultManagerUnpauseUnlockYieldFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'unpauseUnlockYieldFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"unpauseWithdrawalsFrom"`
 */
export const useSimulateRobinVaultManagerUnpauseWithdrawalsFrom = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'unpauseWithdrawalsFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateRobinVaultManagerUpgradeToAndCall = /*#__PURE__*/ createUseSimulateContract({
    abi: robinVaultManagerAbi,
    functionName: 'upgradeToAndCall',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__
 */
export const useWatchRobinVaultManagerEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinVaultManagerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"ConfigUpdated"`
 */
export const useWatchRobinVaultManagerConfigUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinVaultManagerAbi,
    eventName: 'ConfigUpdated',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchRobinVaultManagerInitializedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinVaultManagerAbi,
    eventName: 'Initialized',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchRobinVaultManagerOwnershipTransferredEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinVaultManagerAbi,
    eventName: 'OwnershipTransferred',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchRobinVaultManagerPausedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinVaultManagerAbi, eventName: 'Paused' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"ProtocolFeeClaimed"`
 */
export const useWatchRobinVaultManagerProtocolFeeClaimedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinVaultManagerAbi,
    eventName: 'ProtocolFeeClaimed',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchRobinVaultManagerRoleAdminChangedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinVaultManagerAbi,
    eventName: 'RoleAdminChanged',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchRobinVaultManagerRoleGrantedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinVaultManagerAbi,
    eventName: 'RoleGranted',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchRobinVaultManagerRoleRevokedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinVaultManagerAbi,
    eventName: 'RoleRevoked',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchRobinVaultManagerUnpausedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinVaultManagerAbi, eventName: 'Unpaused' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchRobinVaultManagerUpgradedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: robinVaultManagerAbi, eventName: 'Upgraded' })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link robinVaultManagerAbi}__ and `eventName` set to `"VaultCreated"`
 */
export const useWatchRobinVaultManagerVaultCreatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: robinVaultManagerAbi,
    eventName: 'VaultCreated',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__
 */
export const useReadSafeProxyFactory = /*#__PURE__*/ createUseReadContract({ abi: safeProxyFactoryAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"CREATE_PROXY_TYPEHASH"`
 */
export const useReadSafeProxyFactoryCreateProxyTypehash = /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'CREATE_PROXY_TYPEHASH',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"DOMAIN_TYPEHASH"`
 */
export const useReadSafeProxyFactoryDomainTypehash = /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'DOMAIN_TYPEHASH',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadSafeProxyFactoryName = /*#__PURE__*/ createUseReadContract({ abi: safeProxyFactoryAbi, functionName: 'NAME' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"computeProxyAddress"`
 */
export const useReadSafeProxyFactoryComputeProxyAddress = /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'computeProxyAddress',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"domainSeparator"`
 */
export const useReadSafeProxyFactoryDomainSeparator = /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'domainSeparator',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"fallbackHandler"`
 */
export const useReadSafeProxyFactoryFallbackHandler = /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'fallbackHandler',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"getContractBytecode"`
 */
export const useReadSafeProxyFactoryGetContractBytecode = /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'getContractBytecode',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"getSalt"`
 */
export const useReadSafeProxyFactoryGetSalt = /*#__PURE__*/ createUseReadContract({ abi: safeProxyFactoryAbi, functionName: 'getSalt' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"masterCopy"`
 */
export const useReadSafeProxyFactoryMasterCopy = /*#__PURE__*/ createUseReadContract({ abi: safeProxyFactoryAbi, functionName: 'masterCopy' })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"proxyCreationCode"`
 */
export const useReadSafeProxyFactoryProxyCreationCode = /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'proxyCreationCode',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__
 */
export const useWriteSafeProxyFactory = /*#__PURE__*/ createUseWriteContract({ abi: safeProxyFactoryAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"createProxy"`
 */
export const useWriteSafeProxyFactoryCreateProxy = /*#__PURE__*/ createUseWriteContract({ abi: safeProxyFactoryAbi, functionName: 'createProxy' })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__
 */
export const useSimulateSafeProxyFactory = /*#__PURE__*/ createUseSimulateContract({ abi: safeProxyFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"createProxy"`
 */
export const useSimulateSafeProxyFactoryCreateProxy = /*#__PURE__*/ createUseSimulateContract({
    abi: safeProxyFactoryAbi,
    functionName: 'createProxy',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link safeProxyFactoryAbi}__
 */
export const useWatchSafeProxyFactoryEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: safeProxyFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `eventName` set to `"ProxyCreation"`
 */
export const useWatchSafeProxyFactoryProxyCreationEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: safeProxyFactoryAbi,
    eventName: 'ProxyCreation',
})
