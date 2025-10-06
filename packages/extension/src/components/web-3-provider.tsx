import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, injected, WagmiProvider } from 'wagmi';
import { polygon } from 'wagmi/chains';

const localTransport = true;
const wagmiConfig = createConfig({
    chains: [polygon],
    // Used for public reads; wallet actions go through injected connector
    transports: { [polygon.id]: localTransport ? http('http://127.0.0.1:8545') : http() },
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
