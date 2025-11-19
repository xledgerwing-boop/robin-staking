import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { getUserAggregatedPoints, hasUserSubmittedFeedback } from '@robin-pm-staking/common/lib/rewards';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/rewards';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400 });

    try {
        const db = await getDb();
        const hasSubmittedFeedback = await hasUserSubmittedFeedback(db, address.toLowerCase());
        const totalPoints = await getUserAggregatedPoints(db, address.toLowerCase());
        return NextResponse.json({ points: totalPoints, hasSubmittedFeedback });
    } catch (e) {
        console.error('Failed to fetch rewards', e);
        return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
    }
}
