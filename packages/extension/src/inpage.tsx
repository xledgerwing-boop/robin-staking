import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { WagmiConfig, createConfig, useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { http } from 'viem';
import { polygon } from 'viem/chains';
import { formatAddress } from './inpage_utils';
import { TARGET_CHAIN_ID, fetchConditionIdForCurrentPage, readVaultAddressForCondition, createVaultTx, stakeTx } from './types';

// Simple styles (scoped by wrapper class)
const styles = `
.pmx-card { border: 1px solid rgba(0,0,0,.1); border-radius: 12px; padding: 12px; background: #fff; }
.pmx-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
.pmx-btn { padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,.2); cursor: pointer; }
.pmx-input { padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(0,0,0,.2); min-width: 120px; }
.pmx-muted { color: #666; font-size: 12px; }
`;

function addStylesOnce() {
    if (document.getElementById('pmx-styles')) return;
    const style = document.createElement('style');
    style.id = 'pmx-styles';
    style.textContent = styles;
    document.head.appendChild(style);
}
addStylesOnce();

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

function StakingCard() {
    const { address, chainId, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    const { data: conditionId, isLoading: condLoading, error: condError } = useConditionId();
    const { data: vaultAddress, isLoading: vaultLoading, refetch: refetchVault } = useVaultAddress(conditionId);

    const [amount, setAmount] = useState('');

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
        <div className="pmx-card">
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <strong>Staking</strong>
                <span className="pmx-muted">{isConnected ? `Using ${formatAddress(address)}` : 'Wallet not connected here'}</span>
            </div>

            {condLoading ? (
                <div className="pmx-row pmx-muted">Loading market condition…</div>
            ) : condError ? (
                <div className="pmx-row" style={{ color: '#b00' }}>
                    Couldn’t resolve conditionId. Please implement `fetchConditionIdForCurrentPage()`.
                </div>
            ) : (
                <div className="pmx-row">
                    <div>Condition ID:</div>
                    <code style={{ fontSize: 12 }}>{conditionId}</code>
                </div>
            )}

            {vaultLoading ? (
                <div className="pmx-row pmx-muted">Checking vault…</div>
            ) : vaultAddress ? (
                <>
                    <div className="pmx-row">
                        <div>Vault:</div>
                        <code style={{ fontSize: 12 }}>{vaultAddress}</code>
                    </div>
                    <div className="pmx-row">
                        <input className="pmx-input" value={amount} placeholder="Amount to stake" onChange={e => setAmount(e.target.value)} />
                        <button className="pmx-btn" onClick={() => stake.mutate()} disabled={stake.isPending || !amount}>
                            {stake.isPending ? 'Staking…' : 'Stake'}
                        </button>
                    </div>
                </>
            ) : (
                <div className="pmx-row">
                    <button className="pmx-btn" onClick={() => createVault.mutate()} disabled={createVault.isPending}>
                        {createVault.isPending ? 'Creating vault…' : 'Create Vault'}
                    </button>
                </div>
            )}

            {chainId && chainId !== TARGET_CHAIN_ID && (
                <div className="pmx-row" style={{ color: '#b00' }}>
                    Wrong chain (chainId {chainId}). Switch to Polygon to proceed.
                </div>
            )}
        </div>
    );
}

function App() {
    return (
        <WagmiConfig config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <StakingCard />
            </QueryClientProvider>
        </WagmiConfig>
    );
}

// Mount under the node created by the content script
const host = document.getElementById('pmx-staking-root');
if (host) {
    const root = createRoot(host);
    root.render(<App />);
}
