import type { Activity, ActivityRow, ActivityPosition } from './activity';
import { PromoVaultEvent } from './promo-events';

export type PromoActivityType = PromoVaultEvent;
export type PromoActivity = Omit<Activity, 'type'> & {
    type: PromoActivityType;
};
export type PromoActivityRow = Omit<ActivityRow, 'type'> & {
    type: PromoActivityType;
};
export type PromoActivityPosition = ActivityPosition;

export function PromoActivityRowToActivity(row: PromoActivityRow): PromoActivity {
    return {
        ...row,
        timestamp: Number.parseInt(row.timestamp),
        blockNumber: Number.parseInt(row.blockNumber),
        info: row.info as unknown as Record<string, string | bigint | boolean>, //already comes parsed out of the DB
    };
}
