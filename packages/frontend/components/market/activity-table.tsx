'use client';
import type { Market } from '@robin-pm-staking/common/types/market';
import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { Activity as ActivityIcon } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { shortenAddress } from '@/lib/utils';
import { ActivityInfo } from './activity-info';
import { Activity } from '@robin-pm-staking/common/types/activity';
import { USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { VaultEvent } from '@robin-pm-staking/common/types/conract-events';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const typesMapping: Record<string, { title: string; types: VaultEvent[] }> = {
    deposits_withdrawals: {
        title: 'Deposits/Withdrawals',
        types: [VaultEvent.Deposited, VaultEvent.Withdrawn],
    },
    market_status: {
        title: 'Market Status',
        types: [
            VaultEvent.MarketFinalized,
            VaultEvent.YieldUnlockStarted,
            VaultEvent.YieldUnlockProgress,
            VaultEvent.YieldUnlocked,
            VaultEvent.HarvestedProtocolYield,
        ],
    },
    redeem: {
        title: 'Redemptions',
        types: [VaultEvent.RedeemedWinningForUSD],
    },
    harvest: {
        title: 'Yield Harvest',
        types: [VaultEvent.HarvestedYield, VaultEvent.HarvestedProtocolYield],
    },
};

export default function ActivityTable({ market }: { market: Market }) {
    const [showUserActivityOnly, setShowUserActivityOnly] = useState(false);
    const activitiesMap = useRef<Map<string, Activity>>(new Map());
    const [activities, setActivities] = useState<Activity[]>([]);
    const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const observerRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { proxyAddress } = useProxyAccount();

    const updateQueryParams = (updates: Record<string, string | null | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        const prev = searchParams.toString();
        const next = params.toString();
        if (prev !== next) {
            router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
        }
    };

    const loadQueryParams = () => {
        const userOnlyParam = searchParams.get('userOnly');
        const spUserOnly = userOnlyParam === '1' || userOnlyParam === 'true';
        if (spUserOnly !== showUserActivityOnly) setShowUserActivityOnly(spUserOnly);

        const allowedTypes = Object.keys(typesMapping);
        const typeParam = searchParams.get('activityType');
        if (typeParam && allowedTypes.includes(typeParam) && typeParam !== selectedType) {
            setSelectedType(typeParam);
        }
    };

    useEffect(() => {
        loadQueryParams();
    }, [searchParams]);

    // Fetch new activities (for polling)
    const fetchNewActivities = async () => {
        if (!market.contractAddress) return;
        try {
            const urlParams = new URLSearchParams({ vaultAddress: market.contractAddress });
            if (lastTimestamp) urlParams.set('since', lastTimestamp.toString());
            (selectedType ? typesMapping[selectedType]?.types ?? [] : []).forEach(t => urlParams.append('types', t));
            if (showUserActivityOnly && proxyAddress) urlParams.set('userAddress', proxyAddress);

            const res = await fetch(`/api/activities?${urlParams}`);
            if (!res.ok) throw new Error('Failed to fetch new activities');
            const newActivities: Activity[] = await res.json();

            if (newActivities.length > 0) {
                setActivities(prev => [...newActivities, ...prev]);
                setLastTimestamp(newActivities[0]?.timestamp ?? null);
            }
        } catch (error) {
            console.error('Error fetching new activities:', error);
            toast.error('Failed to fetch activities');
        }
    };

    // Fetch historical activities (for infinite scroll)
    const fetchHistoricalActivities = async () => {
        if (!market.contractAddress) return;
        try {
            setLoadingMore(true);
            const urlParams = new URLSearchParams({ vaultAddress: market.contractAddress });
            if (activities.length > 0) urlParams.set('skip', activities.length.toString());
            (selectedType ? typesMapping[selectedType]?.types ?? [] : []).forEach(t => urlParams.append('types', t));
            if (showUserActivityOnly && proxyAddress) urlParams.set('userAddress', proxyAddress);

            const res = await fetch(`/api/activities?${urlParams}`);
            if (!res.ok) throw new Error('Failed to fetch historical activities');
            const newActivities: Activity[] = await res.json();

            if (newActivities.length > 0) {
                newActivities.forEach(activity => {
                    activitiesMap.current.set(activity.id, activity);
                });
                const sortedActivities = [...activitiesMap.current.values()].sort((a, b) => b.timestamp - a.timestamp);
                setActivities(sortedActivities);
                setLastTimestamp(sortedActivities[0]?.timestamp ?? null);
                setHasMore(newActivities.length === 10);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching historical activities:', error);
            toast.error('Failed to fetch activities');
        } finally {
            setLoadingMore(false);
        }
    };

    //Polling for new activities every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNewActivities();
        }, 4000);
        return () => clearInterval(interval);
    }, [market.contractAddress, lastTimestamp]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0]?.isIntersecting && hasMore && !loadingMore) {
                    fetchHistoricalActivities();
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMore, lastTimestamp]);

    // Reset state when filters change
    useEffect(() => {
        setActivities([]);
        activitiesMap.current.clear();
        setLastTimestamp(null);
        setHasMore(true);
    }, [selectedType, showUserActivityOnly]);

    // Fetch data when filters change or initial load
    useEffect(() => {
        fetchHistoricalActivities();
    }, [market.contractAddress]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <ActivityIcon className="w-5 h-5" />
                        <span>Recent Activities</span>
                    </CardTitle>
                    <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-4">
                        <Select
                            value={selectedType ?? 'all'}
                            onValueChange={(value: string) => {
                                const valid = Object.keys(typesMapping);
                                const next = valid.includes(value) ? value : null;
                                setSelectedType(next);
                                updateQueryParams({ activityType: next === null ? null : next });
                            }}
                        >
                            <SelectTrigger className="w-50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {Object.keys(typesMapping).map(key => (
                                    <SelectItem key={key} value={key}>
                                        {typesMapping[key].title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2 md:mt-0 mt-2">
                            <Switch
                                id="user-activity"
                                checked={showUserActivityOnly}
                                onCheckedChange={(checked: boolean) => {
                                    setShowUserActivityOnly(checked);
                                    updateQueryParams({ userOnly: checked ? '1' : null });
                                }}
                            />
                            <Label htmlFor="user-activity" className="text-sm">
                                My activity only
                            </Label>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div ref={tableRef} className="space-y-3 overflow-y-auto h-[300px]">
                    {activities.map((activity, idx) => (
                        <div key={`${activity.id}-${idx}`} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <div>
                                    <p className="font-medium text-sm">
                                        {shortenAddress(activity.userAddress)}
                                        {activity.userAddress === proxyAddress && <span className="text-primary ml-1">(You)</span>}
                                    </p>
                                    <ActivityInfo activity={activity} market={market} />
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline" className="mb-1">
                                    {activity.type}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p>
                                <Link
                                    href={`${USED_CONTRACTS.EXPLORER_URL}/tx/${activity.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                >
                                    View Tx
                                </Link>
                            </div>
                        </div>
                    ))}
                    {loadingMore && <Skeleton className="h-20 mt-2 w-full" />}
                    {hasMore && <div ref={observerRef} className="h-4" />}
                    {activities.length === 0 && <p className="text-center text-muted-foreground py-4">No activity yet.</p>}
                </div>
            </CardContent>
        </Card>
    );
}
