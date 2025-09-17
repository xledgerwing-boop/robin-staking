'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ExternalLink, WalletMinimal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import { getStatusBadge, MarketRowToMarketWithEvent, MarketWithEvent } from '@/types/market';
import { DateTime } from 'luxon';
import logo from '@/public/logo.png';
import infraredLogo from '@/public/infrared.png';
import dolomiteLogo from '@/public/dolomite.png';
import Activities from '@/components/activities';
import ManagePositionCard from '@/components/market/manage-position-card';
import CompletedMarketCard from '@/components/market/completed-market-card';

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

    const [market, setMarket] = useState<MarketWithEvent | null>(null);

    useEffect(() => {
        const fetchMarket = async () => {
            const market = await fetch(`/api/markets/${marketSlug}`);
            const marketData = await market.json();
            setMarket(marketData ? MarketRowToMarketWithEvent(marketData) : null);
        };
        fetchMarket();
    }, [marketSlug]);

    if (!market) return <div>Loading...</div>;

    const isActive = false; //market ? (market.endDate ? Date.now() < market.endDate : true) : true;
    const computedStatus: 'active' | 'completed' = isActive ? 'active' : 'completed';

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
                                        <div className="flex items-center">{getStatusBadge(computedStatus, market.initialized)}</div>
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
                        {isActive ? (
                            <ManagePositionCard market={market} userPosition={userPosition} />
                        ) : (
                            <CompletedMarketCard market={market} userPosition={userPosition} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
