type Contracts = {
    SAFE_PROXY_FACTORY: `0x${string}`;
    USDCE: `0x${string}`;
    VAULT_MANAGER: `0x${string}`;
    CONDITIONAL_TOKENS: `0x${string}`;
    EXPLORER_URL: string;
};

const CONTRACT_ADDRESSES: {
    [chain: string]: {
        mainnet: Contracts;
        testnet?: Contracts;
    };
} = {
    Polygon: {
        mainnet: {
            SAFE_PROXY_FACTORY: '0xaacFeEa03eb1561C4e67d661e40682Bd20E3541b',
            USDCE: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            VAULT_MANAGER: '0x86f39868E85B0b62ca6ff934c8f7Dae8f84F5C48',
            CONDITIONAL_TOKENS: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
            EXPLORER_URL: 'https://polygonscan.com',
        },
    },
};

export const USED_CONTRACTS = CONTRACT_ADDRESSES.Polygon.mainnet;
export const TARGET_CHAIN_ID = 137;

export const UNDERYLING_DECIMALS = 6;
export const UNDERYLING_PRECISION = 10 ** UNDERYLING_DECIMALS;
export const UNDERYLING_PRECISION_BIG_INT = BigInt(UNDERYLING_PRECISION);

export const DEFAULT_QUERY_STALE_TIME = 2_000;
