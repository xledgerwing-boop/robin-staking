export enum PromoVaultEvent {
    CampaignStarted = 'CampaignStarted',
    PricesUpdated = 'PricesUpdated',
    Deposit = 'Deposit',
    BatchDeposit = 'BatchDeposit',
    Withdraw = 'Withdraw',
    BatchWithdraw = 'BatchWithdraw',
    Claim = 'Claim',
    MarketAdded = 'MarketAdded',
    MarketEnded = 'MarketEnded',
    CampaignFinalized = 'CampaignFinalized',
    TvlCapUpdated = 'TvlCapUpdated',
    LeftoversSwept = 'LeftoversSwept',
    EmergencyModeEnabled = 'EmergencyModeEnabled',
    EmergencyWithdrawal = 'EmergencyWithdrawal',
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
    totalTokens: bigint;
    totalUsd: bigint;
    eligibleUsd: bigint;
};

export type PromoBatchDepositEvent = {
    user: string;
    tokenAmount: bigint;
    totalTokens: bigint;
    totalUsd: bigint;
    eligibleUsd: bigint;
};

export type PromoWithdrawEvent = {
    user: string;
    marketIndex: bigint;
    isA: boolean;
    amount: bigint;
};

export type PromoBatchWithdrawEvent = {
    user: string;
    tokenAmount: bigint;
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
    newCapUsd: bigint;
    newBaseRewardPool: bigint;
};

export type LeftoversSweptEvent = {
    to: string;
    amount: bigint;
};

export type EmergencyModeEnabledEvent = {
    timestamp: bigint;
};

export type EmergencyWithdrawalEvent = {
    user: string;
};

export type PromoVaultEventInfo =
    | CampaignStartedEvent
    | PricesUpdatedEvent
    | PromoDepositEvent
    | PromoBatchDepositEvent
    | PromoWithdrawEvent
    | PromoBatchWithdrawEvent
    | ClaimEvent
    | MarketAddedEvent
    | MarketEndedEvent
    | CampaignFinalizedEvent
    | TvlCapUpdatedEvent
    | LeftoversSweptEvent
    | EmergencyModeEnabledEvent
    | EmergencyWithdrawalEvent;
