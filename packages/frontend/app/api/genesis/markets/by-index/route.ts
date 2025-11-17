import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { MARKETS_TABLE } from '@robin-pm-staking/common/lib/repos';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/genesis/markets/by-index';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

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
        const rows = await db(MARKETS_TABLE).select('*').whereIn('genesisIndex', indices).orderBy('eventSlug', 'asc');
        return NextResponse.json({ markets: rows });
    } catch (e) {
        console.error('GET /api/genesis/markets/by-index failed', e);
        return NextResponse.json({ error: 'Failed to fetch genesis markets' }, { status: 500 });
    }
}
