import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

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
