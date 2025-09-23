'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, fallback, injected, unstable_connector, WagmiProvider } from 'wagmi';
import { polygon } from 'wagmi/chains';

const wagmiConfig = createConfig({
    chains: [polygon],
    // Used for public reads; wallet actions go through injected connector
    //transports: { [polygon.id]: http() },
    transports: {
        [polygon.id]: fallback([unstable_connector(injected)]),
    },
    connectors: [injected({ shimDisconnect: true })],
    ssr: false,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    );
}
