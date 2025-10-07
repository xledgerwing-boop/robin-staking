async function main(payload) {
    const { data } = payload;

    const relevantLogs = [];
    for (const blockData of data) {
        const timestamp = blockData.block.timestamp;
        await checkForNewMarkets(blockData.receipts);
        for (const receipt of blockData.receipts) {
            for (const log of receipt.logs) {
                const isRelevant =
                    log.address.toLowerCase() === vaultManager || (await qnLib.qnContainsListItem(CONTRACTS_LIST_KEY, log.address.toLowerCase()));
                if (isRelevant) {
                    relevantLogs.push({ ...log, timestamp });
                }
            }
        }
    }

    return relevantLogs;
}

async function checkForNewMarkets(receipts) {
    const decodedReceipts = decodeEVMReceipts(receipts, [robinVaultManagerAbi]);
    for (const receipt of decodedReceipts) {
        for (const log of receipt.decodedLogs) {
            if (log.address.toLowerCase() !== vaultManager) continue;
            if (log.name != 'VaultCreated') continue;
            await addContractToList(log.vault);
        }
    }
}

async function addContractToList(contract) {
    await qnLib.qnAddListItem(CONTRACTS_LIST_KEY, contract);
}

const CONTRACTS_LIST_KEY = 'staking_vault_contracts';
const vaultManager = '0x443d773831c8B542F20bd9712c672084911eE10B'.toLowerCase();

const robinVaultManagerAbi = [
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
];
