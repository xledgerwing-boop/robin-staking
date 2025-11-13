'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronDown, ArrowUpRight, PlusCircle, MinusCircle } from 'lucide-react';
import AmountSlider from '@robin-pm-staking/common/components/amount-slider';
import OutcomeToken from '@robin-pm-staking/common/components/outcome-token';
import { MOCK_MARKETS, calcValue, formatUsd } from './utils';

export default function Manage() {
    const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
    const [depositDraft, setDepositDraft] = useState<Record<string, number>>(() => {
        const d: Record<string, number> = {};
        for (const m of MOCK_MARKETS) d[m.id] = m.walletAmount;
        return d;
    });
    const [withdrawDraft, setWithdrawDraft] = useState<Record<string, number>>(() => {
        const w: Record<string, number> = {};
        for (const m of MOCK_MARKETS) w[m.id] = m.vaultAmount;
        return w;
    });

    const depositSummary = useMemo(() => {
        const totalTokens = Object.entries(depositDraft).reduce((acc, [, amt]) => acc + (amt || 0), 0);
        const totalUsd = MOCK_MARKETS.reduce((acc, m) => acc + calcValue(depositDraft[m.id] || 0, m.priceUsd), 0);
        return { totalTokens, totalUsd };
    }, [depositDraft]);

    const withdrawSummary = useMemo(() => {
        const totalTokens = Object.entries(withdrawDraft).reduce((acc, [, amt]) => acc + (amt || 0), 0);
        const totalUsd = MOCK_MARKETS.reduce((acc, m) => acc + calcValue(withdrawDraft[m.id] || 0, m.priceUsd), 0);
        return { totalTokens, totalUsd };
    }, [withdrawDraft]);

    return (
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
                                                        <Image src={m.image || '/placeholder.png'} alt="market" fill className="object-cover" />
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
                                                        <Image src={m.image || '/placeholder.png'} alt="market" fill className="object-cover" />
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
                                                                            [m.id]: Math.max(0, Math.min(max, Math.round(parsed * 1_000_000))),
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
    );
}
