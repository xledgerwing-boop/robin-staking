import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ACTIVITIES_TABLE, MARKETS_TABLE } from '@robin-pm-staking/common/src/lib/repos';
import { MarketStatus } from '@robin-pm-staking/common/types/market';

export async function GET() {
    try {
        const db = await getDb();

        const marketsCountRow = await db(MARKETS_TABLE).whereNot('status', MarketStatus.Uninitialized).count<{ count: string }[]>({ count: 'id' });
        const numberOfMarkets = Number(marketsCountRow?.[0]?.count ?? 0);

        const tvlSumRow = await db(MARKETS_TABLE).whereNot('status', MarketStatus.Unlocked).sum<{ sum: string }[]>({ sum: 'tvl' });
        const totalTVL = tvlSumRow?.[0]?.sum ?? '0'; // keep as string to preserve precision

        const usersCountRow = await db(ACTIVITIES_TABLE).whereNotNull('userAddress').countDistinct<{ count: string }[]>({ count: 'userAddress' });
        const totalUsers = Number(usersCountRow?.[0]?.count ?? 0);

        return NextResponse.json({ numberOfMarkets, totalTVL, totalUsers });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to compute metrics' }, { status: 500 });
    }
}
