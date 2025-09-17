import { PolymarketMarketDTO } from './market';

export interface EventRow {
    id: string;
    slug: string;
    title: string;
    endDate?: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Event {
    id: string;
    slug: string;
    title: string;
    endDate?: number;
    image?: string;
    createdAt: number;
    updatedAt: number;
}

export function EventRowToEvent(row: EventRow): Event {
    return {
        ...row,
        endDate: row.endDate ? Number.parseInt(row.endDate) : undefined,
        createdAt: Number.parseInt(row.createdAt),
        updatedAt: Number.parseInt(row.updatedAt),
    };
}

export interface PolymarketEventDTO {
    id: string;
    slug: string;
    title: string;
    endDate?: string;
    image?: string;
}

export interface PolymarketEventWithMarkets extends PolymarketEventDTO {
    markets: PolymarketMarketDTO[];
}
