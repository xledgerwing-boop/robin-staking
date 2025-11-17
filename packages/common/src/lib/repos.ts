import { MarketRow, MarketStatus, PolymarketMarket } from '../types/market';
import { Knex } from 'knex';
import { PolymarketEvent, EventRow } from '../types/event';
import { fetchEventAndMarketsByEventSlug, fetchEventsByEventSlugs, fetchMarketByConditionId, fetchMarketsByConditionIds } from './polymarket';

export const EVENTS_TABLE = 'events';
export const MARKETS_TABLE = 'markets';
export const ACTIVITIES_TABLE = 'activities';
export const GENESIS_ACTIVITIES_TABLE = 'genesis_activities';
export const GENESIS_INTERESTS_TABLE = 'genesis_interests';
export const USER_POSITIONS_TABLE = 'user_positions';

export async function ensureSchema(db: Knex): Promise<void> {
    const hasEvents = await db.schema.hasTable(EVENTS_TABLE);
    if (!hasEvents) {
        await db.schema.createTable(EVENTS_TABLE, table => {
            table.string('id').primary();
            table.string('slug').notNullable().index();
            table.string('title');
            table.bigint('endDate');
            table.string('image');
            table.bigint('createdAt');
            table.bigint('updatedAt');
        });
    }

    const hasMarkets = await db.schema.hasTable(MARKETS_TABLE);
    if (!hasMarkets) {
        await db.schema.createTable(MARKETS_TABLE, table => {
            table.string('id').primary();
            table.string('contractAddress').unique().nullable();
            table.string('question');
            table.string('conditionId').unique().index();
            table.string('slug');
            table.string('eventSlug').notNullable();
            table.bigint('endDate').nullable();
            table.bigint('startDate').nullable();
            table.string('image').nullable();
            table.string('status').notNullable().defaultTo(MarketStatus.Uninitialized);
            table.jsonb('outcomes');
            table.jsonb('clobTokenIds');
            table.boolean('negRisk').nullable();
            table.string('eventId').notNullable().references('id').inTable(EVENTS_TABLE);
            table.decimal('tvl', 78, 0);
            table.decimal('unmatchedYesTokens', 78, 0);
            table.decimal('unmatchedNoTokens', 78, 0);
            table.decimal('matchedTokens', 78, 0);
            table.string('winningPosition').nullable();
            table.string('creator').nullable();
            table.bigint('vaultCreatedBlockNumber').nullable();
            table.bigint('vaultCreatedAt').nullable();
            // Genesis columns
            table.integer('genesisIndex').nullable();
            table.boolean('genesisEligible').nullable();
            table.decimal('genesisLastSubmittedPriceA', 78, 0).nullable();
            table.bigint('genesisLastSubmittedAt').nullable();
            table.bigint('genesisStartedAt').nullable();
            table.bigint('genesisEndedAt').nullable();
            table.bigint('createdAt');
            table.bigint('updatedAt');
        });
    }

    // Ensure genesis columns exist on existing table
    if (hasMarkets) {
        const hasGenesisIndex = await db.schema.hasColumn(MARKETS_TABLE, 'genesisIndex');
        if (!hasGenesisIndex) {
            await db.schema.alterTable(MARKETS_TABLE, table => {
                table.integer('genesisIndex').nullable().index();
            });
        }
        const hasGenesisEligible = await db.schema.hasColumn(MARKETS_TABLE, 'genesisEligible');
        if (!hasGenesisEligible) {
            await db.schema.alterTable(MARKETS_TABLE, table => {
                table.boolean('genesisEligible').nullable();
            });
        }
        const hasGenesisStartedAt = await db.schema.hasColumn(MARKETS_TABLE, 'genesisStartedAt');
        if (!hasGenesisStartedAt) {
            await db.schema.alterTable(MARKETS_TABLE, table => {
                table.bigint('genesisStartedAt').nullable();
            });
        }
        const hasGenesisEndedAt = await db.schema.hasColumn(MARKETS_TABLE, 'genesisEndedAt');
        if (!hasGenesisEndedAt) {
            await db.schema.alterTable(MARKETS_TABLE, table => {
                table.bigint('genesisEndedAt').nullable();
            });
        }
        // Columns for price update tracking
        const hasGenesisLastSubmittedPriceA = await db.schema.hasColumn(MARKETS_TABLE, 'genesisLastSubmittedPriceA');
        if (!hasGenesisLastSubmittedPriceA) {
            await db.schema.alterTable(MARKETS_TABLE, table => {
                table.decimal('genesisLastSubmittedPriceA', 78, 0).nullable();
            });
        }
        const hasGenesisLastSubmittedAt = await db.schema.hasColumn(MARKETS_TABLE, 'genesisLastSubmittedAt');
        if (!hasGenesisLastSubmittedAt) {
            await db.schema.alterTable(MARKETS_TABLE, table => {
                table.bigint('genesisLastSubmittedAt').nullable();
            });
        }
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

    const hasGenesisActivities = await db.schema.hasTable(GENESIS_ACTIVITIES_TABLE);
    if (!hasGenesisActivities) {
        await db.schema.createTable(GENESIS_ACTIVITIES_TABLE, (table: Knex.CreateTableBuilder) => {
            table.string('id').primary();
            table.string('vaultAddress'); // not FK-bound to markets
            table.string('transactionHash');
            table.bigint('timestamp');
            table.string('type');
            table.string('userAddress').nullable();
            table.string('position').nullable();
            table.jsonb('info');
            table.bigint('blockNumber').notNullable();
        });
    }

    // Table for capturing user interest when TVL cap is reached
    const hasGenesisInterests = await db.schema.hasTable(GENESIS_INTERESTS_TABLE);
    if (!hasGenesisInterests) {
        await db.schema.createTable(GENESIS_INTERESTS_TABLE, (table: Knex.CreateTableBuilder) => {
            table.string('id').primary();
            table.string('vaultAddress').notNullable().index();
            table.string('userAddress').notNullable().index(); // proxy address
            table.decimal('totalTokens', 78, 0).notNullable().defaultTo(0);
            table.decimal('totalUsd', 78, 0).notNullable().defaultTo(0);
            table.decimal('eligibleUsd', 78, 0).notNullable().defaultTo(0);
            table.bigint('createdAt').notNullable();
            table.bigint('updatedAt').notNullable();
            table.unique(['vaultAddress', 'userAddress']);
        });
    }

    const hasUserPositions = await db.schema.hasTable(USER_POSITIONS_TABLE);
    if (!hasUserPositions) {
        await db.schema.createTable(USER_POSITIONS_TABLE, (table: Knex.CreateTableBuilder) => {
            table.string('id').primary();
            table.string('userAddress').notNullable().index();
            table.string('conditionId').notNullable().index();
            table.string('vaultAddress').notNullable().index();
            table.decimal('yesTokens', 78, 0).notNullable().defaultTo(0);
            table.decimal('noTokens', 78, 0).notNullable().defaultTo(0);
            table.decimal('yieldHarvested', 78, 0).notNullable().defaultTo(0);
            table.decimal('usdRedeemed', 78, 0).notNullable().defaultTo(0);
            table.bigint('createdAt');
            table.bigint('updatedAt');
            table.unique(['userAddress', 'conditionId']);
        });
    }

    // Create full-text search indexes for better search performance
    await createFullTextSearchIndexes(db);
}

async function createFullTextSearchIndexes(db: Knex): Promise<void> {
    try {
        // Create GIN indexes for full-text search on text columns
        await db.raw(`
            CREATE INDEX IF NOT EXISTS idx_events_title_fts 
            ON ${EVENTS_TABLE} USING gin(to_tsvector('english', title))
        `);

        await db.raw(`
            CREATE INDEX IF NOT EXISTS idx_markets_question_fts 
            ON ${MARKETS_TABLE} USING gin(to_tsvector('english', question))
        `);
    } catch (error) {
        console.warn('Failed to create full-text search indexes:', error);
        // Don't throw error as this is an optimization, not a requirement
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

export async function insertInactiveMarket(trx: Knex.Transaction, market: PolymarketMarket, eventSlug: string): Promise<MarketRow> {
    const eventId = market.eventId;
    const row: MarketRow = {
        id: market.id,
        eventId,
        question: market.question,
        conditionId: market.conditionId,
        slug: market.slug,
        eventSlug,
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
    await trx(MARKETS_TABLE).insert(row).onConflict().ignore();
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
    await db.transaction(async trx => {
        await insertEvent(db, payload);
        payload.markets.forEach(m => {
            m.eventId = payload.id;
        });
        await Promise.all(payload.markets.map(m => insertInactiveMarket(trx, m, payload.slug)));
    });
}

export async function getAndSaveEventsAndMarkets(db: Knex, eventSlugs?: string[], conditionIds?: string[]) {
    if (!eventSlugs && !conditionIds) throw new Error('Either eventSlugs or conditionIds are required');
    if (!eventSlugs) {
        const markets = await fetchMarketsByConditionIds(conditionIds as string[]);
        eventSlugs = markets.map(m => m.events[0].slug);
    }

    const payload = await fetchEventsByEventSlugs(eventSlugs);
    if (!payload) throw new Error('Events not found');
    await Promise.all(
        payload.map(async e => {
            await db.transaction(async trx => {
                await insertEvent(trx, e);
                e.markets.forEach(m => {
                    m.eventId = e.id;
                });
                await Promise.all(e.markets.map(m => insertInactiveMarket(trx, m, e.slug)));
            });
        })
    );
}
