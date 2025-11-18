'use client';

import { ValueState } from '@/components/value-state';
import { GENESIS_VAULT_INFOS, USED_CONTRACTS, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/src/constants';
import { useProxyAccount } from '@robin-pm-staking/common/src/hooks/use-proxy-account';
import { formatUnitsLocale } from '@robin-pm-staking/common/lib/utils';
import { useGenesisVaultInfo } from '@/hooks/use-genesis-vault-info';
import { useGenesisVaultUserInfo } from '@/hooks/use-genesis-vault-user-info';
import { DateTime } from 'luxon';
import { ArrowBigRight, CircleSmall } from 'lucide-react';
import Link from 'next/link';

export default function PotentialEarnings() {
    const VAULT = USED_CONTRACTS.GENESIS_VAULT as `0x${string}`;
    const { proxyAddress } = useProxyAccount();
    const { apyBps, apyBpsLoading, apyBpsError, campaignEndTimestamp, campaignEndTimestampLoading, campaignEndTimestampError } =
        useGenesisVaultInfo(VAULT);
    const { userStakeableValue, userStakeableValueLoading, userStakeableValueError } = useGenesisVaultUserInfo(VAULT, proxyAddress as `0x${string}`);

    // Example values when wallet not connected: $1000 stakable
    const exampleTotalUsd = 1000n * 10n ** BigInt(UNDERYLING_DECIMALS); // $1000 in 6 decimals
    const exampleEligibleUsd = 0n; // Assume 50% eligible for example
    const exampleTotalTokens = exampleTotalUsd * 2n; // Approximate 1:1 for example

    const totalTokens = proxyAddress ? userStakeableValue?.[0] : exampleTotalTokens;
    const totalUsd = proxyAddress ? userStakeableValue?.[1] : exampleTotalUsd;
    const eligibleUsd = proxyAddress ? userStakeableValue?.[2] : exampleEligibleUsd;

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

    // Calculate non-eligible yield and Robin points
    // Non-eligible USD = totalUsd - eligibleUsd
    const nonEligibleUsd = totalUsd != null && eligibleUsd != null ? (totalUsd > eligibleUsd ? totalUsd - eligibleUsd : 0n) : undefined;
    // Non-eligible yield = (nonEligibleUsd * baseApyBps * timeLeftSec) / (10_000n * secondsPerYear)
    const nonEligibleYield =
        nonEligibleUsd == null || apyBps == null ? undefined : (nonEligibleUsd * apyBps * timeLeftSec) / (10_000n * secondsPerYear);
    // Robin points = (nonEligibleYield / $500 pool) * 50,000 points
    const robinPointsPoolUsd = 500n * 10n ** BigInt(UNDERYLING_DECIMALS); // $500 in 6 decimals
    const robinPoints = nonEligibleYield == null ? undefined : (nonEligibleYield * 50_000n) / robinPointsPoolUsd;

    return (
        <div className="pmx-gradient-border mb-4 mt-12">
            <div className="pmx-gradient-inner p-4">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">{proxyAddress ? 'Stake up to' : 'Example: Stake'}</div>
                        <div className="text-lg md:text-xl font-extrabold">
                            <ValueState
                                value={totalUsd == null ? undefined : `$${formatUnitsLocale(totalUsd, UNDERYLING_DECIMALS, 0)}`}
                                loading={apyBpsLoading || userStakeableValueLoading}
                                error={!!userStakeableValueError}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            <ValueState
                                value={totalTokens == null ? undefined : `${formatUnitsLocale(totalTokens, UNDERYLING_DECIMALS, 0)} tokens`}
                                loading={apyBpsLoading || userStakeableValueLoading}
                                error={!!userStakeableValueError}
                            />
                        </div>
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
                    <CircleSmall className="size-6 text-muted-foreground mt-1" />
                    <Link href="/rewards" className="relative flex-1 text-center sparkle-container hover:opacity-80 transition-opacity">
                        <span className="sparkle sparkle-1">✨</span>
                        <span className="sparkle sparkle-2">✨</span>
                        <span className="sparkle sparkle-3">✨</span>
                        <div className="text-sm text-muted-foreground mb-1">Earn Rewards</div>
                        <div className="text-lg md:text-xl font-extrabold">
                            <ValueState
                                value={robinPoints == null ? undefined : formatUnitsLocale(robinPoints, 0, 0)}
                                loading={apyBpsLoading || userStakeableValueLoading || campaignEndTimestampLoading}
                                error={!!apyBpsError || !!userStakeableValueError || !!campaignEndTimestampError}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Robin Points</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
