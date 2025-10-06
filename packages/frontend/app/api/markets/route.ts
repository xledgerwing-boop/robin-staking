import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { queryMarkets } from '@/lib/repos';
import { fetchMarketByConditionId } from '@robin-pm-staking/common/lib/polymarket';
import { getAndSaveEventAndMarkets } from '@robin-pm-staking/common/lib/repos';
import { rateLimit } from '@/lib/rate-limit';

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
    //https://polymarket.com/sports/mlb/games/week/29/mlb-lad-phi-2025-10-06
    //https://polymarket.com/event/what-will-taylor-swift-say-during-tonight-show-on-october-6?tid=1759781450018
    try {
        const u = new URL(input);
        const parts = u.pathname.split('/').filter(Boolean);
        if (u.pathname.includes('/event/')) {
            // Expect path like /event/<event-slug> or similar; take first meaningful slug after 'event'
            const eventIndex = parts.findIndex(p => p.toLowerCase() === 'event' || p.toLowerCase() === 'events');
            if (eventIndex >= 0 && parts[eventIndex + 1]) return parts[eventIndex + 1];
            // Fallback: use first segment
        }
        if (u.pathname.includes('/sports/')) {
            // Expect path like /sports/<sport-slug>/games/week/<week-slug>/<event-slug> or similar; take first meaningful slug after 'sports'
            return parts[parts.length - 1];
            // Fallback: use first segment
        }
        return parts[0] || null;
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/markets'; // Unique identifier per API

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const db = await getDb();

    const { searchParams } = new URL(req.url);
    let search = searchParams.get('search') || undefined;
    const walletOnly = searchParams.get('walletOnly') === 'true';
    const sortFieldParam = (searchParams.get('sortField') as 'tvl' | 'endDate' | 'title') || undefined;
    const sortDirectionParam = (searchParams.get('sortDirection') as 'asc' | 'desc') || undefined;
    // Frontend supplies conditionIds when walletOnly is true
    const conditionIdsParam = searchParams.get('conditionIds');
    const conditionIdsFromClient = conditionIdsParam
        ? conditionIdsParam
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
        : [];

    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
    const pageSize = 12;

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
                    const existing = await queryMarkets(db, {
                        search: slug,
                        includeUninitialized: true,
                        sortField: sortFieldParam,
                        sortDirection: sortDirectionParam,
                        page,
                        pageSize,
                    });
                    if (existing.rows.length > 0) return NextResponse.json({ markets: existing.rows, page, pageSize, totalCount: existing.count });
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
                const existing = await queryMarkets(db, {
                    search: trimmed,
                    includeUninitialized: true,
                    sortField: sortFieldParam,
                    sortDirection: sortDirectionParam,
                    page,
                    pageSize,
                });
                if (existing.rows.some(m => m.conditionId === trimmed))
                    return NextResponse.json({ markets: existing.rows, page, pageSize, totalCount: existing.count }); // already present
                const market = await fetchMarketByConditionId(trimmed);
                if (!market) return;
                await getAndSaveEventAndMarkets(db, market.events[0].slug);
            } catch (e) {
                console.log('error', e);
            }
        }
    }
    try {
        const { count, rows } = await queryMarkets(db, {
            search: search || null,
            conditionIds: conditionIds.length ? conditionIds : null,
            includeUninitialized,
            sortField: sortFieldParam,
            sortDirection: sortDirectionParam,
            page,
            pageSize,
        });
        return NextResponse.json({ markets: rows, page, pageSize, totalCount: count });
    } catch (e) {
        console.log('error', e);
        return NextResponse.json({ error: 'Failed to query markets' }, { status: 500 });
    }
}
