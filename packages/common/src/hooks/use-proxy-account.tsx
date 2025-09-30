import { USED_CONTRACTS } from '../constants';
import { useReadSafeProxyFactoryComputeProxyAddress } from '../types/contracts';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

export function useProxyAccount() {
    const account = useAccount();
    const {
        data: proxyAddress,
        isLoading,
        error,
    } = useReadSafeProxyFactoryComputeProxyAddress({
        address: USED_CONTRACTS.SAFE_PROXY_FACTORY,
        args: [account.address as `0x${string}`],
        query: {
            enabled: account.isConnected && !!account.address,
        },
    });

    useEffect(() => {}, [account.isConnected, account.address, isLoading, error]);

    return { ...account, proxyAddress };
}
