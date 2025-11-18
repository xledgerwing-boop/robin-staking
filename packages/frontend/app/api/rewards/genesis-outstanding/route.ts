import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { GENESIS_ACTIVITIES_TABLE } from '@robin-pm-staking/common/lib/repos';
import { GenesisVaultEvent } from '@robin-pm-staking/common/types/genesis-events';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/rewards/genesis-outstanding';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const proxyAddress = searchParams.get('proxyAddress');
    if (!proxyAddress) return NextResponse.json({ error: 'Missing proxyAddress' }, { status: 400 });

    try {
        const db = await getDb();
        const claimEvent = await db(GENESIS_ACTIVITIES_TABLE)
            .where('type', GenesisVaultEvent.Claim)
            .andWhere('userAddress', proxyAddress.toLowerCase())
            .first();

        const hasClaimed = !!claimEvent;
        return NextResponse.json({ hasClaimed });
    } catch (e) {
        console.error('Failed to check Genesis claim status', e);
        return NextResponse.json({ error: 'Failed to check claim status' }, { status: 500 });
    }
}
