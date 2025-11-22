import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { createReferralEntry } from '@robin-pm-staking/common/lib/referral';
import { cookies } from 'next/headers';
import { REFERRAL_CODES_TABLE } from '@robin-pm-staking/common/lib/repos';

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/referral/track';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const body = await req.json();
        const { userAddress, totalTokens, type } = body;

        if (!userAddress || totalTokens === undefined || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (type !== 'deposit' && type !== 'withdraw') {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        // Get referral code from cookie
        const cookieStore = await cookies();
        const referralCode = cookieStore.get('r')?.value;

        if (!referralCode) {
            return NextResponse.json({ error: 'No referral code found' }, { status: 200 });
        }

        const db = await getDb();

        // Look up referral code ID from code string
        const codeRow = await db(REFERRAL_CODES_TABLE).where('code', referralCode).first();
        if (!codeRow) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
        }

        const timestamp = Date.now();

        await createReferralEntry(db, {
            referralCodeId: codeRow.id,
            userAddress,
            totalTokens: BigInt(totalTokens),
            type,
            timestamp,
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Failed to track referral', e);
        return NextResponse.json({ error: 'Failed to track referral' }, { status: 500 });
    }
}
