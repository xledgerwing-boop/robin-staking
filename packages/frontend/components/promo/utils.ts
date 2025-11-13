'use client';

import { Outcome } from '@robin-pm-staking/common/types/market';

export type MockMarket = {
    id: string;
    title: string;
    image?: string;
    eligible: boolean;
    yesSymbol: string;
    noSymbol: string;
    side: Outcome;
    walletAmount: number;
    vaultAmount: number;
    priceUsd: number;
};

export function formatUsd(n: number, decimals = 0): string {
    return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

export function calcValue(amount: number, price: number): number {
    return (amount / 1_000_000) * price;
}

export const MOCK_MARKETS: MockMarket[] = [
    {
        id: 'm-yes-1',
        title: 'Will BTC close above $100k by year end?',
        image: '/placeholder.png',
        eligible: true,
        yesSymbol: 'YES',
        noSymbol: 'NO',
        side: Outcome.Yes,
        walletAmount: 2_500_000,
        vaultAmount: 1_200_000,
        priceUsd: 0.62,
    },
    {
        id: 'm-no-2',
        title: 'Will ETH ETF be approved this quarter?',
        image: '/placeholder.png',
        eligible: false,
        yesSymbol: 'YES',
        noSymbol: 'NO',
        side: Outcome.No,
        walletAmount: 1_800_000,
        vaultAmount: 600_000,
        priceUsd: 0.41,
    },
    {
        id: 'm-yes-3',
        title: 'Will Team X win the championship?',
        image: '/placeholder.png',
        eligible: true,
        yesSymbol: 'YES',
        noSymbol: 'NO',
        side: Outcome.Yes,
        walletAmount: 900_000,
        vaultAmount: 0,
        priceUsd: 0.55,
    },
];
