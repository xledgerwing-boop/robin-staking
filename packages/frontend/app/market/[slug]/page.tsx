'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ExternalLink, WalletMinimal, Trophy, Loader } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import { getStatusBadge, MarketRowToMarketWithEvent, MarketWithEvent } from '@/types/market';
import { DateTime } from 'luxon';
import logo from '@/public/logo.png';
import infraredLogo from '@/public/infrared.png';
import dolomiteLogo from '@/public/dolomite.png';
import Activities, { ActivityItem } from '@/components/activities';
import ManagePositionCard from '@/components/market/manage-position-card';
import CompletedMarketCard from '@/components/market/completed-market-card';
import InitializeMarketCard from '@/components/market/initialize-market-card';
import useFakeSigning from '@/hooks/use-fake-signing';
import { useProxyAccount } from '@/hooks/use-proxy-account';

export default function MarketDetailPage() {
    const params = useParams();
    const marketSlug = params.slug as string;
    const { proxyAddress } = useProxyAccount();

    const [market, setMarket] = useState<MarketWithEvent | null>(null);
    const [status, setStatus] = useState<'active' | 'completed' | 'pending'>('active');
    const [winner, setWinner] = useState<'yes' | 'no' | null>(null);
    const wasInitialized = useRef(false);

    // Market metrics (simulation overlay)
    const [tvl, setTvl] = useState<number>(0);
    const [matchedTokens, setMatchedTokens] = useState<number>(0);
    const [unmatchedYesTokens, setUnmatchedYesTokens] = useState<number>(0);
    const [unmatchedNoTokens, setUnmatchedNoTokens] = useState<number>(0);

    // User state
    const [userYes, setUserYes] = useState<number>(0);
    const [userNo, setUserNo] = useState<number>(0);
    const [cashBalance, setCashBalance] = useState<number>(0);
    const [baseEarnedYield, setBaseEarnedYield] = useState<number>(0);
    const [yieldDeposits, setYieldDeposits] = useState<{ amount: number; timestamp: number }[]>([]);
    const [accruedYield, setAccruedYield] = useState<number>(0);

    // Action states
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);

    // Activities
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    const setInitialState = (newState = false) => {
        setCashBalance(5420);
        if (newState) return;
        setUserYes(1250);
        setBaseEarnedYield(50.5);
    };

    useEffect(() => {
        const fetchMarket = async () => {
            const market = await fetch(`/api/markets/${marketSlug}`);
            const marketData = await market.json();
            const m = marketData ? MarketRowToMarketWithEvent(marketData) : null;
            setMarket(m);
            if (m) {
                setTvl(Number(m.tvl));
                setMatchedTokens(Number(m.matchedTokens));
                setUnmatchedYesTokens(Number(m.unmatchedYesTokens));
                setUnmatchedNoTokens(Number(m.unmatchedNoTokens));
                if (m.initialized) {
                    setInitialState();
                }
                wasInitialized.current = m.initialized;
            }
        };
        fetchMarket();
    }, [marketSlug]);

    // Helpers
    const formatNumber = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const nowStr = () => DateTime.now().toLocaleString(DateTime.DATETIME_MED);
    const mockTxHash = () =>
        `0x${Math.floor(Math.random() * 0xffffffff)
            .toString(16)
            .padStart(8, '0')}...`;
    const userAddr = proxyAddress ?? '';
    const { approve: signMessage } = useFakeSigning();

    const userPosition = useMemo(
        () => ({
            yesTokens: userYes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            noTokens: userNo.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            earnedYield: `$${formatNumber(baseEarnedYield + accruedYield)}`,
            balance: cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        }),
        [userYes, userNo, baseEarnedYield, accruedYield, cashBalance],
    );

    if (!market) return <div>Loading...</div>;

    // Action handlers
    const pushActivity = (a: ActivityItem) => setActivities(prev => [{ ...a, id: prev.length + 1 }, ...prev]);

    const onDeposit = async (side: 'yes' | 'no', amount: number) => {
        await signMessage();
        pushActivity({
            id: 0,
            walletAddress: userAddr,
            type: 'deposit',
            position: side,
            info: `Deposited ${formatNumber(amount)} ${side.toUpperCase()}`,
            time: nowStr(),
            txHash: mockTxHash(),
            isCurrentUser: true,
        });
        setCashBalance(b => Math.max(0, b - amount));
        if (side === 'yes') {
            setUserYes(v => v + amount);
            setYieldDeposits(ds => [...ds, { amount, timestamp: Date.now() }]);
            setTvl(v => v + amount);
            setMatchedTokens(m => m + Math.min(amount, unmatchedNoTokens));
            const match = Math.min(amount, unmatchedNoTokens);
            setUnmatchedNoTokens(u => Math.max(0, u - match));
            setUnmatchedYesTokens(u => u + (amount - match));
        } else {
            setUserNo(v => v + amount);
            setYieldDeposits(ds => [...ds, { amount, timestamp: Date.now() }]);
            setTvl(v => v + amount);
            setMatchedTokens(m => m + Math.min(amount, unmatchedYesTokens));
            const match = Math.min(amount, unmatchedYesTokens);
            setUnmatchedYesTokens(u => Math.max(0, u - match));
            setUnmatchedNoTokens(u => u + (amount - match));
        }
    };

    const onWithdraw = async (side: 'yes' | 'no', amount: number) => {
        await signMessage();
        const available = side === 'yes' ? userYes : userNo;
        const amt = Math.min(amount, Math.max(0, available));
        pushActivity({
            id: 0,
            walletAddress: userAddr,
            type: 'withdraw',
            position: side,
            info: `Withdrew ${formatNumber(amt)} ${side.toUpperCase()}`,
            time: nowStr(),
            txHash: mockTxHash(),
            isCurrentUser: true,
        });
        setCashBalance(b => b + amt);
        setTvl(v => Math.max(0, v - amt));
        if (side === 'yes') {
            setUserYes(v => Math.max(0, v - amt));
            // Drain unmatched first, then matched
            setUnmatchedYesTokens(u => {
                const take = Math.min(u, amt);
                const leftover = amt - take;
                if (leftover > 0) setMatchedTokens(m => Math.max(0, m - leftover));
                return u - take;
            });
        } else {
            setUserNo(v => Math.max(0, v - amt));
            setUnmatchedNoTokens(u => {
                const take = Math.min(u, amt);
                const leftover = amt - take;
                if (leftover > 0) setMatchedTokens(m => Math.max(0, m - leftover));
                return u - take;
            });
        }
    };

    const handleFinalize = async () => {
        setIsFinalizing(true);
        try {
            await signMessage();
            setStatus('completed');
            const w: 'yes' | 'no' = 'yes';
            setWinner(w);
            pushActivity({
                id: 0,
                walletAddress: userAddr,
                type: 'finalize',
                position: 'n/a',
                info: `Finalized market. Winner: ${w.toUpperCase()}`,
                time: nowStr(),
                txHash: mockTxHash(),
                isCurrentUser: true,
            });
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleRedeem = async () => {
        if (!winner) return;
        setIsRedeeming(true);
        try {
            await signMessage();
            let redeemed = 0;
            if (winner === 'yes') {
                redeemed = userYes;
                setUserYes(0);
            } else {
                redeemed = userNo;
                setUserNo(0);
            }
            setCashBalance(b => b + redeemed);
            setTvl(v => Math.max(0, v - redeemed));
            pushActivity({
                id: 0,
                walletAddress: userAddr,
                type: 'redeem',
                position: winner,
                info: `Redeemed ${formatNumber(redeemed)} ${winner.toUpperCase()} for ${formatNumber(redeemed)} USDC`,
                time: nowStr(),
                txHash: mockTxHash(),
                isCurrentUser: true,
            });
        } finally {
            setIsRedeeming(false);
        }
    };

    const handleHarvest = async () => {
        const amount = baseEarnedYield + accruedYield;
        if (amount <= 0) return;
        setIsHarvesting(true);
        try {
            await signMessage();
            setCashBalance(b => b + amount);
            setBaseEarnedYield(0);
            setAccruedYield(0);
            setYieldDeposits([]);
            pushActivity({
                id: 0,
                walletAddress: userAddr,
                type: 'harvest',
                position: 'both',
                info: `Harvested $${formatNumber(amount)} yield`,
                time: nowStr(),
                txHash: mockTxHash(),
                isCurrentUser: true,
            });
        } finally {
            setIsHarvesting(false);
        }
    };

    const handleInitialize = async () => {
        await signMessage();
        setMarket(prev => (prev ? { ...prev, initialized: true } : prev));
        pushActivity({
            id: 0,
            walletAddress: userAddr,
            type: 'initialize',
            position: 'n/a',
            info: `Initialized market vault`,
            time: nowStr(),
            txHash: mockTxHash(),
            isCurrentUser: true,
        });
        setInitialState(true);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Market Header */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
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
                                        <div className="flex items-center">{getStatusBadge(status, market.initialized)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {market.initialized && status === 'active' && (
                                    <Button size="sm" onClick={handleFinalize} disabled={isFinalizing}>
                                        <Trophy className="w-4 h-4 mr-1" />
                                        {isFinalizing && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                                        {isFinalizing ? 'Finalizing…' : 'Check Finalization'}
                                    </Button>
                                )}
                                <Link
                                    href={`https://polymarket.com/event/${market.eventSlug}/${market.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" size="sm">
                                        View Market
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Current Metrics */}
                        {market.initialized && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
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
                                    <p className="text-xl font-bold">{formatNumber(tvl)}</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Matched Tokens</p>
                                    <p className="text-xl font-bold">{formatNumber(matchedTokens)}</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Unmatched Tokens</p>
                                    <p className="text-xl font-bold">
                                        {unmatchedYesTokens > 0 ? `${formatNumber(unmatchedYesTokens)} Yes` : ''}{' '}
                                        {unmatchedNoTokens > 0 ? `${formatNumber(unmatchedNoTokens)} No` : ''}
                                        {unmatchedYesTokens === 0 && unmatchedNoTokens === 0 ? '0 Yes/No' : ''}
                                    </p>
                                </div>
                            </div>
                        )}
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
                        <Activities market={market} activities={activities} wasInitialized={wasInitialized.current} />
                    </div>

                    {/* Right Column - Interaction Interface */}
                    <div>
                        {!market.initialized ? (
                            <InitializeMarketCard onInitialize={handleInitialize} />
                        ) : status === 'active' ? (
                            <ManagePositionCard market={market} userPosition={userPosition} onDeposit={onDeposit} onWithdraw={onWithdraw} />
                        ) : (
                            <CompletedMarketCard
                                market={market}
                                userPosition={userPosition}
                                winner={winner}
                                isRedeeming={isRedeeming}
                                isHarvesting={isHarvesting}
                                onRedeem={handleRedeem}
                                onHarvest={handleHarvest}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
