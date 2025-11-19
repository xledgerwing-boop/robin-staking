import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { REWARD_ACTIVITIES_TABLE } from '@robin-pm-staking/common/lib/rewards';
import { RewardActivity, RewardActivityRow } from '@robin-pm-staking/common/types/reward-activity';

function isAuthorized(req: NextRequest): boolean {
    const header = req.headers.get('x-admin-password') || '';
    const envPass = process.env.REWARDS_ADMIN_PASSWORD || '';
    return !!envPass && header === envPass;
}

export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = await getDb();
    const activities = (await db(REWARD_ACTIVITIES_TABLE).orderBy('createdAt', 'desc')) as RewardActivityRow[];
    return NextResponse.json({ activities });
}

export async function POST(req: NextRequest) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = await getDb();
    const payload = (await req.json()) as {
        id?: string;
        userAddress: string;
        points: number;
        type: string;
        details?: Record<string, unknown> | null;
        createdAt?: string;
    };
    if (!payload?.userAddress || typeof payload.points !== 'number' || !payload.type) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const row = {
        id: payload.id ?? crypto.randomUUID(),
        userAddress: payload.userAddress.toLowerCase(),
        points: payload.points,
        type: payload.type,
        details: payload.details ?? null,
        createdAt: payload.createdAt ?? Date.now().toString(),
    };
    await db(REWARD_ACTIVITIES_TABLE).insert(row).onConflict('id').merge();
    return NextResponse.json({ ok: true, activity: row });
}

export async function PUT(req: NextRequest) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = await getDb();
    const payload = (await req.json()) as Partial<RewardActivity>;
    if (!payload?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const update: Partial<RewardActivity> = {};
    if (payload.userAddress) update.userAddress = payload.userAddress.toLowerCase();
    if (payload.points != null) update.points = payload.points;
    if (payload.type) update.type = payload.type;
    if (payload.details !== undefined) update.details = payload.details;
    await db(REWARD_ACTIVITIES_TABLE).where('id', payload.id).update(update);
    const activity = await db(REWARD_ACTIVITIES_TABLE).where('id', payload.id).first();
    return NextResponse.json({ ok: true, activity });
}

export async function DELETE(req: NextRequest) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await db(REWARD_ACTIVITIES_TABLE).where('id', id).delete();
    return NextResponse.json({ ok: true });
}
