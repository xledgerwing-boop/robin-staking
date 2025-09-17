'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Clock, ExternalLink, XCircle, CircleCheck, ArrowDownToLine, ArrowUpToLine, WalletMinimal } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import { getStatusBadge, MarketRowToMarketWithEvent, MarketWithEvent } from '@/types/market';
import { DateTime } from 'luxon';
import logo from '@/public/logo.png';
import infraredLogo from '@/public/infrared.png';
import dolomiteLogo from '@/public/dolomite.png';
import Activities from '@/components/activities';

export default function MarketDetailPage() {
    const params = useParams();
    const marketSlug = params.slug as string;

    const userPosition = {
        yesTokens: '1,250',
        noTokens: '0',
        earnedYield: '$50.50',
        balance: '5,420.00',
        withdrawableAmount: '2,847.30',
    };

    // State for interaction
    const [activeTab, setActiveTab] = useState('deposit');
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [depositSide, setDepositSide] = useState<'yes' | 'no'>('yes');
    const [market, setMarket] = useState<MarketWithEvent | null>(null);

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
        const tabParam = searchParams.get('tab');
        if (tabParam === 'deposit' || tabParam === 'withdraw') {
            if (tabParam !== activeTab) setActiveTab(tabParam);
        }

        const sideParam = searchParams.get('side');
        if (sideParam === 'yes' || sideParam === 'no') {
            if (sideParam !== depositSide) setDepositSide(sideParam);
        }
    };

    useEffect(() => {
        loadQueryParams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        const fetchMarket = async () => {
            const market = await fetch(`/api/markets/${marketSlug}`);
            const marketData = await market.json();
            setMarket(marketData ? MarketRowToMarketWithEvent(marketData) : null);
        };
        fetchMarket();
    }, [marketSlug]);

    if (!market) return <div>Loading...</div>;

    const handleMaxDeposit = () => {
        setDepositAmount(userPosition.balance.replace('$', '').replace(',', ''));
    };

    const handleMaxWithdraw = () => {
        setWithdrawAmount(userPosition.withdrawableAmount.replace('$', '').replace(',', ''));
    };

    const calculateExpectedYield = (amount: string) => {
        const numAmount = Number.parseFloat(amount) || 0;
        const apy = market.apyBps / 10_000;
        const daysUntilResolution = DateTime.fromMillis(market.endDate ?? Date.now()).diff(DateTime.now(), 'days').days;
        const expectedYield = (numAmount * apy * daysUntilResolution) / 365;
        return expectedYield.toFixed(2);
    };

    const handleTabChange = (value: string) => {
        const tab = value === 'withdraw' ? 'withdraw' : 'deposit';
        setActiveTab(tab);
        updateQueryParams({ tab });
    };

    const handleDepositSideChange = (value: string) => {
        const side = value === 'no' ? 'no' : 'yes';
        setDepositSide(side);
        updateQueryParams({ side });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Market Header */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="relative w-12 h-12 shrink-0">
                                    <Image
                                        src={market.image || '/placeholder.png'}
                                        alt={market.question ?? 'Market'}
                                        fill
                                        className="rounded-lg object-cover"
                                        sizes="150px"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{market.question}</h1>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                Liquidates:{' '}
                                                {market.endDate ? DateTime.fromMillis(market.endDate).toLocaleString(DateTime.DATE_MED) : '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center">{getStatusBadge('active' /*market.status*/, market.initialized)}</div>
                                    </div>
                                </div>
                            </div>
                            <Link href={`https://polymarket.com/event/${market.eventSlug}/${market.slug}`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">
                                    View Market
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Current Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Current APY</p>
                                <p className="text-xl font-bold text-primary">{((market.apyBps / 10_000) * 100).toFixed(2)}%</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Yield Sources</p>
                                <div className="flex items-center justify-center gap-2 text-md font-bold text-primary mt-1">
                                    <Image src={infraredLogo} alt="Infrared" width={15} height={15} />
                                    <span>Infrared</span>
                                    <Image src={dolomiteLogo} alt="Dolomite" width={15} height={15} />
                                    <span>Dolomite</span>
                                    <Image src={logo} alt="Robin" width={15} height={15} />
                                    <span>Robin</span>
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">TVL</p>
                                <p className="text-xl font-bold">{market.tvl}</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Matched Tokens</p>
                                <p className="text-xl font-bold">{market.matchedTokens}</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Unmatched Tokens</p>
                                <p className="text-xl font-bold">
                                    {market.unmatchedYesTokens > 0 ? `${market.unmatchedYesTokens} Yes` : ''}{' '}
                                    {market.unmatchedNoTokens > 0 ? `${market.unmatchedNoTokens} No` : ''}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - User Position & Activities */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* User Position */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <WalletMinimal className="w-5 h-5" />
                                    <span>Your Position</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">YES Tokens</p>
                                        <p className="text-lg font-bold">{userPosition.yesTokens}</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">NO Tokens</p>
                                        <p className="text-lg font-bold">{userPosition.noTokens}</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Earned Yield</p>
                                        <p className="text-lg font-bold text-primary">{userPosition.earnedYield}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Activities market={market} />
                    </div>

                    {/* Right Column - Interaction Interface */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Position</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={handleTabChange}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="deposit">Deposit</TabsTrigger>
                                        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="deposit" className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-3 border-b pb-4">
                                                <Input
                                                    id="deposit-amount"
                                                    type="number"
                                                    inputMode="decimal"
                                                    placeholder="0"
                                                    value={depositAmount}
                                                    onChange={e => setDepositAmount(e.target.value)}
                                                    className="flex-1 border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 h-auto px-0 py-0 text-4xl sm:text-4xl md:text-4xl appearance-none font-semibold tracking-tight"
                                                />
                                                <Select value={depositSide} onValueChange={handleDepositSideChange}>
                                                    <SelectTrigger
                                                        className={cn(
                                                            'px-4 py-2 rounded-full border text-sm font-medium',
                                                            depositSide === 'yes'
                                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                                : 'bg-red-50 text-red-600 border-red-200',
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {depositSide === 'yes' ? (
                                                                <CircleCheck className="w-4 h-4 text-emerald-600" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                            )}
                                                            <span className="capitalize">{depositSide}</span>
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="yes">
                                                            <div className="flex items-center gap-2 text-emerald-600">
                                                                <CircleCheck className="w-4 h-4 text-emerald-600" />
                                                                <span>Yes</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="no">
                                                            <div className="flex items-center gap-2 text-red-600">
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                                <span>No</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex space-x-2 justify-between">
                                                <p className="text-sm text-muted-foreground">Balance: {userPosition.balance}</p>
                                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleMaxDeposit}>
                                                    Max
                                                </Button>
                                            </div>
                                        </div>

                                        {depositAmount && (
                                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                                <h4 className="font-medium">Position Preview</h4>
                                                <div className="flex justify-between text-sm">
                                                    <span>Your Position:</span>
                                                    <span>
                                                        {depositAmount} {depositSide}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>APY:</span>
                                                    <span className="text-primary">{((market.apyBps / 10_000) * 100).toFixed(2)}%</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>
                                                        Expected Yield by{' '}
                                                        {market.endDate ? DateTime.fromMillis(market.endDate).toLocaleString(DateTime.DATE_MED) : '—'}
                                                        :
                                                    </span>
                                                    <span className="text-primary">${calculateExpectedYield(depositAmount)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <Button className="w-full">
                                            <ArrowUpToLine className="w-4 h-4 mr-2" />
                                            Deposit {depositAmount || '0.00'} {depositSide}
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="withdraw" className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-3 border-b pb-4">
                                                <Input
                                                    id="withdraw-amount"
                                                    type="number"
                                                    inputMode="decimal"
                                                    placeholder="0"
                                                    value={withdrawAmount}
                                                    onChange={e => setWithdrawAmount(e.target.value)}
                                                    className="flex-1 border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 h-auto px-0 py-0 text-4xl sm:text-4xl md:text-4xl appearance-none font-semibold tracking-tight"
                                                />
                                                <Select value={depositSide} onValueChange={handleDepositSideChange}>
                                                    <SelectTrigger
                                                        className={cn(
                                                            'px-4 py-2 rounded-full border text-sm font-medium',
                                                            depositSide === 'yes'
                                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                                : 'bg-red-50 text-red-600 border-red-200',
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {depositSide === 'yes' ? (
                                                                <CircleCheck className="w-4 h-4 text-emerald-600" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                            )}
                                                            <span className="capitalize">{depositSide}</span>
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="yes">
                                                            <div className="flex items-center gap-2 text-emerald-600">
                                                                <CircleCheck className="w-4 h-4 text-emerald-600" />
                                                                <span>Yes</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="no">
                                                            <div className="flex items-center gap-2 text-red-600">
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                                <span>No</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex space-x-2 justify-between">
                                                <p className="text-sm text-muted-foreground">Balance: {userPosition.withdrawableAmount}</p>
                                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleMaxWithdraw}>
                                                    Max
                                                </Button>
                                            </div>
                                        </div>

                                        {withdrawAmount && (
                                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                                <h4 className="font-medium">Withdrawal Preview</h4>
                                                <div className="flex justify-between text-sm">
                                                    <span>Withdrawal Amount:</span>
                                                    <span>${withdrawAmount}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Remaining Position:</span>
                                                    <span>
                                                        $
                                                        {(
                                                            Number.parseFloat(userPosition.withdrawableAmount.replace('$', '').replace(',', '')) -
                                                            (Number.parseFloat(withdrawAmount) || 0)
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <Button className="w-full" variant="secondary">
                                            <ArrowDownToLine className="w-4 h-4 mr-2" />
                                            Withdraw {withdrawAmount || '0.00'} {depositSide}
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
