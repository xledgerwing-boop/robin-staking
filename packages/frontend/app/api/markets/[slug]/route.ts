import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureSchema, queryMarketBySlug } from '@/lib/repos';
import { fetchMarketBySlug } from '@robin-pm-staking/common/lib/polymarket';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const db = getDb();
    await ensureSchema(db);

    const { slug } = await params;

    try {
        const result = await queryMarketBySlug(db, slug);
        const polymarketMarket = await fetchMarketBySlug(slug);
        return NextResponse.json({ market: result, polymarketMarket: polymarketMarket });
    } catch {
        return NextResponse.json({ error: 'Failed to query markets' }, { status: 500 });
    }
}
