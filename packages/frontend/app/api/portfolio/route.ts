import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { MARKETS_TABLE, USER_POSITIONS_TABLE } from '@robin-pm-staking/common/src/lib/repos';
import { rateLimit } from '@/lib/rate-limit';
import { MarketStatus } from '@robin-pm-staking/common/types/market';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/portfolio';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const filterParam = (searchParams.get('filter') as 'all' | 'active' | 'ended') || 'active';
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400 });

    try {
        const db = await getDb();

        const addressLc = address.toLowerCase();

        // Totals across ALL positions (not paginated, not filtered); query sums separately for clear typing
        const sums = await db(USER_POSITIONS_TABLE)
            .where(`${USER_POSITIONS_TABLE}.userAddress`, addressLc)
            .sum<{ sumYes: string; sumNo: string; sumHarvested: string }[]>({
                sumYes: `${USER_POSITIONS_TABLE}.yesTokens`,
                sumNo: `${USER_POSITIONS_TABLE}.noTokens`,
                sumHarvested: `${USER_POSITIONS_TABLE}.yieldHarvested`,
            });
        const yesSum = sums?.[0]?.sumYes ?? '0';
        const noSum = sums?.[0]?.sumNo ?? '0';
        const harvestedSum = sums?.[0]?.sumHarvested ?? '0';

        // Base filtered query
        const base = db(USER_POSITIONS_TABLE)
            .leftJoin(MARKETS_TABLE, `${MARKETS_TABLE}.conditionId`, `${USER_POSITIONS_TABLE}.conditionId`)
            .where(`${USER_POSITIONS_TABLE}.userAddress`, addressLc);

        if (filterParam === 'ended') {
            base.andWhere(`${MARKETS_TABLE}.status`, MarketStatus.Unlocked)
                .andWhere(`${USER_POSITIONS_TABLE}.yieldHarvested`, '>', 0)
                .andWhere(`${USER_POSITIONS_TABLE}.usdRedeemed`, '>', 0);
        } else if (filterParam === 'active') {
            base.andWhere(q => {
                q.where(`${USER_POSITIONS_TABLE}.yieldHarvested`, '=', 0).orWhere(`${USER_POSITIONS_TABLE}.usdRedeemed`, '=', 0);
            });
        }

        // Count for pagination (distinct by position id)
        const countRows = await base.clone().countDistinct<{ count: string }[]>({ count: `${USER_POSITIONS_TABLE}.id` });
        const totalCount = Number(countRows?.[0]?.count ?? 0);

        // Page fetch
        const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
        const pageSize = 10;
        const offset = (page - 1) * pageSize;

        const deposits = await base
            .clone()
            .select(
                `${USER_POSITIONS_TABLE}.*`,
                `${MARKETS_TABLE}.question`,
                `${MARKETS_TABLE}.image`,
                `${MARKETS_TABLE}.endDate`,
                `${MARKETS_TABLE}.status`,
                `${MARKETS_TABLE}.slug`
            )
            .orderBy(`${USER_POSITIONS_TABLE}.updatedAt`, 'desc')
            .limit(pageSize)
            .offset(offset);

        return NextResponse.json({
            yesSum,
            noSum,
            harvestedSum,
            page,
            pageSize,
            totalCount,
            filter: filterParam,
            deposits,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
    }
}
