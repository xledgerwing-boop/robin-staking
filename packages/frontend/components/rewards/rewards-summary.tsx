'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FEEDBACK_REWARD_PONTS } from '@/lib/constants';

export function RewardsSummary({ onHomepage = false }: { onHomepage?: boolean }) {
    const { address, proxyAddress, isConnected } = useProxyAccount();
    const [loading, setLoading] = useState(false);
    const [points, setPoints] = useState(0);
    const [hasDeposit, setHasDeposit] = useState<boolean>(false);
    const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState<boolean>(false);

    useEffect(() => {
        const run = async () => {
            if (!isConnected || !address || !proxyAddress) {
                setLoading(false);
                setPoints(0);
                setHasSubmittedFeedback(false);
                setHasDeposit(false);
                return;
            }
            try {
                setLoading(true);
                const res = await fetch(`/api/rewards?address=${address}`);
                const data = (await res.json()) as { points: number; hasSubmittedFeedback: boolean };
                setPoints(data.points ?? 0);
                setHasSubmittedFeedback(data.hasSubmittedFeedback ?? false);

                const res2 = await fetch(`/api/rewards/eligibility?proxyAddress=${proxyAddress}`);
                const data2 = (await res2.json()) as { hasDeposit: boolean };
                setHasDeposit(!!data2.hasDeposit);
            } catch {
                setHasDeposit(false);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [isConnected, address, proxyAddress]);

    const progressPercent = useMemo(() => {
        const completed = (hasDeposit ? 1 : 0) + (hasSubmittedFeedback ? 1 : 0);
        return (completed / 2) * 100;
    }, [hasDeposit, hasSubmittedFeedback]);

    return (
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Beta Reward Points
                        {onHomepage && (
                            <Link className="text-primary underline" href="/rewards">
                                View
                            </Link>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>{loading ? <Skeleton className="h-8 w-24" /> : <div className="text-4xl font-bold">{points}</div>}</CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Staking Feedback: {FEEDBACK_REWARD_PONTS} points</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex gap-4">
                            <div
                                className={cn(
                                    'flex-1 p-3 border rounded-lg flex items-start justify-between',
                                    !hasDeposit && !loading ? 'animate-pulse' : ''
                                )}
                            >
                                <div className="w-full">
                                    <div className="relative font-medium flex items-start justify-between w-full">
                                        1. Make a deposit in any vault
                                        <div className="lg:static absolute right-[-25px] top-[-20px] rotate-20 lg:rotate-0">
                                            {loading ? (
                                                <Skeleton className="h-6 w-16" />
                                            ) : (
                                                <Badge variant={hasDeposit ? 'default' : 'outline'}>{hasDeposit ? 'Done' : 'Pending'}</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">Detected via on-chain activity of your proxy address.</div>
                                </div>
                            </div>
                            <div
                                className={cn(
                                    'flex-1 p-3 border rounded-lg flex items-start justify-between',
                                    !hasSubmittedFeedback && !loading && hasDeposit
                                        ? 'animate-pulse'
                                        : hasSubmittedFeedback
                                        ? 'opacity-100'
                                        : 'opacity-50'
                                )}
                            >
                                <div className="w-full">
                                    <div className="relative font-medium flex items-start justify-between w-full">
                                        2. Submit feedback form
                                        <div className="lg:static absolute right-[-25px] top-[-20px] rotate-20 lg:rotate-0">
                                            {hasSubmittedFeedback ? (
                                                <Badge>Done</Badge>
                                            ) : (
                                                <Button size="sm" className="hidden lg:block" disabled={!hasDeposit || !isConnected || !address}>
                                                    <Link href="/rewards/feedback">Fill Form</Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">Provide feedback after staking to receive points.</div>
                                    {!hasSubmittedFeedback && (
                                        <Button className="lg:hidden block mt-2" disabled={!hasDeposit || !isConnected || !address}>
                                            <Link href="/rewards/feedback">Fill Form</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="pt-1">
                            <Progress value={progressPercent} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
