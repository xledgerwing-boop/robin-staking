'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import { MarketStatusBadge } from '@/components/market/market-status-badge';
import { MarketStatus } from '@robin-pm-staking/common/types/market';

export default function StakingPage() {
    const userTotals = {
        totalSupplied: '$45,230',
        totalEarned: '$3,847',
    };

    const userDeposits = [
        {
            id: 1,
            image: '/placeholder.png',
            title: '2024 US Election',
            liquidationDate: '2024-11-05',
            yesTokens: '1,250',
            noTokens: '1,250',
            status: 'active',
        },
        {
            id: 2,
            image: '/placeholder.png',
            title: 'BTC > $100k by EOY',
            liquidationDate: '2024-12-31',
            yesTokens: '850',
            noTokens: '850',
            status: 'active',
        },
        {
            id: 3,
            image: '/placeholder.png',
            title: 'ETH Merge Success',
            liquidationDate: '2024-03-15',
            yesTokens: '2,100',
            noTokens: '2,100',
            status: 'completed',
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Portfolio</h1>
                    <p className="text-muted-foreground text-lg">Manage your prediction market positions</p>
                </div>

                {/* Your Deposits Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Your Deposits</CardTitle>
                            <div className="flex space-x-6 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Total Supplied: </span>
                                    <span className="font-bold">{userTotals.totalSupplied}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Total Earned: </span>
                                    <span className="font-bold text-primary">{userTotals.totalEarned}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {userDeposits.map(deposit => (
                                <Link key={deposit.id} href={`/market/${deposit.id}`}>
                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer mt-2">
                                        <div className="flex items-center space-x-4">
                                            <Image
                                                src={deposit.image || '/placeholder.png'}
                                                alt={deposit.title}
                                                width={40}
                                                height={40}
                                                className="rounded-lg"
                                            />
                                            <div>
                                                <h3 className="font-semibold">{deposit.title}</h3>
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(deposit.liquidationDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">YES Tokens</p>
                                                <p className="font-medium">{deposit.yesTokens}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">NO Tokens</p>
                                                <p className="font-medium">{deposit.noTokens}</p>
                                            </div>
                                            {/* <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Earned Yield</p>
                                                <p className="font-medium text-primary">{deposit.earnedYield}</p>
                                            </div> */}
                                            <div className="flex items-center justify-center space-x-2 min-w-28">
                                                <MarketStatusBadge status={deposit.status as MarketStatus} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
