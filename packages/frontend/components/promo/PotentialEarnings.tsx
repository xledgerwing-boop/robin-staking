'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ValueState } from '@/components/value-state';
import { PROMOTION_VAULT_INFOS, USED_CONTRACTS, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/src/constants';
import { useProxyAccount } from '@robin-pm-staking/common/src/hooks/use-proxy-account';
import { formatUnits, formatUnitsLocale } from '@robin-pm-staking/common/lib/utils';
import { usePromotionVaultInfo } from '@/hooks/use-promotion-vault-info';
import { usePromotionVaultUserInfo } from '@/hooks/use-promotion-vault-user-info';
import { DateTime } from 'luxon';

export default function PotentialEarnings() {
    const VAULT = USED_CONTRACTS.PROMOTION_VAULT as `0x${string}`;
    const { proxyAddress, isConnected, isConnecting } = useProxyAccount();
    const { apyBps, apyBpsLoading, apyBpsError, campaignEndTimestamp, campaignEndTimestampLoading, campaignEndTimestampError } =
        usePromotionVaultInfo(VAULT);
    const { userStakeableValue, userStakeableValueLoading, userStakeableValueError } = usePromotionVaultUserInfo(
        VAULT,
        proxyAddress as `0x${string}`
    );

    const totalTokens = userStakeableValue?.[0];
    const totalUsd = userStakeableValue?.[1];
    const eligibleUsd = userStakeableValue?.[2];

    // Effective APY BPS = base BPS + EXTRA_APY_BPS weighted by eligible value fraction
    const extraBps = PROMOTION_VAULT_INFOS.EXTRA_APY_BPS ?? 0n;
    const effectiveApyBps =
        totalUsd == null || eligibleUsd == null || apyBps == null
            ? undefined
            : totalUsd > 0n
            ? (apyBps ?? 0n) + (extraBps * eligibleUsd) / totalUsd
            : apyBps ?? 0n;

    // Potential yield over remaining campaign time: stakeUsd * effectiveBps * timeLeft / (10000 * secondsPerYear)
    const nowSec = BigInt(Math.floor(Date.now() / 1000));
    const endSec = campaignEndTimestamp ?? 0n;
    const timeLeftSec = endSec > nowSec ? endSec - nowSec : 0n;
    const secondsPerYear = 365n * 24n * 3600n;
    const potentialYield =
        totalUsd == null || effectiveApyBps == null ? undefined : (totalUsd * effectiveApyBps * timeLeftSec) / (10_000n * secondsPerYear);

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
                            <ValueState
                                value={totalUsd == null ? undefined : `$${formatUnitsLocale(totalUsd, UNDERYLING_DECIMALS, 2)}`}
                                loading={userStakeableValueLoading}
                                error={!!userStakeableValueError}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            <ValueState
                                value={totalTokens == null ? undefined : `${formatUnitsLocale(totalTokens, UNDERYLING_DECIMALS, 2)} tokens`}
                                loading={userStakeableValueLoading}
                                error={!!userStakeableValueError}
                            />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold select-none">×</div>
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">APY</div>
                        <div className="text-3xl md:text-4xl font-extrabold">
                            <ValueState
                                value={effectiveApyBps == null ? undefined : `${formatUnits(effectiveApyBps * 100n, 4, 2)}%`}
                                loading={apyBpsLoading || userStakeableValueLoading}
                                error={!!apyBpsError || !!userStakeableValueError}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">annualized</div>
                    </div>
                    <div className="text-3xl font-extrabold select-none">=</div>
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Potential yield</div>
                        <div className="text-3xl md:text-4xl font-extrabold">
                            <ValueState
                                value={potentialYield == null ? undefined : `$${formatUnitsLocale(potentialYield, UNDERYLING_DECIMALS, 2)}`}
                                loading={apyBpsLoading || userStakeableValueLoading}
                                error={!!apyBpsError || !!userStakeableValueError}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            <ValueState
                                value={
                                    campaignEndTimestamp == null
                                        ? undefined
                                        : 'by ' + DateTime.fromMillis(Number(campaignEndTimestamp) * 1000).toLocaleString(DateTime.DATE_MED)
                                }
                                loading={campaignEndTimestampLoading}
                                error={!!campaignEndTimestampError}
                            />
                        </div>
                    </div>
                </div>
                {!isConnected && !isConnecting && (
                    <div className="mt-4 text-center text-md text-secondary">Connect wallet to see potential earnings</div>
                )}
            </CardContent>
        </Card>
    );
}
