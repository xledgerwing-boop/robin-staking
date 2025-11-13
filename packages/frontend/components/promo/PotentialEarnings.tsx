'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ValueState } from '@/components/value-state';
import { useAccount } from 'wagmi';
import { MOCK_MARKETS, calcValue, formatUsd } from './utils';

export default function PotentialEarnings({ apyPct }: { apyPct: number }) {
    const { isConnected } = useAccount();

    const walletTotals = useMemo(() => {
        const totalTokens = MOCK_MARKETS.reduce((acc, m) => acc + (m.walletAmount || 0), 0);
        const totalUsd = MOCK_MARKETS.reduce((acc, m) => acc + calcValue(m.walletAmount || 0, m.priceUsd), 0);
        return { totalTokens, totalUsd };
    }, []);

    const campaignEnd = useMemo(() => new Date(Date.now() + 60 * 24 * 3600 * 1000), []);
    const timeLeftYears = useMemo(() => {
        const ms = campaignEnd.getTime() - Date.now();
        return Math.max(0, ms) / (365 * 24 * 3600 * 1000);
    }, [campaignEnd]);

    const stakeUsd = isConnected ? walletTotals.totalUsd : 0;
    const stakeTokens = isConnected ? walletTotals.totalTokens / 1_000_000 : 0;
    const potentialYieldUsd = isConnected ? stakeUsd * (apyPct / 100) * timeLeftYears : 0;

    const endLabel = useMemo(() => campaignEnd.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }), [campaignEnd]);

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-xl">Your potential earnings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">You can stake up to</div>
                        <div className="text-3xl md:text-4xl font-extrabold">
                            <ValueState value={`$${formatUsd(stakeUsd, 2)}`} loading={false} error={false} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            <ValueState value={`${formatUsd(stakeTokens, 2)} tokens`} loading={false} error={false} />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold select-none">×</div>
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">APY</div>
                        <div className="text-3xl md:text-4xl font-extrabold">
                            <ValueState value={`${apyPct.toFixed(2)}%`} loading={false} error={false} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">annualized</div>
                    </div>
                    <div className="text-3xl font-extrabold select-none">=</div>
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Potential yield</div>
                        <div className="text-3xl md:text-4xl font-extrabold">
                            <ValueState value={`$${formatUsd(potentialYieldUsd, 2)}`} loading={false} error={false} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">by {endLabel}</div>
                    </div>
                </div>
                {!isConnected && <div className="mt-4 text-center text-sm text-muted-foreground">Connect wallet to see potential earnings</div>}
            </CardContent>
        </Card>
    );
}
