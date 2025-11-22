import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { REFERRAL_CODES_TABLE } from '@robin-pm-staking/common/lib/repos';
import { Knex } from 'knex';

// Admin check - in production, use proper authentication
function isAdmin(req: NextRequest): boolean {
    // For now, check a simple header or env var
    // In production, implement proper admin authentication
    const adminKey = req.headers.get('x-admin-key');
    return adminKey === process.env.REWARDS_ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/referral/codes';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const db = await getDb();
        const { searchParams } = new URL(req.url);
        const ownerAddress = searchParams.get('ownerAddress');

        let query = db(REFERRAL_CODES_TABLE).select('*').orderBy('createdAt', 'desc');

        if (ownerAddress) {
            query = query.where('ownerAddress', ownerAddress.toLowerCase());
        }

        const codes = await query;
        return NextResponse.json({ codes });
    } catch (e) {
        console.error('Failed to fetch referral codes', e);
        return NextResponse.json({ error: 'Failed to fetch referral codes' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/referral/codes';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!isAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { code, ownerAddress, ownerName } = body;

        if (!code || !ownerAddress || !ownerName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await getDb();
        // Generate unique ID - use timestamp-based
        const id = `${code}-${Date.now()}`;
        const createdAt = Date.now().toString();

        // Check if code already exists
        const existing = await db(REFERRAL_CODES_TABLE).where('code', code).first();
        if (existing) {
            return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
        }

        await db(REFERRAL_CODES_TABLE).insert({
            id,
            code,
            ownerAddress: ownerAddress.toLowerCase(),
            ownerName,
            createdAt,
        });

        return NextResponse.json({ success: true, id });
    } catch (e) {
        console.error('Failed to create referral code', e);
        return NextResponse.json({ error: 'Failed to create referral code' }, { status: 500 });
    }
}
