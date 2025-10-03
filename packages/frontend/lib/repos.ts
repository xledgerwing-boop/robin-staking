import { Knex } from 'knex';
import type { EventRow, PolymarketEvent } from '@robin-pm-staking/common/types/event';
import {
    MarketStatus,
    type MarketRow,
    type MarketRowWithEvent,
    type PolymarketMarket,
    type PolymarketMarketWithEvent,
} from '@robin-pm-staking/common/types/market';

const EVENTS_TABLE = 'events';
const MARKETS_TABLE = 'markets';

export async function ensureSchema(db: Knex): Promise<void> {
    const hasEvents = await db.schema.hasTable(EVENTS_TABLE);
    if (!hasEvents) {
        await db.schema.createTable(EVENTS_TABLE, table => {
            table.string('id').primary();
            table.string('slug').notNullable().index();
            table.string('title');
            table.bigint('end_date');
            table.string('image');
            table.bigint('created_at');
            table.bigint('updated_at');
        });
    }

    const hasMarkets = await db.schema.hasTable(MARKETS_TABLE);
    if (!hasMarkets) {
        await db.schema.createTable(MARKETS_TABLE, table => {
            table.string('id').primary();
            table.string('contract_address').nullable();
            table.string('question');
            table.string('condition_id').unique().index();
            table.string('slug');
            table.bigint('end_date').nullable();
            table.bigint('start_date').nullable();
            table.string('image').nullable();
            table.string('status').notNullable().defaultTo(MarketStatus.Uninitialized);
            table.jsonb('outcomes');
            table.jsonb('clob_token_ids');
            table.boolean('neg_risk').nullable();
            table.string('event_id').notNullable().references('id').inTable(EVENTS_TABLE).onDelete('CASCADE');
            table.decimal('tvl', 78, 0);
            table.decimal('unmatched_yes_tokens', 78, 0);
            table.decimal('unmatched_no_tokens', 78, 0);
            table.decimal('matched_tokens', 78, 0);
            table.string('winning_position').nullable();
            table.bigint('created_at');
            table.bigint('updated_at');
        });
    }
}

export async function upsertEvent(db: Knex, evt: PolymarketEvent): Promise<EventRow> {
    const row: EventRow = {
        id: evt.id,
        slug: evt.slug,
        title: evt.title,
        endDate: evt.endDate ? new Date(evt.endDate).getTime().toString() : undefined,
        image: evt.image,
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
    };
    await db(EVENTS_TABLE).insert(row).onConflict('id').merge({ title: row.title, image: row.image, updatedAt: Date.now() });
    return row;
}

export async function upsertMarket(
    db: Knex,
    market: PolymarketMarket | PolymarketMarketWithEvent,
    initialized: boolean,
    contractAddress?: string
): Promise<MarketRow> {
    if (initialized && !contractAddress) {
        throw new Error('Contract address is required when market is initialized');
    }
    const eventId = (market as PolymarketMarket).eventId ?? (market as PolymarketMarketWithEvent).events[0].id;
    const row: MarketRow = {
        id: market.id,
        contractAddress: contractAddress,
        eventId,
        question: market.question,
        conditionId: market.conditionId,
        slug: market.slug,
        endDate: market.endDate ? new Date(market.endDate).getTime().toString() : undefined,
        startDate: market.startDate ? new Date(market.startDate).getTime().toString() : undefined,
        image: market.image,
        outcomes: market.outcomes,
        clobTokenIds: market.clobTokenIds,
        negRisk: market.negRisk ?? false,
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
        status: initialized ? MarketStatus.Active : MarketStatus.Uninitialized,
        tvl: (0).toString(),
        unmatchedYesTokens: (0).toString(),
        unmatchedNoTokens: (0).toString(),
        matchedTokens: (0).toString(),
    };
    await db(MARKETS_TABLE).insert(row).onConflict('conditionId').merge({
        contractAddress: row.contractAddress,
        question: row.question,
        image: row.image,
        tvl: row.tvl,
        status: row.status,
        unmatchedYesTokens: row.unmatchedYesTokens,
        unmatchedNoTokens: row.unmatchedNoTokens,
        matchedTokens: row.matchedTokens,
        updatedAt: Date.now(),
    });
    return row;
}

export interface MarketsQuery {
    search?: string | null;
    conditionIds?: string[] | null;
    eventSlug?: string | null;
    includeUninitialized?: boolean;
    sortField?: 'apy' | 'tvl' | 'liquidationDate' | 'title';
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
    const sortField = q.sortField ?? 'apy';
    const sortDirection = q.sortDirection ?? 'desc';
    const sortMap: Record<typeof sortField, string> = {
        apy: `${MARKETS_TABLE}.apyBps`,
        tvl: `${MARKETS_TABLE}.tvl`,
        liquidationDate: `${MARKETS_TABLE}.endDate`,
        title: `${MARKETS_TABLE}.question`,
    } as const;
    builder.orderBy(sortMap[sortField], sortDirection);

    const rows = await builder;
    return rows;
}
