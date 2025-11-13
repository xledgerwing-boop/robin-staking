import { Knex } from 'knex';
import type { EventRow } from '@robin-pm-staking/common/types/event';
import { MarketStatus, MarketRow } from '@robin-pm-staking/common/types/market';
import { EVENTS_TABLE, MARKETS_TABLE, USER_POSITIONS_TABLE } from '@robin-pm-staking/common/src/lib/repos';

export interface MarketsQuery {
    search?: string;
    walletOnly?: boolean;
    conditionIds?: string[];
    eventSlug?: string;
    includeUninitialized?: boolean;
    sortField?: 'tvl' | 'endDate' | 'title';
    sortDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
    // When provided, include markets that the user has had positions in (even if not in conditionIds)
    userAddressForWalletOnly?: string;
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

    const userAddressLc = q.userAddressForWalletOnly?.toLowerCase() ?? null;
    if (userAddressLc) {
        // Join user positions to include markets where the user has or had positions
        builder.leftJoin(USER_POSITIONS_TABLE, `${USER_POSITIONS_TABLE}.conditionId`, `${MARKETS_TABLE}.conditionId`);
    }

    if (!q.includeUninitialized) {
        builder.whereNot(`${MARKETS_TABLE}.status`, MarketStatus.Uninitialized);
    }

    const addUserPositionWhere = (b: Knex.QueryBuilder) => {
        if (!userAddressLc) return b;
        b.where(`${USER_POSITIONS_TABLE}.userAddress`, userAddressLc)
            .andWhereRaw(`${USER_POSITIONS_TABLE}.yes_tokens + ${USER_POSITIONS_TABLE}.no_tokens > 0`)
            .andWhereNot(`${MARKETS_TABLE}.status`, MarketStatus.Unlocked);
    };

    if (q.conditionIds && q.walletOnly) {
        // Include markets either explicitly listed by conditionIds OR where the user has positions
        builder.andWhere(b => {
            b.whereIn(`${MARKETS_TABLE}.conditionId`, q.conditionIds as string[]).orWhere(addUserPositionWhere);
        });
    } else if (q.walletOnly) {
        builder.andWhere(addUserPositionWhere);
    }

    if (q.search) {
        const s = q.search.trim();
        builder.andWhere(b => {
            // Use PostgreSQL full-text search for multi-word queries
            // This allows searching for words in any order and not necessarily adjacent
            b.orWhereRaw(`to_tsvector('english', ${MARKETS_TABLE}.question) @@ plainto_tsquery('english', ?)`, [s])
                .orWhereRaw(`to_tsvector('english', ${EVENTS_TABLE}.title) @@ plainto_tsquery('english', ?)`, [s])
                .orWhereILike(`${MARKETS_TABLE}.slug`, `%${s}%`);
        });
    }

    if (q.eventSlug) {
        builder.andWhere(`${MARKETS_TABLE}.eventSlug`, q.eventSlug);
    }

    builder.distinct();

    const countBuilder = builder.clone().count<{ count: string }[]>({ count: `${MARKETS_TABLE}.id` });

    builder.select(`${MARKETS_TABLE}.*`);

    // Sorting
    const sortField = q.sortField ?? 'tvl';
    const sortDirection = q.sortDirection ?? 'desc';
    const sortMap: Record<typeof sortField, string> = {
        tvl: `${MARKETS_TABLE}.tvl`,
        endDate: `${MARKETS_TABLE}.endDate`,
        title: `${MARKETS_TABLE}.question`,
    } as const;
    //first sort by whether in user wallet if searching and we have user address
    if (q.search) {
        if (userAddressLc) {
            builder.orderByRaw(
                `CASE WHEN ${USER_POSITIONS_TABLE}.user_address = ?
                AND ${USER_POSITIONS_TABLE}.yes_tokens + ${USER_POSITIONS_TABLE}.no_tokens > 0
                AND ${MARKETS_TABLE}.status <> ?
                THEN 0 else 1 END`,
                [userAddressLc, MarketStatus.Unlocked]
            );
        }
        if (q.conditionIds?.length) {
            builder.orderByRaw(
                `CASE WHEN ${MARKETS_TABLE}.condition_id IN (${q.conditionIds.map(() => '?').join(',')}) THEN 0 else 1 END`,
                q.conditionIds
            );
        }
    }
    //TODO in general how do I sort by market status?, can't really sort if I don't have the info of Polymarket, but no vault and polymarket ended should not be displayed or only at the bottom ---- maybe run job every hour that deletes unitizialzed markets that have ended on Polymarket?
    builder.orderBy(sortMap[sortField], sortDirection);
    if (sortField === 'tvl') {
        builder.orderByRaw(`${MARKETS_TABLE}.unmatched_yes_tokens + ${MARKETS_TABLE}.unmatched_no_tokens ${sortDirection}`);
    }

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
