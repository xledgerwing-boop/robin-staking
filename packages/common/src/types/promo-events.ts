export enum PromoVaultEvent {
    CampaignStarted = 'CampaignStarted',
    PricesUpdated = 'PricesUpdated',
    Deposit = 'Deposit',
    Withdraw = 'Withdraw',
    Claim = 'Claim',
    MarketAdded = 'MarketAdded',
    MarketEnded = 'MarketEnded',
    CampaignFinalized = 'CampaignFinalized',
    TvlCapUpdated = 'TvlCapUpdated',
    LeftoversSwept = 'LeftoversSwept',
}

export type CampaignStartedEvent = {
    starter: string;
    baseFunded: bigint;
    startTs: bigint;
    endTs: bigint;
};

export type PricesUpdatedEvent = {
    timestamp: bigint;
};

export type PromoDepositEvent = {
    user: string;
    marketIndex: bigint;
    isA: boolean;
    amount: bigint;
};

export type PromoWithdrawEvent = {
    user: string;
    marketIndex: bigint;
    isA: boolean;
    amount: bigint;
};

export type ClaimEvent = {
    user: string;
    basePaid: bigint;
    extraPaid: bigint;
};

export type MarketAddedEvent = {
    index: bigint;
    conditionId: `0x${string}`;
    tokenIdA: bigint;
    tokenIdB: bigint;
    extraEligible: boolean;
};

export type MarketEndedEvent = {
    index: bigint;
};

export type CampaignFinalizedEvent = {
    timestamp: bigint;
    totalValueTime: bigint;
    totalExtraValueTime: bigint;
    baseDistributed: bigint;
    extraPool: bigint;
};

export type TvlCapUpdatedEvent = {
    oldCapUsd: bigint;
    newCapUsd: bigint;
};

export type LeftoversSweptEvent = {
    to: string;
    amount: bigint;
};

export type PromoVaultEventInfo =
    | CampaignStartedEvent
    | PricesUpdatedEvent
    | PromoDepositEvent
    | PromoWithdrawEvent
    | ClaimEvent
    | MarketAddedEvent
    | MarketEndedEvent
    | CampaignFinalizedEvent
    | TvlCapUpdatedEvent
    | LeftoversSweptEvent;
