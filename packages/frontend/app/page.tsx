'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrendingUp, DollarSign, BarChart3, Clock, ArrowUpRight, Search, ArrowUpDown, ArrowUp, ArrowDown, User, Loader } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/navbar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { fetchWalletPositions } from '@/lib/polymarket';
import { DateTime } from 'luxon';
import { getStatusBadge, Market, MarketRow, MarketRowToMarket } from '@/types/market';
import { useProxyAccount } from '@/hooks/useProxyAccount';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function StakingPage() {
    // Mock data for demonstration
    const keyMetrics = {
        averageAPY: '24.5%',
        numberOfMarkets: 47,
        totalTVL: '$12.4M',
        totalUsers: 2847,
    };

    const { address, isConnected } = useProxyAccount();
    const [availableMarkets, setAvailableMarkets] = useState<Market[]>([]);

    // State for filtering controls
    const [showWalletOnly, setShowWalletOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [walletConditionIds, setWalletConditionIds] = useState<string[]>([]);
    const [marketsLoading, setMarketsLoading] = useState(false);
    const [queryParamsLoaded, setQueryParamsLoaded] = useState(false);

    // Sorting state
    type SortField = 'apy' | 'tvl' | 'liquidationDate' | 'title';
    type SortDirection = 'asc' | 'desc';
    const [sortField, setSortField] = useState<SortField>('apy');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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
        const spSearch = searchParams.get('search') ?? '';
        if (spSearch !== searchQuery) setSearchQuery(spSearch);

        const walletOnlyParam = searchParams.get('walletOnly');
        const spWalletOnly = walletOnlyParam === '1' || walletOnlyParam === 'true';
        if (spWalletOnly !== showWalletOnly) setShowWalletOnly(spWalletOnly);

        const allowedSortFields: SortField[] = ['apy', 'tvl', 'liquidationDate', 'title'];
        const spSortField = searchParams.get('sortField') as SortField | null;
        const spSortDirection = searchParams.get('sortDirection') as SortDirection | null;
        if (spSortField && allowedSortFields.includes(spSortField) && spSortField !== sortField) {
            setSortField(spSortField);
        }
        if (spSortDirection && (spSortDirection === 'asc' || spSortDirection === 'desc') && spSortDirection !== sortDirection) {
            setSortDirection(spSortDirection);
        }
        setQueryParamsLoaded(true);
    };

    // Sync URL -> state on mount and when navigating back/forward
    useEffect(() => {
        loadQueryParams();
    }, [searchParams]);

    useEffect(() => {
        if (!queryParamsLoaded) return;
        const controller = new AbortController();
        const fetchMarkets = async () => {
            setMarketsLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchQuery.trim()) params.set('search', searchQuery.trim());
                if (showWalletOnly && walletConditionIds.length > 0) {
                    params.set('walletOnly', 'true');
                    params.set('conditionIds', walletConditionIds.join(','));
                }
                // pass sorting to server
                params.set('sortField', sortField);
                params.set('sortDirection', sortDirection);
                const res = await fetch(`/api/markets?${params.toString()}`, { signal: controller.signal });
                if (!res.ok) throw new Error('Failed to load markets');
                const data = (await res.json()) as MarketRow[];
                setAvailableMarkets(data.map(MarketRowToMarket));
            } catch (e) {
                console.error(e);
                setAvailableMarkets([]);
            } finally {
                setMarketsLoading(false);
            }
        };
        fetchMarkets();
    }, [searchQuery, showWalletOnly, isConnected, address, walletConditionIds, sortField, sortDirection, queryParamsLoaded]);

    useEffect(() => {
        const controller = new AbortController();
        const run = async () => {
            if (showWalletOnly && isConnected && address) {
                try {
                    const positions = await fetchWalletPositions(address);
                    setWalletConditionIds(Array.from(new Set(positions.map(p => p))));
                } catch {
                    setWalletConditionIds([]);
                }
            } else {
                setWalletConditionIds([]);
            }
        };
        run();
        return () => controller.abort();
    }, [showWalletOnly, isConnected, address]);

    const defaultDirectionByField: Record<SortField, SortDirection> = {
        apy: 'desc',
        tvl: 'desc',
        liquidationDate: 'asc',
        title: 'asc',
    };

    const sortLabels: Record<SortField, string> = {
        apy: 'APY',
        tvl: 'TVL',
        liquidationDate: 'Liquidation Date',
        title: 'Name',
    };

    const handleSortSelect = (field: SortField) => {
        if (sortField === field) {
            const nextDirection: SortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(nextDirection);
            updateQueryParams({ sortField: field, sortDirection: nextDirection });
        } else {
            const nextDirection = defaultDirectionByField[field];
            setSortField(field);
            setSortDirection(nextDirection);
            updateQueryParams({ sortField: field, sortDirection: nextDirection });
        }
    };

    const handleSearchInputChange = (value: string) => {
        setSearchQuery(value);
        const trimmed = value.trim();
        updateQueryParams({ search: trimmed || null });
    };

    const handleWalletOnlyChange = (checked: boolean) => {
        setShowWalletOnly(checked);
        updateQueryParams({ walletOnly: checked ? '1' : null });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <Navbar />

            <div className="h-full container mx-auto px-4 py-8">
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
                            <div className="flex items-start justify-between space-x-2">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Average APY</p>
                                    <p className="text-2xl font-bold">{keyMetrics.averageAPY}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between space-x-2">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <BarChart3 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Markets</p>
                                    <p className="text-2xl font-bold">{keyMetrics.numberOfMarkets}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between space-x-2">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total TVL</p>
                                    <p className="text-2xl font-bold">{keyMetrics.totalTVL}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between space-x-2">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Users</p>
                                    <p className="text-2xl font-bold">{keyMetrics.totalUsers.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Available Markets Section */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-xl">Available Markets</CardTitle>
                        <p className="text-muted-foreground">Discover new prediction market opportunities to stake your tokens</p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search by condition ID, name or Polymarket url..."
                                    value={searchQuery}
                                    onChange={e => handleSearchInputChange(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="wallet-only" checked={showWalletOnly} onCheckedChange={handleWalletOnlyChange} />
                                <Label htmlFor="wallet-only" className="text-sm font-medium">
                                    Show wallet only
                                </Label>
                            </div>
                            <div className="flex items-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="min-w-36 justify-between">
                                            <span className="flex items-center gap-2">{sortLabels[sortField]}</span>
                                            {sortDirection === 'asc' ? (
                                                <ArrowUp className="w-4 h-4 text-primary" />
                                            ) : (
                                                <ArrowDown className="w-4 h-4 text-primary" />
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => handleSortSelect('apy')}>
                                            <span className="flex-1">APY</span>
                                            {sortField === 'apy' ? (
                                                sortDirection === 'asc' ? (
                                                    <ArrowUp className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <ArrowDown className="w-4 h-4 text-primary" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSortSelect('tvl')}>
                                            <span className="flex-1">TVL</span>
                                            {sortField === 'tvl' ? (
                                                sortDirection === 'asc' ? (
                                                    <ArrowUp className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <ArrowDown className="w-4 h-4 text-primary" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSortSelect('liquidationDate')}>
                                            <span className="flex-1">Liquidation Date</span>
                                            {sortField === 'liquidationDate' ? (
                                                sortDirection === 'asc' ? (
                                                    <ArrowUp className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <ArrowDown className="w-4 h-4 text-primary" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSortSelect('title')}>
                                            <span className="flex-1">Name</span>
                                            {sortField === 'title' ? (
                                                sortDirection === 'asc' ? (
                                                    <ArrowUp className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <ArrowDown className="w-4 h-4 text-primary" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {marketsLoading ? (
                                <div className="col-span-full h-full flex items-center justify-center">
                                    <Loader className="w-12 h-12 animate-spin" />
                                </div>
                            ) : (
                                availableMarkets.map(market => (
                                    <Card className="hover:shadow-md transition-shadow" key={market.conditionId}>
                                        <CardContent>
                                            <Link href={`/market/${encodeURIComponent(market.slug)}`} className="flex items-center space-x-3 mb-4">
                                                <div className="w-18 h-18 relative shrink-0">
                                                    <Image
                                                        src={market.image || '/placeholder.png'}
                                                        alt={market.question ?? 'Market'}
                                                        fill
                                                        className="rounded-lg object-cover"
                                                        sizes="150px"
                                                    />
                                                </div>
                                                <div className="flex flex-col items-start justify-center h-18">
                                                    <h3 className="font-semibold line-clamp-2">{market.question}</h3>
                                                    <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>
                                                            {market.endDate
                                                                ? DateTime.fromMillis(market.endDate).toLocaleString(DateTime.DATE_MED)
                                                                : '—'}
                                                        </span>
                                                        <div className="flex items-center">
                                                            {getStatusBadge('active' /*market.status*/, market.initialized)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">TVL</span>
                                                    <span className="font-medium">
                                                        {market.initialized ? `$${market.tvl.toLocaleString()}` : 'Uninitialized'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">APY</span>
                                                    <span className="font-bold text-primary">
                                                        {market.initialized ? `${market.apyBps.toFixed(2)}%` : 'Uninitialized'}
                                                    </span>
                                                </div>

                                                <Button className="w-full" size="sm" asChild>
                                                    <Link href={`/market/${encodeURIComponent(market.slug)}`}>
                                                        {market.initialized ? 'Stake Now' : 'Initialize Market'}
                                                        <ArrowUpRight className="w-4 h-4 ml-1" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                            {availableMarkets.length === 0 && !marketsLoading && (
                                <div className="col-span-full text-center py-8">
                                    <p className="text-muted-foreground">
                                        No markets found matching your criteria. Try searching by Polymarket URL or condition ID to initialize a
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
