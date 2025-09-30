export const STAKING_TOKEN_DECIMALS = 6;

// Chains: Polymarket commonly uses Polygon PoS (id 137)
export const TARGET_CHAIN_ID = 137; // Polygon PoS

export interface PolymarketEvent {
    id: string;
    slug: string;
    title: string;
    endDate?: string;
    image?: string;
    markets: PolymarketMarket[];
    closed?: boolean;
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

export interface Market extends Omit<PolymarketMarket, 'outcomes' | 'clobTokenIds' | 'outcomePrices'> {
    outcomes: string[];
    clobTokenIds: bigint[];
    outcomePrices: string[];
    winnerIndex?: number;
}

export function parseMarket(market: PolymarketMarket): Market {
    const outcomePrices = JSON.parse(market.outcomePrices) as string[];
    return {
        ...market,
        outcomes: JSON.parse(market.outcomes),
        clobTokenIds: JSON.parse(market.clobTokenIds).map((id: string) => BigInt(id)),
        outcomePrices: outcomePrices,
        winnerIndex: market.closed ? (outcomePrices.findIndex(price => price == '1') ?? -1) : undefined, //-1 means both outcomes are winning
    };
}

export enum Outcome {
    Yes = 'yes',
    No = 'no',
}
