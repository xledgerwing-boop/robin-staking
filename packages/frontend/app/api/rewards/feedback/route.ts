import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getProxyAddressForUser } from '@/lib/proxy';
import { rateLimit } from '@/lib/rate-limit';
import { doesUserHaveDeposit, FEEDBACK_SUBMISSIONS_TABLE, insertRewardActivity, upsertFeedbackSubmission } from '@/lib/rewards';

type FeedbackPayload = {
    address: string;
    answers: Record<string, unknown>;
};

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/rewards/feedback';
    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const body = (await req.json()) as FeedbackPayload;
        const address = body.address?.toLowerCase();
        if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400 });
        if (!body.answers || typeof body.answers !== 'object') {
            return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
        }

        const db = await getDb();
        const proxy = (await getProxyAddressForUser(address))?.toLowerCase() ?? null;

        if (!proxy) {
            return NextResponse.json({ error: 'Unable to resolve proxy' }, { status: 400 });
        }

        const hasDeposit = await doesUserHaveDeposit(db, proxy);
        if (!hasDeposit) {
            return NextResponse.json({ error: 'Not eligible: no deposit found' }, { status: 403 });
        }

        const existing = await db(FEEDBACK_SUBMISSIONS_TABLE).where('userAddress', address.toLowerCase()).first();
        if (existing) {
            return NextResponse.json({ error: 'Already submitted feedback' }, { status: 400 });
        }

        const submission = await upsertFeedbackSubmission(db, {
            userAddress: address,
            proxyAddress: proxy,
            answers: body.answers,
        });

        const reward = await insertRewardActivity(db, {
            userAddress: address,
            points: 100,
            type: 'Provided Feedback',
            details: { submissionId: submission.id },
        });

        return NextResponse.json({ ok: true, reward, submission });
    } catch (e) {
        console.error('feedback error', e);
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }
}
