'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Loader } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@robin-pm-staking/common/lib/utils';
import { Market } from '@robin-pm-staking/common/types/market';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';

export default function InitializeMarketCard({ market, onInitialized }: { market: Market; onInitialized: () => void }) {
    const [isLoading, setIsLoading] = useState(false);

    const { isConnected, address } = useProxyAccount();

    const handleInitialize = async () => {
        try {
            if (!isConnected) throw new Error('Wallet not connected');
            if (!address) throw new Error('No account found');
            if (!market.conditionId) throw new Error('Market conditionId not found');
            setIsLoading(true);
            const res = await fetch('/api/markets/initialize', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ conditionId: market.conditionId }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Request failed');
            onInitialized();
        } catch (error) {
            toast.error('Failed to create market' + getErrorMessage(error));
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span>Activate Market</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Create this market vault on-chain to start depositing tokens</p>
                <Button className="w-full" onClick={handleInitialize} disabled={isLoading}>
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                    Activate
                </Button>
            </CardContent>
        </Card>
    );
}
