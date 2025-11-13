'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { TrendingUp, DollarSign, User, ChevronDown, Loader, ArrowUpRight, PlusCircle, MinusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAccount } from 'wagmi';
import AmountSlider from '@robin-pm-staking/common/components/amount-slider';
import OutcomeToken from '@robin-pm-staking/common/components/outcome-token';
import { Outcome } from '@robin-pm-staking/common/types/market';
import { ValueState } from '@/components/value-state';

// Placeholder/mocked data models (no chain calls yet)
type MockMarket = {
    id: string;
    title: string;
    image?: string;
    eligible: boolean;
    yesSymbol: string;
    noSymbol: string;
    side: Outcome; // which side user holds for this item
    walletAmount: number; // tokens in wallet (depositable)
    vaultAmount: number; // tokens in vault (withdrawable)
    priceUsd: number; // per token (0-1)
};

const MOCK_MARKETS: MockMarket[] = [
    {
        id: 'm-yes-1',
        title: 'Will BTC close above $100k by year end?',
        image: '/placeholder.png',
        eligible: true,
        yesSymbol: 'YES',
        noSymbol: 'NO',
        side: Outcome.Yes,
        walletAmount: 2_500_000,
        vaultAmount: 1_200_000,
        priceUsd: 0.62,
    },
    {
        id: 'm-no-2',
        title: 'Will ETH ETF be approved this quarter?',
        image: '/placeholder.png',
        eligible: false,
        yesSymbol: 'YES',
        noSymbol: 'NO',
        side: Outcome.No,
        walletAmount: 1_800_000,
        vaultAmount: 600_000,
        priceUsd: 0.41,
    },
    {
        id: 'm-yes-3',
        title: 'Will Team X win the championship?',
        image: '/placeholder.png',
        eligible: true,
        yesSymbol: 'YES',
        noSymbol: 'NO',
        side: Outcome.Yes,
        walletAmount: 900_000,
        vaultAmount: 0,
        priceUsd: 0.55,
    },
];

