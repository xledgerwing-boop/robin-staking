import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureSchema, queryMarkets, upsertEvent, upsertMarket } from '@/lib/repos';
import { fetchEventAndMarketsByEventSlug, fetchMarketByConditionId } from '@robin-pm-staking/common/lib/polymarket';
import { Knex } from 'knex';

function isPolymarketUrl(input: string): boolean {
    try {
        const u = new URL(input);
        return u.hostname.includes('polymarket');
    } catch {
        return false;
    }
}

function isConditionId(input: string): boolean {
    // Strict 32-byte hex string with 0x prefix
    return /^0x[a-fA-F0-9]{64}$/.test(input.trim());
}

function extractEventSlugFromUrl(input: string): string | null {
    try {
        const u = new URL(input);
        const parts = u.pathname.split('/').filter(Boolean);
        // Expect path like /event/<event-slug> or similar; take first meaningful slug after 'event'
        const eventIndex = parts.findIndex(p => p.toLowerCase() === 'event' || p.toLowerCase() === 'events');
        if (eventIndex >= 0 && parts[eventIndex + 1]) return parts[eventIndex + 1];
        // Fallback: use first segment
        return parts[0] || null;
    } catch {
        return null;
    }
}

async function getAndSaveEventAndMarkets(db: Knex, slug: string) {
    const payload = await fetchEventAndMarketsByEventSlug(slug);
    if (!payload) return;
    await upsertEvent(db, payload);
    await Promise.all(
        payload.markets.map(async m => {
            m.eventId = payload.id;
            await upsertMarket(db, m, false);
        })
    );
}

export async function GET(req: NextRequest) {
    const db = getDb();
    await ensureSchema(db);

    const { searchParams } = new URL(req.url);
    let search = searchParams.get('search') || undefined;
    const walletOnly = searchParams.get('walletOnly') === 'true';
    const sortFieldParam = (searchParams.get('sortField') as 'apy' | 'tvl' | 'liquidationDate' | 'title') || undefined;
    const sortDirectionParam = (searchParams.get('sortDirection') as 'asc' | 'desc') || undefined;
    // Frontend supplies conditionIds when walletOnly is true
    const conditionIdsParam = searchParams.get('conditionIds');
    const conditionIdsFromClient = conditionIdsParam
        ? conditionIdsParam
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
        : [];

    let conditionIds: string[] = [];
    let includeUninitialized = false;

    // If walletOnly, use provided conditionIds from client, return only initialized markets, do not upsert
    if (walletOnly) {
        conditionIds = conditionIdsFromClient;
        includeUninitialized = false; // explicitly only initialized
        // If client provided walletOnly but no ids, short-circuit to empty list
        if (conditionIds.length === 0) {
            return NextResponse.json({ markets: [] });
        }
    }

    // If there is a search, and it looks like conditionId or Polymarket URL, attempt to upsert missing
    if (search) {
        const trimmed = search.trim();
        const looksLikeConditionId = !isPolymarketUrl(trimmed) && isConditionId(trimmed);
        if (isPolymarketUrl(trimmed)) {
            includeUninitialized = true;
            const slug = extractEventSlugFromUrl(trimmed);
            if (slug) {
                try {
                    // First: check DB for existing markets by event_slug
                    const existing = await queryMarkets(db, { search: slug, includeUninitialized: true });
                    if (existing.length > 0) return NextResponse.json(existing);
                    // Otherwise fetch from Polymarket and upsert
                    await getAndSaveEventAndMarkets(db, slug);
                    search = slug;
                } catch (e) {
                    console.log('error', e);
                }
            }
        } else if (looksLikeConditionId) {
            includeUninitialized = true;
            try {
                // DB-first: if exists, skip
                const existing = await queryMarkets(db, { search: trimmed, includeUninitialized: true });
                if (existing.some(m => m.conditionId === trimmed)) return NextResponse.json(existing); // already present
                const market = await fetchMarketByConditionId(trimmed);
                if (!market) return;
                await getAndSaveEventAndMarkets(db, market.events[0].slug);
            } catch (e) {
                console.log('error', e);
            }
        }
    }
    try {
        const results = await queryMarkets(db, {
            search: search || null,
            conditionIds: conditionIds.length ? conditionIds : null,
            includeUninitialized,
            sortField: sortFieldParam,
            sortDirection: sortDirectionParam,
        });
        return NextResponse.json(results);
    } catch {
        return NextResponse.json({ error: 'Failed to query markets' }, { status: 500 });
    }
}
