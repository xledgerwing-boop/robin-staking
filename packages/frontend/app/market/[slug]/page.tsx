'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import {
    MarketRowToMarketWithEvent,
    MarketRowWithEvent,
    MarketStatus,
    MarketWithEvent,
    Outcome,
    ParsedPolymarketMarket,
    parsePolymarketMarket,
    PolymarketMarketWithEvent,
} from '@robin-pm-staking/common/types/market';
import Activities from '@/components/market/activities';
import ManagePositionCard from '@/components/market/manage-position-card';
import CompletedMarketCard from '@/components/market/completed-market-card';
import InitializeMarketCard from '@/components/market/initialize-market-card';
import MarketHeader from '@/components/market/market-header';
import UserPosition from '@/components/market/user-position';
import NoVaultEndedNotice from '@/components/market/no-vault-ended-notice';
import EndedMarketActions from '@/components/market/ended-market-actions';
import PartialUnlockActions from '@/components/market/partial-unlock-actions';
import { Loader } from 'lucide-react';
import { formatUnits } from '@robin-pm-staking/common/lib/utils';

export default function MarketDetailPage() {
    const params = useParams();
    const marketSlug = params.slug as string;

    const [market, setMarket] = useState<MarketWithEvent | null>(null);
    const [polymarketMarket, setPolymarketMarket] = useState<ParsedPolymarketMarket | null>(null);

    const fetchMarket = async () => {
        const market = await fetch(`/api/markets/${marketSlug}`);
        const marketData = (await market.json()) as { market: MarketRowWithEvent; polymarketMarket: PolymarketMarketWithEvent } | null;
        const m = marketData ? MarketRowToMarketWithEvent(marketData.market) : null;
        const p = marketData ? parsePolymarketMarket(marketData.polymarketMarket) : null;
        setMarket(m);
        setPolymarketMarket(p);
    };

    useEffect(() => {
        fetchMarket();
    }, [marketSlug]);

    const reloadMarket = async () => {
        await fetchMarket();
    };

    if (!market || !polymarketMarket)
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="h-auto w-full">
                    <div className="container h-full mx-auto flex items-center justify-center mt-24">
                        <Loader className="w-8 h-8 animate-spin" />
                    </div>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <MarketHeader market={market} polymarketMarket={polymarketMarket} />

                <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <UserPosition market={market} polymarketMarket={polymarketMarket} />
                        <Activities market={market} />
                    </div>

                    <div>
                        {market.status === MarketStatus.Uninitialized && !polymarketMarket?.closed ? (
                            <InitializeMarketCard market={market} onInitialized={reloadMarket} />
                        ) : market.status === MarketStatus.Uninitialized && polymarketMarket?.closed ? (
                            <NoVaultEndedNotice polymarketMarket={polymarketMarket} />
                        ) : market.status === MarketStatus.Active && !polymarketMarket?.closed ? (
                            <ManagePositionCard market={market} polymarketMarket={polymarketMarket} />
                        ) : market.status === MarketStatus.Active && polymarketMarket?.closed ? (
                            <EndedMarketActions market={market} polymarketMarket={polymarketMarket} onFinalized={reloadMarket} />
                        ) : market.status === MarketStatus.Finalized ? (
                            <PartialUnlockActions market={market} onUnlocked={reloadMarket} />
                        ) : market.status === MarketStatus.Unlocked ? (
                            <CompletedMarketCard market={market} />
                        ) : null}
                    </div>
                </div>
                <div className="flex flex-col lg:hidden gap-8">
                    <UserPosition market={market} polymarketMarket={polymarketMarket} />
                    <div>
                        {market.status === MarketStatus.Uninitialized && !polymarketMarket?.closed ? (
                            <InitializeMarketCard market={market} onInitialized={reloadMarket} />
                        ) : market.status === MarketStatus.Uninitialized && polymarketMarket?.closed ? (
                            <NoVaultEndedNotice polymarketMarket={polymarketMarket} />
                        ) : market.status === MarketStatus.Active && !polymarketMarket?.closed ? (
                            <ManagePositionCard market={market} polymarketMarket={polymarketMarket} />
                        ) : market.status === MarketStatus.Active && polymarketMarket?.closed ? (
                            <EndedMarketActions market={market} polymarketMarket={polymarketMarket} onFinalized={reloadMarket} />
                        ) : market.status === MarketStatus.Finalized ? (
                            <PartialUnlockActions market={market} onUnlocked={reloadMarket} />
                        ) : market.status === MarketStatus.Unlocked ? (
                            <CompletedMarketCard market={market} />
                        ) : null}
                    </div>
                    <Activities market={market} />
                </div>
            </div>
        </div>
    );
}
