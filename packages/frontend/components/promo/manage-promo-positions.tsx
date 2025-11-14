'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronDown, ArrowUpRight, Loader } from 'lucide-react';
import AmountSlider from '@robin-pm-staking/common/components/amount-slider';
import { Outcome } from '@robin-pm-staking/common/types/market';
import { USED_CONTRACTS, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';
import { formatUnits as formatUnitsViem, parseUnits } from 'viem';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import useProxyContractInteraction from '@robin-pm-staking/common/hooks/use-proxy-contract-interaction';
import { useReadConditionalTokensIsApprovedForAll, useWriteConditionalTokensSetApprovalForAll } from '@robin-pm-staking/common/types/contracts';
import {
    useReadPromotionVaultViewUserStakedMarkets,
    useReadPromotionVaultViewUserActiveWalletBalancesAboveThreshold,
    useWritePromotionVaultBatchDeposit,
    useWritePromotionVaultBatchWithdraw,
} from '@robin-pm-staking/common/src/types/contracts-promo';
import useInvalidateQueries from '@robin-pm-staking/common/hooks/use-invalidate-queries';
import { toast } from 'sonner';
import { getErrorMessage } from '@robin-pm-staking/common/lib/utils';
import { usePromotionVaultInfo } from '@/hooks/use-promotion-vault-info';
import { usePromotionVaultUserInfo } from '@/hooks/use-promotion-vault-user-info';

type PromoMarket = {
    index: number;
    title: string;
    image?: string;
    outcomes: string[];
    eligible?: boolean | null;
    ended?: boolean | null;
    walletA: bigint;
    walletB: bigint;
    stakedA: bigint;
    stakedB: bigint;
};

export default function ManagePromoPositions() {
    const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
    const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
    const [markets, setMarkets] = useState<Record<number, PromoMarket>>({});
    const [depositDraftYes, setDepositDraftYes] = useState<Record<number, string>>({});
    const [depositDraftNo, setDepositDraftNo] = useState<Record<number, string>>({});
    const [withdrawDraftYes, setWithdrawDraftYes] = useState<Record<number, string>>({});
    const [withdrawDraftNo, setWithdrawDraftNo] = useState<Record<number, string>>({});

    const { proxyAddress, isConnected, isConnecting } = useProxyAccount();
    const vaultAddress = USED_CONTRACTS.PROMOTION_VAULT as `0x${string}`;
    const invalidateQueries = useInvalidateQueries();
    const { totalValueUsdQueryKey, apyBpsQueryKey } = usePromotionVaultInfo(vaultAddress);
    const { userCurrentValuesQueryKey, userStakeableValueQueryKey } = usePromotionVaultUserInfo(
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
    } = useProxyContractInteraction([useWriteConditionalTokensSetApprovalForAll, useWritePromotionVaultBatchDeposit]);
    const {
        batch: batchWithdraw,
        isLoading: withdrawLoading,
        promise: withdrawPromise,
    } = useProxyContractInteraction([useWritePromotionVaultBatchWithdraw]);

    // Read wallet balances above threshold 0 and staked markets
    const { data: walletRes } = useReadPromotionVaultViewUserActiveWalletBalancesAboveThreshold({
        address: vaultAddress,
        args: [proxyAddress as `0x${string}`, 0n],
        query: { enabled: tab === 'deposit' },
    });
    const { data: stakedRes, queryKey: stakedQueryKey } = useReadPromotionVaultViewUserStakedMarkets({
        address: vaultAddress,
        args: [proxyAddress as `0x${string}`],
        query: { enabled: tab === 'withdraw' },
    });
    const { queryKey: walletQueryKey } = useReadPromotionVaultViewUserActiveWalletBalancesAboveThreshold({
        address: vaultAddress,
        args: [proxyAddress as `0x${string}`, 0n],
        query: { enabled: false },
    });

    // Build market map and fetch metadata by promo indices
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
                return;
            }
            const indices = Array.from(indicesSet.values());
            const resp = await fetch(`/api/promo/markets/by-index?indices=${indices.join(',')}`);
            const json = await resp.json();
            const list = (json.markets || []) as Array<{
                promotionIndex: number;
                question: string;
                image?: string;
                outcomes: string[];
                eligible?: boolean | null;
                promoEndedAt?: string | number | null;
            }>;
            const base: Record<number, PromoMarket> = {};
            for (const row of list) {
                base[row.promotionIndex] = {
                    index: row.promotionIndex,
                    title: row.question,
                    image: row.image,
                    outcomes: row.outcomes,
                    eligible: row.eligible ?? null,
                    ended: row.promoEndedAt ? true : false,
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
            const items: any[] = [];
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
            toast.error(`Withdraw failed: ${getErrorMessage(error)}`);
            console.error(error);
        }
    };

    const marketList = useMemo(() => Object.values(markets).sort((a, b) => a.index - b.index), [markets]);
    const inactiveWithdrawList = useMemo(() => marketList.filter(m => m.ended), [marketList]);
    const activeWithdrawList = useMemo(() => marketList.filter(m => !m.ended), [marketList]);

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
                <CardTitle className="text-xl">Manage Across Markets</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs className="max-w-[900px] mx-auto" value={tab} onValueChange={v => setTab(v as 'deposit' | 'withdraw')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="deposit">Deposit</TabsTrigger>
                        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                    </TabsList>

                    <TabsContent value="deposit" className="space-y-4 pt-4">
                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">Total deposit amount</div>
                                <div className="text-sm font-medium">{formatUnitsViem(depositSummary.totalTokens, UNDERYLING_DECIMALS)} tokens</div>
                            </div>
                            <Button className="w-full" onClick={onStakeEverything} disabled={stakeLoading}>
                                {stakeLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
                                Stake Everything
                            </Button>
                        </div>

                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground"
                            onClick={() => setDetailsOpen(o => !o)}
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
                            {detailsOpen ? 'Hide details' : 'Show details'}
                        </button>

                        {detailsOpen && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={selectAllDepositable} disabled={stakeLoading}>
                                        Select all
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={deselectAllDepositable} disabled={stakeLoading}>
                                        Deselect all
                                    </Button>
                                </div>
                                {marketList.map(m => {
                                    const yesSymbol = m.outcomes?.[0] || 'YES';
                                    const noSymbol = m.outcomes?.[1] || 'NO';
                                    return (
                                        <Card key={`dep-${m.index}`} className="border-muted">
                                            <CardContent className="pt-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-16 h-16 relative shrink-0 rounded-md overflow-hidden bg-muted">
                                                        <Image src={m.image || '/placeholder.png'} alt="market" fill className="object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="font-medium">{m.title}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {m.eligible ? (
                                                                    <span className="text-primary font-medium">Eligible +4% APY</span>
                                                                ) : (
                                                                    'Standard APY'
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                                            <div className="md:col-span-2 space-y-3">
                                                                <div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="text-xs text-muted-foreground">
                                                                            Wallet YES: {formatUnitsViem(m.walletA, UNDERYLING_DECIMALS)} tokens
                                                                        </div>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-7 text-xs"
                                                                            onClick={() =>
                                                                                setDepositDraftYes(prev => ({
                                                                                    ...prev,
                                                                                    [m.index]: formatUnitsViem(m.walletA, UNDERYLING_DECIMALS),
                                                                                }))
                                                                            }
                                                                        >
                                                                            Max
                                                                        </Button>
                                                                    </div>
                                                                    <div className="text-xs mb-1">
                                                                        Selected: {depositDraftYes[m.index] || '0'} {yesSymbol}
                                                                    </div>
                                                                    <AmountSlider
                                                                        className="py-1"
                                                                        amount={depositDraftYes[m.index] || '0'}
                                                                        max={m.walletA}
                                                                        onAmountChange={v =>
                                                                            setDepositDraftYes(prev => ({
                                                                                ...prev,
                                                                                [m.index]: v,
                                                                            }))
                                                                        }
                                                                        showMax={false}
                                                                        disabled={false}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="text-xs text-muted-foreground">
                                                                            Wallet NO: {formatUnitsViem(m.walletB, UNDERYLING_DECIMALS)} tokens
                                                                        </div>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-7 text-xs"
                                                                            onClick={() =>
                                                                                setDepositDraftNo(prev => ({
                                                                                    ...prev,
                                                                                    [m.index]: formatUnitsViem(m.walletB, UNDERYLING_DECIMALS),
                                                                                }))
                                                                            }
                                                                        >
                                                                            Max
                                                                        </Button>
                                                                    </div>
                                                                    <div className="text-xs mb-1">
                                                                        Selected: {depositDraftNo[m.index] || '0'} {noSymbol}
                                                                    </div>
                                                                    <AmountSlider
                                                                        className="py-1"
                                                                        amount={depositDraftNo[m.index] || '0'}
                                                                        max={m.walletB}
                                                                        onAmountChange={v =>
                                                                            setDepositDraftNo(prev => ({
                                                                                ...prev,
                                                                                [m.index]: v,
                                                                            }))
                                                                        }
                                                                        showMax={false}
                                                                        disabled={false}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="withdraw" className="space-y-4 pt-4">
                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">Total withdraw amount</div>
                                <div className="text-sm font-medium">{formatUnitsViem(withdrawSummary.totalTokens, UNDERYLING_DECIMALS)} tokens</div>
                            </div>
                            <Button className="w-full" variant="secondary" onClick={onWithdrawEverything} disabled={withdrawLoading}>
                                {withdrawLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
                                Withdraw Everything
                            </Button>
                        </div>

                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground"
                            onClick={() => setDetailsOpen(o => !o)}
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
                            {detailsOpen ? 'Hide details' : 'Show details'}
                        </button>

                        {detailsOpen && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={selectAllWithdrawable} disabled={withdrawLoading}>
                                        Select all
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={deselectAllWithdrawable} disabled={withdrawLoading}>
                                        Deselect all
                                    </Button>
                                </div>
                                {inactiveWithdrawList.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium">Inactive markets</div>
                                            <Button variant="outline" size="sm" onClick={selectAllInactiveWithdrawable} disabled={withdrawLoading}>
                                                Select all inactive
                                            </Button>
                                        </div>
                                        {inactiveWithdrawList.map(m => {
                                            const yesSymbol = m.outcomes?.[0] || 'YES';
                                            const noSymbol = m.outcomes?.[1] || 'NO';
                                            return (
                                                <Card key={`with-inactive-${m.index}`} className="border-muted">
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-16 h-16 relative shrink-0 rounded-md overflow-hidden bg-muted">
                                                                <Image
                                                                    src={m.image || '/placeholder.png'}
                                                                    alt="market"
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="font-medium">{m.title}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {m.eligible ? (
                                                                            <span className="text-primary font-medium">Eligible +4% APY</span>
                                                                        ) : (
                                                                            'Standard APY'
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                                                    <div className="md:col-span-2 space-y-3">
                                                                        <div>
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    In Vault YES: {formatUnitsViem(m.stakedA, UNDERYLING_DECIMALS)}{' '}
                                                                                    tokens
                                                                                </div>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="h-7 text-xs"
                                                                                    onClick={() =>
                                                                                        setWithdrawDraftYes(prev => ({
                                                                                            ...prev,
                                                                                            [m.index]: formatUnitsViem(
                                                                                                m.stakedA,
                                                                                                UNDERYLING_DECIMALS
                                                                                            ),
                                                                                        }))
                                                                                    }
                                                                                >
                                                                                    Max
                                                                                </Button>
                                                                            </div>
                                                                            <div className="text-xs mb-1">
                                                                                Selected: {withdrawDraftYes[m.index] || '0'} {yesSymbol}
                                                                            </div>
                                                                            <AmountSlider
                                                                                className="py-1"
                                                                                amount={withdrawDraftYes[m.index] || '0'}
                                                                                max={m.stakedA}
                                                                                onAmountChange={v =>
                                                                                    setWithdrawDraftYes(prev => ({
                                                                                        ...prev,
                                                                                        [m.index]: v,
                                                                                    }))
                                                                                }
                                                                                showMax={false}
                                                                                disabled={false}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    In Vault NO: {formatUnitsViem(m.stakedB, UNDERYLING_DECIMALS)}{' '}
                                                                                    tokens
                                                                                </div>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="h-7 text-xs"
                                                                                    onClick={() =>
                                                                                        setWithdrawDraftNo(prev => ({
                                                                                            ...prev,
                                                                                            [m.index]: formatUnitsViem(
                                                                                                m.stakedB,
                                                                                                UNDERYLING_DECIMALS
                                                                                            ),
                                                                                        }))
                                                                                    }
                                                                                >
                                                                                    Max
                                                                                </Button>
                                                                            </div>
                                                                            <div className="text-xs mb-1">
                                                                                Selected: {withdrawDraftNo[m.index] || '0'} {noSymbol}
                                                                            </div>
                                                                            <AmountSlider
                                                                                className="py-1"
                                                                                amount={withdrawDraftNo[m.index] || '0'}
                                                                                max={m.stakedB}
                                                                                onAmountChange={v =>
                                                                                    setWithdrawDraftNo(prev => ({
                                                                                        ...prev,
                                                                                        [m.index]: v,
                                                                                    }))
                                                                                }
                                                                                showMax={false}
                                                                                disabled={false}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                                {activeWithdrawList.map(m => {
                                    const yesSymbol = m.outcomes?.[0] || 'YES';
                                    const noSymbol = m.outcomes?.[1] || 'NO';
                                    return (
                                        <Card key={`with-${m.index}`} className="border-muted">
                                            <CardContent className="pt-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-16 h-16 relative shrink-0 rounded-md overflow-hidden bg-muted">
                                                        <Image src={m.image || '/placeholder.png'} alt="market" fill className="object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="font-medium">{m.title}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {m.eligible ? (
                                                                    <span className="text-primary font-medium">Eligible +4% APY</span>
                                                                ) : (
                                                                    'Standard APY'
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                                            <div className="md:col-span-2 space-y-3">
                                                                <div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="text-xs text-muted-foreground">
                                                                            In Vault YES: {formatUnitsViem(m.stakedA, UNDERYLING_DECIMALS)} tokens
                                                                        </div>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-7 text-xs"
                                                                            onClick={() =>
                                                                                setWithdrawDraftYes(prev => ({
                                                                                    ...prev,
                                                                                    [m.index]: formatUnitsViem(m.stakedA, UNDERYLING_DECIMALS),
                                                                                }))
                                                                            }
                                                                        >
                                                                            Max
                                                                        </Button>
                                                                    </div>
                                                                    <div className="text-xs mb-1">
                                                                        Selected: {withdrawDraftYes[m.index] || '0'} {yesSymbol}
                                                                    </div>
                                                                    <AmountSlider
                                                                        className="py-1"
                                                                        amount={withdrawDraftYes[m.index] || '0'}
                                                                        max={m.stakedA}
                                                                        onAmountChange={v =>
                                                                            setWithdrawDraftYes(prev => ({
                                                                                ...prev,
                                                                                [m.index]: v,
                                                                            }))
                                                                        }
                                                                        showMax={false}
                                                                        disabled={false}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="text-xs text-muted-foreground">
                                                                            In Vault NO: {formatUnitsViem(m.stakedB, UNDERYLING_DECIMALS)} tokens
                                                                        </div>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-7 text-xs"
                                                                            onClick={() =>
                                                                                setWithdrawDraftNo(prev => ({
                                                                                    ...prev,
                                                                                    [m.index]: formatUnitsViem(m.stakedB, UNDERYLING_DECIMALS),
                                                                                }))
                                                                            }
                                                                        >
                                                                            Max
                                                                        </Button>
                                                                    </div>
                                                                    <div className="text-xs mb-1">
                                                                        Selected: {withdrawDraftNo[m.index] || '0'} {noSymbol}
                                                                    </div>
                                                                    <AmountSlider
                                                                        className="py-1"
                                                                        amount={withdrawDraftNo[m.index] || '0'}
                                                                        max={m.stakedB}
                                                                        onAmountChange={v =>
                                                                            setWithdrawDraftNo(prev => ({
                                                                                ...prev,
                                                                                [m.index]: v,
                                                                            }))
                                                                        }
                                                                        showMax={false}
                                                                        disabled={false}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
