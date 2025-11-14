'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { USED_CONTRACTS, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/src/constants';
import { formatUnits, formatUnitsLocale } from '@robin-pm-staking/common/lib/utils';
import { usePromotionVaultInfo } from '@/hooks/use-promotion-vault-info';

export default function VaultCapacity() {
    const VAULT = USED_CONTRACTS.PROMOTION_VAULT as `0x${string}`;
    let { totalValueUsd, tvlCapUsd } = usePromotionVaultInfo(VAULT);

    const capReached = useMemo(() => (totalValueUsd ?? 0n) >= (tvlCapUsd ?? 0n) && (tvlCapUsd ?? 0n) > 0n, [totalValueUsd, tvlCapUsd]);
    const capPctBps = useMemo(() => (tvlCapUsd ? ((totalValueUsd ?? 0n) * 10_000n * 100n) / (tvlCapUsd ?? 1n) : 0n), [totalValueUsd, tvlCapUsd]);

    return (
        <div className="">
            <Progress value={Number(capPctBps / 10_000n)} className="h-8" />
            <div className="flex items-center justify-between mb-2 mt-1">
                <span className="text-sm text-muted-foreground">TVL Cap</span>
                <span className="text-sm font-medium">
                    ${formatUnitsLocale(totalValueUsd ?? 0n, UNDERYLING_DECIMALS, 0)} / ${formatUnitsLocale(tvlCapUsd ?? 0n, UNDERYLING_DECIMALS, 0)}{' '}
                    ({formatUnits(capPctBps, 4, 0)}%)
                </span>
            </div>
            {capReached && (
                <div className="mt-3">
                    <Button className="w-full" variant="outline">
                        Register Interest
                    </Button>
                </div>
            )}
        </div>
    );
}
