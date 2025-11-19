import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { REWARD_ACTIVITIES_TABLE } from '@robin-pm-staking/common/lib/rewards';

function isAuthorized(req: NextRequest): boolean {
    const header = req.headers.get('x-admin-password') || '';
    const envPass = process.env.REWARDS_ADMIN_PASSWORD || '';
    return !!envPass && header === envPass;
}

type BatchPayload = {
    userAddresses: string; // comma separated list
    type: string;
    amount: number;
};

export async function POST(req: NextRequest) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = (await req.json()) as BatchPayload;
    if (!payload?.userAddresses || !payload?.type || typeof payload.amount !== 'number') {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const addresses = payload.userAddresses
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);
    if (addresses.length === 0) return NextResponse.json({ error: 'No addresses provided' }, { status: 400 });

    const db = await getDb();
    const now = Date.now().toString();
    const rows = addresses.map(addr => ({
        id: crypto.randomUUID(),
        userAddress: addr.toLowerCase(),
        points: payload.amount,
        type: payload.type,
        details: null,
        createdAt: now,
    }));

    await db(REWARD_ACTIVITIES_TABLE).insert(rows);
    return NextResponse.json({ ok: true, created: rows.length });
}
