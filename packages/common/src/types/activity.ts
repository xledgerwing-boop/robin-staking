import { VaultEvent } from './conract-events';

export interface ActivityRow {
    id: string;
    transactionHash: string;
    vaultAddress: string;
    timestamp: string;
    type: ActivityType;
    userAddress: string | null;
    position: ActivityPosition | null;
    blockNumber: string;
    info: string;
}

export interface Activity {
    id: string;
    transactionHash: string;
    vaultAddress: string;
    timestamp: number;
    type: ActivityType;
    userAddress: string | null;
    position: ActivityPosition | null;
    blockNumber: number;
    info: Record<string, string | bigint | boolean>;
}

export function ActivityRowToActivity(row: ActivityRow): Activity {
    return {
        ...row,
        timestamp: Number.parseInt(row.timestamp),
        blockNumber: Number.parseInt(row.blockNumber),
        info: row.info as unknown as Record<string, string | bigint | boolean>, //already comes parsed out of the DB
    };
}

export const activityTypeMapping: Record<string, { title: string; color: string }> = {
    [VaultEvent.Deposited]: { title: 'Deposited', color: 'bg-gray-500' },
    [VaultEvent.Withdrawn]: { title: 'Withdrawn', color: 'bg-market-no text-white' },
    [VaultEvent.MarketFinalized]: { title: 'Market Finalized', color: 'bg-market-yes' },
    [VaultEvent.YieldUnlockStarted]: { title: 'Yield Unlock Started', color: 'bg-market-no text-white' },
    [VaultEvent.YieldUnlockProgress]: { title: 'Yield Unlock Progress', color: 'bg-market-yes' },
    [VaultEvent.YieldUnlocked]: { title: 'Yield Unlocked', color: 'bg-market-no text-white' },
    [VaultEvent.HarvestedYield]: { title: 'Harvested Yield', color: 'bg-primary' },
    [VaultEvent.RedeemedWinningForUSD]: { title: 'Redeemed', color: 'bg-primary' },
    [VaultEvent.HarvestedProtocolYield]: { title: 'Harvested Protocol Yield', color: 'bg-primary' },
};

export type ActivityType = VaultEvent;

export enum ActivityPosition {
    Yes = 'yes',
    No = 'no',
    Both = 'both',
}

export const activityPositionMapping: Record<string, string> = {
    [ActivityPosition.Yes]: 'Yes',
    [ActivityPosition.No]: 'No',
    [ActivityPosition.Both]: 'Yes/No',
};
