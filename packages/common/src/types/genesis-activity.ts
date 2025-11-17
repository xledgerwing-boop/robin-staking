import type { Activity, ActivityRow, ActivityPosition } from './activity';
import { GenesisVaultEvent } from './genesis-events';

export type GenesisActivityType = GenesisVaultEvent;
export type GenesisActivity = Omit<Activity, 'type'> & {
    type: GenesisActivityType;
};
export type GenesisActivityRow = Omit<ActivityRow, 'type'> & {
    type: GenesisActivityType;
};
export type GenesisActivityPosition = ActivityPosition;

export function GenesisActivityRowToActivity(row: GenesisActivityRow): GenesisActivity {
    return {
        ...row,
        timestamp: Number.parseInt(row.timestamp),
        blockNumber: Number.parseInt(row.blockNumber),
        info: row.info as unknown as Record<string, string | bigint | boolean>, //already comes parsed out of the DB
    };
}
