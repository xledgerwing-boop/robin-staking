import { Knex } from 'knex';
import type { EventRow, PolymarketEvent } from '@robin-pm-staking/common/types/event';
import {
    MarketStatus,
    type MarketRow,
    type MarketRowWithEvent,
    type PolymarketMarket,
    type PolymarketMarketWithEvent,
} from '@robin-pm-staking/common/types/market';
import { EVENTS_TABLE, MARKETS_TABLE } from '@robin-pm-staking/common/src/lib/repos';

export interface MarketsQuery {
    search?: string | null;
    conditionIds?: string[] | null;
    eventSlug?: string | null;
    includeUninitialized?: boolean;
    sortField?: 'tvl' | 'liquidationDate' | 'title';
    sortDirection?: 'asc' | 'desc';
}

export async function queryEvent(db: Knex, eventSlug: string): Promise<EventRow | null> {
    const builder = db(EVENTS_TABLE).select(`${EVENTS_TABLE}.*`).where(`${EVENTS_TABLE}.slug`, eventSlug);
    const rows = await builder;
    return rows[0];
}

export async function queryMarketBySlug(db: Knex, slug: string): Promise<MarketRowWithEvent | null> {
    const builder = db(MARKETS_TABLE)
        .select(`${MARKETS_TABLE}.*`, `${EVENTS_TABLE}.slug as eventSlug`)
        .where(`${MARKETS_TABLE}.slug`, slug)
        .leftJoin(EVENTS_TABLE, `${EVENTS_TABLE}.id`, `${MARKETS_TABLE}.eventId`);
    const rows = await builder;
    return rows[0];
}

export async function queryMarkets(db: Knex, q: MarketsQuery): Promise<MarketRow[]> {
    const builder = db(MARKETS_TABLE).select(`${MARKETS_TABLE}.*`).leftJoin(EVENTS_TABLE, `${EVENTS_TABLE}.id`, `${MARKETS_TABLE}.eventId`);

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
                .orWhereILike(`${EVENTS_TABLE}.slug`, `%${s}%`);
        });
    }

    // Sorting
    const sortField = q.sortField ?? 'tvl';
    const sortDirection = q.sortDirection ?? 'desc';
    const sortMap: Record<typeof sortField, string> = {
        tvl: `${MARKETS_TABLE}.tvl`,
        liquidationDate: `${MARKETS_TABLE}.endDate`,
        title: `${MARKETS_TABLE}.question`,
    } as const;
    builder.orderBy(sortMap[sortField], sortDirection);

    const rows = await builder;
    return rows;
}
