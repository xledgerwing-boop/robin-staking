import { PolymarketEvent } from './event';

export interface MarketRow {
    id: string;
    contractAddress?: string;
    question: string;
    conditionId: string;
    slug: string;
    eventSlug: string;
    endDate?: string;
    startDate?: string;
    image?: string;
    outcomes: string;
    clobTokenIds: string;
    negRisk: boolean;
    status: MarketStatus;
    createdAt: string;
    updatedAt: string;
    tvl: string;
    eventId: string;
    unmatchedYesTokens: string;
    unmatchedNoTokens: string;
    matchedTokens: string;
    winningPosition?: Outcome;
    creator?: string;
    vaultCreatedBlockNumber?: string;
    vaultCreatedAt?: string;
    // Genesis fields (nullable)
    genesisIndex?: number;
    genesisEligible?: boolean;
    genesisLastSubmittedPriceA?: string; // decimal as string
    genesisLastSubmittedAt?: string; // bigint as string
    genesisStartedAt?: string; // bigint as string
    genesisEndedAt?: string; // bigint as string
}

export interface Market {
    id: string;
    contractAddress?: string;
    question: string;
    conditionId: string;
    slug: string;
    eventSlug: string;
    endDate?: number;
    startDate?: number;
    image?: string;
    outcomes: string[];
    clobTokenIds: bigint[];
    negRisk: boolean;
    status: MarketStatus;
    createdAt: number;
    updatedAt: number;
    tvl: bigint;
    eventId: string;
    unmatchedYesTokens: bigint;
    unmatchedNoTokens: bigint;
    matchedTokens: bigint;
    winningPosition?: Outcome;
    creator?: string;
    vaultCreatedBlockNumber?: number;
    vaultCreatedAt?: number;
    // Genesis fields (nullable)
    genesisIndex?: number;
    genesisEligible?: boolean;
    genesisLastSubmittedPriceA?: bigint; // decimal as string
    genesisLastSubmittedAt?: number; // bigint as string
    genesisStartedAt?: number;
    genesisEndedAt?: number;
}

export function MarketRowToMarket(row: MarketRow): Market {
    return {
        ...row,
        endDate: row.endDate ? Number.parseInt(row.endDate) : undefined,
        startDate: row.startDate ? Number.parseInt(row.startDate) : undefined,
        createdAt: Number.parseInt(row.createdAt),
        updatedAt: Number.parseInt(row.updatedAt),
        outcomes: row.outcomes as unknown as string[], //already comes parsed out of the DB
        clobTokenIds: (row.clobTokenIds as unknown as string[]).map((id: string) => BigInt(id)), //already comes parsed out of the DB
        tvl: BigInt(row.tvl),
        unmatchedYesTokens: BigInt(row.unmatchedYesTokens),
        unmatchedNoTokens: BigInt(row.unmatchedNoTokens),
        matchedTokens: BigInt(row.matchedTokens),
        vaultCreatedBlockNumber: row.vaultCreatedBlockNumber ? Number.parseInt(row.vaultCreatedBlockNumber) : undefined,
        vaultCreatedAt: row.vaultCreatedAt ? Number.parseInt(row.vaultCreatedAt) : undefined,
        genesisLastSubmittedPriceA: row.genesisLastSubmittedPriceA ? BigInt(row.genesisLastSubmittedPriceA) : undefined,
        genesisLastSubmittedAt: row.genesisLastSubmittedAt ? Number.parseInt(row.genesisLastSubmittedAt) : undefined,
        genesisStartedAt: row.genesisStartedAt ? Number.parseInt(row.genesisStartedAt) : undefined,
        genesisEndedAt: row.genesisEndedAt ? Number.parseInt(row.genesisEndedAt) : undefined,
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
    outcomePrices?: string;
    clobTokenIds: string;
    negRisk?: boolean;
    eventId: string;
    groupItemTitle?: string;
    closed?: boolean;
}

export interface PolymarketMarketWithEvent extends PolymarketMarket {
    events: PolymarketEvent[];
}

export interface ParsedPolymarketMarket extends Omit<PolymarketMarket, 'outcomes' | 'clobTokenIds' | 'outcomePrices' | 'endDate'> {
    outcomes: string[];
    clobTokenIds: bigint[];
    outcomePrices?: string[];
    winningPosition?: Outcome;
    endDate?: number;
}

export function parsePolymarketMarket(market: PolymarketMarket): ParsedPolymarketMarket {
    const outcomePrices = market.outcomePrices ? (JSON.parse(market.outcomePrices) as string[]) : undefined;
    const winningIndex = market.closed && outcomePrices ? outcomePrices.findIndex(price => price == '1') ?? -1 : undefined; //-1 means both outcomes are winning
    return {
        ...market,
        outcomes: JSON.parse(market.outcomes),
        clobTokenIds: JSON.parse(market.clobTokenIds).map((id: string) => BigInt(id)),
        outcomePrices: outcomePrices,
        winningPosition: winningIndex === -1 ? Outcome.Both : winningIndex === 0 ? Outcome.Yes : winningIndex === 1 ? Outcome.No : undefined,
        endDate: market.endDate ? new Date(market.endDate).getTime() : undefined,
    };
}

export enum Outcome {
    Yes = 'yes',
    No = 'no',
    Both = 'both',
}

export enum MarketStatus {
    Uninitialized = 'uninitialized',
    Active = 'active',
    Finalized = 'finalized',
    Unlocked = 'unlocked',
}
