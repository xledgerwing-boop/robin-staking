type Contracts = {
    SAFE_PROXY_FACTORY: `0x${string}`;
    USDCE: `0x${string}`;
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
        },
    },
};

export const USED_CONTRACTS = CONTRACT_ADDRESSES.Polygon.mainnet;
