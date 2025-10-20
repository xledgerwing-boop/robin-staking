import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { queryMarkets } from '@/lib/repos';
import { fetchMarketByConditionId, extractEventSlugFromUrl, isPolymarketUrl, fetchEventsBySearch } from '@robin-pm-staking/common/lib/polymarket';
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
    const addressParam = searchParams.get('address') || undefined;
    const userAddressForWalletOnly = addressParam ? addressParam.toLowerCase() : undefined;
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

        try {
            // For each conditionId, ensure corresponding market exists by fetching from Polymarket if missing
            // We batch-check existence using one DB query
            const existing =
                conditionIds.length > 0
                    ? await queryMarkets(db, {
                          conditionIds,
                          includeUninitialized: true,
                          page: 1,
                          pageSize: conditionIds.length,
                      })
                    : { rows: [], count: 0 };
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
        includeUninitialized = true;
        if (isPolymarketUrl(trimmed)) {
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
        } else {
            // Normal text search - query Polymarket for events and save missing ones
            try {
                // Query Polymarket for events
                const events = await fetchEventsBySearch(trimmed);

                if (events && events.length > 0) {
                    // Check which events are already in DB
                    const eventSlugs = events.map(event => event.slug);
                    const existingEvents = await db('events').select('slug').whereIn('slug', eventSlugs);
                    const existingSlugs = new Set(existingEvents.map(e => e.slug));
                    const missingSlugs = eventSlugs.filter(slug => !existingSlugs.has(slug));

                    // Save missing events and their markets
                    for (const slug of missingSlugs) {
                        try {
                            await getAndSaveEventAndMarkets(db, slug);
                        } catch (e) {
                            console.log('Error saving event:', slug, e);
                        }
                    }
                }
            } catch (e) {
                console.log('error during text search:', e);
            }
        }
    }
    try {
        const { count, rows } = await queryMarkets(db, {
            search: search ? search.trim() : null,
            conditionIds: conditionIds.length ? conditionIds : null,
            includeUninitialized,
            userAddressForWalletOnly: walletOnly ? userAddressForWalletOnly || null : null,
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
                  const ai = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
                  const bi = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
                  return ai - bi;
              })
            : rows;

        const total = walletOnly ? orderedRows.length : count;
        return NextResponse.json({ markets: orderedRows, page, pageSize, totalCount: total });
    } catch (e) {
        console.log('error', e);
        return NextResponse.json({ error: 'Failed to query markets' }, { status: 500 });
    }
}
