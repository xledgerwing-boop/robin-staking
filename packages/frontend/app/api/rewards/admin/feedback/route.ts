import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { listFeedbackSubmissions } from '@robin-pm-staking/common/lib/rewards';

function isAuthorized(req: NextRequest): boolean {
    const header = req.headers.get('x-admin-password') || '';
    const envPass = process.env.REWARDS_ADMIN_PASSWORD || '';
    return !!envPass && header === envPass;
}

export async function GET(req: NextRequest) {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const db = await getDb();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
        const { rows, totalCount } = await listFeedbackSubmissions(db, page, pageSize);
        return NextResponse.json({ submissions: rows, page, pageSize, totalCount });
    } catch (e) {
        console.error('Failed to load feedback submissions', e);
        return NextResponse.json({ error: 'Failed to load feedback submissions' }, { status: 500 });
    }
}
