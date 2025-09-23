import { useEffect, useRef, useState } from 'react';
import './tailwind.css';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { WagmiProvider, createConfig, useAccount, useWalletClient } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { http } from 'viem';
import { polygon } from 'viem/chains';
import { formatAddress, getSelectedTitleElement } from './inpage_utils';
import { PolymarketEvent, PolymarketMarket, TARGET_CHAIN_ID } from './types';
import { Button } from './components/ui/button';
import * as React from 'react';

const ROOT_ID = 'pmx-staking-root';

// Wagmi + Query setup
const queryClient = new QueryClient();

const wagmiConfig = createConfig({
    chains: [polygon],
    // Used for public reads; wallet actions go through injected connector
    transports: { [polygon.id]: http() },
    connectors: [injected({ shimDisconnect: true })],
    ssr: false,
});

async function getEventData() {
    const pathname = window.location.pathname;
    const eventSlug = pathname.split('/')[2];
    if (!eventSlug) return null;
    const data = await fetch(`https://gamma-api.polymarket.com/events/slug/${eventSlug}`);
    const json = await data.json();
    return json;
}

function rootPath() {
    return (document.getElementById(ROOT_ID) as HTMLElement | null)?.dataset?.rootPath || '/';
}

function StakingCard() {
    const [market, setMarket] = useState<PolymarketMarket | null>(null);
    const { address, chainId, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    const [vaultAddress, setVaultAddress] = useState<string | null>(null);
    const [vaultLoading, setVaultLoading] = useState(false);
    const [conditionLoading, setConditionLoading] = useState(false);
    const [conditionError, setConditionError] = useState<string | null>(null);

    const eventData = useRef<PolymarketEvent | null>(null);

    const [amount, setAmount] = useState('');

    const [pageMarketTitle, setPageMarketTitle] = useState('');

    useEffect(() => {
        const init = async () => {
            eventData.current = await getEventData();
            const title = getSelectedTitleElement();
            if (!title) return;
            setPageMarketTitle(title.innerText);
        };
        init();

        const title = getSelectedTitleElement();
        if (!title) return;
        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.type === 'characterData' || m.type === 'childList') {
                    setPageMarketTitle(title.innerText);
                    break;
                }
            }
        });

        observer.observe(title, {
            characterData: true,
            characterDataOldValue: true,
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!eventData.current || !pageMarketTitle) return;
        const market = eventData.current.markets.find(m => m.groupItemTitle === pageMarketTitle);
        if (!market) return;
        setMarket(market);
    }, [pageMarketTitle]);

    const createVault = useMutation({
        mutationFn: async () => {
            if (!market?.conditionId) throw new Error('No conditionId');
            if (!walletClient) throw new Error('No wallet client');
            if (chainId !== TARGET_CHAIN_ID) throw new Error('Wrong chain');
        },
    });

    const stake = useMutation({
        mutationFn: async () => {
            if (!market?.conditionId) throw new Error('No conditionId');
            if (!walletClient) throw new Error('No wallet client');
            if (chainId !== TARGET_CHAIN_ID) throw new Error('Wrong chain');
        },
    });

    return (
        <div className="overflow-scroll">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-primary">
                    <img src={`${rootPath()}logo.png`} alt="Robin" className="w-5 h-5" /> Robin
                </div>
                <span>{isConnected ? `Using ${formatAddress(address)}` : 'Wallet not connected here'}</span>
            </div>

            {conditionLoading ? (
                <div>Loading market condition…</div>
            ) : conditionError ? (
                <div className="text-destructive">Couldn’t resolve conditionId. Please implement `fetchConditionIdForCurrentPage()`.</div>
            ) : (
                <div>
                    <div>Condition ID:</div>
                    <code className="text-sm">{market?.conditionId}</code>
                </div>
            )}

            {vaultLoading ? (
                <div>Checking vault…</div>
            ) : vaultAddress ? (
                <>
                    <div>
                        <div>Vault:</div>
                        <code className="text-sm">{vaultAddress}</code>
                    </div>
                    <div>
                        <input value={amount} placeholder="Amount to stake" onChange={e => setAmount(e.target.value)} />
                        <button onClick={() => stake.mutate()} disabled={stake.isPending || !amount}>
                            {stake.isPending ? 'Staking…' : 'Stake'}
                        </button>
                    </div>
                </>
            ) : (
                <div>
                    <Button onClick={() => createVault.mutate()} disabled={createVault.isPending}>
                        {createVault.isPending ? 'Creating vault…' : 'Create Vault'}
                    </Button>
                </div>
            )}

            {chainId && chainId !== TARGET_CHAIN_ID && (
                <div className="text-destructive">Wrong chain (chainId {chainId}). Switch to Polygon to proceed.</div>
            )}
        </div>
    );
}

function App() {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <StakingCard />
            </QueryClientProvider>
        </WagmiProvider>
    );
}

// Mount under the node created by the content script
function mount() {
    const host = document.getElementById(ROOT_ID);
    if (host) {
        const root = createRoot(host);
        root.render(<App />);
    }
}
mount();

// Re-run on SPA URL changes
let __pmx_lastPathname = window.location.pathname;
setInterval(async () => {
    const current = window.location.pathname;
    if (current !== __pmx_lastPathname) {
        __pmx_lastPathname = current;
        await new Promise(resolve => setTimeout(resolve, 1000));
        mount();
    }
}, 1000);
