import { clsx, type ClassValue } from 'clsx';
import { formatUnits as viemFormatUnits } from 'viem';
import { twMerge } from 'tailwind-merge';
import { VaultEventInfo } from '../types/conract-events';
import { GenesisVaultEventInfo } from '../types/genesis-events';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message.length > 0 && error.message.length < 50) return ': ' + error.message;
    return '';
}

export function formatUnits(value: bigint, decimals: number, maxDecimals: number = 2) {
    const clampedMaxDecimals = Math.max(0, Math.min(maxDecimals, decimals));
    const decimalDiff = decimals - clampedMaxDecimals;
    const precision = 10n ** BigInt(decimalDiff);
    const oneUnit = 10n ** BigInt(decimals);
    if (value !== 0n && clampedMaxDecimals === 0 && value < oneUnit) return '<1';
    if (value !== 0n && value < precision) return '<0.' + '0'.repeat(clampedMaxDecimals - 1) + '1';
    const quantizedValue = (value / precision) * precision;
    return viemFormatUnits(quantizedValue, decimals);
}

export function formatUnitsLocale(
    value: bigint,
    decimals: number,
    maxDecimals: number = 2,
    locales: Intl.LocalesArgument = 'en-US',
    options: Intl.NumberFormatOptions = { maximumFractionDigits: maxDecimals }
) {
    const str = formatUnits(value, decimals, maxDecimals);
    let num = '';
    if (str.includes('<')) {
        num = Number(str.replace('<', '')).toLocaleString(locales, options);
        num = '<' + num;
    } else {
        num = Number(str).toLocaleString(locales, options);
    }
    return num;
}

export function eventInfoToDb(info: VaultEventInfo | GenesisVaultEventInfo): string {
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

export function eventInfoFromDb(dbInfo: Record<string, string | bigint | boolean | number>): VaultEventInfo | GenesisVaultEventInfo {
    for (const key in dbInfo) {
        if (dbInfo[key] && typeof dbInfo[key] === 'string' && dbInfo[key].startsWith('bigint:')) {
            dbInfo[key] = BigInt(dbInfo[key].substring(7));
        }
    }
    return dbInfo as VaultEventInfo | GenesisVaultEventInfo;
}
