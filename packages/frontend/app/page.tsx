'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrendingUp, DollarSign, BarChart3, Clock, ArrowUpRight, Coins, CheckCircle, AlertCircle, Timer, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import Navbar from '@/components/navbar';

export default function StakingPage() {
    // Mock data for demonstration
    const keyMetrics = {
        averageAPY: '24.5%',
        numberOfMarkets: 47,
        totalTVL: '$12.4M',
        totalUsers: 2847,
    };

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
            earnedYield: '$247.50',
            status: 'active',
        },
        {
            id: 2,
            image: '/placeholder.png',
            title: 'BTC > $100k by EOY',
            liquidationDate: '2024-12-31',
            yesTokens: '850',
            noTokens: '850',
            earnedYield: '$89.25',
            status: 'active',
        },
        {
            id: 3,
            image: '/placeholder.png',
            title: 'ETH Merge Success',
            liquidationDate: '2024-03-15',
            yesTokens: '2,100',
            noTokens: '2,100',
            earnedYield: '$420.00',
            status: 'completed',
        },
    ];

    const availableVaults = [
        {
            id: 1,
            conditionId: 'SPORTS_001',
            image: '/placeholder.png',
            title: 'Sports Betting Vault',
            liquidationDate: '2024-06-30',
            tvl: '$2.8M',
            apy: '28.5%',
            inWallet: true,
        },
        {
            id: 2,
            conditionId: 'CRYPTO_002',
            image: '/placeholder.png',
            title: 'Crypto Predictions',
            liquidationDate: '2024-12-31',
            tvl: '$4.2M',
            apy: '22.1%',
            inWallet: false,
        },
        {
            id: 3,
            conditionId: 'POLITICS_003',
            image: '/placeholder.png',
            title: 'Political Events',
            liquidationDate: '2024-11-05',
            tvl: '$1.9M',
            apy: '31.2%',
            inWallet: true,
        },
        {
            id: 4,
            conditionId: 'WEATHER_004',
            image: '/placeholder.png',
            title: 'Weather & Climate',
            liquidationDate: '2024-09-30',
            tvl: '$890K',
            apy: '19.8%',
            inWallet: false,
        },
        {
            id: 5,
            conditionId: 'TECH_005',
            image: '/placeholder.png',
            title: 'Tech Milestones',
            liquidationDate: '2025-01-31',
            tvl: '$3.1M',
            apy: '25.7%',
            inWallet: true,
        },
        {
            id: 6,
            conditionId: 'FINANCE_006',
            image: '/placeholder.png',
            title: 'Financial Markets',
            liquidationDate: '2024-08-15',
            tvl: '$1.5M',
            apy: '20.9%',
            inWallet: false,
        },
    ];

    // State for filtering controls
    const [showWalletOnly, setShowWalletOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filtered vaults computation
    const filteredVaults = useMemo(() => {
        let filtered = availableVaults;

        // Filter by wallet if switch is enabled
        if (showWalletOnly) {
            filtered = filtered.filter(vault => vault.inWallet);
        }

        // Filter by search query (conditionId or vault name)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(vault => vault.title.toLowerCase().includes(query) || vault.conditionId.toLowerCase().includes(query));
        }

        return filtered;
    }, [showWalletOnly, searchQuery]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4 text-primary" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-secondary" />;
            case 'pending':
                return <Timer className="w-4 h-4 text-yellow-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'default',
            completed: 'secondary',
            pending: 'outline',
        } as const;

        return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Staking Dashboard</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your prediction market positions and earn yield on delta-neutral strategies
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Average APY</p>
                                    <p className="text-2xl font-bold text-primary">{keyMetrics.averageAPY}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-accent" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Markets</p>
                                    <p className="text-2xl font-bold">{keyMetrics.numberOfMarkets}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total TVL</p>
                                    <p className="text-2xl font-bold">{keyMetrics.totalTVL}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <Coins className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Users</p>
                                    <p className="text-2xl font-bold">{keyMetrics.totalUsers.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Your Deposits Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Your Deposits</CardTitle>
                            <div className="flex space-x-6 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Total Supplied: </span>
                                    <span className="font-bold text-primary">{userTotals.totalSupplied}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Total Earned: </span>
                                    <span className="font-bold text-green-500">{userTotals.totalEarned}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {userDeposits.map(deposit => (
                                <Link key={deposit.id} href={`/vault/${deposit.id}`}>
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
                                                    <Clock className="w-3 h-3" />
                                                    <span>Liquidates: {new Date(deposit.liquidationDate).toLocaleDateString()}</span>
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
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">Earned Yield</p>
                                                <p className="font-medium text-green-500">{deposit.earnedYield}</p>
                                            </div>
                                            <div className="flex items-center justify-center space-x-2 min-w-28">
                                                {getStatusIcon(deposit.status)}
                                                {getStatusBadge(deposit.status)}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Available Vaults Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Available Markets</CardTitle>
                        <p className="text-muted-foreground">Discover new prediction market opportunities to stake your tokens</p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search by condition ID, name or Polymarket url..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="wallet-only" checked={showWalletOnly} onCheckedChange={setShowWalletOnly} />
                                <Label htmlFor="wallet-only" className="text-sm font-medium">
                                    Show wallet vaults only
                                </Label>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVaults.map(vault => (
                                <Link key={vault.id} href={`/vault/${vault.id}`}>
                                    <Card className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <Image
                                                    src={vault.image || '/placeholder.png'}
                                                    alt={vault.title}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-lg"
                                                />
                                                <div>
                                                    <h3 className="font-semibold">{vault.title}</h3>
                                                    <p className="text-xs text-muted-foreground font-mono">{vault.conditionId}</p>
                                                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{new Date(vault.liquidationDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">TVL</span>
                                                    <span className="font-medium">{vault.tvl}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">APY</span>
                                                    <span className="font-bold text-primary">{vault.apy}</span>
                                                </div>

                                                <Button className="w-full" size="sm">
                                                    Stake Now
                                                    <ArrowUpRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}

                            {filteredVaults.length === 0 && (
                                <div className="col-span-full text-center py-8">
                                    <p className="text-muted-foreground">
                                        No vaults found matching your criteria. Try searching by Polymarket URL or condition ID to initialize a
                                        non-existing market.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
