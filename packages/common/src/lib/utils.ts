import { clsx, type ClassValue } from 'clsx';
import { formatUnits as viemFormatUnits } from 'viem';
import { twMerge } from 'tailwind-merge';
import { UNDERYLING_DECIMALS } from '../constants';
import { VaultEventInfo } from '../types/conract-events';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message.length > 0 && error.message.length < 50) return ': ' + error.message;
    return '';
}

export function formatUnits(value: bigint, decimals: number, maxDecimals: number = 2) {
    const decimalDiff = UNDERYLING_DECIMALS - maxDecimals;
    const precision = BigInt(10 ** decimalDiff);
    if (value !== 0n && value / precision === 0n) return '<0.' + '0'.repeat(maxDecimals - 1) + '1';
    return viemFormatUnits((value / precision) * precision, decimals);
}

export function eventInfoToDb(info: VaultEventInfo): string {
    const dbInfo: Record<string, string> = {};
    for (const key in info) {
        if (typeof info[key as keyof typeof info] === 'bigint') {
            dbInfo[key] = 'bigint:' + (info[key as keyof typeof info] as bigint).toString();
        } else {
            dbInfo[key] = info[key as keyof typeof info];
        }
    }
    return JSON.stringify(dbInfo);
}

export function eventInfoFromDb(dbInfo: Record<string, string | bigint | boolean | number>): VaultEventInfo {
    for (const key in dbInfo) {
        if (dbInfo[key] && typeof dbInfo[key] === 'string' && dbInfo[key].startsWith('bigint:')) {
            dbInfo[key] = BigInt(dbInfo[key].substring(7));
        }
    }
    return dbInfo as VaultEventInfo;
}
