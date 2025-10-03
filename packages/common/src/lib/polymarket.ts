import { PolymarketEventWithMarkets } from '../types/event';
import { PolymarketMarketWithEvent } from '../types/market';

// Function prototypes only — implement integration later
const BASE_URL = 'https://gamma-api.polymarket.com';
const DATA_API_URL = 'https://data-api.polymarket.com';

export async function fetchWalletPositions(address: string): Promise<string[]> {
    const url = `${DATA_API_URL}/positions?sizeThreshold=1&limit=100&sortBy=TOKENS&sortDirection=DESC&user=${address}`;
    const options = { method: 'GET', body: undefined };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch wallet positions');
    const data = await response.json();
    return data.map((p: { conditionId: string }) => p.conditionId);
}

export async function fetchMarketByConditionId(conditionId: string): Promise<PolymarketMarketWithEvent> {
    const url = `${BASE_URL}/markets?limit=1&condition_ids=${conditionId}`;
    const options = { method: 'GET', body: undefined };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch market');
    const data = await response.json();
    return data[0];
}

export const fetchMarketBySlug = async (slug: string): Promise<PolymarketMarketWithEvent> => {
    const url = `${BASE_URL}/markets/slug/${slug}`;
    const options = { method: 'GET', body: undefined };
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch market');
    const data = await response.json();
    return data;
};

export async function fetchEventAndMarketsByEventSlug(eventSlug: string): Promise<PolymarketEventWithMarkets> {
    const url = `${BASE_URL}/events/slug/${eventSlug}`;
    const options = { method: 'GET', body: undefined };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch event and markets');
    const data = await response.json();
    return data;
}
