import { PolymarketPosition } from '../types/position';
import { PolymarketEventWithMarkets } from '../types/event';
import { PolymarketMarketWithEvent } from '../types/market';

// Function prototypes only — implement integration later
const BASE_URL = 'https://gamma-api.polymarket.com';
const DATA_API_URL = 'https://data-api.polymarket.com';

export async function fetchMarketByConditionId(conditionId: string): Promise<PolymarketMarketWithEvent> {
    const url = `${BASE_URL}/markets?limit=1&condition_ids=${conditionId}`;
    const options = { method: 'GET', body: undefined };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch market');
    const data = (await response.json()) as PolymarketMarketWithEvent[];
    return data[0];
}

export const fetchMarketBySlug = async (slug: string): Promise<PolymarketMarketWithEvent> => {
    const url = `${BASE_URL}/markets/slug/${slug}`;
    const options = { method: 'GET', body: undefined };
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch market');
    const data = (await response.json()) as PolymarketMarketWithEvent;
    return data;
};

export async function fetchEventAndMarketsByEventSlug(eventSlug: string): Promise<PolymarketEventWithMarkets> {
    const url = `${BASE_URL}/events/slug/${eventSlug}`;
    const options = { method: 'GET', body: undefined };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch event and markets');
    const data = (await response.json()) as PolymarketEventWithMarkets;
    return data;
}

export async function fetchEventsByEventSlugs(eventSlugs: string[]): Promise<PolymarketEventWithMarkets[]> {
    const url = `${BASE_URL}/events?${eventSlugs.map(slug => `slug=${slug}`).join('&')}`;
    const options = { method: 'GET', body: undefined };
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch events');
    const data = (await response.json()) as PolymarketEventWithMarkets[];
    return data;
}

export async function fetchEventsBySearch(search: string): Promise<PolymarketEventWithMarkets[]> {
    const url = `${BASE_URL}/public-search?q=${search}&optimized=true&limit_per_type=10&type=events&search_tags=true&cache=true&event_status=active`;
    const options = { method: 'GET', body: undefined };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch events by search');
    const data = (await response.json()) as { events: PolymarketEventWithMarkets[] };
    return data.events;
}

export interface WalletPositionsPageOptions {
    page?: number;
    pageSize?: number;
    title?: string;
}

// Paginated positions fetch for a wallet with optional title filtering
export async function fetchWalletPositionsPage(
    address: string,
    opts: WalletPositionsPageOptions = {}
): Promise<{ positions: PolymarketPosition[]; hasMore: boolean }> {
    const page = opts.page ? Math.max(1, opts.page) : undefined;
    const limit = opts.pageSize ? Math.max(1, Math.min(opts.pageSize, 100)) : undefined;
    const offset = page && limit ? (page - 1) * limit : undefined;

    const params = new URLSearchParams();
    params.set('user', address);
    params.set('sizeThreshold', '1');
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    params.set('sortBy', 'CURRENT');
    params.set('sortDirection', 'DESC');
    params.set('sizeThreshold', '1');
    params.set('redeemable', 'false');
    if ((opts.title ?? '').trim()) params.set('title', (opts.title ?? '').trim());

    const url = `${DATA_API_URL}/positions?${params.toString()}`;
    const options = { method: 'GET', body: undefined } as const;

    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch wallet positions');

    const data = (await response.json()) as PolymarketPosition[];
    const hasMore = (data || []).length === limit; // best-effort indicator
    return { positions: data, hasMore };
}

export async function fetchPolymarketPositionIds(
    address: string,
    opts: WalletPositionsPageOptions = {}
): Promise<{ conditionIds: string[]; hasMore: boolean }> {
    const { positions, hasMore } = await fetchWalletPositionsPage(address, opts);

    const conditionIds = Array.from(new Set((positions || []).map(p => p.conditionId).filter(Boolean)));

    return { conditionIds, hasMore };
}

export function extractEventSlugFromUrl(input: string): string | null {
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

export function isPolymarketUrl(input: string): boolean {
    try {
        const u = new URL(input);
        return u.hostname.includes('polymarket');
    } catch {
        return false;
    }
}
