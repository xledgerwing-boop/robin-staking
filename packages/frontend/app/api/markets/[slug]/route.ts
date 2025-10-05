import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { queryMarketBySlug } from '@/lib/repos';
import { fetchMarketBySlug } from '@robin-pm-staking/common/lib/polymarket';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/markets/[slug]'; // Unique identifier per API

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const db = await getDb();

    const { slug } = await params;

    try {
        const result = await queryMarketBySlug(db, slug);
        const polymarketMarket = await fetchMarketBySlug(slug);
        return NextResponse.json({ market: result, polymarketMarket: polymarketMarket });
    } catch {
        return NextResponse.json({ error: 'Failed to query markets' }, { status: 500 });
    }
}
