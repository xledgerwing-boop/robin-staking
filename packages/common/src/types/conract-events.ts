export enum VaultManagerEvent {
    VaultCreated = 'VaultCreated',
    ConfigUpdated = 'ConfigUpdated',
    ProtocolFeeClaimed = 'ProtocolFeeClaimed',
}

export type VaultCreatedEvent = {
    conditionId: string;
    vault: string;
    creator: string;
};

export type ConfigUpdatedEvent = {
    implementation: string;
    protocolFeeBps: bigint;
    underlyingUsd: string;
    polymarketWcol: string;
    ctf: string;
    negRiskAdapter: string;
    negRiskCtfExchange: string;
    ctfExchange: string;
    aavePool: string;
    aaveDataProv: string;
};

export type ProtocolFeeClaimedEvent = {
    conditionId: string;
    vault: string;
    to: string;
    when: bigint;
};

export enum VaultEvent {
    Deposited = 'Deposited',
    Withdrawn = 'Withdrawn',
    MarketFinalized = 'MarketFinalized',
    YieldUnlockStarted = 'YieldUnlockStarted',
    YieldUnlockProgress = 'YieldUnlockProgress',
    YieldUnlocked = 'YieldUnlocked',
    HarvestedYield = 'HarvestedYield',
    RedeemedWinningForUSD = 'RedeemedWinningForUSD',
    HarvestedProtocolYield = 'HarvestedProtocolYield',
}

export type DepositedEvent = {
    user: string;
    isYes: boolean;
    amount: bigint;
};

export type WithdrawnEvent = {
    user: string;
    yesAmount: bigint;
    noAmount: bigint;
};

export type MarketFinalizedEvent = {
    winningPosition: WinningPosition;
};

export type YieldUnlockStartedEvent = {
    leftoverUsd: bigint;
    principalAtStart: bigint;
};

export type YieldUnlockProgressEvent = {
    withdrawnThisCall: bigint;
    cumulativeWithdrawn: bigint;
    remainingInStrategy: bigint;
};

export type YieldUnlockedEvent = {
    totalWithdrawnUsd: bigint;
    totalYield: bigint;
    userYield: bigint;
    protocolYield: bigint;
};

export type HarvestedYieldEvent = {
    user: string;
    amount: bigint;
};

export type RedeemedWinningForUSDEvent = {
    user: string;
    winningAmount: bigint;
    usdPaid: bigint;
};

export type HarvestedProtocolYieldEvent = {
    receiver: string;
    amount: bigint;
};

export enum WinningPosition {
    Unresolved = 0,
    Yes = 1,
    No = 2,
    Both = 3,
}

export type VaultEventInfo =
    | DepositedEvent
    | WithdrawnEvent
    | MarketFinalizedEvent
    | YieldUnlockStartedEvent
    | YieldUnlockProgressEvent
    | YieldUnlockedEvent
    | HarvestedYieldEvent
    | RedeemedWinningForUSDEvent
    | HarvestedProtocolYieldEvent;
