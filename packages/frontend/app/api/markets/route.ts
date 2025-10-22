import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { queryMarkets } from '@/lib/repos';
import { extractEventSlugFromUrl, isPolymarketUrl, fetchEventsBySearch } from '@robin-pm-staking/common/lib/polymarket';
import { EVENTS_TABLE, getAndSaveEventAndMarkets, getAndSaveEventsAndMarkets, MARKETS_TABLE } from '@robin-pm-staking/common/lib/repos';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/markets'; // Unique identifier per API

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const db = await getDb();

    const { searchParams } = new URL(req.url);
    let search = searchParams.get('search') || undefined;
    let walletOnly = searchParams.get('walletOnly') === 'true';
    const addressParam = searchParams.get('address') || undefined;
    const userAddressForWalletOnly = addressParam ? addressParam.toLowerCase() : undefined;
    const sortFieldParam = (searchParams.get('sortField') as 'tvl' | 'endDate' | 'title') || undefined;
    const sortDirectionParam = (searchParams.get('sortDirection') as 'asc' | 'desc') || undefined;
    // Frontend supplies conditionIds when walletOnly is true
    const conditionIdsParam = searchParams.get('conditionIds') || undefined;
    const conditionIds = conditionIdsParam
        ?.split(',')
        .map(s => s.trim())
        .filter(Boolean);

    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
    const pageSize = 12;

    let includeUninitialized = false;

    //if we are searching for something, don't filter for only in wallet
    if (search) walletOnly = false;
    if (walletOnly) includeUninitialized = true;

    // If walletOnly, use provided conditionIds from client, ensure they exist in DB (upsert if needed)
    if (walletOnly && conditionIds) {
        try {
            // For each conditionId, ensure corresponding market exists by fetching from Polymarket if missing
            // We batch-check existence using one DB query
            const existingIds = new Set((await db(MARKETS_TABLE).select('conditionId').whereIn('conditionId', conditionIds)) as string[]);
            const missingIds = conditionIds.filter(id => !existingIds.has(id));

            try {
                await getAndSaveEventsAndMarkets(db, undefined, missingIds);
            } catch (e) {
                // Continue on errors per id to avoid failing the whole request
                console.log('walletOnly upsert error', e);
            }
        } catch (e) {
            console.log('walletOnly prefetch error', e);
        }
    }

    // If there is a search, and it looks like conditionId or Polymarket URL, attempt to upsert missing
    if (!walletOnly && search) {
        const trimmed = search.trim();
        includeUninitialized = true;
        if (isPolymarketUrl(trimmed)) {
            const slug = extractEventSlugFromUrl(trimmed);
            if (slug) {
                try {
                    // First: check DB for existing markets by event_slug
                    const existing = await queryMarkets(db, {
                        eventSlug: slug,
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
        } else {
            // Normal text search - query Polymarket for events and save missing ones
            try {
                // Query Polymarket for events
                const events = await fetchEventsBySearch(trimmed);

                if (events && events.length > 0) {
                    // Check which events are already in DB
                    const eventSlugs = events.map(event => event.slug);
                    const existingEvents = await db(EVENTS_TABLE).select('slug').whereIn('slug', eventSlugs);
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
            search: search?.trim(),
            walletOnly,
            conditionIds: conditionIds,
            includeUninitialized,
            userAddressForWalletOnly: userAddressForWalletOnly,
            sortField: sortFieldParam,
            sortDirection: sortDirectionParam,
            page: page,
            pageSize: pageSize,
        });

        return NextResponse.json({ markets: rows, page, pageSize, totalCount: count });
    } catch (e) {
        console.log('error', e);
        return NextResponse.json({ error: 'Failed to query markets' }, { status: 500 });
    }
}