// Helpers
function formatUsd(n: number, decimals = 0): string {
    return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

function calcValue(amount: number, price: number): number {
    return (amount / 1_000_000) * price; // tokens are 6-dec
}

export default function PromoVaultPage() {
    const { isConnected } = useAccount();
    // Top metrics (mocked)
    const [tvlUsd, setTvlUsd] = useState<number>(0);
    const [apyPct, setApyPct] = useState<number>(12.34);
    const [myValueUsd, setMyValueUsd] = useState<number>(0);
    const [myEarningsUsd, setMyEarningsUsd] = useState<number>(0);

    // Cap state (mocked)
    const [tvlCapUsd] = useState<number>(100_000);
    const [capReached, setCapReached] = useState<boolean>(false);

    // UI state
    const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

    // Per-market adjustable amounts for batch actions (in tokens, 6-dec)
    const [depositDraft, setDepositDraft] = useState<Record<string, number>>({});
    const [withdrawDraft, setWithdrawDraft] = useState<Record<string, number>>({});

    // Activity list (mocked infinite feed)
    const [activities, setActivities] = useState<Array<{ id: string; label: string; ts: string }>>([]);
    const feedRef = useRef<HTMLDivElement>(null);
    const [fetchingMore, setFetchingMore] = useState(false);

    // Initialize mock state
    useEffect(() => {
        // Pretend we fetched metrics and user balances
        const totalVaultVal = MOCK_MARKETS.reduce((acc, m) => acc + calcValue(m.vaultAmount, m.priceUsd), 0);
        const totalWalletVal = MOCK_MARKETS.reduce((acc, m) => acc + calcValue(m.walletAmount, m.priceUsd), 0);
        setTvlUsd(52_300); // mock
        setMyValueUsd(totalVaultVal);
        setMyEarningsUsd(348.76); // mock
        setCapReached(52_300 >= tvlCapUsd);
        // Prime drafts
        const d: Record<string, number> = {};
        const w: Record<string, number> = {};
        for (const m of MOCK_MARKETS) {
            d[m.id] = m.walletAmount;
            w[m.id] = m.vaultAmount;
        }
        setDepositDraft(d);
        setWithdrawDraft(w);
        // Seed activity feed
        setActivities(
            Array.from({ length: 30 }).map((_, i) => ({
                id: `act-${i}`,
                label: i % 3 === 0 ? 'DepositEvent' : i % 3 === 1 ? 'WithdrawEvent' : 'ClaimEvent',
                ts: new Date(Date.now() - i * 60_000).toLocaleString(),
            }))
        );
    }, [tvlCapUsd]);

    const depositSummary = useMemo(() => {
        const totalTokens = Object.entries(depositDraft).reduce((acc, [id, amt]) => acc + (amt || 0), 0);
        const totalUsd = MOCK_MARKETS.reduce((acc, m) => acc + calcValue(depositDraft[m.id] || 0, m.priceUsd), 0);
        return { totalTokens, totalUsd };
    }, [depositDraft]);

    const withdrawSummary = useMemo(() => {
        const totalTokens = Object.entries(withdrawDraft).reduce((acc, [id, amt]) => acc + (amt || 0), 0);
        const totalUsd = MOCK_MARKETS.reduce((acc, m) => acc + calcValue(withdrawDraft[m.id] || 0, m.priceUsd), 0);
        return { totalTokens, totalUsd };
    }, [withdrawDraft]);

    const tvlCapPct = Math.min(100, Math.round((tvlUsd / tvlCapUsd) * 100));

    const handleFetchMore = () => {
        if (fetchingMore) return;
        setFetchingMore(true);
        setTimeout(() => {
            const next = activities.length;
            const more = Array.from({ length: 20 }).map((_, i) => ({
                id: `act-${next + i}`,
                label: (next + i) % 3 === 0 ? 'DepositEvent' : (next + i) % 3 === 1 ? 'WithdrawEvent' : 'ClaimEvent',
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
        <div className="min-h-screen bg-background">
            <div className="h-full container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Promotion Vault</h1>
                    <p className="text-muted-foreground text-lg">Stake your outcome tokens across eligible markets and earn USDC over time.</p>
                </div>

                {/* Top Metrics - reuse card styles from homepage */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-3 sm:p-6 md:p-6">
                            <div className="flex items-center w-full h-full justify-between space-x-2">
                                <div className="text-center p-2 md:p-4 bg-muted/50 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total TVL</p>
                                    <div className="text-2xl font-bold text-right">
                                        <ValueState value={`$${formatUsd(tvlUsd, 0)}`} loading={false} error={false} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 sm:p-6 md:p-6">
                            <div className="flex items-center w-full h-full justify-between space-x-2">
                                <div className="text-center p-2 md:p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current APY</p>
                                    <div className="text-2xl font-bold text-right">
                                        <ValueState value={`${apyPct.toFixed(2)}%`} loading={false} error={false} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 sm:p-6 md:p-6">
                            <div className="flex items-center w-full h-full justify-between space-x-2">
                                <div className="text-center p-2 md:p-4 bg-muted/50 rounded-lg">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">My Staked Value</p>
                                    <div className="text-2xl font-bold text-right">
                                        <ValueState value={`$${formatUsd(myValueUsd, 2)}`} loading={false} error={false} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3 sm:p-6 md:p-6">
                            <div className="flex items-center w-full h-full justify-between space-x-2">
                                <div className="text-center p-2 md:p-4 bg-muted/50 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">My Earned</p>
                                    <div className="text-2xl font-bold text-right">
                                        <ValueState value={`$${formatUsd(myEarningsUsd, 2)}`} loading={false} error={false} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Potential stake and earnings */}
                <PotentialEarnings apyPct={apyPct} connected={isConnected} />

                {/* TVL cap progress */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">Vault Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">TVL Cap</span>
                            <span className="text-sm font-medium">
                                ${formatUsd(tvlUsd, 0)} / ${formatUsd(tvlCapUsd, 0)} ({tvlCapPct}%)
                            </span>
                        </div>
                        <Progress value={tvlCapPct} />
                        {capReached && (
                            <div className="mt-3">
                                <Button className="w-full" variant="outline">
                                    Register Interest
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Deposit / Withdraw interface */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">Manage Across Markets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs className="max-w-[800px] mx-auto" value={tab} onValueChange={v => setTab(v as 'deposit' | 'withdraw')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                            </TabsList>

                            {/* Deposit Tab */}
                            <TabsContent value="deposit" className="space-y-4 pt-4">
                                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">Total deposit amount</div>
                                        <div className="text-sm font-medium">
                                            {formatUsd(depositSummary.totalTokens / 1_000_000, 2)} tokens (${formatUsd(depositSummary.totalUsd, 2)})
                                        </div>
                                    </div>
                                    <Button className="w-full">
                                        Stake Everything
                                        <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>

                                <button
                                    type="button"
                                    className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground"
                                    onClick={() => setDetailsOpen(o => !o)}
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
                                    {detailsOpen ? 'Hide details' : 'Show details'}
                                </button>

                                {detailsOpen && (
                                    <div className="space-y-4">
                                        {MOCK_MARKETS.map(m => {
                                            const max = m.walletAmount;
                                            const valTokens = (depositDraft[m.id] || 0) / 1_000_000;
                                            const valUsd = calcValue(depositDraft[m.id] || 0, m.priceUsd);
                                            return (
                                                <Card key={`dep-${m.id}`} className="border-muted">
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-16 h-16 relative shrink-0 rounded-md overflow-hidden bg-muted">
                                                                <Image
                                                                    src={m.image || '/placeholder.png'}
                                                                    alt="market"
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="font-medium">{m.title}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {m.eligible ? (
                                                                            <span className="text-primary font-medium">Eligible +4% APY</span>
                                                                        ) : (
                                                                            'Standard APY'
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <Button variant="outline" size="sm" className="h-8">
                                                                        <OutcomeToken
                                                                            outcome={m.side}
                                                                            symbolHolder={{ outcomes: [m.yesSymbol, m.noSymbol] }}
                                                                        />
                                                                    </Button>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        Wallet: {formatUsd(m.walletAmount / 1_000_000, 2)} tokens ($
                                                                        {formatUsd(calcValue(m.walletAmount, m.priceUsd), 2)})
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                                                    <div className="md:col-span-2">
                                                                        <AmountSlider
                                                                            className="py-1"
                                                                            amount={String(valTokens)}
                                                                            max={BigInt(m.walletAmount)}
                                                                            onAmountChange={v => {
                                                                                const parsed = Number(v || 0);
                                                                                setDepositDraft(prev => ({
                                                                                    ...prev,
                                                                                    [m.id]: Math.max(
                                                                                        0,
                                                                                        Math.min(m.walletAmount, Math.round(parsed * 1_000_000))
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                            showMax={false}
                                                                            disabled={false}
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-2 justify-end">
                                                                        <div className="text-sm">
                                                                            {formatUsd(valTokens, 2)} tokens (${formatUsd(valUsd, 2)})
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    setDepositDraft(prev => ({
                                                                                        ...prev,
                                                                                        [m.id]: Math.max(0, (prev[m.id] || 0) - 100_000),
                                                                                    }))
                                                                                }
                                                                            >
                                                                                <MinusCircle className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    setDepositDraft(prev => ({
                                                                                        ...prev,
                                                                                        [m.id]: Math.min(m.walletAmount, (prev[m.id] || 0) + 100_000),
                                                                                    }))
                                                                                }
                                                                            >
                                                                                <PlusCircle className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Withdraw Tab */}
                            <TabsContent value="withdraw" className="space-y-4 pt-4">
                                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">Total withdraw amount</div>
                                        <div className="text-sm font-medium">
                                            {formatUsd(withdrawSummary.totalTokens / 1_000_000, 2)} tokens (${formatUsd(withdrawSummary.totalUsd, 2)})
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="secondary">
                                        Withdraw Everything
                                        <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>

                                <button
                                    type="button"
                                    className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground"
                                    onClick={() => setDetailsOpen(o => !o)}
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
                                    {detailsOpen ? 'Hide details' : 'Show details'}
                                </button>

                                {detailsOpen && (
                                    <div className="space-y-4">
                                        {MOCK_MARKETS.map(m => {
                                            const max = m.vaultAmount;
                                            const valTokens = (withdrawDraft[m.id] || 0) / 1_000_000;
                                            const valUsd = calcValue(withdrawDraft[m.id] || 0, m.priceUsd);
                                            return (
                                                <Card key={`with-${m.id}`} className="border-muted">
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-16 h-16 relative shrink-0 rounded-md overflow-hidden bg-muted">
                                                                <Image
                                                                    src={m.image || '/placeholder.png'}
                                                                    alt="market"
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="font-medium">{m.title}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {m.eligible ? (
                                                                            <span className="text-primary font-medium">Eligible +4% APY</span>
                                                                        ) : (
                                                                            'Standard APY'
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <Button variant="outline" size="sm" className="h-8">
                                                                        <OutcomeToken
                                                                            outcome={m.side}
                                                                            symbolHolder={{ outcomes: [m.yesSymbol, m.noSymbol] }}
                                                                        />
                                                                    </Button>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        In Vault: {formatUsd(m.vaultAmount / 1_000_000, 2)} tokens ($
                                                                        {formatUsd(calcValue(m.vaultAmount, m.priceUsd), 2)})
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                                                    <div className="md:col-span-2">
                                                                        <AmountSlider
                                                                            className="py-1"
                                                                            amount={String(valTokens)}
                                                                            max={BigInt(max)}
                                                                            onAmountChange={v => {
                                                                                const parsed = Number(v || 0);
                                                                                setWithdrawDraft(prev => ({
                                                                                    ...prev,
                                                                                    [m.id]: Math.max(
                                                                                        0,
                                                                                        Math.min(max, Math.round(parsed * 1_000_000))
                                                                                    ),
                                                                                }));
                                                                            }}
                                                                            showMax={false}
                                                                            disabled={false}
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-2 justify-end">
                                                                        <div className="text-sm">
                                                                            {formatUsd(valTokens, 2)} tokens (${formatUsd(valUsd, 2)})
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    setWithdrawDraft(prev => ({
                                                                                        ...prev,
                                                                                        [m.id]: Math.max(0, (prev[m.id] || 0) - 100_000),
                                                                                    }))
                                                                                }
                                                                            >
                                                                                <MinusCircle className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    setWithdrawDraft(prev => ({
                                                                                        ...prev,
                                                                                        [m.id]: Math.min(max, (prev[m.id] || 0) + 100_000),
                                                                                    }))
                                                                                }
                                                                            >
                                                                                <PlusCircle className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Activity feed */}
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
                                                    {a.label === 'DepositEvent' ? (
                                                        <PlusCircle className="w-4 h-4 text-primary" />
                                                    ) : a.label === 'WithdrawEvent' ? (
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
                {/* FAQ */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="text-xl">FAQ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {FAQS.map((f, idx) => (
                                <FaqItem key={idx} question={f.q} answer={f.a} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const FAQS: Array<{ q: string; a: React.ReactNode }> = [
    {
        q: 'What tokens can I stake?',
        a: 'You can stake Polymarket outcome tokens (YES/NO) from participating markets that are added to this vault.',
    },
    {
        q: 'How are earnings calculated?',
        a: 'Earnings accrue based on the time-weighted USD value (USD-seconds) of your staked tokens. APY reflects current conditions and is subject to change as prices and TVL update.',
    },
    {
        q: 'When can I claim?',
        a: 'Rewards can be claimed after the campaign is finalized. Your payout is proportional to your accumulated USD-seconds at the end.',
    },
    {
        q: 'What happens if a market is not eligible?',
        a: 'Non-eligible markets still accrue base rewards; only eligible markets also accrue extra rewards when available.',
    },
];

function FaqItem({ question, answer }: { question: string; answer: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border rounded-md">
            <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left" onClick={() => setOpen(o => !o)}>
                <span className="font-medium">{question}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="px-4 pb-4 text-sm text-muted-foreground">{answer}</div>}
        </div>
    );
}

function PotentialEarnings({ apyPct, connected }: { apyPct: number; connected: boolean }) {
    // Mock: derive stakeable from wallet totals; replace with wallet reads
    const walletTotals = useMemo(() => {
        const totalTokens = MOCK_MARKETS.reduce((acc, m) => acc + (m.walletAmount || 0), 0);
        const totalUsd = MOCK_MARKETS.reduce((acc, m) => acc + calcValue(m.walletAmount || 0, m.priceUsd), 0);
        return { totalTokens, totalUsd };
    }, []);

    const campaignEnd = useMemo(() => new Date(Date.now() + 60 * 24 * 3600 * 1000), []);
    const timeLeftYears = useMemo(() => {
        const ms = campaignEnd.getTime() - Date.now();
        return Math.max(0, ms) / (365 * 24 * 3600 * 1000);
    }, [campaignEnd]);

    const stakeUsd = connected ? walletTotals.totalUsd : 0;
    const stakeTokens = connected ? walletTotals.totalTokens / 1_000_000 : 0;
    const potentialYieldUsd = connected ? stakeUsd * (apyPct / 100) * timeLeftYears : 0;

    const endLabel = useMemo(() => campaignEnd.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }), [campaignEnd]);

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-xl">Your potential earnings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Stakeable volume */}
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">You can stake up to</div>
                        <div className="text-3xl md:text-4xl font-extrabold">
                            <ValueState value={`$${formatUsd(stakeUsd, 2)}`} loading={false} error={false} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            <ValueState value={`${formatUsd(stakeTokens, 2)} tokens`} loading={false} error={false} />
                        </div>
                    </div>

                    {/* Times sign */}
                    <div className="text-3xl font-extrabold select-none">×</div>

                    {/* APY */}
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">APY</div>
                        <div className="text-3xl md:text-4xl font-extrabold">
                            <ValueState value={`${apyPct.toFixed(2)}%`} loading={false} error={false} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">annualized</div>
                    </div>

                    {/* Equals sign */}
                    <div className="text-3xl font-extrabold select-none">=</div>

                    {/* Potential yield by end date */}
                    <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Potential yield</div>
                        <div className="text-3xl md:text-4xl font-extrabold">
                            <ValueState value={`$${formatUsd(potentialYieldUsd, 2)}`} loading={false} error={false} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">by {endLabel}</div>
                    </div>
                </div>
                {!connected && <div className="mt-4 text-center text-sm text-muted-foreground">Connect wallet to see potential earnings</div>}
            </CardContent>
        </Card>
    );
}
