'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrendingUp, DollarSign, BarChart3, Clock, ArrowUpRight, Search, ArrowUpDown, ArrowUp, ArrowDown, User, Loader, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/navbar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { fetchWalletPositions, fetchWalletPositionsPage } from '@robin-pm-staking/common/lib/polymarket';
import { DateTime } from 'luxon';
import type { Market, MarketRow } from '@robin-pm-staking/common/types/market';
import { MarketRowToMarket, MarketStatus } from '@robin-pm-staking/common/types/market';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MarketStatusBadge } from '@/components/market/market-status-badge';
import { formatUnits } from '@robin-pm-staking/common/lib/utils';
import { UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';
import { useReadRobinStakingVaultGetCurrentApy } from '@robin-pm-staking/common/types/contracts';
import { zeroAddress } from 'viem';
import { ValueState } from '@/components/value-state';
import { toast } from 'sonner';

function StakingPageContent() {
    const { proxyAddress: address, isConnected } = useProxyAccount();
    const [availableMarkets, setAvailableMarkets] = useState<Market[]>([]);
    const [numberOfMarkets, setNumberOfMarkets] = useState(0);
    const [totalTVL, setTotalTVL] = useState<bigint>(0n);
    const [totalUsers, setTotalUsers] = useState(0);
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [vaultAddress, setVaultAddress] = useState<`0x${string}` | null>(null);

    const {
        data: averageApy,
        isLoading: averageApyLoading,
        isEnabled: averageApyEnabled,
        error: averageApyError,
    } = useReadRobinStakingVaultGetCurrentApy({
        address: vaultAddress as `0x${string}`,
        args: [],
        query: {
            enabled: !!vaultAddress && vaultAddress !== zeroAddress,
        },
    });

    // State for filtering controls
    const [showWalletOnly, setShowWalletOnly] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [walletConditionIds, setWalletConditionIds] = useState<string[]>([]);
    const [marketsLoading, setMarketsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [totalCount, setTotalCount] = useState(0);
    const [queryParamsLoaded, setQueryParamsLoaded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [hasMoreWalletPositions, setHasMoreWalletPositions] = useState(false);

    // Sorting state
    type SortField = 'tvl' | 'endDate' | 'title';
    type SortDirection = 'asc' | 'desc';
    const [sortField, setSortField] = useState<SortField>('tvl');
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
            router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
        }
    };

    const loadQueryParams = () => {
        const spSearch = searchParams.get('search') ?? '';
        if (spSearch !== searchQuery) setSearchQuery(spSearch);

        const walletOnlyParam = isConnected ? searchParams.get('walletOnly') || 'true' : 'false';
        const spWalletOnly = walletOnlyParam === '1' || walletOnlyParam === 'true';
        if (spWalletOnly !== showWalletOnly) setShowWalletOnly(spWalletOnly);

        const allowedSortFields: SortField[] = ['tvl', 'endDate', 'title'];
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

    // Load key metrics on mount
    useEffect(() => {
        const run = async () => {
            try {
                setMetricsLoading(true);
                const res = await fetch('/api/metrics');
                if (!res.ok) throw new Error('Failed to fetch metrics');
                const data = (await res.json()) as {
                    numberOfMarkets: number;
                    totalTVL: string;
                    totalUsers: number;
                    contractAddress: `0x${string}` | null;
                };
                setNumberOfMarkets(data.numberOfMarkets ?? 0);
                setTotalTVL(BigInt(data.totalTVL ?? '0'));
                setTotalUsers(data.totalUsers ?? 0);
                setVaultAddress(data.contractAddress);
            } catch (e) {
                console.error(e);
                toast.error('Failed to fetch metrics');
            } finally {
                setMetricsLoading(false);
            }
        };
        run();
    }, []);

    // Sync URL -> state on mount and when navigating back/forward
    useEffect(() => {
        loadQueryParams();
    }, [searchParams]);

    useEffect(() => {
        if (!queryParamsLoaded) return;
        const controller = new AbortController();
        const fetchMarkets = async () => {
            if (showWalletOnly && walletConditionIds.length === 0) {
                setAvailableMarkets([]);
                setTotalCount(0);
                return;
            }
            setMarketsLoading(true);
            try {
                const params = new URLSearchParams();
                if (!showWalletOnly && searchQuery.trim()) params.set('search', searchQuery.trim());
                if (showWalletOnly) {
                    params.set('walletOnly', 'true');
                    if (walletConditionIds.length > 0) params.set('conditionIds', walletConditionIds.join(','));
                }
                // pass sorting to server
                if (!showWalletOnly) {
                    params.set('sortField', sortField);
                    params.set('sortDirection', sortDirection);
                }
                params.set('page', String(page));
                params.set('pageSize', String(pageSize));
                const res = await fetch(`/api/markets?${params.toString()}`, { signal: controller.signal });
                if (!res.ok) throw new Error('Failed to load markets');
                const data = (await res.json()) as { markets: MarketRow[]; page: number; pageSize: number; totalCount: number };
                setAvailableMarkets((data.markets ?? []).map(MarketRowToMarket));
                if (!showWalletOnly) setTotalCount(data.totalCount ?? 0);
            } catch (e) {
                console.error(e);
                toast.error('Failed to fetch markets');
                setAvailableMarkets([]);
            } finally {
                setMarketsLoading(false);
            }
        };
        fetchMarkets();
    }, [searchQuery, showWalletOnly, isConnected, address, walletConditionIds, sortField, sortDirection, queryParamsLoaded, page, pageSize]);

    useEffect(() => {
        const controller = new AbortController();
        const run = async () => {
            if (showWalletOnly && isConnected && address) {
                try {
                    const { conditionIds, hasMore } = await fetchWalletPositionsPage(address, {
                        page,
                        pageSize,
                        title: searchQuery.trim() || undefined,
                    });
                    setWalletConditionIds(conditionIds);
                    setHasMoreWalletPositions(hasMore);
                    const offset = (page - 1) * pageSize;
                    const estTotal = hasMore ? page * pageSize + 1 : offset + conditionIds.length;
                    setTotalCount(estTotal);
                } catch {
                    setWalletConditionIds([]);
                    setHasMoreWalletPositions(false);
                    setTotalCount(0);
                }
            } else {
                setWalletConditionIds([]);
                setHasMoreWalletPositions(false);
            }
        };
        run();
        return () => controller.abort();
    }, [showWalletOnly, isConnected, address, page, pageSize, searchQuery]);

    const defaultDirectionByField: Record<SortField, SortDirection> = {
        tvl: 'desc',
        endDate: 'asc',
        title: 'asc',
    };

    const sortLabels: Record<SortField, string> = {
        tvl: 'TVL',
        endDate: 'End Date',
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
        if (showWalletOnly) setPage(1);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        updateQueryParams({ search: null });
        inputRef.current?.focus();
    };

    const handleWalletOnlyChange = (checked: boolean) => {
        setShowWalletOnly(checked);
        updateQueryParams({ walletOnly: !checked ? '0' : null });
        setPage(1);
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
                                    <span className="text-2xl font-bold">
                                        {vaultAddress ? (
                                            <ValueState
                                                value={`${((Number(averageApy) / 10_000) * 100).toFixed(2)}%`}
                                                loading={averageApyLoading || !averageApyEnabled}
                                                error={!!averageApyError}
                                            />
                                        ) : (
                                            '—'
                                        )}
                                    </span>
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
                                    <span className="text-2xl font-bold">
                                        <ValueState value={numberOfMarkets.toLocaleString()} loading={metricsLoading} error={false} />
                                    </span>
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
                                    <span className="text-2xl font-bold">
                                        <ValueState value={`$${formatUnits(totalTVL, UNDERYLING_DECIMALS)}`} loading={metricsLoading} error={false} />
                                    </span>
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
                                    <span className="text-2xl font-bold">
                                        <ValueState value={totalUsers.toLocaleString()} loading={metricsLoading} error={false} />
                                    </span>
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
                                    ref={inputRef}
                                    className="pl-10 pr-10"
                                />
                                {searchQuery && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClearSearch}
                                        aria-label="Clear search"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="wallet-only"
                                    checked={showWalletOnly}
                                    onCheckedChange={handleWalletOnlyChange}
                                    disabled={!isConnected || !address}
                                />
                                <Label htmlFor="wallet-only" className="text-sm font-medium">
                                    Show wallet only
                                </Label>
                            </div>
                            <div className="flex items-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="min-w-36 justify-between" disabled={showWalletOnly}>
                                            <span className="flex items-center gap-2">{sortLabels[sortField]}</span>
                                            {sortDirection === 'asc' ? (
                                                <ArrowUp className="w-4 h-4 text-primary" />
                                            ) : (
                                                <ArrowDown className="w-4 h-4 text-primary" />
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => handleSortSelect('tvl')} disabled={showWalletOnly}>
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
                                        <DropdownMenuItem onClick={() => handleSortSelect('endDate')} disabled={showWalletOnly}>
                                            <span className="flex-1">End Date</span>
                                            {sortField === 'endDate' ? (
                                                sortDirection === 'asc' ? (
                                                    <ArrowUp className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <ArrowDown className="w-4 h-4 text-primary" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSortSelect('title')} disabled={showWalletOnly}>
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
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                                                            <MarketStatusBadge status={market.status} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">TVL</span>
                                                    <span className="font-medium">
                                                        {market.status !== MarketStatus.Uninitialized
                                                            ? `$${market.tvl.toLocaleString()}`
                                                            : 'Uninitialized'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">APY</span>
                                                    <span className="font-bold text-primary">
                                                        {vaultAddress ? (
                                                            <ValueState
                                                                value={`${((Number(averageApy) / 10_000) * 100).toFixed(2)}%`}
                                                                loading={averageApyLoading || !averageApyEnabled}
                                                                error={!!averageApyError}
                                                            />
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </span>
                                                </div>

                                                <Button className="w-full" size="sm" asChild>
                                                    <Link href={`/market/${encodeURIComponent(market.slug)}`}>
                                                        {market.status !== MarketStatus.Uninitialized ? 'Stake Now' : 'Initialize Market'}
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
                        {totalCount > 0 && (
                            <div className="flex items-center justify-between pt-2 mt-8">
                                <div className="text-sm text-muted-foreground">
                                    {`Showing ${Math.min((page - 1) * pageSize + 1, totalCount)}-${Math.min(
                                        page * pageSize,
                                        totalCount
                                    )} of ${totalCount}`}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page <= 1 || marketsLoading}
                                    >
                                        Prev
                                    </Button>
                                    <div className="text-sm">Page {page}</div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPage(p => (p * pageSize < totalCount ? p + 1 : p))}
                                        disabled={page * pageSize >= totalCount || marketsLoading}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function StakingPage() {
    return (
        <React.Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Loader className="w-8 h-8 animate-spin" />
                </div>
            }
        >
            <StakingPageContent />
        </React.Suspense>
    );
}
