import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GnosisSafeL2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const gnosisSafeL2Abi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AddedOwner',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'approvedHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ApproveHash',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'handler',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'ChangedFallbackHandler',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'guard',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'ChangedGuard',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'threshold',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ChangedThreshold',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'module',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DisabledModule',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'module',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'EnabledModule',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'txHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'payment',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ExecutionFailure',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'module',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ExecutionFromModuleFailure',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'module',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ExecutionFromModuleSuccess',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'txHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'payment',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ExecutionSuccess',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'RemovedOwner',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'module',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      {
        name: 'operation',
        internalType: 'enum Enum.Operation',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'SafeModuleTransaction',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      {
        name: 'operation',
        internalType: 'enum Enum.Operation',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'safeTxGas',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'baseGas',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'gasPrice',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'gasToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'refundReceiver',
        internalType: 'address payable',
        type: 'address',
        indexed: false,
      },
      {
        name: 'signatures',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
      {
        name: 'additionalInfo',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'SafeMultiSigTransaction',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SafeReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'initiator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owners',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'threshold',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'initializer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'fallbackHandler',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'SafeSetup',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'msgHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'SignMsg',
  },
  { type: 'fallback', stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
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
    inputs: [
      { name: 'hashToApprove', internalType: 'bytes32', type: 'bytes32' },
    ],
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
      {
        name: 'refundReceiver',
        internalType: 'address payable',
        type: 'address',
      },
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
  {
    type: 'function',
    inputs: [],
    name: 'getChainId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
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
  {
    type: 'function',
    inputs: [],
    name: 'nonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
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
      {
        name: 'paymentReceiver',
        internalType: 'address payable',
        type: 'address',
      },
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
      {
        name: 'proxy',
        internalType: 'contract GnosisSafe',
        type: 'address',
        indexed: false,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
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
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
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
      {
        name: 'paymentReceiver',
        internalType: 'address payable',
        type: 'address',
      },
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
  {
    type: 'function',
    inputs: [],
    name: 'masterCopy',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__
 */
export const useReadGnosisSafeL2 = /*#__PURE__*/ createUseReadContract({
  abi: gnosisSafeL2Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"VERSION"`
 */
export const useReadGnosisSafeL2Version = /*#__PURE__*/ createUseReadContract({
  abi: gnosisSafeL2Abi,
  functionName: 'VERSION',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"approvedHashes"`
 */
export const useReadGnosisSafeL2ApprovedHashes =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'approvedHashes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"checkNSignatures"`
 */
export const useReadGnosisSafeL2CheckNSignatures =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'checkNSignatures',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"checkSignatures"`
 */
export const useReadGnosisSafeL2CheckSignatures =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'checkSignatures',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"domainSeparator"`
 */
export const useReadGnosisSafeL2DomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'domainSeparator',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"encodeTransactionData"`
 */
export const useReadGnosisSafeL2EncodeTransactionData =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'encodeTransactionData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getChainId"`
 */
export const useReadGnosisSafeL2GetChainId =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'getChainId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getModulesPaginated"`
 */
export const useReadGnosisSafeL2GetModulesPaginated =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'getModulesPaginated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getOwners"`
 */
export const useReadGnosisSafeL2GetOwners = /*#__PURE__*/ createUseReadContract(
  { abi: gnosisSafeL2Abi, functionName: 'getOwners' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getStorageAt"`
 */
export const useReadGnosisSafeL2GetStorageAt =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'getStorageAt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getThreshold"`
 */
export const useReadGnosisSafeL2GetThreshold =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'getThreshold',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"getTransactionHash"`
 */
export const useReadGnosisSafeL2GetTransactionHash =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'getTransactionHash',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"isModuleEnabled"`
 */
export const useReadGnosisSafeL2IsModuleEnabled =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'isModuleEnabled',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"isOwner"`
 */
export const useReadGnosisSafeL2IsOwner = /*#__PURE__*/ createUseReadContract({
  abi: gnosisSafeL2Abi,
  functionName: 'isOwner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"nonce"`
 */
export const useReadGnosisSafeL2Nonce = /*#__PURE__*/ createUseReadContract({
  abi: gnosisSafeL2Abi,
  functionName: 'nonce',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"signedMessages"`
 */
export const useReadGnosisSafeL2SignedMessages =
  /*#__PURE__*/ createUseReadContract({
    abi: gnosisSafeL2Abi,
    functionName: 'signedMessages',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__
 */
export const useWriteGnosisSafeL2 = /*#__PURE__*/ createUseWriteContract({
  abi: gnosisSafeL2Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"addOwnerWithThreshold"`
 */
export const useWriteGnosisSafeL2AddOwnerWithThreshold =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'addOwnerWithThreshold',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"approveHash"`
 */
export const useWriteGnosisSafeL2ApproveHash =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'approveHash',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"changeThreshold"`
 */
export const useWriteGnosisSafeL2ChangeThreshold =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'changeThreshold',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"disableModule"`
 */
export const useWriteGnosisSafeL2DisableModule =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'disableModule',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"enableModule"`
 */
export const useWriteGnosisSafeL2EnableModule =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'enableModule',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransaction"`
 */
export const useWriteGnosisSafeL2ExecTransaction =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransaction',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransactionFromModule"`
 */
export const useWriteGnosisSafeL2ExecTransactionFromModule =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransactionFromModule',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransactionFromModuleReturnData"`
 */
export const useWriteGnosisSafeL2ExecTransactionFromModuleReturnData =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransactionFromModuleReturnData',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"removeOwner"`
 */
export const useWriteGnosisSafeL2RemoveOwner =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'removeOwner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"requiredTxGas"`
 */
export const useWriteGnosisSafeL2RequiredTxGas =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'requiredTxGas',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setFallbackHandler"`
 */
export const useWriteGnosisSafeL2SetFallbackHandler =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'setFallbackHandler',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setGuard"`
 */
export const useWriteGnosisSafeL2SetGuard =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'setGuard',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setup"`
 */
export const useWriteGnosisSafeL2Setup = /*#__PURE__*/ createUseWriteContract({
  abi: gnosisSafeL2Abi,
  functionName: 'setup',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"simulateAndRevert"`
 */
export const useWriteGnosisSafeL2SimulateAndRevert =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'simulateAndRevert',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"swapOwner"`
 */
export const useWriteGnosisSafeL2SwapOwner =
  /*#__PURE__*/ createUseWriteContract({
    abi: gnosisSafeL2Abi,
    functionName: 'swapOwner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__
 */
export const useSimulateGnosisSafeL2 = /*#__PURE__*/ createUseSimulateContract({
  abi: gnosisSafeL2Abi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"addOwnerWithThreshold"`
 */
export const useSimulateGnosisSafeL2AddOwnerWithThreshold =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'addOwnerWithThreshold',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"approveHash"`
 */
export const useSimulateGnosisSafeL2ApproveHash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'approveHash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"changeThreshold"`
 */
export const useSimulateGnosisSafeL2ChangeThreshold =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'changeThreshold',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"disableModule"`
 */
export const useSimulateGnosisSafeL2DisableModule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'disableModule',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"enableModule"`
 */
export const useSimulateGnosisSafeL2EnableModule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'enableModule',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransaction"`
 */
export const useSimulateGnosisSafeL2ExecTransaction =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransaction',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransactionFromModule"`
 */
export const useSimulateGnosisSafeL2ExecTransactionFromModule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransactionFromModule',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"execTransactionFromModuleReturnData"`
 */
export const useSimulateGnosisSafeL2ExecTransactionFromModuleReturnData =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'execTransactionFromModuleReturnData',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"removeOwner"`
 */
export const useSimulateGnosisSafeL2RemoveOwner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'removeOwner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"requiredTxGas"`
 */
export const useSimulateGnosisSafeL2RequiredTxGas =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'requiredTxGas',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setFallbackHandler"`
 */
export const useSimulateGnosisSafeL2SetFallbackHandler =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'setFallbackHandler',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setGuard"`
 */
export const useSimulateGnosisSafeL2SetGuard =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'setGuard',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"setup"`
 */
export const useSimulateGnosisSafeL2Setup =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'setup',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"simulateAndRevert"`
 */
export const useSimulateGnosisSafeL2SimulateAndRevert =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'simulateAndRevert',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `functionName` set to `"swapOwner"`
 */
export const useSimulateGnosisSafeL2SwapOwner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: gnosisSafeL2Abi,
    functionName: 'swapOwner',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__
 */
export const useWatchGnosisSafeL2Event =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: gnosisSafeL2Abi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"AddedOwner"`
 */
export const useWatchGnosisSafeL2AddedOwnerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'AddedOwner',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ApproveHash"`
 */
export const useWatchGnosisSafeL2ApproveHashEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ApproveHash',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ChangedFallbackHandler"`
 */
export const useWatchGnosisSafeL2ChangedFallbackHandlerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ChangedFallbackHandler',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ChangedGuard"`
 */
export const useWatchGnosisSafeL2ChangedGuardEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ChangedGuard',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ChangedThreshold"`
 */
export const useWatchGnosisSafeL2ChangedThresholdEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ChangedThreshold',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"DisabledModule"`
 */
export const useWatchGnosisSafeL2DisabledModuleEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'DisabledModule',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"EnabledModule"`
 */
export const useWatchGnosisSafeL2EnabledModuleEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'EnabledModule',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ExecutionFailure"`
 */
export const useWatchGnosisSafeL2ExecutionFailureEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ExecutionFailure',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ExecutionFromModuleFailure"`
 */
export const useWatchGnosisSafeL2ExecutionFromModuleFailureEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ExecutionFromModuleFailure',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ExecutionFromModuleSuccess"`
 */
export const useWatchGnosisSafeL2ExecutionFromModuleSuccessEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ExecutionFromModuleSuccess',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"ExecutionSuccess"`
 */
export const useWatchGnosisSafeL2ExecutionSuccessEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'ExecutionSuccess',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"RemovedOwner"`
 */
export const useWatchGnosisSafeL2RemovedOwnerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'RemovedOwner',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"SafeModuleTransaction"`
 */
export const useWatchGnosisSafeL2SafeModuleTransactionEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'SafeModuleTransaction',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"SafeMultiSigTransaction"`
 */
export const useWatchGnosisSafeL2SafeMultiSigTransactionEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'SafeMultiSigTransaction',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"SafeReceived"`
 */
export const useWatchGnosisSafeL2SafeReceivedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'SafeReceived',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"SafeSetup"`
 */
export const useWatchGnosisSafeL2SafeSetupEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'SafeSetup',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link gnosisSafeL2Abi}__ and `eventName` set to `"SignMsg"`
 */
export const useWatchGnosisSafeL2SignMsgEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: gnosisSafeL2Abi,
    eventName: 'SignMsg',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__
 */
export const useReadSafeProxyFactory = /*#__PURE__*/ createUseReadContract({
  abi: safeProxyFactoryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"CREATE_PROXY_TYPEHASH"`
 */
export const useReadSafeProxyFactoryCreateProxyTypehash =
  /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'CREATE_PROXY_TYPEHASH',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"DOMAIN_TYPEHASH"`
 */
export const useReadSafeProxyFactoryDomainTypehash =
  /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'DOMAIN_TYPEHASH',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadSafeProxyFactoryName = /*#__PURE__*/ createUseReadContract({
  abi: safeProxyFactoryAbi,
  functionName: 'NAME',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"computeProxyAddress"`
 */
export const useReadSafeProxyFactoryComputeProxyAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'computeProxyAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"domainSeparator"`
 */
export const useReadSafeProxyFactoryDomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'domainSeparator',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"fallbackHandler"`
 */
export const useReadSafeProxyFactoryFallbackHandler =
  /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'fallbackHandler',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"getContractBytecode"`
 */
export const useReadSafeProxyFactoryGetContractBytecode =
  /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'getContractBytecode',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"getSalt"`
 */
export const useReadSafeProxyFactoryGetSalt =
  /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'getSalt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"masterCopy"`
 */
export const useReadSafeProxyFactoryMasterCopy =
  /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'masterCopy',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"proxyCreationCode"`
 */
export const useReadSafeProxyFactoryProxyCreationCode =
  /*#__PURE__*/ createUseReadContract({
    abi: safeProxyFactoryAbi,
    functionName: 'proxyCreationCode',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__
 */
export const useWriteSafeProxyFactory = /*#__PURE__*/ createUseWriteContract({
  abi: safeProxyFactoryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"createProxy"`
 */
export const useWriteSafeProxyFactoryCreateProxy =
  /*#__PURE__*/ createUseWriteContract({
    abi: safeProxyFactoryAbi,
    functionName: 'createProxy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__
 */
export const useSimulateSafeProxyFactory =
  /*#__PURE__*/ createUseSimulateContract({ abi: safeProxyFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `functionName` set to `"createProxy"`
 */
export const useSimulateSafeProxyFactoryCreateProxy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: safeProxyFactoryAbi,
    functionName: 'createProxy',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link safeProxyFactoryAbi}__
 */
export const useWatchSafeProxyFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: safeProxyFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link safeProxyFactoryAbi}__ and `eventName` set to `"ProxyCreation"`
 */
export const useWatchSafeProxyFactoryProxyCreationEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: safeProxyFactoryAbi,
    eventName: 'ProxyCreation',
  })
