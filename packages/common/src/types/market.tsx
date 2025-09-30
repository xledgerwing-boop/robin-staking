import { PolymarketEvent } from './event';

export interface MarketRow {
    id: string;
    question: string;
    conditionId: string;
    slug: string;
    endDate?: string;
    startDate?: string;
    image?: string;
    outcomes: string;
    clobTokenIds: string;
    negRisk: boolean;
    createdAt: string;
    updatedAt: string;
    initialized: boolean;
    tvl: string;
    apyBps: number;
    eventId: string;
    unmatchedYesTokens: string;
    unmatchedNoTokens: string;
    matchedTokens: string;
}

export interface MarketRowWithEvent extends MarketRow {
    eventSlug: string;
}

export interface Market {
    id: string;
    question: string;
    conditionId: string;
    slug: string;
    endDate?: number;
    startDate?: number;
    image?: string;
    outcomes: string[];
    clobTokenIds: string[];
    negRisk: boolean;
    createdAt: number;
    updatedAt: number;
    initialized: boolean;
    tvl: bigint;
    apyBps: number;
    eventId: string;
    unmatchedYesTokens: bigint;
    unmatchedNoTokens: bigint;
    matchedTokens: bigint;
}

export interface MarketWithEvent extends Market {
    eventSlug: string;
}

export function MarketRowToMarket(row: MarketRow): Market {
    return {
        ...row,
        endDate: row.endDate ? Number.parseInt(row.endDate) : undefined,
        startDate: row.startDate ? Number.parseInt(row.startDate) : undefined,
        createdAt: Number.parseInt(row.createdAt),
        updatedAt: Number.parseInt(row.updatedAt),
        outcomes: row.outcomes as unknown as string[], //already comes parsed out of the DB
        clobTokenIds: row.clobTokenIds as unknown as string[], //already comes parsed out of the DB
        tvl: BigInt(row.tvl),
        unmatchedYesTokens: BigInt(row.unmatchedYesTokens),
        unmatchedNoTokens: BigInt(row.unmatchedNoTokens),
        matchedTokens: BigInt(row.matchedTokens),
    };
}

export function MarketRowToMarketWithEvent(row: MarketRowWithEvent): MarketWithEvent {
    const market = MarketRowToMarket(row);
    return {
        ...market,
        eventSlug: row.eventSlug,
    };
}

export interface PolymarketMarket {
    id: string;
    question: string;
    conditionId: string;
    slug: string;
    endDate?: string;
    startDate?: string;
    image?: string;
    outcomes: string;
    outcomePrices: string;
    clobTokenIds: string;
    negRisk?: boolean;
    eventId: string;
    groupItemTitle: string;
    closed?: boolean;
}

export interface PolymarketMarketWithEvent extends PolymarketMarket {
    events: PolymarketEvent[];
}

export interface ParsedPolymarketMarket extends Omit<PolymarketMarket, 'outcomes' | 'clobTokenIds' | 'outcomePrices'> {
    outcomes: string[];
    clobTokenIds: bigint[];
    outcomePrices: string[];
    winnerIndex?: number;
}

export function parsePolymarketMarket(market: PolymarketMarket): ParsedPolymarketMarket {
    const outcomePrices = JSON.parse(market.outcomePrices) as string[];
    return {
        ...market,
        outcomes: JSON.parse(market.outcomes),
        clobTokenIds: JSON.parse(market.clobTokenIds).map((id: string) => BigInt(id)),
        outcomePrices: outcomePrices,
        winnerIndex: market.closed ? outcomePrices.findIndex(price => price == '1') ?? -1 : undefined, //-1 means both outcomes are winning
    };
}

export enum Outcome {
    Yes = 'yes',
    No = 'no',
}
