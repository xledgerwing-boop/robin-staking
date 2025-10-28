import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { doesUserHaveDeposit } from '@/lib/rewards';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/rewards/eligibility';
    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const proxyAddress = searchParams.get('proxyAddress');
    if (!proxyAddress) return NextResponse.json({ error: 'Missing proxy address' }, { status: 400 });

    try {
        const db = await getDb();
        const hasDeposit = await doesUserHaveDeposit(db, proxyAddress.toLowerCase());
        return NextResponse.json({ hasDeposit });
    } catch (e) {
        console.error('eligibility error', e);
        return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 });
    }
}
