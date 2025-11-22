import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { REFERRAL_CODES_TABLE, REFERRAL_ENTRIES_TABLE } from '@robin-pm-staking/common/lib/repos';

const REFERRAL_POINTS_POOL = 25_000n;

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/referral/overview';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const codeId = searchParams.get('codeId');
        const ownerAddress = searchParams.get('ownerAddress');

        if (!codeId && !ownerAddress) {
            return NextResponse.json({ error: 'Missing codeId or ownerAddress' }, { status: 400 });
        }

        const db = await getDb();

        // Get referral code
        let codeQuery = db(REFERRAL_CODES_TABLE).select('*');
        if (codeId) {
            codeQuery = codeQuery.where('id', codeId);
        } else if (ownerAddress) {
            codeQuery = codeQuery.where('ownerAddress', ownerAddress.toLowerCase());
        }
        const codes = await codeQuery;

        if (codes.length === 0) {
            return NextResponse.json({ error: 'Referral code not found' }, { status: 404 });
        }

        const code = codes[0];

        // Get all entries for this code
        const entries = await db(REFERRAL_ENTRIES_TABLE).where('referralCodeId', code.id).whereNotNull('realizedValue').orderBy('timestamp', 'desc');

        // Get all entries for this code
        const totalRealizedValueRow = await db(REFERRAL_ENTRIES_TABLE)
            .where('referralCodeId', code.id)
            .whereNotNull('realizedValue')
            .sum('realizedValue');
        const totalRealizedValue = BigInt((totalRealizedValueRow?.[0]?.sum as string | undefined) ?? '0');

        // Get total realized value across all codes for pro-rata calculation
        const totalPoolValueRow = await db(REFERRAL_ENTRIES_TABLE).whereNotNull('realizedValue').sum('realizedValue');
        const totalPoolValue = BigInt((totalPoolValueRow?.[0]?.sum as string | undefined) ?? '0');

        // Calculate points (pro-rata)
        const points = totalPoolValue > 0n ? (totalRealizedValue * REFERRAL_POINTS_POOL) / totalPoolValue : 0n;

        return NextResponse.json({
            code: {
                id: code.id,
                code: code.code,
                ownerAddress: code.ownerAddress,
                ownerName: code.ownerName,
                createdAt: code.createdAt,
            },
            entries: entries.map(e => ({
                id: e.id,
                userAddress: e.userAddress,
                totalTokens: e.totalTokens,
                realizedValue: e.realizedValue,
                timestamp: e.timestamp,
                transactionHash: e.transactionHash,
                type: e.type,
            })),
            totalRealizedValue: totalRealizedValue.toString(),
            points: points.toString(),
        });
    } catch (e) {
        console.error('Failed to fetch referral overview', e);
        return NextResponse.json({ error: 'Failed to fetch referral overview' }, { status: 500 });
    }
}
