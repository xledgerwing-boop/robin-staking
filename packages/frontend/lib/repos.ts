import { Knex } from 'knex';
import { EventRow, PolymarketEventDTO } from '../types/event';
import { MarketRow, MarketRowWithEvent, PolymarketMarketDTO, PolymarketMarketWithEvent } from '../types/market';

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
            table.string('question');
            table.string('condition_id').unique().index();
            table.string('slug');
            table.bigint('end_date').nullable();
            table.bigint('start_date').nullable();
            table.string('image').nullable();
            table.jsonb('outcomes');
            table.jsonb('clob_token_ids');
            table.boolean('neg_risk').nullable();
            table.string('event_id').notNullable().references('id').inTable(EVENTS_TABLE).onDelete('CASCADE');
            table.decimal('tvl', 78, 0);
            table.integer('apy_bps');
            table.boolean('initialized').notNullable().defaultTo(false).index();
            table.decimal('unmatched_yes_tokens', 78, 0);
            table.decimal('unmatched_no_tokens', 78, 0);
            table.decimal('matched_tokens', 78, 0);
            table.bigint('created_at');
            table.bigint('updated_at');
        });
    }
}

export async function upsertEvent(db: Knex, evt: PolymarketEventDTO): Promise<EventRow> {
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

export async function upsertMarket(db: Knex, market: PolymarketMarketDTO | PolymarketMarketWithEvent, initialized: boolean): Promise<MarketRow> {
    const eventId = (market as PolymarketMarketDTO).eventId ?? (market as PolymarketMarketWithEvent).events[0].id;
    const tvl = 50_000 * Math.random();
    const unmatchedTokens = 5_000 * Math.random();
    const matchedTokens = tvl;
    const unmatchedYesTokens = unmatchedTokens * (Math.random() > 0.5 ? 1 : 0);
    const unmatchedNoTokens = unmatchedTokens - unmatchedYesTokens;
    const row: MarketRow = {
        id: market.id,
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
        initialized,
        tvl: tvl.toString(),
        apyBps: Math.floor(500 + Math.random() * 500),
        unmatchedYesTokens: unmatchedYesTokens.toString(),
        unmatchedNoTokens: unmatchedNoTokens.toString(),
        matchedTokens: matchedTokens.toString(),
    };
    await db(MARKETS_TABLE).insert(row).onConflict('conditionId').merge({
        question: row.question,
        image: row.image,
        tvl: row.tvl,
        apyBps: row.apyBps,
        initialized: row.initialized,
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
        builder.where(`${MARKETS_TABLE}.initialized`, true);
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
