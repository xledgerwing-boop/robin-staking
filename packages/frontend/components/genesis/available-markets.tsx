'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Loader, ExternalLink } from 'lucide-react';
import { Market, MarketRow, MarketRowToMarket } from '@robin-pm-staking/common/types/market';

export default function AvailableMarkets() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const resp = await fetch('/api/genesis/markets/all');
                const json = await resp.json();
                const list = (json.markets || []) as MarketRow[];
                setMarkets(list.map(MarketRowToMarket));
            } catch (error) {
                console.error('Failed to load markets', error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="h-96 py-8 flex justify-center text-muted-foreground">
                <Loader className="w-5 h-5 animate-spin" />
            </div>
        );
    }

    if (markets.length === 0) {
        return <div className="h-96 text-sm text-muted-foreground text-center py-8">No markets available</div>;
    }

    return (
        <div className="h-96 overflow-y-auto pr-2 space-y-2 pb-2">
            {markets.map(market => (
                <Card key={market.genesisIndex} className="relative overflow-hidden border-muted p-2">
                    {market.genesisEligible && (
                        <div className="pointer-events-none select-none absolute -right-10 top-3 rotate-45 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider px-12 py-1 shadow-md">
                            +4% APY
                        </div>
                    )}
                    <CardContent className="p-2">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 relative shrink-0 rounded-md overflow-hidden bg-muted">
                                <Image src={market.image || '/placeholder.png'} alt={market.question} fill className="object-cover" sizes="150px" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-1">
                                    <div className="font-medium">{market.question}</div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <a
                                        href={`https://polymarket.com/event/${encodeURIComponent(market.eventSlug)}`}
                                        className="flex items-center gap-1 text-primary hover:underline"
                                        target="_blank"
                                    >
                                        Buy on Polymarket
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                                {market.genesisEndedAt && <div className="mt-2 text-xs text-muted-foreground italic">Market ended</div>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
