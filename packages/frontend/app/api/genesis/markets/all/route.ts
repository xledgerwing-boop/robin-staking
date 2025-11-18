import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { MARKETS_TABLE } from '@robin-pm-staking/common/lib/repos';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/genesis/markets/all';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const db = await getDb();
        const rows = await db(MARKETS_TABLE).select('*').whereNotNull('genesisIndex').orderBy('genesisEndedAt', 'desc').orderBy('question', 'asc');
        return NextResponse.json({ markets: rows });
    } catch (e) {
        console.error('GET /api/genesis/markets/all failed', e);
        return NextResponse.json({ error: 'Failed to fetch genesis markets' }, { status: 500 });
    }
}
