import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { queryMarkets } from '@/lib/repos';
import { fetchMarketByConditionId, extractEventSlugFromUrl, isPolymarketUrl } from '@robin-pm-staking/common/lib/polymarket';
import { getAndSaveEventAndMarkets } from '@robin-pm-staking/common/lib/repos';
import { rateLimit } from '@/lib/rate-limit';

function isConditionId(input: string): boolean {
    // Strict 32-byte hex string with 0x prefix
    return /^0x[a-fA-F0-9]{64}$/.test(input.trim());
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

    // If walletOnly, use provided conditionIds from client, ensure they exist in DB (upsert if needed)
    if (walletOnly) {
        conditionIds = conditionIdsFromClient;
        includeUninitialized = true; // include newly created/uninitialized markets as well
        // If client provided walletOnly but no ids, short-circuit to empty list
        if (conditionIds.length === 0) {
            return NextResponse.json({ markets: [], page, pageSize, totalCount: 0 });
        }

        try {
            // For each conditionId, ensure corresponding market exists by fetching from Polymarket if missing
            // We batch-check existence using one DB query
            const existing = await queryMarkets(db, {
                conditionIds,
                includeUninitialized: true,
                page: 1,
                pageSize: conditionIds.length,
            });
            const existingIds = new Set(existing.rows.map(m => m.conditionId));
            const missingIds = conditionIds.filter(id => !existingIds.has(id));

            for (const id of missingIds) {
                try {
                    const market = await fetchMarketByConditionId(id);
                    if (market && market.events && market.events.length > 0) {
                        const eventSlug = market.events[0].slug;
                        await getAndSaveEventAndMarkets(db, eventSlug);
                    }
                } catch (e) {
                    // Continue on errors per id to avoid failing the whole request
                    console.log('walletOnly upsert error', e);
                }
            }
        } catch (e) {
            console.log('walletOnly prefetch error', e);
        }
    }

    // If there is a search, and it looks like conditionId or Polymarket URL, attempt to upsert missing
    if (!walletOnly && search) {
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
            search: walletOnly ? null : search || null,
            conditionIds: conditionIds.length ? conditionIds : null,
            includeUninitialized,
            sortField: walletOnly ? undefined : sortFieldParam,
            sortDirection: walletOnly ? undefined : sortDirectionParam,
            page: walletOnly ? 1 : page,
            pageSize: walletOnly ? conditionIds.length || pageSize : pageSize,
        });

        // If walletOnly, we want to preserve the input order of conditionIds and ignore DB sorting
        const orderedRows = walletOnly
            ? [...rows].sort((a, b) => {
                  const ia = conditionIds.indexOf(a.conditionId);
                  const ib = conditionIds.indexOf(b.conditionId);
                  return ia - ib;
              })
            : rows;

        const total = walletOnly ? orderedRows.length : count;
        return NextResponse.json({ markets: orderedRows, page, pageSize, totalCount: total });
    } catch (e) {
        console.log('error', e);
        return NextResponse.json({ error: 'Failed to query markets' }, { status: 500 });
    }
}
