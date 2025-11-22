'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUnitsLocale } from '@robin-pm-staking/common/lib/utils';
import { UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';

export default function ReferralOverviewPage() {
    const params = useParams();
    const codeId = params.codeId as string;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [codeId]);

    const loadData = async () => {
        try {
            const res = await fetch(`/api/referral/overview?codeId=${codeId}`);
            if (!res.ok) {
                throw new Error('Failed to load data');
            }
            const result = await res.json();
            setData(result);
        } catch (e) {
            console.error('Failed to load referral overview', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 max-w-4xl">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-32 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto py-8 max-w-4xl">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">Referral code not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalValue = BigInt(data.totalRealizedValue || '0');
    const points = BigInt(data.points || '0');

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-6 min-h-screen">
            <Card>
                <CardHeader>
                    <CardTitle>Referral Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="text-sm text-muted-foreground">Code</div>
                        <div className="text-lg font-semibold">{data.code.code}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Referral Link</div>
                        <div className="text-lg font-semibold">{`${window.location.origin}?r=${data.code.code}`}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Owner Address</div>
                        <div className="text-lg font-mono">{data.code.ownerAddress}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Owner Name</div>
                        <div className="text-lg font-semibold">{data.code.ownerName}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Total Realized Value</div>
                            <div className="text-2xl font-bold">${formatUnitsLocale(totalValue, UNDERYLING_DECIMALS, 2)}</div>
                        </div>
                        {/* <div>
                            <div className="text-sm text-muted-foreground">Estimated Points</div>
                            <div className="text-2xl font-bold">{formatUnitsLocale(points, 0, 0)}</div>
                        </div> */}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Referral Entries ({data.entries.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.entries.length === 0 ? (
                        <p className="text-muted-foreground">No entries yet</p>
                    ) : (
                        <div className="space-y-2">
                            {data.entries.map((entry: any) => (
                                <Card key={entry.id}>
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-medium">{entry.userAddress}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {entry.type} • {new Date(Number(entry.timestamp)).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">
                                                    ${formatUnitsLocale(BigInt(entry.realizedValue || '0'), UNDERYLING_DECIMALS, 2)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatUnitsLocale(BigInt(entry.totalTokens), UNDERYLING_DECIMALS, 1)} tokens
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
