import type { Abi } from 'viem';

// If you need decimals conversion for staking token (e.g., USDC=6, MATIC=18)
export const STAKING_TOKEN_DECIMALS = 6; // TODO adjust

// Chains: Polymarket commonly uses Polygon PoS (id 137)
export const TARGET_CHAIN_ID = 137; // Polygon PoS

export interface PolymarketEvent {
    id: string;
    slug: string;
    title: string;
    endDate?: string;
    image?: string;
    markets: PolymarketMarket[];
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
    clobTokenIds: string;
    negRisk?: boolean;
    eventId: string;
    groupItemTitle: string;
}
