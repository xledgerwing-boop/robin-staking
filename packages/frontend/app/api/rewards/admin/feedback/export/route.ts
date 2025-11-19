import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FEEDBACK_SUBMISSIONS_TABLE } from '@robin-pm-staking/common/lib/rewards';

function isAuthorized(req: NextRequest): boolean {
    const header = req.headers.get('x-admin-password') || '';
    const envPass = process.env.REWARDS_ADMIN_PASSWORD || '';
    return !!envPass && header === envPass;
}

export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const db = await getDb();
        const submissions = await db(FEEDBACK_SUBMISSIONS_TABLE).orderBy('createdAt', 'desc');
        return NextResponse.json({ submissions });
    } catch (e) {
        console.error('Failed to export feedback submissions', e);
        return NextResponse.json({ error: 'Failed to export feedback submissions' }, { status: 500 });
    }
}
