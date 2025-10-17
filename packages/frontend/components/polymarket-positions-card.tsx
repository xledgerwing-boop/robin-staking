import { Input } from '@/components/ui/input';
import { fetchWalletPositionsPage } from '@robin-pm-staking/common/lib/polymarket';
import type { PolymarketPosition } from '@robin-pm-staking/common/types/position';
import { debounce } from 'throttle-debounce';
import { useEffect, useMemo, useState } from 'react';
import { RefreshCcw, Search, X, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import Link from 'next/link';
import Image from 'next/image';

export function PolymarketPositionsCard({ address }: { address?: `0x${string}` | null }) {
    const [pmPositions, setPmPositions] = useState<PolymarketPosition[]>([]);
    const [pmLoading, setPmLoading] = useState(false);
    const [pmPage, setPmPage] = useState(1);
    const [pmPageSize] = useState(10);
    const [pmHasMore, setPmHasMore] = useState(false);
    const [pmSearchContent, setPmSearchContent] = useState('');
    const [pmSearchQuery, setPmSearchQuery] = useState('');

    const handlePmSearchChange = useMemo(
        () =>
            debounce(400, (v: string) => {
                setPmSearchQuery(v.trim());
                setPmPage(1);
            }),
        []
    );

    useEffect(() => {
        const load = async () => {
            if (!address) {
                setPmPositions([]);
                setPmHasMore(false);
                return;
            }
            try {
                setPmLoading(true);
                const { positions, hasMore } = await fetchWalletPositionsPage(address, {
                    page: pmPage,
                    pageSize: pmPageSize,
                    title: pmSearchQuery || undefined,
                });
                setPmPositions(positions || []);
                setPmHasMore(!!hasMore);
            } catch (e) {
                console.error(e);
                toast.error('Failed to fetch Polymarket positions');
                setPmPositions([]);
                setPmHasMore(false);
            } finally {
                setPmLoading(false);
            }
        };
        load();
    }, [address, pmPage, pmPageSize, pmSearchQuery]);

    const formatUsd = (v: number | undefined | null) => {
        const num = typeof v === 'number' && Number.isFinite(v) ? v : 0;
        return `$${num.toFixed(2)}`;
    };

    const formatCents = (price: number | undefined | null) => {
        const p = typeof price === 'number' && Number.isFinite(price) ? price : 0;
        const cents = Math.round(p * 100);
        return `${cents}¢`;
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">Polymarket Wallet Positions</CardTitle>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                                setPmPage(1);
                                setPmSearchQuery(pmSearchQuery);
                            }}
                            disabled={pmLoading || !address}
                        >
                            <RefreshCcw className="w-1 h-1" />
                        </Button>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by market title..."
                            value={pmSearchContent}
                            onChange={e => {
                                setPmSearchContent(e.target.value);
                                handlePmSearchChange(e.target.value);
                            }}
                            className="pl-10 pr-10"
                            disabled={!address}
                        />
                        {pmSearchContent && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setPmSearchContent('');
                                    setPmSearchQuery('');
                                    setPmPage(1);
                                }}
                                aria-label="Clear search"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {pmLoading && (
                        <div className="flex items-center justify-center h-full">
                            <Loader className="mt-8 w-8 h-8 animate-spin" />
                        </div>
                    )}
                    {!pmLoading &&
                        pmPositions.map(pos => (
                            <Link key={`${pos.asset}-${pos.outcomeIndex}`} href={`/market/${encodeURIComponent(pos.slug)}`}>
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer mt-2">
                                    <div className="flex w-full items-center space-x-2 md:w-auto justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative w-12 h-12 shrink-0">
                                                <Image
                                                    src={pos.icon || '/placeholder.png'}
                                                    alt={pos.title ?? 'Market'}
                                                    fill
                                                    className="rounded-lg object-cover"
                                                    sizes="150px"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{pos.title}</h3>
                                                <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <span className="text-green-600 dark:text-green-500 font-medium">{pos.outcome}</span>
                                                    <span>{formatCents(pos.avgPrice)}</span>
                                                    <span>·</span>
                                                    <span>{pos.size.toFixed(2)} shares</span>
                                                </div>
                                                <div className="md:hidden text-sm text-muted-foreground">
                                                    <span>{formatUsd(pos.initialValue)} on </span>
                                                    <span className="text-green-600 dark:text-green-500 font-medium">{pos.outcome}</span>
                                                    <span> to win {formatUsd(pos.size)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Small-screen right-aligned value and PnL */}
                                        <div className="md:hidden ml-auto text-right">
                                            <div className="font-semibold">{formatUsd(pos.currentValue)}</div>
                                            <div
                                                className={`${
                                                    (pos.cashPnl ?? 0) >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                                                } text-xs`}
                                            >
                                                {`${pos.cashPnl >= 0 ? '+' : ''}${formatUsd(Math.abs(pos.cashPnl))}`}{' '}
                                                {`(${(pos.percentPnl ?? 0).toFixed(1)}%)`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:grid w-full grid-cols-4 gap-1 md:w-auto md:flex md:items-center md:space-x-0">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">AVG → NOW</p>
                                            <p className="font-medium text-md">
                                                {formatCents(pos.avgPrice)} - {formatCents(pos.curPrice)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">BET</p>
                                            <p className="font-medium text-md">{formatUsd(pos.initialValue)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">TO WIN</p>
                                            <p className="font-medium text-md">{formatUsd(pos.size)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">VALUE</p>
                                            <div className="font-medium text-md">
                                                <span>{formatUsd(pos.currentValue)}</span>
                                                <span
                                                    className={`${
                                                        (pos.cashPnl ?? 0) >= 0
                                                            ? 'text-green-600 dark:text-green-500'
                                                            : 'text-red-600 dark:text-red-500'
                                                    } text-xs ml-1`}
                                                >
                                                    {`${pos.cashPnl >= 0 ? '+' : ''}${formatUsd(Math.abs(pos.cashPnl))}`}{' '}
                                                    {`(${(pos.percentPnl ?? 0).toFixed(2)}%)`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    {!pmLoading && pmPositions.length === 0 && <div className="text-sm text-muted-foreground">No Polymarket positions found.</div>}
                    <div className="flex items-center justify-between pt-2 mt-8">
                        <div className="text-sm text-muted-foreground">{pmPositions.length > 0 ? `Page ${pmPage}` : '—'}</div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPmPage(p => Math.max(1, p - 1))}
                                disabled={pmPage <= 1 || pmLoading}
                            >
                                Prev
                            </Button>
                            <div className="text-sm">Page {pmPage}</div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPmPage(p => (pmHasMore ? p + 1 : p))}
                                disabled={!pmHasMore || pmLoading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
