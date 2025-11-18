'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { RewardsSummary } from '@/components/rewards/rewards-summary';

type RewardActivity = {
    id: string;
    userAddress: string;
    points: number;
    type: string;
    createdAt: string;
    details?: Record<string, unknown> | null;
};

export default function RewardsPage() {
    const { address, isConnected } = useProxyAccount();
    const [loading, setLoading] = useState(false);
    const [activities, setActivities] = useState<RewardActivity[]>([]);

    useEffect(() => {
        const run = async () => {
            if (!isConnected || !address) {
                setLoading(false);
                setActivities([]);
                return;
            }
            try {
                setLoading(true);
                const res = await fetch(`/api/rewards/activities?address=${address}`);
                const data = (await res.json()) as { activities: RewardActivity[] };
                setActivities(data.activities ?? []);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [isConnected, address]);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Rewards</h1>
                    <p className="text-muted-foreground">Earn points by completing actions. Points can be redeemed in a future token sale.</p>
                </div>

                <RewardsSummary />

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
