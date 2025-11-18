'use client';

import { USED_CONTRACTS } from '../constants';
import { useReadSafeProxyFactoryComputeProxyAddress } from '../types/contracts';
import { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';

export function useProxyAccount() {
    const account = useAccount();
    const publicClient = usePublicClient();
    const [hasProxyDeployed, setHasProxyDeployed] = useState<boolean>(false);
    const [isCheckingProxyDeployed, setIsCheckingProxyDeployed] = useState<boolean>(false);
    const {
        data: proxyAddress,
        isLoading: proxyAddressLoading,
        error: proxyAddressError,
    } = useReadSafeProxyFactoryComputeProxyAddress({
        address: USED_CONTRACTS.SAFE_PROXY_FACTORY,
        args: [account.address as `0x${string}`],
        query: {
            enabled: account.isConnected && !!account.address,
        },
    });

    useEffect(() => {
        let cancelled = false;
        const checkCode = async () => {
            if (!publicClient || !proxyAddress || !account.isConnected) {
                setHasProxyDeployed(false);
                return;
            }
            try {
                setIsCheckingProxyDeployed(true);
                const bytecode = await publicClient.getCode({ address: proxyAddress });
                if (!cancelled) setHasProxyDeployed(!!bytecode && bytecode.length > 2);
            } finally {
                if (!cancelled) setIsCheckingProxyDeployed(false);
            }
        };
        checkCode();
        return () => {
            cancelled = true;
        };
    }, [publicClient, proxyAddress, account.isConnected]);

    return { ...account, proxyAddress, proxyAddressLoading, proxyAddressError, hasProxyDeployed, isCheckingProxyDeployed };
}
