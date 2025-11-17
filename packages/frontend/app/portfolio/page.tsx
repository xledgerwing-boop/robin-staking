'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, RefreshCcw, HandCoins, Trophy, Loader, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MarketStatusBadge } from '@/components/market/market-status-badge';
import { MarketStatus } from '@robin-pm-staking/common/types/market';
import { useEffect, useState } from 'react';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { formatUnits } from '@robin-pm-staking/common/lib/utils';
import { UNDERYLING_DECIMALS, USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortfolioFilter, UserPositionInfo, UserPositionInfoRow, userPositionRowToUserPosition } from '@robin-pm-staking/common/types/position';
import { toast } from 'sonner';
import { useReadContracts } from 'wagmi';
import { robinStakingVaultAbi } from '@robin-pm-staking/common/types/contracts';
import { ValueState } from '@/components/value-state';
import { PolymarketPositionsCard } from '@/components/polymarket-positions-card';
import { useGenesisVaultInfo } from '@/hooks/use-genesis-vault-info';
import { useGenesisVaultUserInfo } from '@/hooks/use-genesis-vault-user-info';
import { formatUnitsLocale } from '@robin-pm-staking/common/lib/utils';
import { useReadRobinGenesisVaultViewUserStakedMarkets } from '@robin-pm-staking/common/types/contracts-genesis';
import { useMemo } from 'react';

