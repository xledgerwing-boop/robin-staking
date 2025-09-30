type Contracts = {
    SAFE_PROXY_FACTORY: `0x${string}`;
    USDCE: `0x${string}`;
    VAULT_MANAGER: `0x${string}`;
    CONDITIONAL_TOKENS: `0x${string}`;
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
            VAULT_MANAGER: '0xf7F2b89d9502913A14A1a2E5A61E93f8A9d9bbDf',
            CONDITIONAL_TOKENS: '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
        },
    },
};

export const USED_CONTRACTS = CONTRACT_ADDRESSES.Polygon.mainnet;
