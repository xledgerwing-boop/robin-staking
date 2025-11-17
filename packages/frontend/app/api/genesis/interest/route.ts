import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { GENESIS_INTERESTS_TABLE } from '@robin-pm-staking/common/lib/repos';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/genesis/interest';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const db = await getDb();
        const { searchParams } = new URL(req.url);
        const vault = (searchParams.get('vault') || '').toLowerCase();
        if (!vault || !vault.startsWith('0x') || vault.length !== 42) {
            return NextResponse.json({ error: 'Invalid vault address' }, { status: 400 });
        }
        // Sum remainingUsd for this vault
        const row = await db(GENESIS_INTERESTS_TABLE).where('vaultAddress', vault).sum({ total: 'totalUsd' }).first();
        const registeredUsd = (row?.total as string | null) ?? '0';
        return NextResponse.json({ vault, registeredUsd });
    } catch (e) {
        console.error('GET /api/genesis/interest/oversubscription failed', e);
        return NextResponse.json({ error: 'Failed to load registered interest' }, { status: 500 });
    }
}