export default function PortfolioPage() {
    const { proxyAddress: address } = useProxyAccount();
    const [totalYes, setTotalYes] = useState<bigint>(0n);
    const [totalNo, setTotalNo] = useState<bigint>(0n);
    const [totalHarvested, setTotalHarvested] = useState<bigint>(0n);
    const [userDeposits, setUserDeposits] = useState<UserPositionInfo[]>([]);
    const [filter, setFilter] = useState<PortfolioFilter>(PortfolioFilter.Active);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);

    // Genesis Vault data
    const GENESIS_VAULT = USED_CONTRACTS.GENESIS_VAULT as `0x${string}`;
    const {
        userCurrentValues,
        userCurrentValuesLoading,
        userCurrentValuesError,
        userEstimatedEarnings,
        userEstimatedEarningsLoading,
        userEstimatedEarningsError,
    } = useGenesisVaultUserInfo(GENESIS_VAULT, address as `0x${string}`);

    const { data: stakedMarkets, isLoading: stakedMarketsLoading } = useReadRobinGenesisVaultViewUserStakedMarkets({
        address: GENESIS_VAULT,
        args: [address as `0x${string}`],
        query: { enabled: !!address },
    });

    const totalStakedTokens = useMemo(() => {
        if (!stakedMarkets) return 0n;
        const [, stakedABalances, stakedBBalances] = stakedMarkets as [bigint[], bigint[], bigint[]];
        let total = 0n;
        for (let i = 0; i < stakedABalances.length; i++) {
            total += stakedABalances[i] + stakedBBalances[i];
        }
        return total;
    }, [stakedMarkets]);

    const {
        data: userYields,
        isLoading: userYieldsLoading,
        error: userYieldsError,
    } = useReadContracts({
        contracts: userDeposits.map(deposit => {
            return {
                address: deposit.vaultAddress as `0x${string}`,
                abi: robinStakingVaultAbi,
                functionName: 'getCurrentUserYield',
                args: [address as `0x${string}`],
            };
        }),
        multicallAddress: USED_CONTRACTS.MULTICALL,
        query: {
            enabled: !!userDeposits.length && !!address,
        },
    });

    useEffect(() => {
        if (!address) {
            setTotalYes(0n);
            setTotalNo(0n);
            setTotalHarvested(0n);
            setUserDeposits([]);
            setTotalCount(0);
            return;
        }
        const run = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                params.set('address', address);
                params.set('filter', filter);
                params.set('page', String(page));
                params.set('pageSize', String(pageSize));
                const res = await fetch(`/api/portfolio?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch portfolio');
                const data: {
                    yesSum: string;
                    noSum: string;
                    harvestedSum: string;
                    page: number;
                    pageSize: number;
                    totalCount: number;
                    filter: PortfolioFilter;
                    deposits: UserPositionInfoRow[];
                } = await res.json();
                setTotalYes(BigInt(data.yesSum ?? '0'));
                setTotalNo(BigInt(data.noSum ?? '0'));
                setTotalHarvested(BigInt(data.harvestedSum ?? '0'));
                setUserDeposits(data.deposits.map(userPositionRowToUserPosition));
                setTotalCount(data.totalCount ?? 0);
            } catch (e) {
                console.error(e);
                toast.error('Failed to fetch portfolio');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [address, filter, page, pageSize, refreshTick]);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Portfolio</h1>
                    <p className="text-muted-foreground text-lg">Manage all your positions staked with Robin</p>
                </div>

                {/* Genesis Vault Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            <Link href="/" className="hover:underline">
                                Genesis Reward Vault
                            </Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Staked TVL</p>
                                <div className="text-xl font-bold">
                                    <ValueState
                                        value={
                                            userCurrentValues == null
                                                ? undefined
                                                : `$${formatUnitsLocale(userCurrentValues[0], UNDERYLING_DECIMALS, 1)}`
                                        }
                                        loading={userCurrentValuesLoading}
                                        error={!!userCurrentValuesError}
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Staked Tokens</p>
                                <div className="text-xl font-bold">
                                    <ValueState
                                        value={stakedMarkets == null ? undefined : `${formatUnitsLocale(totalStakedTokens, UNDERYLING_DECIMALS, 1)}`}
                                        loading={stakedMarketsLoading}
                                        error={false}
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Earnings</p>
                                <div className="text-xl font-bold text-primary">
                                    <ValueState
                                        value={
                                            userEstimatedEarnings == null
                                                ? undefined
                                                : `$${formatUnitsLocale(userEstimatedEarnings[0], UNDERYLING_DECIMALS, 1)}`
                                        }
                                        loading={userEstimatedEarningsLoading}
                                        error={!!userEstimatedEarningsError}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Your Deposits Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex gap-2 justify-between w-full flex-col sm:flex-row">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-xl">Your Deposits</CardTitle>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            setPage(1);
                                            setRefreshTick(t => t + 1);
                                        }}
                                        disabled={loading}
                                    >
                                        <RefreshCcw className="w-1 h-1" />
                                    </Button>
                                </div>
                                <Select
                                    value={filter}
                                    onValueChange={v => {
                                        setPage(1);
                                        setFilter(v as PortfolioFilter);
                                    }}
                                >
                                    <SelectTrigger size="sm" className="min-w-32">
                                        <SelectValue placeholder="Filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="ended">Ended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center shrink-0">
                                <div className="flex w-full justify-between text-sm md:w-auto md:justify-start md:space-x-6 flex-col sm:flex-row">
                                    <div>
                                        <span className="text-muted-foreground">Total Supplied: </span>
                                        <span className="font-bold">
                                            {formatUnits(totalYes, UNDERYLING_DECIMALS)} Yes | {formatUnits(totalNo, UNDERYLING_DECIMALS)} No
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Total Harvested: </span>
                                        <span className="font-bold text-primary">${formatUnits(totalHarvested, UNDERYLING_DECIMALS)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {!loading &&
                                userDeposits.map((deposit, index) => (
                                    <Link key={deposit.slug} href={`/market/${encodeURIComponent(deposit.slug)}`}>
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer mt-2">
                                            <div className="flex w-full items-center space-x-4 md:w-auto justify-between flex-col sm:flex-row">
                                                <div className="flex items-center space-x-4">
                                                    <div className="relative w-12 h-12 shrink-0">
                                                        <Image
                                                            src={deposit.image || '/placeholder.png'}
                                                            alt={deposit.question ?? 'Market'}
                                                            fill
                                                            className="rounded-lg object-cover"
                                                            sizes="150px"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{deposit.question}</h3>
                                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{deposit.endDate ? new Date(deposit.endDate).toLocaleDateString() : '—'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 flex items-center justify-end space-x-3 md:hidden py-4 sm:py-0">
                                                    <span title="Redeemed">
                                                        <Trophy
                                                            className={`w-5 h-5 ${
                                                                deposit.usdRedeemed > 0n ? 'text-primary' : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                    </span>
                                                    <span title="Harvested">
                                                        <HandCoins
                                                            className={`w-5 h-5 ${
                                                                deposit.yieldHarvested > 0n ? 'text-primary' : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                    </span>
                                                    <MarketStatusBadge status={deposit.status as MarketStatus} />
                                                </div>
                                            </div>

                                            <div className="grid w-full grid-cols-3 md:w-auto md:flex md:items-center md:space-x-6">
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground md:text-sm">{deposit.outcomes[0]} Tokens</p>
                                                    <p className="font-medium">
                                                        {formatUnits(BigInt(deposit.yesTokens ?? '0'), UNDERYLING_DECIMALS)}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground md:text-sm">{deposit.outcomes[1]} Tokens</p>
                                                    <p className="font-medium">{formatUnits(BigInt(deposit.noTokens ?? '0'), UNDERYLING_DECIMALS)}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-muted-foreground">Earned Yield</p>
                                                    <div className="font-medium text-primary">
                                                        $
                                                        <ValueState
                                                            value={
                                                                // @ts-expect-error — deep generic inference with wagmi+ABI here
                                                                userYields?.[index]?.result != null
                                                                    ? formatUnits(userYields?.[index].result as bigint, UNDERYLING_DECIMALS)
                                                                    : '-'
                                                            }
                                                            loading={userYieldsLoading}
                                                            error={!!userYieldsError}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Icons for redemption/harvesting status */}
                                                <div className="items-center justify-center space-x-3 min-w-42 hidden md:flex">
                                                    <span title="Redeemed">
                                                        <Trophy
                                                            className={`w-5 h-5 ${
                                                                deposit.usdRedeemed > 0n ? 'text-primary' : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                    </span>
                                                    <span title="Harvested">
                                                        <HandCoins
                                                            className={`w-5 h-5 ${
                                                                deposit.yieldHarvested > 0n ? 'text-primary' : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                    </span>
                                                    <MarketStatusBadge status={deposit.status as MarketStatus} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            {loading && (
                                <div className="flex items-center justify-center h-full">
                                    <Loader className="mt-8 w-8 h-8 animate-spin" />
                                </div>
                            )}
                            {userDeposits.length === 0 && !loading && <div className="text-sm text-muted-foreground">No positions found.</div>}
                            <div className="flex items-center justify-between pt-2 mt-8">
                                <div className="text-sm text-muted-foreground">
                                    {totalCount > 0
                                        ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalCount)} of ${totalCount}`
                                        : '—'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page <= 1 || loading}
                                    >
                                        Prev
                                    </Button>
                                    <div className="text-sm">Page {page}</div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setPage(p => (p * pageSize < totalCount ? p + 1 : p))}
                                        disabled={page * pageSize >= totalCount || loading}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <PolymarketPositionsCard address={address as `0x${string}` | null} />
            </div>
        </div>
    );
}
