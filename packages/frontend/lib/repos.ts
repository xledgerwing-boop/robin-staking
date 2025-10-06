import { Knex } from 'knex';
import type { EventRow } from '@robin-pm-staking/common/types/event';
import { MarketStatus, MarketRow } from '@robin-pm-staking/common/types/market';
import { EVENTS_TABLE, MARKETS_TABLE } from '@robin-pm-staking/common/src/lib/repos';

export interface MarketsQuery {
    search?: string | null;
    conditionIds?: string[] | null;
    eventSlug?: string | null;
    includeUninitialized?: boolean;
    sortField?: 'tvl' | 'endDate' | 'title';
    sortDirection?: 'asc' | 'desc';
    page?: number | null;
    pageSize?: number | null;
}

export async function queryEvent(db: Knex, eventSlug: string): Promise<EventRow | null> {
    const builder = db(EVENTS_TABLE).select(`${EVENTS_TABLE}.*`).where(`${EVENTS_TABLE}.slug`, eventSlug);
    const rows = await builder;
    return rows[0];
}

export async function queryMarketBySlug(db: Knex, slug: string): Promise<MarketRow | null> {
    const builder = db(MARKETS_TABLE).select(`${MARKETS_TABLE}.*`).where(`${MARKETS_TABLE}.slug`, slug);
    const rows = await builder;
    return rows[0];
}

export async function queryMarkets(db: Knex, q: MarketsQuery): Promise<{ rows: MarketRow[]; count: number }> {
    const builder = db(MARKETS_TABLE).leftJoin(EVENTS_TABLE, `${EVENTS_TABLE}.id`, `${MARKETS_TABLE}.eventId`);

    if (!q.includeUninitialized) {
        builder.whereNot(`${MARKETS_TABLE}.status`, MarketStatus.Uninitialized);
    }

    if (q.conditionIds && q.conditionIds.length > 0) {
        builder.whereIn(`${MARKETS_TABLE}.conditionId`, q.conditionIds);
    }

    if (q.search) {
        const s = q.search.trim();
        builder.andWhere(b => {
            b.whereILike(`${MARKETS_TABLE}.conditionId`, `%${s}%`)
                .orWhereILike(`${MARKETS_TABLE}.question`, `%${s}%`)
                .orWhereILike(`${MARKETS_TABLE}.slug`, `%${s}%`)
                .orWhereILike(`${EVENTS_TABLE}.slug`, `%${s}%`)
                .orWhereILike(`${EVENTS_TABLE}.title`, `%${s}%`);
        });
    }

    const countBuilder = builder.clone().countDistinct<{ count: string }[]>({ count: `${MARKETS_TABLE}.id` });

    builder.select(`${MARKETS_TABLE}.*`);

    // Sorting
    const sortField = q.sortField ?? 'tvl';
    const sortDirection = q.sortDirection ?? 'desc';
    const sortMap: Record<typeof sortField, string> = {
        tvl: `${MARKETS_TABLE}.tvl`,
        endDate: `${MARKETS_TABLE}.endDate`,
        title: `${MARKETS_TABLE}.question`,
    } as const;
    builder.orderBy(sortMap[sortField], sortDirection);

    // Pagination
    if (q.page && q.pageSize) {
        const page = Math.max(1, q.page);
        const pageSize = Math.max(1, Math.min(q.pageSize, 100));
        builder.limit(pageSize).offset((page - 1) * pageSize);
    }

    const [rows, countRow] = await Promise.all([builder, countBuilder]);
    const count = Number(countRow?.[0]?.count ?? 0);
    return { rows, count };
}
