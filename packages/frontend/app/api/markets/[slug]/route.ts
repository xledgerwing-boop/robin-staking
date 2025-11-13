import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { queryMarketBySlug } from '@/lib/repos';
import { fetchMarketByConditionId, fetchMarketBySlug } from '@robin-pm-staking/common/lib/polymarket';
import { rateLimit } from '@/lib/rate-limit';
import { getAndSaveEventAndMarkets, MARKETS_TABLE } from '@robin-pm-staking/common/lib/repos';
import { PolymarketMarketWithEvent } from '@robin-pm-staking/common/types/market';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/markets/[slug]'; // Unique identifier per API

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const db = await getDb();

    const { slug } = await params;

    try {
        let result = await queryMarketBySlug(db, slug);
        let polymarketMarket: PolymarketMarketWithEvent | null = null;
        try {
            polymarketMarket = await fetchMarketBySlug(slug);
        } catch (e) {
            if (result) {
                // We do have the market already but we can't find it on Polymarket -> it's likely that Polymarket changed the slug.
                polymarketMarket = await fetchMarketByConditionId(result.conditionId);
                if (polymarketMarket) {
                    // Update the slug in the database
                    await db(MARKETS_TABLE).where('id', result.id).update({ slug: polymarketMarket.slug });
                    return NextResponse.redirect(new URL(`/market/${polymarketMarket.slug}`, request.url), 308);
                }
            } else throw e;
        }

        if (!result && polymarketMarket) {
            await getAndSaveEventAndMarkets(db, polymarketMarket.events[0].slug);
            result = await queryMarketBySlug(db, slug);
        } else if (!result && !polymarketMarket) {
            return NextResponse.json({ error: 'Market not found' }, { status: 404 });
        }
        return NextResponse.json({ market: result, polymarketMarket: polymarketMarket });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to query markets' }, { status: 500 });
    }
}
