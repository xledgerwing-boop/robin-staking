import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { MARKETS_TABLE } from '@robin-pm-staking/common/lib/repos';

export async function GET(req: NextRequest) {
    try {
        const db = await getDb();
        const { searchParams } = new URL(req.url);
        const indicesParam = searchParams.get('indices');
        const indexParams = indicesParam
            ? indicesParam
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean)
            : (searchParams.getAll('index') as string[]);
        const indices = Array.from(
            new Set(
                indexParams
                    .map(s => {
                        const n = Number.parseInt(s, 10);
                        return isNaN(n) ? null : n;
                    })
                    .filter((n): n is number => n !== null)
            )
        );
        if (indices.length === 0) {
            return NextResponse.json({ markets: [] });
        }
        const rows = await db(MARKETS_TABLE).select('*').whereIn('promotionIndex', indices).orderBy('eventSlug', 'asc');
        return NextResponse.json({ markets: rows });
    } catch (e) {
        console.error('GET /api/promo/markets/by-index failed', e);
        return NextResponse.json({ error: 'Failed to fetch promo markets' }, { status: 500 });
    }
}
