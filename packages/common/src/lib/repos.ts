import { MarketRow, MarketStatus, PolymarketMarket, PolymarketMarketWithEvent } from '../types/market';
import { Knex } from 'knex';
import { PolymarketEvent, EventRow } from '../types/event';
import { fetchEventAndMarketsByEventSlug, fetchMarketByConditionId } from './polymarket';

export const EVENTS_TABLE = 'events';
export const MARKETS_TABLE = 'markets';
export const ACTIVITIES_TABLE = 'activities';

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
            table.string('contract_address').unique().nullable();
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
            table.string('event_id').notNullable().references('id').inTable(EVENTS_TABLE);
            table.decimal('tvl', 78, 0);
            table.decimal('unmatched_yes_tokens', 78, 0);
            table.decimal('unmatched_no_tokens', 78, 0);
            table.decimal('matched_tokens', 78, 0);
            table.string('winning_position').nullable();
            table.string('creator').nullable();
            table.bigint('vault_created_block_number').nullable();
            table.bigint('vault_created_at').nullable();
            table.bigint('created_at');
            table.bigint('updated_at');
        });
    }

    const hasActivities = await db.schema.hasTable(ACTIVITIES_TABLE);
    if (!hasActivities) {
        await db.schema.createTable(ACTIVITIES_TABLE, (table: Knex.CreateTableBuilder) => {
            table.string('id').primary();
            table.string('vaultAddress').references('contractAddress').inTable(MARKETS_TABLE);
            table.string('transactionHash');
            table.bigint('timestamp');
            table.string('type');
            table.string('userAddress').nullable();
            table.string('position').nullable();
            table.jsonb('info');
            table.bigint('blockNumber').notNullable();
        });
    }
}

export async function insertEvent(db: Knex, evt: PolymarketEvent): Promise<EventRow> {
    const row: EventRow = {
        id: evt.id,
        slug: evt.slug,
        title: evt.title,
        endDate: evt.endDate ? new Date(evt.endDate).getTime().toString() : undefined,
        image: evt.image,
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
    };
    await db(EVENTS_TABLE).insert(row).onConflict().ignore();
    return row;
}

export async function insertInactiveMarket(db: Knex, market: PolymarketMarket | PolymarketMarketWithEvent): Promise<MarketRow> {
    const eventId = (market as PolymarketMarket).eventId ?? (market as PolymarketMarketWithEvent).events[0].id;
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
        status: MarketStatus.Uninitialized,
        tvl: (0).toString(),
        unmatchedYesTokens: (0).toString(),
        unmatchedNoTokens: (0).toString(),
        matchedTokens: (0).toString(),
    };
    await db(MARKETS_TABLE).insert(row).onConflict().ignore();
    return row;
}

export async function getAndSaveEventAndMarkets(db: Knex, eventSlug?: string, conditionId?: string) {
    if (!eventSlug && !conditionId) {
        throw new Error('Either eventSlug or conditionId is required');
    }
    if (!eventSlug) {
        const market = await fetchMarketByConditionId(conditionId as string);
        if (!market) throw new Error('Market not found');
        eventSlug = market.events[0].slug;
    }
    const payload = await fetchEventAndMarketsByEventSlug(eventSlug);
    if (!payload) throw new Error('Event not found');
    await insertEvent(db, payload);
    await Promise.all(
        payload.markets.map(async m => {
            m.eventId = payload.id;
            await insertInactiveMarket(db, m);
        })
    );
}
