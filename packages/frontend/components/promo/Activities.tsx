'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, PlusCircle, MinusCircle, TrendingUp } from 'lucide-react';

type Activity = { id: string; label: 'Deposit' | 'Withdraw' | 'Claim'; ts: string };

export default function Activities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [fetchingMore, setFetchingMore] = useState(false);
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setActivities(
            Array.from({ length: 30 }).map((_, i) => ({
                id: `act-${i}`,
                label: i % 3 === 0 ? 'Deposit' : i % 3 === 1 ? 'Withdraw' : 'Claim',
                ts: new Date(Date.now() - i * 60_000).toLocaleString(),
            }))
        );
    }, []);

    const handleFetchMore = () => {
        if (fetchingMore) return;
        setFetchingMore(true);
        setTimeout(() => {
            const next = activities.length;
            const more: Activity[] = Array.from({ length: 20 }).map((_, i) => ({
                id: `act-${next + i}`,
                label: (next + i) % 3 === 0 ? 'Deposit' : (next + i) % 3 === 1 ? 'Withdraw' : 'Claim',
                ts: new Date(Date.now() - (next + i) * 60_000).toLocaleString(),
            }));
            setActivities(prev => [...prev, ...more]);
            setFetchingMore(false);
        }, 600);
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div ref={feedRef} className="max-h-96 overflow-y-auto pr-2">
                        <div className="space-y-3">
                            {activities.map(a => (
                                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                            {a.label === 'Deposit' ? (
                                                <PlusCircle className="w-4 h-4 text-primary" />
                                            ) : a.label === 'Withdraw' ? (
                                                <MinusCircle className="w-4 h-4 text-primary" />
                                            ) : (
                                                <TrendingUp className="w-4 h-4 text-primary" />
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium">{a.label}</div>
                                            <div className="text-muted-foreground">{a.ts}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">View</div>
                                </div>
                            ))}
                            {fetchingMore && (
                                <div className="w-full flex items-center justify-center py-3">
                                    <Loader className="w-4 h-4 animate-spin" />
                                </div>
                            )}
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
            </CardContent>
        </Card>
    );
}
