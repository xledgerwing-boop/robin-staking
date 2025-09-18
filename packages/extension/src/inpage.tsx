import { useState } from 'react';
import './tailwind.css';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { WagmiProvider, createConfig, useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { http } from 'viem';
import { polygon } from 'viem/chains';
import { formatAddress, getSelectedTitleElement } from './inpage_utils';
import { TARGET_CHAIN_ID, fetchConditionIdForCurrentPage, readVaultAddressForCondition, createVaultTx, stakeTx } from './types';

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

function useConditionId() {
    return useQuery({
        queryKey: ['conditionId', window.location.pathname],
        queryFn: fetchConditionIdForCurrentPage,
    });
}

function useVaultAddress(conditionId: `0x${string}` | undefined) {
    const publicClient = usePublicClient();
    return useQuery({
        enabled: !!conditionId,
        queryKey: ['vaultAddress', conditionId],
        queryFn: async () => {
            if (!conditionId) throw new Error('No conditionId');
            return await readVaultAddressForCondition(conditionId, async args => {
                // generic viem read via public client
                return await publicClient!.readContract(args);
            });
        },
    });
}

function useMarketInfo() {}

function rootPath() {
    return (document.getElementById(ROOT_ID) as HTMLElement | null)?.dataset?.rootPath || '/';
}

function StakingCard() {
    const { address, chainId, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    const { data: conditionId, isLoading: condLoading, error: condError } = useConditionId();
    const { data: vaultAddress, isLoading: vaultLoading, refetch: refetchVault } = useVaultAddress(conditionId);

    const [amount, setAmount] = useState('');

    const title = getSelectedTitleElement();
    if (title) {
        new MutationObserver(() => {
            console.log('title', title);
        }).observe(title, {
            childList: true,
            subtree: true,
        });
    }

    const createVault = useMutation({
        mutationFn: async () => {
            if (!conditionId) throw new Error('No conditionId');
            if (!walletClient) throw new Error('No wallet client');
            if (chainId !== TARGET_CHAIN_ID) throw new Error('Wrong chain');
            return await createVaultTx(conditionId, async args => {
                return await walletClient!.writeContract(args);
            });
        },
        onSuccess: async () => {
            await refetchVault();
        },
    });

    const stake = useMutation({
        mutationFn: async () => {
            if (!conditionId) throw new Error('No conditionId');
            if (!walletClient) throw new Error('No wallet client');
            if (chainId !== TARGET_CHAIN_ID) throw new Error('Wrong chain');
            return await stakeTx(conditionId, amount, async args => {
                return await walletClient!.writeContract(args);
            });
        },
    });

    return (
        <div>
            {window.location.pathname}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div className="flex items-center gap-2 text-primary">
                    <img src={`${rootPath()}logo.png`} alt="Robin" style={{ width: 20, height: 20 }} /> Robin
                </div>
                <span>{isConnected ? `Using ${formatAddress(address)}` : 'Wallet not connected here'}</span>
            </div>

            {condLoading ? (
                <div>Loading market condition…</div>
            ) : condError ? (
                <div style={{ color: '#b00' }}>Couldn’t resolve conditionId. Please implement `fetchConditionIdForCurrentPage()`.</div>
            ) : (
                <div>
                    <div>Condition ID:</div>
                    <code style={{ fontSize: 12 }}>{conditionId}</code>
                </div>
            )}

            {vaultLoading ? (
                <div>Checking vault…</div>
            ) : vaultAddress ? (
                <>
                    <div>
                        <div>Vault:</div>
                        <code style={{ fontSize: 12 }}>{vaultAddress}</code>
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
                    <button onClick={() => createVault.mutate()} disabled={createVault.isPending}>
                        {createVault.isPending ? 'Creating vault…' : 'Create Vault'}
                    </button>
                </div>
            )}

            {chainId && chainId !== TARGET_CHAIN_ID && (
                <div style={{ color: '#b00' }}>Wrong chain (chainId {chainId}). Switch to Polygon to proceed.</div>
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
