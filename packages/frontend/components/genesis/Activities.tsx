'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader, PlusCircle, MinusCircle, TrendingUp } from 'lucide-react';
import { USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { GenesisVaultEvent } from '@robin-pm-staking/common/src/types/genesis-events';
import { GenesisActivity, GenesisActivityRow, GenesisActivityRowToActivity } from '@robin-pm-staking/common/src/types/genesis-activity';
import { formatDistanceToNow } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { toast } from 'sonner';

export default function Activities() {
    const activitiesMap = useRef<Map<string, GenesisActivity>>(new Map());
    const [activities, setActivities] = useState<GenesisActivity[]>([]);
    const [fetchingMore, setFetchingMore] = useState(false);
    const feedRef = useRef<HTMLDivElement>(null);
    const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [showUserActivityOnly, setShowUserActivityOnly] = useState(false);
    const { proxyAddress } = useProxyAccount();

    useEffect(() => {
        fetchHistoricalActivities();
    }, [lastTimestamp, showUserActivityOnly]);

    const handleFetchMore = () => {
        if (fetchingMore) return;
        setFetchingMore(true);
        fetchHistoricalActivities().finally(() => setFetchingMore(false));
    };

    useEffect(() => {
        const el = feedRef.current;
        if (!el) return;
        const onScroll = () => {
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
                handleFetchMore();
            }
        };
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, [activities, fetchingMore]);

    // Poll every 4s for new activities
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNewActivities();
        }, 4000);
        return () => clearInterval(interval);
    }, [lastTimestamp, showUserActivityOnly]);

    function formatTitle(type: GenesisVaultEvent) {
        return type.toString().replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    }

    function renderIcon(type: GenesisVaultEvent) {
        if (type === GenesisVaultEvent.Deposit || type === GenesisVaultEvent.MarketAdded || type === GenesisVaultEvent.BatchDeposit)
            return <PlusCircle className="w-4 h-4 text-primary" />;
        if (type === GenesisVaultEvent.Withdraw || type === GenesisVaultEvent.MarketEnded || type === GenesisVaultEvent.BatchWithdraw)
            return <MinusCircle className="w-4 h-4 text-primary" />;
        return <TrendingUp className="w-4 h-4 text-primary" />;
    }

    // Fetch new activities (for polling)
    const fetchNewActivities = async () => {
        const vaultAddress = USED_CONTRACTS.GENESIS_VAULT;
        try {
            const urlParams = new URLSearchParams({ vaultAddress: vaultAddress });
            if (lastTimestamp) urlParams.set('since', lastTimestamp.toString());
            if (showUserActivityOnly && proxyAddress) urlParams.set('userAddress', proxyAddress.toLowerCase());

            const res = await fetch(`/api/genesis/activities?${urlParams}`);
            if (!res.ok) throw new Error('Failed to fetch new activities');
            const newActivities: GenesisActivity[] = ((await res.json()) as GenesisActivityRow[]).map(GenesisActivityRowToActivity);

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
        const vaultAddress = USED_CONTRACTS.GENESIS_VAULT;
        try {
            const urlParams = new URLSearchParams({ vaultAddress: vaultAddress });
            if (activities.length > 0) urlParams.set('skip', activities.length.toString());
            if (showUserActivityOnly && proxyAddress) urlParams.set('userAddress', proxyAddress.toLowerCase());

            const res = await fetch(`/api/genesis/activities?${urlParams}`);
            if (!res.ok) throw new Error('Failed to fetch historical activities');
            const newActivities: GenesisActivity[] = ((await res.json()) as GenesisActivityRow[]).map(GenesisActivityRowToActivity);

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
        }
    };

    useEffect(() => {
        setActivities([]);
        activitiesMap.current.clear();
        setLastTimestamp(null);
        setHasMore(true);
    }, [showUserActivityOnly]);

    return (
        <div>
            <div className="flex items-center space-x-2 mb-2">
                <Switch id="genesis-user-activity" checked={showUserActivityOnly} onCheckedChange={setShowUserActivityOnly} />
                <Label htmlFor="genesis-user-activity" className="text-sm">
                    My activity only
                </Label>
            </div>
            <div className="relative">
                <div ref={feedRef} className="max-h-96 overflow-y-auto pr-2">
                    <div className="space-y-3">
                        {activities.map(a => (
                            <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">{renderIcon(a.type)}</div>
                                    <div className="text-sm">
                                        <div className="font-medium">{formatTitle(a.type)}</div>
                                        <div className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(a.timestamp * 1000), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={`${USED_CONTRACTS.EXPLORER_URL}/tx/${a.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:underline"
                                >
                                    View
                                </a>
                            </div>
                        ))}
                        {fetchingMore && (
                            <div className="w-full flex items-center justify-center py-3">
                                <Loader className="w-4 h-4 animate-spin" />
                            </div>
                        )}
                        {!fetchingMore && activities.length === 0 && <p className="text-center text-muted-foreground py-4">No activity yet.</p>}
                    </div>
                </div>
                <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-12"
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(var(--background), 0.6) 40%, rgba(var(--background), 1) 100%)',
                    }}
                />
            </div>
        </div>
    );
}
