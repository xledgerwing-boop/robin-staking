'use client';

import { ReactNode } from 'react';
import { isAddressBlocked } from '@/lib/blocked';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';

export function BlockedGuard({ children }: { children: ReactNode }) {
    const { address, proxyAddress, status } = useProxyAccount();
    const isConnected = status === 'connected';
    const blocked = isConnected && (isAddressBlocked(address) || isAddressBlocked(proxyAddress));

    if (blocked) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
                    <h2 className="text-xl font-bold text-destructive">Access blocked</h2>
                    <p className="mt-2 text-sm text-muted-foreground">This wallet address is not permitted to use this application.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default BlockedGuard;
