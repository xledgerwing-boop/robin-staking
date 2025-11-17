type Contracts = {
    SAFE_PROXY_FACTORY: `0x${string}`;
    USDCE: `0x${string}`;
    VAULT_MANAGER: `0x${string}`;
    CONDITIONAL_TOKENS: `0x${string}`;
    GENESIS_VAULT: `0x${string}`;
    EXPLORER_URL: string;
    MULTICALL: `0x${string}`;
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
            VAULT_MANAGER: '0x443d773831c8B542F20bd9712c672084911eE10B',
            CONDITIONAL_TOKENS: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
            GENESIS_VAULT: '0xAa489b4F076ce1459B48a730eFb981641A91B7c7',
            EXPLORER_URL: 'https://polygonscan.com',
            MULTICALL: '0xca11bde05977b3631167028862be2a173976ca11',
        },
    },
};

export const GENESIS_VAULT_INFOS = {
    EXTRA_APY_BPS: 400n,
};

export const USED_CONTRACTS = CONTRACT_ADDRESSES.Polygon.mainnet;
export const TARGET_CHAIN_ID = 137;

export const UNDERYLING_DECIMALS = 6;
export const UNDERYLING_PRECISION = 10 ** UNDERYLING_DECIMALS;
export const UNDERYLING_PRECISION_BIG_INT = BigInt(UNDERYLING_PRECISION);

export const DEFAULT_QUERY_STALE_TIME = 2_000;
