export interface PolymarketPosition {
    proxyWallet: string;
    asset: string;
    conditionId: string;
    size: number;
    avgPrice: number;
    initialValue: number;
    currentValue: number;
    cashPnl: number;
    percentPnl: number;
    totalBought: number;
    realizedPnl: number;
    percentRealizedPnl: number;
    curPrice: number;
    redeemable: boolean;
    mergeable: boolean;
    title: string;
    slug: string;
    icon: string;
    eventSlug: string;
    outcome: string;
    outcomeIndex: number;
    oppositeOutcome: string;
    oppositeAsset: string;
    endDate?: string;
    negativeRisk: boolean;
}

export interface UserPositionRow {
    id: string;
    userAddress: string;
    conditionId: string;
    vaultAddress: string;
    yesTokens: string; // decimal as string
    noTokens: string; // decimal as string
    yieldHarvested: string; // decimal as string
    usdRedeemed: string; // decimal as string
    createdAt: string;
    updatedAt: string;
}

export interface UserPositionInfoRow extends UserPositionRow {
    question: string;
    image: string;
    endDate: string;
    status: string;
    slug: string;
    outcomes: string[];
}

export interface UserPositionInfo {
    id: string;
    userAddress: string;
    conditionId: string;
    vaultAddress: string;
    yesTokens: bigint;
    noTokens: bigint;
    yieldHarvested: bigint;
    usdRedeemed: bigint;

    question: string;
    image: string;
    endDate: number;
    status: string;
    slug: string;
    outcomes: string[];

    createdAt: number;
    updatedAt: number;
}

export function userPositionRowToUserPosition(row: UserPositionInfoRow): UserPositionInfo {
    return {
        ...row,
        yesTokens: BigInt(row.yesTokens),
        noTokens: BigInt(row.noTokens),
        yieldHarvested: BigInt(row.yieldHarvested),
        usdRedeemed: BigInt(row.usdRedeemed),
        createdAt: Number.parseInt(row.createdAt),
        updatedAt: Number.parseInt(row.updatedAt),
        endDate: Number.parseInt(row.endDate),
    };
}

export enum PortfolioFilter {
    All = 'all',
    Active = 'active',
    Ended = 'ended',
}
