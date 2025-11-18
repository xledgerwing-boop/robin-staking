'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ValueState } from '@/components/value-state';
import { GENESIS_VAULT_INFOS, USED_CONTRACTS, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/src/constants';
import { useProxyAccount } from '@robin-pm-staking/common/src/hooks/use-proxy-account';
import { formatUnits, formatUnitsLocale } from '@robin-pm-staking/common/lib/utils';
import { useGenesisVaultInfo } from '@/hooks/use-genesis-vault-info';
import { useGenesisVaultUserInfo } from '@/hooks/use-genesis-vault-user-info';
import { DateTime } from 'luxon';
import { ArrowBigRight, Circle, CircleSmall } from 'lucide-react';

export default function PotentialEarnings() {
    const VAULT = USED_CONTRACTS.GENESIS_VAULT as `0x${string}`;
    const { proxyAddress, isConnected, isConnecting } = useProxyAccount();
    const { apyBps, apyBpsLoading, apyBpsError, campaignEndTimestamp, campaignEndTimestampLoading, campaignEndTimestampError } =
        useGenesisVaultInfo(VAULT);
    const { userStakeableValue, userStakeableValueLoading, userStakeableValueError } = useGenesisVaultUserInfo(VAULT, proxyAddress as `0x${string}`);

    const totalTokens = userStakeableValue?.[0];
    const totalUsd = userStakeableValue?.[1];
    const eligibleUsd = userStakeableValue?.[2];

    // Effective APY BPS = base BPS + EXTRA_APY_BPS weighted by eligible value fraction
    const extraBps = GENESIS_VAULT_INFOS.EXTRA_APY_BPS ?? 0n;
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
        <div className="pmx-gradient-border mb-4 mt-12">
            <div className="pmx-gradient-inner p-4">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Stake up to</div>
                        <div className="text-lg md:text-xl font-extrabold">
                            <ValueState
                                value={totalUsd == null ? undefined : `$${formatUnitsLocale(totalUsd, UNDERYLING_DECIMALS, 0)}`}
                                loading={userStakeableValueLoading}
                                error={!!userStakeableValueError}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            <ValueState
                                value={totalTokens == null ? undefined : `${formatUnitsLocale(totalTokens, UNDERYLING_DECIMALS, 0)} tokens`}
                                loading={userStakeableValueLoading}
                                error={!!userStakeableValueError}
                            />
                        </div>
                    </div>
                    <CircleSmall className="size-6 text-muted-foreground mt-1" />
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">APY</div>
                        <div className="text-lg md:text-xl font-extrabold">
                            <ValueState
                                value={effectiveApyBps == null ? undefined : `${formatUnits(effectiveApyBps * 100n, 4, 0)}%`}
                                loading={apyBpsLoading || userStakeableValueLoading}
                                error={!!apyBpsError || !!userStakeableValueError}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">annualized</div>
                    </div>
                    <ArrowBigRight className="size-6 text-muted-foreground mt-1" />
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Potential yield</div>
                        <div className="text-lg md:text-xl font-extrabold">
                            <ValueState
                                value={potentialYield == null ? undefined : `$${formatUnitsLocale(potentialYield, UNDERYLING_DECIMALS, 0)}`}
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
            </div>
        </div>
    );
}
