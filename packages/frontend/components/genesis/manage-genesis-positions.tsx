'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Loader } from 'lucide-react';
import AmountSlider from '@robin-pm-staking/common/components/amount-slider';
import { MarketRow, Outcome } from '@robin-pm-staking/common/types/market';
import { USED_CONTRACTS, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';
import { formatUnits as formatUnitsViem, parseUnits } from 'viem';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import useProxyContractInteraction from '@robin-pm-staking/common/hooks/use-proxy-contract-interaction';
import { useReadConditionalTokensIsApprovedForAll, useWriteConditionalTokensSetApprovalForAll } from '@robin-pm-staking/common/types/contracts';
import {
    useReadRobinGenesisVaultViewUserStakedMarkets,
    useReadRobinGenesisVaultViewUserActiveWalletBalancesAboveThreshold,
    useWriteRobinGenesisVaultBatchDeposit,
    useWriteRobinGenesisVaultBatchWithdraw,
} from '@robin-pm-staking/common/src/types/contracts-genesis';
import useInvalidateQueries from '@robin-pm-staking/common/hooks/use-invalidate-queries';
import { toast } from 'sonner';
import { formatUnits, formatUnitsLocale, getErrorMessage } from '@robin-pm-staking/common/lib/utils';
import OutcomeToken from '@robin-pm-staking/common/components/outcome-token';
import { useGenesisVaultInfo } from '@/hooks/use-genesis-vault-info';
import { useGenesisVaultUserInfo } from '@/hooks/use-genesis-vault-user-info';

type GenesisMarket = {
    index: number;
    title: string;
    image?: string;
    outcomes: string[];
    genesisEligible?: boolean | null;
    ended?: boolean | null;
    walletA: bigint;
    walletB: bigint;
    stakedA: bigint;
    stakedB: bigint;
};

export default function ManageGenesisPositions() {
    const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
    // Details list is always shown now (with scroll & fade), so no toggle state needed
    const [markets, setMarkets] = useState<Record<number, GenesisMarket>>({});
    const [depositDraftYes, setDepositDraftYes] = useState<Record<number, string>>({});
    const [depositDraftNo, setDepositDraftNo] = useState<Record<number, string>>({});
    const [withdrawDraftYes, setWithdrawDraftYes] = useState<Record<number, string>>({});
    const [withdrawDraftNo, setWithdrawDraftNo] = useState<Record<number, string>>({});
    const depositListRef = useRef<HTMLDivElement | null>(null);
    const withdrawListRef = useRef<HTMLDivElement | null>(null);
    const [depositShowFade, setDepositShowFade] = useState<boolean>(false);
    const [withdrawShowFade, setWithdrawShowFade] = useState<boolean>(false);
    const [metadataLoading, setMetadataLoading] = useState<boolean>(false);

    const { proxyAddress, isConnected, isConnecting } = useProxyAccount();
    const vaultAddress = USED_CONTRACTS.GENESIS_VAULT as `0x${string}`;
    const invalidateQueries = useInvalidateQueries();
    const { totalValueUsd, tvlCapUsd, totalValueUsdQueryKey, apyBpsQueryKey } = useGenesisVaultInfo(vaultAddress);
    const { userCurrentValuesQueryKey, userStakeableValueQueryKey } = useGenesisVaultUserInfo(
        vaultAddress,
        (proxyAddress || null) as `0x${string}` | null
    );

    // Approvals for ERC1155 to the vault
    const { data: approvedForAll } = useReadConditionalTokensIsApprovedForAll({
        address: USED_CONTRACTS.CONDITIONAL_TOKENS,
        args: [proxyAddress as `0x${string}`, vaultAddress],
    });

    const {
        batch: batchStake,
        isLoading: stakeLoading,
        promise: stakePromise,
    } = useProxyContractInteraction([useWriteConditionalTokensSetApprovalForAll, useWriteRobinGenesisVaultBatchDeposit]);
    const {
        batch: batchWithdraw,
        isLoading: withdrawLoading,
        promise: withdrawPromise,
    } = useProxyContractInteraction([useWriteRobinGenesisVaultBatchWithdraw]);

    // Read wallet balances above threshold 0 and staked markets
    const {
        data: walletRes,
        isLoading: walletLoading,
        queryKey: walletQueryKey,
    } = useReadRobinGenesisVaultViewUserActiveWalletBalancesAboveThreshold({
        address: vaultAddress,
        args: [proxyAddress as `0x${string}`, 10_000n],
        query: { enabled: tab === 'deposit' },
    });
    const {
        data: stakedRes,
        isLoading: stakedLoading,
        queryKey: stakedQueryKey,
    } = useReadRobinGenesisVaultViewUserStakedMarkets({
        address: vaultAddress,
        args: [proxyAddress as `0x${string}`],
        query: { enabled: tab === 'withdraw' },
    });

    // Build market map and fetch metadata by genesis indices
    useEffect(() => {
        const load = async () => {
            if ((tab === 'deposit' && !walletRes) || (tab === 'withdraw' && !stakedRes)) return;
            const wallet = tab === 'deposit' ? (walletRes as [bigint[], bigint[], bigint[]] | undefined) : undefined;
            const staked = tab === 'withdraw' ? (stakedRes as [bigint[], bigint[], bigint[]] | undefined) : undefined;
            const indicesSet = new Set<number>();
            if (wallet) wallet[0].forEach(i => indicesSet.add(Number(i)));
            if (staked) staked[0].forEach(i => indicesSet.add(Number(i)));
            if (indicesSet.size === 0) {
                setMarkets({});
                setDepositDraftYes({});
                setDepositDraftNo({});
                setWithdrawDraftYes({});
                setWithdrawDraftNo({});
                setMetadataLoading(false);
                return;
            }
            const indices = Array.from(indicesSet.values());
            setMetadataLoading(true);
            const resp = await fetch(`/api/genesis/markets/by-index?indices=${indices.join(',')}`);
            const json = await resp.json();
            const list = (json.markets || []) as MarketRow[];
            const base: Record<number, GenesisMarket> = {};
            for (const row of list) {
                if (row.genesisIndex == null) continue;
                base[row.genesisIndex] = {
                    index: row.genesisIndex,
                    title: row.question,
                    image: row.image,
                    outcomes: row.outcomes as unknown as string[],
                    genesisEligible: row.genesisEligible ?? null,
                    ended: row.genesisEndedAt ? true : false,
                    walletA: 0n,
                    walletB: 0n,
                    stakedA: 0n,
                    stakedB: 0n,
                };
            }
            if (wallet) {
                for (let i = 0; i < wallet[0].length; i++) {
                    const idx = Number(wallet[0][i]);
                    if (!base[idx]) continue;
                    base[idx].walletA = wallet[1][i];
                    base[idx].walletB = wallet[2][i];
                }
            }
            if (staked) {
                for (let i = 0; i < staked[0].length; i++) {
                    const idx = Number(staked[0][i]);
                    if (!base[idx]) continue;
                    base[idx].stakedA = staked[1][i];
                    base[idx].stakedB = staked[2][i];
                }
            }
            setMarkets(base);
            // Reset drafts for current mode
            if (tab === 'deposit') {
                const depYes: Record<number, string> = {};
                const depNo: Record<number, string> = {};
                Object.values(base).forEach(m => {
                    depYes[m.index] = formatUnitsViem(m.walletA, UNDERYLING_DECIMALS);
                    depNo[m.index] = formatUnitsViem(m.walletB, UNDERYLING_DECIMALS);
                });
                setDepositDraftYes(depYes);
                setDepositDraftNo(depNo);
            } else {
                const withYes: Record<number, string> = {};
                const withNo: Record<number, string> = {};
                Object.values(base).forEach(m => {
                    withYes[m.index] = formatUnitsViem(m.stakedA, UNDERYLING_DECIMALS);
                    withNo[m.index] = formatUnitsViem(m.stakedB, UNDERYLING_DECIMALS);
                });
                setWithdrawDraftYes(withYes);
                setWithdrawDraftNo(withNo);
            }
            setMetadataLoading(false);
        };
        load();
    }, [walletRes, stakedRes, tab]);

    const depositSummary = useMemo(() => {
        let totalTokens = 0n;
        Object.entries(depositDraftYes).forEach(([k, v]) => {
            try {
                totalTokens += parseUnits(v || '0', UNDERYLING_DECIMALS);
            } catch {}
        });
        Object.entries(depositDraftNo).forEach(([k, v]) => {
            try {
                totalTokens += parseUnits(v || '0', UNDERYLING_DECIMALS);
            } catch {}
        });
        return { totalTokens };
    }, [depositDraftYes, depositDraftNo]);

    const withdrawSummary = useMemo(() => {
        let totalTokens = 0n;
        Object.entries(withdrawDraftYes).forEach(([k, v]) => {
            try {
                totalTokens += parseUnits(v || '0', UNDERYLING_DECIMALS);
            } catch {}
        });
        Object.entries(withdrawDraftNo).forEach(([k, v]) => {
            try {
                totalTokens += parseUnits(v || '0', UNDERYLING_DECIMALS);
            } catch {}
        });
        return { totalTokens };
    }, [withdrawDraftYes, withdrawDraftNo]);

    const capReached = useMemo(() => (totalValueUsd ?? 0n) >= (tvlCapUsd ?? 0n) && (tvlCapUsd ?? 0n) > 0n, [totalValueUsd, tvlCapUsd]);

    const onStakeEverything = async () => {
        try {
            if (!isConnected || isConnecting) throw new Error('Wallet not connected');
            const indices: bigint[] = [];
            const sidesIsA: boolean[] = [];
            const amounts: bigint[] = [];
            Object.values(markets).forEach(m => {
                const amtYes = parseUnits(depositDraftYes[m.index] || '0', UNDERYLING_DECIMALS);
                const amtNo = parseUnits(depositDraftNo[m.index] || '0', UNDERYLING_DECIMALS);
                if (amtYes > 0n) {
                    indices.push(BigInt(m.index));
                    sidesIsA.push(true);
                    amounts.push(amtYes);
                }
                if (amtNo > 0n) {
                    indices.push(BigInt(m.index));
                    sidesIsA.push(false);
                    amounts.push(amtNo);
                }
            });
            if (indices.length === 0) return;
            const items: {
                address: `0x${string}`;
                args: readonly unknown[];
                hookIndex: number;
            }[] = [];
            if (!approvedForAll) {
                items.push({
                    address: USED_CONTRACTS.CONDITIONAL_TOKENS as `0x${string}`,
                    args: [vaultAddress, true],
                    hookIndex: 0,
                });
            }
            items.push({
                address: vaultAddress,
                args: [indices, sidesIsA, amounts],
                hookIndex: approvedForAll ? 1 : 1,
            });
            // @ts-expect-error fix typing
            await batchStake(items);
            await stakePromise.current;
            await invalidateQueries([totalValueUsdQueryKey, apyBpsQueryKey, userCurrentValuesQueryKey, userStakeableValueQueryKey, walletQueryKey]);
            toast.success('Deposit successful');
        } catch (error) {
            toast.error(`Deposit failed: ${getErrorMessage(error)}`);
            console.error(error);
        }
    };

    const onWithdrawEverything = async () => {
        try {
            if (!isConnected || isConnecting) throw new Error('Wallet not connected');
            const indices: bigint[] = [];
            const sidesIsA: boolean[] = [];
            const amounts: bigint[] = [];
            Object.values(markets).forEach(m => {
                const amtYes = parseUnits(withdrawDraftYes[m.index] || '0', UNDERYLING_DECIMALS);
                const amtNo = parseUnits(withdrawDraftNo[m.index] || '0', UNDERYLING_DECIMALS);
                if (amtYes > 0n) {
                    indices.push(BigInt(m.index));
                    sidesIsA.push(true);
                    amounts.push(amtYes);
                }
                if (amtNo > 0n) {
                    indices.push(BigInt(m.index));
                    sidesIsA.push(false);
                    amounts.push(amtNo);
                }
            });
            if (indices.length === 0) return;
            await batchWithdraw([
                {
                    address: vaultAddress,
                    args: [indices, sidesIsA, amounts],
                    hookIndex: 0,
                },
            ]);
            await withdrawPromise.current;
            await invalidateQueries([totalValueUsdQueryKey, apyBpsQueryKey, userCurrentValuesQueryKey, userStakeableValueQueryKey, stakedQueryKey]);
            toast.success('Withdraw successful');
        } catch (error) {
            toast.error(`Withdraw failed: ${getErrorMessage(error) || 'Please try again after 1 minute'}`);
            console.error(error);
        }
    };

    const marketList = useMemo(() => Object.values(markets).sort((a, b) => a.index - b.index), [markets]);
    const inactiveWithdrawList = useMemo(() => marketList.filter(m => m.ended), [marketList]);
    const activeWithdrawList = useMemo(() => marketList.filter(m => !m.ended), [marketList]);
    const depositListLoading = tab === 'deposit' && (walletLoading || metadataLoading);
    const withdrawListLoading = tab === 'withdraw' && (stakedLoading || metadataLoading);

    // Update fade visibility on scroll/resize; hide fade at end or when list can't scroll
    useEffect(() => {
        const update = (el: HTMLDivElement | null, setter: (v: boolean) => void) => {
            if (!el) {
                setter(false);
                return;
            }
            const canScroll = el.scrollHeight > el.clientHeight + 1;
            if (!canScroll) {
                setter(false);
                return;
            }
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            setter(!atBottom);
        };
        const depEl = depositListRef.current;
        const withEl = withdrawListRef.current;
        const onDepositScroll = () => update(depEl, setDepositShowFade);
        const onWithdrawScroll = () => update(withEl, setWithdrawShowFade);
        depEl?.addEventListener('scroll', onDepositScroll);
        withEl?.addEventListener('scroll', onWithdrawScroll);
        update(depEl, setDepositShowFade);
        update(withEl, setWithdrawShowFade);
        const onResize = () => {
            update(depEl, setDepositShowFade);
            update(withEl, setWithdrawShowFade);
        };
        window.addEventListener('resize', onResize);
        return () => {
            depEl?.removeEventListener('scroll', onDepositScroll);
            withEl?.removeEventListener('scroll', onWithdrawScroll);
            window.removeEventListener('resize', onResize);
        };
    }, [marketList.length, inactiveWithdrawList.length, activeWithdrawList.length, tab]);

    const selectAllDepositable = () => {
        const depYes: Record<number, string> = {};
        const depNo: Record<number, string> = {};
        Object.values(markets).forEach(m => {
            depYes[m.index] = formatUnitsViem(m.walletA, UNDERYLING_DECIMALS);
            depNo[m.index] = formatUnitsViem(m.walletB, UNDERYLING_DECIMALS);
        });
        setDepositDraftYes(depYes);
        setDepositDraftNo(depNo);
    };
    const deselectAllDepositable = () => {
        const depYes: Record<number, string> = {};
        const depNo: Record<number, string> = {};
        Object.values(markets).forEach(m => {
            depYes[m.index] = '0';
            depNo[m.index] = '0';
        });
        setDepositDraftYes(depYes);
        setDepositDraftNo(depNo);
    };
    const selectAllWithdrawable = () => {
        const withYes: Record<number, string> = {};
        const withNo: Record<number, string> = {};
        Object.values(markets).forEach(m => {
            withYes[m.index] = formatUnitsViem(m.stakedA, UNDERYLING_DECIMALS);
            withNo[m.index] = formatUnitsViem(m.stakedB, UNDERYLING_DECIMALS);
        });
        setWithdrawDraftYes(withYes);
        setWithdrawDraftNo(withNo);
    };
    const deselectAllWithdrawable = () => {
        const withYes: Record<number, string> = {};
        const withNo: Record<number, string> = {};
        Object.values(markets).forEach(m => {
            withYes[m.index] = '0';
            withNo[m.index] = '0';
        });
        setWithdrawDraftYes(withYes);
        setWithdrawDraftNo(withNo);
    };
    const selectAllInactiveWithdrawable = () => {
        const withYes = { ...withdrawDraftYes };
        const withNo = { ...withdrawDraftNo };
        inactiveWithdrawList.forEach(m => {
            withYes[m.index] = formatUnitsViem(m.stakedA, UNDERYLING_DECIMALS);
            withNo[m.index] = formatUnitsViem(m.stakedB, UNDERYLING_DECIMALS);
        });
        setWithdrawDraftYes(withYes);
        setWithdrawDraftNo(withNo);
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-xl text-muted-foreground">My Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={tab} onValueChange={v => setTab(v as 'deposit' | 'withdraw')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="deposit">Deposit</TabsTrigger>
                        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                    </TabsList>

                    <TabsContent value="deposit" className="space-y-4 pt-4">
                        {capReached && <div className="text-xs text-secondary -mt-2">Cap reached — deposits are temporarily disabled</div>}
                        <Button
                            className="relative w-full overflow-hidden h-12"
                            onClick={onStakeEverything}
                            disabled={stakeLoading || capReached || depositSummary.totalTokens === 0n}
                        >
                            <span className="flex items-center justify-center">
                                {stakeLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
                                {`Stake ${formatUnitsLocale(depositSummary.totalTokens, UNDERYLING_DECIMALS, 1)} tokens`}
                            </span>
                        </Button>

                        <div className="space-y-4">
                            {marketList.length != 0 && (
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={deselectAllDepositable} disabled={stakeLoading}>
                                        Deselect all
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={selectAllDepositable} disabled={stakeLoading}>
                                        Select all
                                    </Button>
                                </div>
                            )}
                            <div className="relative">
                                <div
                                    ref={depositListRef}
                                    className="no-scrollbar max-h-[550px] overflow-y-auto pr-1 space-y-4"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {depositListLoading ? (
                                        <div className="py-8 flex items-center justify-center text-muted-foreground">
                                            <Loader className="w-5 h-5 animate-spin" />
                                        </div>
                                    ) : marketList.length === 0 ? (
                                        <div className="text-sm text-muted-foreground text-center py-8">No eligible positions</div>
                                    ) : (
                                        marketList.map(m => {
                                            const yesSymbol = m.outcomes?.[0] || 'YES';
                                            const noSymbol = m.outcomes?.[1] || 'NO';
                                            return (
                                                <MarketSlidersCard
                                                    key={`dep-${m.index}`}
                                                    market={m}
                                                    yesMax={m.walletA}
                                                    noMax={m.walletB}
                                                    yesSymbol={yesSymbol}
                                                    noSymbol={noSymbol}
                                                    draftYes={depositDraftYes[m.index] || '0'}
                                                    draftNo={depositDraftNo[m.index] || '0'}
                                                    onChangeYes={v =>
                                                        setDepositDraftYes(prev => ({
                                                            ...prev,
                                                            [m.index]: v,
                                                        }))
                                                    }
                                                    onChangeNo={v =>
                                                        setDepositDraftNo(prev => ({
                                                            ...prev,
                                                            [m.index]: v,
                                                        }))
                                                    }
                                                />
                                            );
                                        })
                                    )}
                                </div>
                                {depositShowFade && (
                                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/95 to-transparent" />
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="withdraw" className="space-y-4 pt-4">
                        <Button
                            className="relative w-full overflow-hidden h-12"
                            variant="secondary"
                            onClick={onWithdrawEverything}
                            disabled={withdrawLoading || withdrawSummary.totalTokens === 0n}
                        >
                            <span className="flex items-center justify-center">
                                {withdrawLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
                                {`Withdraw ${formatUnitsLocale(withdrawSummary.totalTokens, UNDERYLING_DECIMALS, 1)} tokens`}
                            </span>
                        </Button>

                        <div className="space-y-4">
                            {(inactiveWithdrawList.length > 0 || activeWithdrawList.length > 0) && (
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={deselectAllWithdrawable} disabled={withdrawLoading}>
                                        Deselect all
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={selectAllWithdrawable} disabled={withdrawLoading}>
                                        Select all
                                    </Button>
                                </div>
                            )}
                            <div className="relative">
                                <div
                                    ref={withdrawListRef}
                                    className="no-scrollbar max-h-[550px] overflow-y-auto pr-1 space-y-4 pb-4"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {withdrawListLoading ? (
                                        <div className="py-8 flex items-center justify-center text-muted-foreground">
                                            <Loader className="w-5 h-5 animate-spin" />
                                        </div>
                                    ) : inactiveWithdrawList.length === 0 && activeWithdrawList.length === 0 ? (
                                        <div className="text-sm text-muted-foreground text-center">No eligible positions</div>
                                    ) : (
                                        <>
                                            {inactiveWithdrawList.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm font-medium">Inactive markets</div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={selectAllInactiveWithdrawable}
                                                            disabled={withdrawLoading}
                                                        >
                                                            Select all inactive
                                                        </Button>
                                                    </div>
                                                    {inactiveWithdrawList.map(m => {
                                                        const yesSymbol = m.outcomes?.[0] || 'YES';
                                                        const noSymbol = m.outcomes?.[1] || 'NO';
                                                        return (
                                                            <MarketSlidersCard
                                                                key={`with-inactive-${m.index}`}
                                                                market={m}
                                                                yesMax={m.stakedA}
                                                                noMax={m.stakedB}
                                                                yesSymbol={yesSymbol}
                                                                noSymbol={noSymbol}
                                                                draftYes={withdrawDraftYes[m.index] || '0'}
                                                                draftNo={withdrawDraftNo[m.index] || '0'}
                                                                onChangeYes={v =>
                                                                    setWithdrawDraftYes(prev => ({
                                                                        ...prev,
                                                                        [m.index]: v,
                                                                    }))
                                                                }
                                                                onChangeNo={v =>
                                                                    setWithdrawDraftNo(prev => ({
                                                                        ...prev,
                                                                        [m.index]: v,
                                                                    }))
                                                                }
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {activeWithdrawList.map(m => {
                                                const yesSymbol = m.outcomes?.[0] || 'YES';
                                                const noSymbol = m.outcomes?.[1] || 'NO';
                                                return (
                                                    <MarketSlidersCard
                                                        key={`with-${m.index}`}
                                                        market={m}
                                                        yesMax={m.stakedA}
                                                        noMax={m.stakedB}
                                                        yesSymbol={yesSymbol}
                                                        noSymbol={noSymbol}
                                                        draftYes={withdrawDraftYes[m.index] || '0'}
                                                        draftNo={withdrawDraftNo[m.index] || '0'}
                                                        onChangeYes={v =>
                                                            setWithdrawDraftYes(prev => ({
                                                                ...prev,
                                                                [m.index]: v,
                                                            }))
                                                        }
                                                        onChangeNo={v =>
                                                            setWithdrawDraftNo(prev => ({
                                                                ...prev,
                                                                [m.index]: v,
                                                            }))
                                                        }
                                                    />
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                                {withdrawShowFade && (
                                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/95 to-transparent" />
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                <style jsx global>{`
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </CardContent>
        </Card>
    );
}

type MarketCardProps = {
    market: GenesisMarket;
    yesMax: bigint;
    noMax: bigint;
    yesSymbol: string;
    noSymbol: string;
    draftYes: string;
    draftNo: string;
    onChangeYes: (v: string) => void;
    onChangeNo: (v: string) => void;
    disabled?: boolean;
};

function MarketSlidersCard({ market, yesMax, noMax, yesSymbol, noSymbol, draftYes, draftNo, onChangeYes, onChangeNo, disabled }: MarketCardProps) {
    return (
        <Card className="relative overflow-hidden border-muted">
            {market.genesisEligible && (
                <div className="pointer-events-none select-none absolute -right-10 top-3 rotate-45 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider px-12 py-1 shadow-md">
                    +4% APY
                </div>
            )}
            <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                    <div className="w-16 h-16 relative shrink-0 rounded-md overflow-hidden bg-muted">
                        <Image src={market.image || '/placeholder.png'} alt="market" fill className="object-cover" sizes="150px" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <div className="font-medium">{market.title}</div>
                        </div>
                        <div className="flex w-full items-center gap-2 mb-1">
                            <div className="text-xs min-w-7 shrink-0">{Number.parseFloat(draftYes).toFixed(1) || '0'}</div>
                            <OutcomeToken outcome={Outcome.Yes} symbolHolder={market} noText />
                            <AmountSlider
                                className="w-full"
                                amount={draftYes || '0'}
                                max={yesMax}
                                onAmountChange={onChangeYes}
                                disabled={!!disabled}
                            />
                        </div>
                        <div className="flex w-full items-center gap-2">
                            <div className="text-xs min-w-7 shrink-0">{Number.parseFloat(draftNo).toFixed(1) || '0'}</div>
                            <OutcomeToken outcome={Outcome.No} symbolHolder={market} noText />
                            <AmountSlider className="w-full" amount={draftNo || '0'} max={noMax} onAmountChange={onChangeNo} disabled={!!disabled} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
