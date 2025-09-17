'use client';
import { MarketWithEvent } from '@/types/market';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Activities({ market: _market }: { market: MarketWithEvent }) {
    const [showUserActivityOnly, setShowUserActivityOnly] = useState(false);
    const [activityTypeFilter, setActivityTypeFilter] = useState('all');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    void _market;

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
            router.replace(`${pathname}${next ? `?${next}` : ''}`);
        }
    };

    const loadQueryParams = () => {
        const userOnlyParam = searchParams.get('userOnly');
        const spUserOnly = userOnlyParam === '1' || userOnlyParam === 'true';
        if (spUserOnly !== showUserActivityOnly) setShowUserActivityOnly(spUserOnly);

        const allowedTypes = ['all', 'deposit', 'withdraw', 'harvest'];
        const typeParam = searchParams.get('activityType');
        if (typeParam && allowedTypes.includes(typeParam) && typeParam !== activityTypeFilter) {
            setActivityTypeFilter(typeParam);
        }
    };

    useEffect(() => {
        loadQueryParams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);
    // Filter activities
    const filteredActivities = useMemo(() => {
        let filtered = [
            {
                id: 1,
                walletAddress: '0x1234...5678',
                type: 'deposit',
                position: 'yes',
                info: 'Deposited 500 USDC',
                time: '2024-01-15 14:30',
                txHash: '0xabc123...',
                isCurrentUser: true,
            },
            {
                id: 2,
                walletAddress: '0x9876...5432',
                type: 'withdraw',
                position: 'no',
                info: 'Withdrew 250 USDC',
                time: '2024-01-15 12:15',
                txHash: '0xdef456...',
                isCurrentUser: false,
            },
            {
                id: 3,
                walletAddress: '0x1234...5678',
                type: 'harvest',
                position: 'both',
                info: 'Harvested $47.50 yield',
                time: '2024-01-14 16:45',
                txHash: '0xghi789...',
                isCurrentUser: true,
            },
            {
                id: 4,
                walletAddress: '0x5555...7777',
                type: 'deposit',
                position: 'no',
                info: 'Deposited 1000 USDC',
                time: '2024-01-14 09:20',
                txHash: '0xjkl012...',
                isCurrentUser: false,
            },
        ];

        if (showUserActivityOnly) {
            filtered = filtered.filter(activity => activity.isCurrentUser);
        }

        if (activityTypeFilter !== 'all') {
            filtered = filtered.filter(activity => activity.type === activityTypeFilter);
        }

        return filtered;
    }, [showUserActivityOnly, activityTypeFilter]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Recent Activities</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
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
                        <Select
                            value={activityTypeFilter}
                            onValueChange={(value: string) => {
                                const next = ['deposit', 'withdraw', 'harvest'].includes(value) ? value : 'all';
                                setActivityTypeFilter(next);
                                updateQueryParams({ activityType: next === 'all' ? null : next });
                            }}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="deposit">Deposits</SelectItem>
                                <SelectItem value="withdraw">Withdrawals</SelectItem>
                                <SelectItem value="harvest">Harvests</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {filteredActivities.map(activity => (
                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <div>
                                    <p className="font-medium text-sm">
                                        {activity.walletAddress}
                                        {activity.isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{activity.info}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline" className="mb-1">
                                    {activity.type}
                                </Badge>
                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                                <Link
                                    href={`https://etherscan.io/tx/${activity.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                >
                                    View Tx
                                </Link>
                            </div>
                        </div>
                    ))}
                    {filteredActivities.length === 0 && <p className="text-center text-muted-foreground py-4">No activities found.</p>}
                </div>
            </CardContent>
        </Card>
    );
}
