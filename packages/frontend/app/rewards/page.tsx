'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { USED_CONTRACTS, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/src/constants';
import { useGenesisVaultUserInfo } from '@/hooks/use-genesis-vault-user-info';
import { formatUnitsLocale } from '@robin-pm-staking/common/lib/utils';
import { ValueState } from '@/components/value-state';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { FEEDBACK_REWARD_PONTS } from '@/lib/constants';
import { RewardsFormMethod } from '@/components/rewards/rewards-form-method';
import { useReadRobinGenesisVaultCampaignEndTimestamp } from '@robin-pm-staking/common/types/contracts-genesis';
import { useReadRobinGenesisVaultViewCurrentApyBps } from '@robin-pm-staking/common/types/contracts-genesis';

type RewardActivity = {
    id: string;
    userAddress: string;
    points: number;
    type: string;
    createdAt: string;
    details?: Record<string, unknown> | null;
};

export default function RewardsPage() {
    const { address, proxyAddress, isConnected } = useProxyAccount();
    const [loading, setLoading] = useState(false);
    const [activities, setActivities] = useState<RewardActivity[]>([]);
    const [currentPoints, setCurrentPoints] = useState(0);
    const [hasClaimed, setHasClaimed] = useState<boolean | null>(null);
    const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState<boolean>(false);

    const VAULT = USED_CONTRACTS.GENESIS_VAULT as `0x${string}`;
    const {
        calculateRobinPoints,
        userEstimatedEarnings,
        userEstimatedEarningsLoading,
        userCurrentValues,
        userCurrentValuesLoading,
        userStakeableValue,
        userStakeableValueLoading,
    } = useGenesisVaultUserInfo(VAULT, proxyAddress as `0x${string}`);

    const hasStaked = (userCurrentValues?.[0] ?? 0n) > 0n;
    const stakedUsd = userCurrentValues?.[0];
    const stakeableUsd = userStakeableValue?.[1];

    const { data: apyBps } = useReadRobinGenesisVaultViewCurrentApyBps({
        address: USED_CONTRACTS.GENESIS_VAULT,
        args: [],
    });

    const { data: campaignEndTimestamp } = useReadRobinGenesisVaultCampaignEndTimestamp({
        address: USED_CONTRACTS.GENESIS_VAULT,
        args: [],
    });

    const { potentialRobinPoints, dailyRobinPoints, outstandingRobinPoints } = calculateRobinPoints(apyBps, campaignEndTimestamp);

    useEffect(() => {
        const run = async () => {
            if (!isConnected || !address) {
                setLoading(false);
                setActivities([]);
                setCurrentPoints(0);
                setHasClaimed(null);
                return;
            }
            try {
                setLoading(true);
                const res = await fetch(`/api/rewards?address=${address}`);
                const data = (await res.json()) as { points: number; hasSubmittedFeedback: boolean };
                setCurrentPoints(data.points ?? 0);
                setHasSubmittedFeedback(data.hasSubmittedFeedback ?? false);

                const res2 = await fetch(`/api/rewards/activities?address=${address}`);
                const data2 = (await res2.json()) as { activities: RewardActivity[] };
                setActivities(data2.activities ?? []);

                if (proxyAddress) {
                    const res3 = await fetch(`/api/rewards/genesis-outstanding?proxyAddress=${proxyAddress}`);
                    const data3 = (await res3.json()) as { hasClaimed: boolean };
                    setHasClaimed(data3.hasClaimed ?? false);
                }
            } catch {
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [isConnected, address, proxyAddress]);

    const outstandingPoints = hasClaimed ? 0n : outstandingRobinPoints ?? 0n;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Rewards</h1>
                    <p className="text-muted-foreground">Earn points by completing actions. Points can be redeemed in a future token sale.</p>
                </div>

                {/* Current Points and Outstanding Points */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Points</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-12 w-24" /> : <div className="text-4xl font-bold">{currentPoints}</div>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Outstanding Points (Genesis Vault)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {userEstimatedEarnings == null ? (
                                <div className="text-4xl font-bold">0</div>
                            ) : hasClaimed === null || userEstimatedEarningsLoading ? (
                                <Skeleton className="h-12 w-24" />
                            ) : (
                                <div className="text-4xl font-bold">{formatUnitsLocale(outstandingPoints, 0, 0)}</div>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                                {hasClaimed
                                    ? 'Already claimed - these points have been earned'
                                    : 'Will be earned when you claim yield from Genesis vault'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Two Ways of Earning */}
                <div className="space-y-6 mb-8">
                    {/* Method 1: Genesis Vault */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Method 1: Genesis Vault Deposit</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <div className="text-sm text-muted-foreground mb-2">Potential Points</div>
                                    <div className="text-2xl font-bold">
                                        {potentialRobinPoints == null ? (
                                            '-'
                                        ) : (
                                            <ValueState
                                                value={formatUnitsLocale(potentialRobinPoints, 0, 0)}
                                                loading={userStakeableValueLoading}
                                                error={false}
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Points you can earn by staking your available tokens</p>
                                    {stakeableUsd != null && stakeableUsd > 0n && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Stakeable: ${formatUnitsLocale(stakeableUsd, UNDERYLING_DECIMALS, 0)}
                                        </p>
                                    )}
                                </div>
                                {hasStaked && (
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-2">Earning Per Day</div>
                                        <div className="text-2xl font-bold">
                                            <ValueState
                                                value={dailyRobinPoints == null ? undefined : formatUnitsLocale(dailyRobinPoints, 0, 0)}
                                                loading={userCurrentValuesLoading}
                                                error={false}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Current daily earning rate from staked funds</p>
                                        {stakedUsd != null && stakedUsd > 0n && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Staked: ${formatUnitsLocale(stakedUsd, UNDERYLING_DECIMALS, 0)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="pt-2">
                                <Button asChild>
                                    <Link href="/">
                                        <span>Go to Genesis Vault</span>
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Method 2: Staking + Feedback */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Method 2: Staking + Feedback - {FEEDBACK_REWARD_PONTS} points</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RewardsFormMethod hasSubmittedFeedback={hasSubmittedFeedback} />
                        </CardContent>
                    </Card>
                </div>

                {/* Reward Activities */}
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Reward Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-17 w-full" />
                            ) : activities.length === 0 ? (
                                <p className="text-muted-foreground">No reward activities yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {activities.map(a => (
                                        <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{a.type}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(Number(a.createdAt)).toLocaleString('en-US', {
                                                        dateStyle: 'medium',
                                                        timeStyle: undefined,
                                                    })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-primary">+{a.points}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
