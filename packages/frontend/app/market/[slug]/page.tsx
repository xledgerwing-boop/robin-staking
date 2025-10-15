'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Market,
    MarketRow,
    MarketRowToMarket,
    MarketStatus,
    ParsedPolymarketMarket,
    parsePolymarketMarket,
    PolymarketMarketWithEvent,
} from '@robin-pm-staking/common/types/market';
import ActivityTable from '@/components/market/activity-table';
import ManagePositionCard from '@/components/market/manage-position-card';
import CompletedMarketCard from '@/components/market/completed-market-card';
import InitializeMarketCard from '@/components/market/initialize-market-card';
import MarketHeader from '@/components/market/market-header';
import UserPosition from '@/components/market/user-position';
import NoVaultEndedNotice from '@/components/market/no-vault-ended-notice';
import EndedMarketActions from '@/components/market/ended-market-actions';
import PartialUnlockActions from '@/components/market/partial-unlock-actions';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useIsLgScreen } from '@/hooks/use-lg-screen';

export default function MarketDetailPage() {
    const params = useParams();
    const marketSlug = params.slug as string;

    const [market, setMarket] = useState<Market | null>(null);
    const [polymarketMarket, setPolymarketMarket] = useState<ParsedPolymarketMarket | null>(null);
    const [marketLoading, setMarketLoading] = useState(true);
    const isLg = useIsLgScreen();

    const fetchMarket = async () => {
        try {
            const market = await fetch(`/api/markets/${marketSlug}`);
            if (!market.ok) throw new Error('Failed to fetch market');
            const marketData = (await market.json()) as { market: MarketRow; polymarketMarket: PolymarketMarketWithEvent } | null;
            const m = marketData ? MarketRowToMarket(marketData.market) : null;
            const p = marketData ? parsePolymarketMarket(marketData.polymarketMarket) : null;
            setMarket(m);
            setPolymarketMarket(p);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch market');
        } finally {
            setMarketLoading(false);
        }
    };

    useEffect(() => {
        fetchMarket();
    }, [marketSlug]);

    const reloadMarket = async () => {
        await fetchMarket();
    };

    if (marketLoading)
        return (
            <div className="min-h-screen bg-background">
                <div className="h-auto w-full">
                    <div className="container h-full mx-auto flex items-center justify-center mt-24">
                        <Loader className="w-8 h-8 animate-spin" />
                    </div>
                </div>
            </div>
        );

    if (!market || !polymarketMarket)
        return (
            <div className="min-h-screen bg-background">
                <div className="h-auto w-full">
                    <div className="container h-full mx-auto flex items-center justify-center mt-24">
                        <p className="text-sm text-muted-foreground">Market not found</p>
                    </div>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <MarketHeader market={market} polymarketMarket={polymarketMarket} />

                {isLg && (
                    <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2 space-y-6">
                            <UserPosition market={market} polymarketMarket={polymarketMarket} />
                            <ActivityTable market={market} />
                        </div>

                        <div>
                            {market.status === MarketStatus.Uninitialized && !polymarketMarket?.closed ? (
                                <InitializeMarketCard market={market} onInitialized={reloadMarket} />
                            ) : market.status === MarketStatus.Uninitialized && polymarketMarket?.closed ? (
                                <NoVaultEndedNotice polymarketMarket={polymarketMarket} />
                            ) : market.status === MarketStatus.Active && !polymarketMarket?.closed ? (
                                <ManagePositionCard market={market} polymarketMarket={polymarketMarket} onAction={reloadMarket} />
                            ) : market.status === MarketStatus.Active && polymarketMarket?.closed ? (
                                <EndedMarketActions market={market} polymarketMarket={polymarketMarket} onFinalized={reloadMarket} />
                            ) : market.status === MarketStatus.Finalized ? (
                                <PartialUnlockActions market={market} onUnlocked={reloadMarket} />
                            ) : market.status === MarketStatus.Unlocked ? (
                                <CompletedMarketCard market={market} onAction={reloadMarket} />
                            ) : null}
                        </div>
                    </div>
                )}
                {!isLg && (
                    <div className="flex flex-col gap-8">
                        <UserPosition market={market} polymarketMarket={polymarketMarket} />
                        <div>
                            {market.status === MarketStatus.Uninitialized && !polymarketMarket?.closed ? (
                                <InitializeMarketCard market={market} onInitialized={reloadMarket} />
                            ) : market.status === MarketStatus.Uninitialized && polymarketMarket?.closed ? (
                                <NoVaultEndedNotice polymarketMarket={polymarketMarket} />
                            ) : market.status === MarketStatus.Active && !polymarketMarket?.closed ? (
                                <ManagePositionCard market={market} polymarketMarket={polymarketMarket} onAction={reloadMarket} />
                            ) : market.status === MarketStatus.Active && polymarketMarket?.closed ? (
                                <EndedMarketActions market={market} polymarketMarket={polymarketMarket} onFinalized={reloadMarket} />
                            ) : market.status === MarketStatus.Finalized ? (
                                <PartialUnlockActions market={market} onUnlocked={reloadMarket} />
                            ) : market.status === MarketStatus.Unlocked ? (
                                <CompletedMarketCard market={market} onAction={reloadMarket} />
                            ) : null}
                        </div>
                        <ActivityTable market={market} />
                    </div>
                )}
            </div>
        </div>
    );
}
