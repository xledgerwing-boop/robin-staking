import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAccount, useWalletClient } from 'wagmi';
import { formatAddress, getEventData, getSelectedTitleElement, rootPath } from '../inpage_utils';
import { PolymarketEvent, PolymarketMarket, TARGET_CHAIN_ID } from '../types/types';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { useReadRobinVaultManagerVaultOf } from '@/types/contracts';

export function StakingCard() {
    const [market, setMarket] = useState<PolymarketMarket | null>(null);
    const { address, chainId, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    const { data: vaultAddress, isLoading: vaultLoading } = useReadRobinVaultManagerVaultOf({
        address: address,
        args: [market?.conditionId as `0x${string}`],
        query: {
            enabled: !!market?.conditionId,
        },
    });

    const eventData = useRef<PolymarketEvent | null>(null);

    const [amount, setAmount] = useState('');

    const [pageMarketTitle, setPageMarketTitle] = useState('');

    useEffect(() => {
        const init = async () => {
            eventData.current = await getEventData();
            const title = getSelectedTitleElement();
            if (!title) {
                handleMarketChange();
                return;
            }
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

    const handleMarketChange = () => {
        if (!eventData.current) return;
        if (eventData.current.markets.length === 1) {
            setMarket(eventData.current.markets[0]);
            return;
        }
        if (!pageMarketTitle) return;
        const market = eventData.current.markets.find(m => m.groupItemTitle === pageMarketTitle);
        if (!market) return;
        setMarket(market);
    };

    useEffect(() => {
        handleMarketChange();
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
        <Card className="pmx-gradient-border">
            <div className="pmx-gradient-inner overflow-scroll">
                <CardHeader>
                    <CardTitle>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-primary">
                                <img src={`${rootPath()}logo.png`} alt="Robin" className="w-5 h-5" /> Robin
                            </div>
                            <span className="text-sm">{isConnected ? `Using ${formatAddress(address)}` : 'Wallet not connected here'}</span>
                        </div>
                    </CardTitle>
                    <CardDescription>{market?.groupItemTitle}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div>
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
                </CardContent>
            </div>
        </Card>
    );
}
