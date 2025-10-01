import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatAddress, getEventData, getSelectedTitleElement, rootPath } from '../inpage_utils';
import { ParsedPolymarketMarket, parsePolymarketMarket, Outcome } from '@robin-pm-staking/common/types/market';
import { PolymarketEventWithMarkets } from '@robin-pm-staking/common/types/event';
import { TARGET_CHAIN_ID, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Progress } from './ui/progress';
import {
    useReadConditionalTokensIsApprovedForAll,
    useReadErc20BalanceOf,
    useReadRobinStakingVaultGetTvlUsd,
    useReadRobinVaultManagerVaultForConditionId,
    useWriteConditionalTokensSetApprovalForAll,
    useWriteRobinStakingVaultDeposit,
    useWriteRobinStakingVaultFinalizeMarket,
    useWriteRobinStakingVaultHarvestYield,
    useWriteRobinStakingVaultRedeemWinningForUsd,
    useWriteRobinStakingVaultUnlockYield,
    useWriteRobinStakingVaultWithdraw,
    useWriteRobinVaultManagerCreateVault,
} from '@robin-pm-staking/common/types/contracts';
import { USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { ArrowDownToLine, ArrowUpFromLine, Coins, Sprout, Loader } from 'lucide-react';
import { formatUnits, parseUnits, zeroAddress } from 'viem';
import useInvalidateQueries from '@robin-pm-staking/common/hooks/use-invalidate-queries';
import { Separator } from './ui/separator';
import OutcomeToken from '@robin-pm-staking/common/components/outcome-token';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { QueryKey } from '@tanstack/react-query';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import useProxyContractInteraction from '@robin-pm-staking/common/hooks/use-proxy-contract-interaction';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import AmountSlider from '@robin-pm-staking/common/components/amount-slider';
import { useVaultInfo } from '../../../common/src/hooks/use-vault-info';
import { useVaultUserInfo } from '../../../common/src/hooks/use-vault-user-info';

export function StakingCard() {
    const [market, setMarket] = useState<ParsedPolymarketMarket | null>(null);
    const [marketLoading, setMarketLoading] = useState(false);
    const { address, chainId, isConnected } = useAccount();
    const eventData = useRef<PolymarketEventWithMarkets | null>(null);
    const [pageMarketTitle, setPageMarketTitle] = useState('');

    const {
        data: vaultAddress,
        isLoading: vaultLoading,
        error: vaultError,
        queryKey: vaultQueryKey,
    } = useReadRobinVaultManagerVaultForConditionId({
        address: USED_CONTRACTS.VAULT_MANAGER,
        args: [market?.conditionId as `0x${string}`],
        query: {
            enabled: !!market?.conditionId,
        },
    });

    const {
        vaultFinalized,
        vaultFinalizedLoading,
        vaultFinalizedError,
        vaultFinalizedQueryKey,

        vaultYieldUnlocked,
        vaultYieldUnlockedLoading,
        vaultYieldUnlockedError,
        vaultYieldUnlockedQueryKey,
    } = useVaultInfo(vaultAddress as `0x${string}`);

    useEffect(() => {
        let observer: MutationObserver | null = null;

        const init = async () => {
            eventData.current = await getEventData();
            const title = getSelectedTitleElement(eventData.current?.closed || false);
            if (!title) {
                handleMarketChange();
                return;
            }
            setPageMarketTitle(title.innerText);

            observer = new MutationObserver(() => {
                setPageMarketTitle(title.innerText);
            });

            observer.observe(title, {
                characterData: true,
                characterDataOldValue: true,
                childList: true,
                subtree: true,
            });
        };
        init();

        return () => observer?.disconnect();
    }, []);

    const handleMarketChange = () => {
        if (!eventData.current) return;
        try {
            setMarketLoading(true);
            if (eventData.current.markets.length === 1) {
                setMarket(parsePolymarketMarket(eventData.current.markets[0]));
                return;
            }
            if (!pageMarketTitle) return;
            const market = eventData.current.markets.find(m => m.groupItemTitle.trim().toLowerCase() === pageMarketTitle.trim().toLowerCase());
            if (!market) return;
            setMarket(parsePolymarketMarket(market));
        } catch (error) {
            console.error(error);
        } finally {
            setMarketLoading(false);
        }
    };

    useEffect(() => {
        handleMarketChange();
    }, [pageMarketTitle]);

    const vaultExists = !!vaultAddress && vaultAddress !== zeroAddress && !vaultLoading && !vaultError;
    const isVaultFinalized = vaultFinalized && !vaultFinalizedLoading && !vaultFinalizedError;
    const isVaultYieldUnlocked = vaultYieldUnlocked && !vaultYieldUnlockedLoading && !vaultYieldUnlockedError;

    return (
        <Card className="pmx-gradient-border">
            <div className="pmx-gradient-inner">
                <CardHeader className="p-3">
                    <CardTitle>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-primary w-5 h-5">
                                <img src={`${rootPath()}logo.png`} alt="Robin" width={20} height={20} className="w-5 h-5" /> Robin
                            </div>
                            <span className="text-sm">{isConnected ? `Using ${formatAddress(address)}` : 'Wallet not connected'}</span>
                        </div>
                    </CardTitle>
                    <CardDescription>{market?.groupItemTitle}</CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                    {vaultLoading || marketLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : market ? (
                        <div className="space-y-4">
                            {vaultExists ? (
                                <>
                                    <HoldingsSummaryRow market={market} vaultAddress={vaultAddress} />
                                    <Separator />
                                    {!market.closed && <StakeWithdrawTabs vaultAddress={vaultAddress} market={market} />}
                                    {market.closed && !isVaultFinalized && (
                                        <EndedVaultActions
                                            vaultAddress={vaultAddress}
                                            reloadQueryKeys={[vaultFinalizedQueryKey, vaultYieldUnlockedQueryKey]}
                                        />
                                    )}
                                    {market.closed && isVaultFinalized && !isVaultYieldUnlocked && (
                                        <PartialUnlockActions
                                            vaultAddress={vaultAddress}
                                            reloadQueryKeys={[vaultYieldUnlockedQueryKey]}
                                            market={market}
                                        />
                                    )}
                                    {market.closed && isVaultFinalized && isVaultYieldUnlocked && (
                                        <VaultUnlockedActions vaultAddress={vaultAddress} market={market} />
                                    )}
                                </>
                            ) : (
                                <>
                                    {!market.closed ? (
                                        <CreateVaultCallout market={market} reloadQueryKeys={[vaultQueryKey]} />
                                    ) : (
                                        <NoVaultEndedNotice />
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">Something went wrong</div>
                    )}

                    {chainId && chainId !== TARGET_CHAIN_ID && (
                        <div className="text-destructive">Wrong chain (chainId {chainId}). Switch to Polygon to proceed.</div>
                    )}
                </CardContent>
            </div>
        </Card>
    );
}

function ValueState({ value, loading, error }: { value: string; loading: boolean; error: boolean }) {
    if (loading) return <Skeleton className="w-10 h-3 inline-block" />;
    if (error) return <span className="text-xs text-destructive">--</span>;
    return value;
}

function HoldingsSummaryRow({ market, vaultAddress }: { market: ParsedPolymarketMarket; vaultAddress: string }) {
    const { proxyAddress } = useProxyAccount();

    const {
        vaultCurrentApyLoading,
        vaultCurrentApyError,

        vaultUserBalancesLoading,
        vaultUserBalancesError,

        tokenUserBalancesLoading,
        tokenUserBalancesError,

        currentYield,
        currentYieldLoading,
        currentYieldError,

        calculateUserInfo,
    } = useVaultUserInfo(vaultAddress as `0x${string}`, proxyAddress as `0x${string}`, market);

    const { tokenUserYes, tokenUserNo, vaultUserYes, vaultUserNo, currentYesApyBps, currentNoApyBps, userResultingApyBps, earningsPerDay } =
        calculateUserInfo();

    const loading = vaultUserBalancesLoading || tokenUserBalancesLoading || vaultCurrentApyLoading || currentYieldLoading;

    const userYes = `${formatUnits(vaultUserYes, UNDERYLING_DECIMALS)} / ${formatUnits(tokenUserYes + vaultUserYes, UNDERYLING_DECIMALS)}`;
    const userYesProgress = vaultUserYes === 0n && tokenUserYes === 0n ? 50 : (Number(vaultUserYes) / Number(tokenUserYes + vaultUserYes)) * 100;
    const userNo = `${formatUnits(vaultUserNo, UNDERYLING_DECIMALS)} / ${formatUnits(tokenUserNo + vaultUserNo, UNDERYLING_DECIMALS)}`;
    const userNoProgress = vaultUserNo === 0n && tokenUserNo === 0n ? 50 : (Number(vaultUserNo) / Number(tokenUserNo + vaultUserNo)) * 100;
    const earningsPerDayString =
        earningsPerDay > 10n ** BigInt(UNDERYLING_DECIMALS - 2) || earningsPerDay === 0n ? formatUnits(earningsPerDay, UNDERYLING_DECIMALS) : '<0.01';

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="p-1 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{market.outcomes[0]}</span>
                    <span className="text-xs text-primary">
                        ~<ValueState value={(Number(currentYesApyBps) / 100).toFixed(1)} loading={loading} error={!!vaultCurrentApyError} />%
                    </span>
                </div>
                <Separator />

                <div className="h-8 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                        <ValueState value={userYes} loading={loading} error={!!vaultUserBalancesError || !!tokenUserBalancesError} />
                    </span>
                    <Progress value={userYesProgress} />
                </div>
            </div>

            <div className="border-l border-muted p-1 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{market.outcomes[1]}</span>
                    <span className="text-xs text-primary">
                        ~<ValueState value={(Number(currentNoApyBps) / 100).toFixed(1)} loading={loading} error={!!vaultCurrentApyError} />%
                    </span>
                </div>
                <Separator />
                <div className="h-8 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                        <ValueState value={userNo} loading={loading} error={!!vaultUserBalancesError || !!tokenUserBalancesError} />
                    </span>
                    <Progress value={userNoProgress} />
                </div>
            </div>

            <div className="border-l border-muted p-1 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Earn</span>
                    <span className="text-xs text-primary">
                        ~<ValueState value={(Number(userResultingApyBps) / 100).toFixed(1)} loading={loading} error={!!vaultCurrentApyError} />%
                    </span>
                </div>
                <Separator />
                <div className="h-8 flex flex-col items-center justify-center">
                    <span className="text-base text-primary">
                        <ValueState value={formatUnits(currentYield ?? 0n, UNDERYLING_DECIMALS)} loading={loading} error={!!currentYieldError} />$
                    </span>
                    <span className="text-xs text-muted-foreground">
                        <ValueState value={earningsPerDayString} loading={loading} error={!!currentYieldError} />$ / day
                    </span>
                </div>
            </div>
        </div>
    );
}

function StakeWithdrawTabs({ vaultAddress, market }: { vaultAddress: string; market: ParsedPolymarketMarket }) {
    const [tab, setTab] = useState<'stake' | 'withdraw'>('stake');

    const [stakeAmount, setStakeAmount] = useState<string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [side, setSide] = useState<Outcome>(Outcome.Yes);

    const { proxyAddress } = useProxyAccount();
    const invalidateQueries = useInvalidateQueries();

    const { vaultUserBalancesQueryKey, tokenUserBalancesQueryKey, vaultCurrentApyQueryKey, getUserBalances } = useVaultUserInfo(
        vaultAddress as `0x${string}`,
        proxyAddress as `0x${string}`,
        market
    );

    const { data: approvedForAll, queryKey: approvedForAllQueryKey } = useReadConditionalTokensIsApprovedForAll({
        address: USED_CONTRACTS.CONDITIONAL_TOKENS,
        args: [proxyAddress as `0x${string}`, vaultAddress as `0x${string}`],
    });

    const {
        batch: stake,
        isLoading: stakeLoading,
        promise: stakePromise,
    } = useProxyContractInteraction([useWriteConditionalTokensSetApprovalForAll, useWriteRobinStakingVaultDeposit]);

    const {
        write: withdraw,
        isLoading: withdrawLoading,
        promise: withdrawPromise,
    } = useProxyContractInteraction([useWriteRobinStakingVaultWithdraw]);

    const handleStake = async () => {
        try {
            await stake([
                ...((approvedForAll
                    ? []
                    : [
                          {
                              address: USED_CONTRACTS.CONDITIONAL_TOKENS,
                              args: [vaultAddress as `0x${string}`, true],
                              hookIndex: 0,
                          },
                      ]) as any),
                {
                    address: vaultAddress as `0x${string}`,
                    args: [side === Outcome.Yes, parseUnits(stakeAmount, 6)],
                    hookIndex: 1,
                },
            ]);
            await stakePromise.current;
            await invalidateQueries([vaultUserBalancesQueryKey, tokenUserBalancesQueryKey, vaultCurrentApyQueryKey, approvedForAllQueryKey]);
            setStakeAmount('');
        } catch (error) {
            toast.error('Failed to stake' + getErrorMessage(error));
            console.error(error);
        }
    };

    const handleWithdraw = async () => {
        try {
            await withdraw({
                address: vaultAddress as `0x${string}`,
                args: [side === Outcome.Yes ? parseUnits(withdrawAmount, 6) : 0n, side === Outcome.No ? parseUnits(withdrawAmount, 6) : 0n],
                hookIndex: 0,
            });
            await withdrawPromise.current;
            await invalidateQueries([vaultUserBalancesQueryKey, tokenUserBalancesQueryKey, vaultCurrentApyQueryKey]);
            setWithdrawAmount('');
        } catch (error) {
            toast.error('Failed to withdraw' + getErrorMessage(error));
            console.error(error);
        }
    };

    const { tokenUserYes, tokenUserNo, vaultUserYes, vaultUserNo } = getUserBalances();

    const stakeAmountParsed = parseUnits(stakeAmount, 6);
    const withdrawAmountParsed = parseUnits(withdrawAmount, 6);
    const stakeAmountInvalid =
        stakeAmountParsed <= 0 ||
        (side === Outcome.Yes && stakeAmountParsed > tokenUserYes) ||
        (side === Outcome.No && stakeAmountParsed > tokenUserNo);
    const withdrawAmountInvalid =
        withdrawAmountParsed <= 0 ||
        (side === Outcome.Yes && withdrawAmountParsed > vaultUserYes) ||
        (side === Outcome.No && withdrawAmountParsed > vaultUserNo);

    return (
        <div className="space-y-3">
            <Tabs value={tab} onValueChange={v => setTab(v as 'stake' | 'withdraw')}>
                <TabsList className="w-full">
                    <TabsTrigger value="stake" className="data-[state=active]:bg-card">
                        Stake
                    </TabsTrigger>
                    <TabsTrigger value="withdraw" className="data-[state=active]:bg-card">
                        Withdraw
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="stake">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Input
                                id="stake-amount"
                                type="number"
                                inputMode="decimal"
                                placeholder="0"
                                min={0}
                                value={stakeAmount}
                                onChange={e => setStakeAmount(e.target.value)}
                                className="border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 h-auto px-0 py-0 text-4xl sm:text-4xl md:text-4xl appearance-none font-semibold tracking-tight"
                            />
                            <Select value={side} onValueChange={setSide as (value: string) => void}>
                                <SelectTrigger className="px-4 py-2 rounded-full border text-sm font-medium flex-1">
                                    <OutcomeToken outcome={side} />
                                </SelectTrigger>
                                <SelectContent className="bg-background">
                                    <SelectItem value={Outcome.Yes}>
                                        <OutcomeToken outcome={Outcome.Yes} />
                                    </SelectItem>
                                    <SelectItem value={Outcome.No}>
                                        <OutcomeToken outcome={Outcome.No} />
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <AmountSlider amount={stakeAmount} max={side === Outcome.Yes ? tokenUserYes : tokenUserNo} onAmountChange={setStakeAmount} />
                        {stakeAmountInvalid && stakeAmount != '' && <span className="text-xs text-destructive mt-2">Invalid amount</span>}
                        <Button
                            variant="default"
                            className="w-full mt-2"
                            onClick={handleStake}
                            disabled={stakeLoading || !stakeAmount || stakeAmountInvalid}
                        >
                            {stakeLoading && <Loader className="w-4 h-4 animate-spin" />}
                            <ArrowUpFromLine /> Stake
                        </Button>
                    </div>
                </TabsContent>
                <TabsContent value="withdraw">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Input
                                id="deposit-amount"
                                type="number"
                                inputMode="decimal"
                                placeholder="0"
                                min={0}
                                value={withdrawAmount}
                                onChange={e => setWithdrawAmount(e.target.value)}
                                className="border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 h-auto px-0 py-0 text-4xl sm:text-4xl md:text-4xl appearance-none font-semibold tracking-tight"
                            />
                            <Select value={side} onValueChange={setSide as (value: string) => void}>
                                <SelectTrigger className="px-4 py-2 rounded-full border text-sm font-medium flex-1">
                                    <OutcomeToken outcome={side} />
                                </SelectTrigger>
                                <SelectContent className="bg-background">
                                    <SelectItem value={Outcome.Yes}>
                                        <OutcomeToken outcome={Outcome.Yes} />
                                    </SelectItem>
                                    <SelectItem value={Outcome.No}>
                                        <OutcomeToken outcome={Outcome.No} />
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <AmountSlider
                            amount={withdrawAmount}
                            max={side === Outcome.Yes ? vaultUserYes : vaultUserNo}
                            onAmountChange={setWithdrawAmount}
                        />
                        {withdrawAmountInvalid && withdrawAmount != '' && <span className="text-xs text-destructive mt-2">Invalid amount</span>}
                        <Button
                            variant="secondary"
                            className="w-full mt-2"
                            onClick={handleWithdraw}
                            disabled={withdrawLoading || !withdrawAmount || withdrawAmountInvalid}
                        >
                            {withdrawLoading && <Loader className="w-4 h-4 animate-spin" />}
                            <ArrowDownToLine /> Withdraw
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EndedVaultActions({ vaultAddress, reloadQueryKeys }: { vaultAddress: string; reloadQueryKeys: QueryKey[] }) {
    const { isConnected, chainId } = useProxyAccount();
    const invalidateQueries = useInvalidateQueries();

    const {
        write: finalizeVault,
        isLoading: finalizeVaultLoading,
        promise: finalizeVaultPromise,
    } = useProxyContractInteraction([useWriteRobinStakingVaultFinalizeMarket]);

    const handleFinalizeVault = async () => {
        try {
            if (!isConnected) throw new Error('Wallet not connected');
            if (chainId !== TARGET_CHAIN_ID) throw new Error('Wrong chain');

            await finalizeVault({
                address: vaultAddress as `0x${string}`,
                args: [],
                hookIndex: 0,
            });
            await finalizeVaultPromise.current;
            await invalidateQueries(reloadQueryKeys);
        } catch (error) {
            toast.error('Failed to finalize vault' + getErrorMessage(error));
            console.error(error);
        }
    };

    return (
        <div className="space-y-3">
            <div className="p-3">
                <div className="text-sm font-medium mb-2">Market ended</div>
                <div className="text-sm text-muted-foreground">Finalize market to enable redemption and harvesting.</div>
                <Button className="w-full mt-2" onClick={handleFinalizeVault} disabled={finalizeVaultLoading}>
                    {finalizeVaultLoading && <Loader className="w-4 h-4 animate-spin" />}
                    Finalize market
                </Button>
            </div>
        </div>
    );
}

function PartialUnlockActions({
    vaultAddress,
    reloadQueryKeys,
    market,
}: {
    vaultAddress: string;
    reloadQueryKeys: QueryKey[];
    market: ParsedPolymarketMarket;
}) {
    const { proxyAddress, isConnected, chainId } = useProxyAccount();
    const invalidateQueries = useInvalidateQueries();

    const { tokenUserBalancesQueryKey, vaultUserBalancesQueryKey } = useVaultUserInfo(
        vaultAddress as `0x${string}`,
        proxyAddress as `0x${string}`,
        market
    );

    const {
        data: tvlUsd,
        isLoading: tvlUsdLoading,
        error: tvlUsdError,
        queryKey: tvlUsdQueryKey,
    } = useReadRobinStakingVaultGetTvlUsd({
        address: vaultAddress as `0x${string}`,
    });

    const {
        data: vaultUsdBalance,
        isLoading: vaultUsdBalanceLoading,
        error: vaultUsdBalanceError,
        queryKey: vaultUsdBalanceQueryKey,
    } = useReadErc20BalanceOf({
        address: USED_CONTRACTS.USDCE,
        args: [vaultAddress as `0x${string}`],
    });

    const {
        write: unlockYield,
        isLoading: unlockYieldLoading,
        promise: unlockYieldPromise,
    } = useProxyContractInteraction([useWriteRobinStakingVaultUnlockYield]);

    const {
        write: redeemWinningTokens,
        isLoading: redeemWinningTokensLoading,
        promise: redeemWinningTokensPromise,
    } = useProxyContractInteraction([useWriteRobinStakingVaultRedeemWinningForUsd]);

    const handleUnlockYield = async () => {
        try {
            await unlockYield({
                address: vaultAddress as `0x${string}`,
                args: [],
                hookIndex: 0,
            });
            await unlockYieldPromise.current;
            await invalidateQueries([...reloadQueryKeys, tvlUsdQueryKey, vaultUsdBalanceQueryKey]);
        } catch (error) {
            toast.error('Failed to unlock yield' + getErrorMessage(error));
            console.error(error);
        }
    };

    const handleRedeemWinningTokens = async () => {
        try {
            await redeemWinningTokens({
                address: vaultAddress as `0x${string}`,
                args: [],
                hookIndex: 0,
            });
            await redeemWinningTokensPromise.current;
            await invalidateQueries([tvlUsdQueryKey, vaultUsdBalanceQueryKey, tokenUserBalancesQueryKey, vaultUserBalancesQueryKey]);
        } catch (error) {
            toast.error('Failed to redeem winning tokens' + getErrorMessage(error));
            console.error(error);
        }
    };

    return (
        <div className="space-y-3">
            <div className="text-sm mb-2">
                Fund unlocking in progress. You can redeem winning tokens now if enough liquidity is available. You can harvest yield once unlocking
                is complete.
            </div>
            <div className="h-8 flex flex-col items-center justify-center">
                <span className="text-muted-foreground">
                    <ValueState value={formatUnits(vaultUsdBalance ?? 0n, 6)} loading={vaultUsdBalanceLoading} error={!!vaultUsdBalanceError} /> /{' '}
                    <ValueState value={formatUnits(tvlUsd?.[3] ?? 0n, 6)} loading={tvlUsdLoading} error={!!tvlUsdError} /> Unlocked
                </span>
                <Progress value={50} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="secondary" className="w-full" onClick={handleUnlockYield} disabled={unlockYieldLoading}>
                    {unlockYieldLoading && <Loader className="w-4 h-4 animate-spin" />}
                    Try unlock remaining
                </Button>
                <Separator />
                <Button variant="default" className="w-full" onClick={handleRedeemWinningTokens} disabled={redeemWinningTokensLoading}>
                    {redeemWinningTokensLoading && <Loader className="w-4 h-4 animate-spin" />}
                    <Coins className="w-4 h-4 mr-1" />
                    Redeem winning tokens
                </Button>
                <Button disabled variant="default" className="w-full">
                    <Sprout className="w-4 h-4 mr-1" />
                    Harvest yield
                </Button>
            </div>
        </div>
    );
}

function VaultUnlockedActions({ vaultAddress, market }: { vaultAddress: string; market: ParsedPolymarketMarket }) {
    const invalidateQueries = useInvalidateQueries();
    const { proxyAddress: userAddress } = useProxyAccount();

    const { tokenUserBalancesQueryKey, vaultUserBalancesQueryKey, currentYieldQueryKey } = useVaultUserInfo(
        vaultAddress as `0x${string}`,
        userAddress as `0x${string}`,
        market
    );

    const {
        write: redeemWinningTokens,
        isLoading: redeemWinningTokensLoading,
        promise: redeemWinningTokensPromise,
    } = useProxyContractInteraction([useWriteRobinStakingVaultRedeemWinningForUsd]);

    const {
        write: harvestYield,
        isLoading: harvestYieldLoading,
        promise: harvestYieldPromise,
    } = useProxyContractInteraction([useWriteRobinStakingVaultHarvestYield]);

    const handleRedeemWinningTokens = async () => {
        try {
            await redeemWinningTokens({
                address: vaultAddress as `0x${string}`,
                args: [],
                hookIndex: 0,
            });
            await redeemWinningTokensPromise.current;
            await invalidateQueries([tokenUserBalancesQueryKey, vaultUserBalancesQueryKey]);
        } catch (error) {
            toast.error('Failed to redeem winning tokens' + getErrorMessage(error));
            console.error(error);
        }
    };

    const handleHarvestYield = async () => {
        try {
            await harvestYield({
                address: vaultAddress as `0x${string}`,
                args: [],
                hookIndex: 0,
            });
            await harvestYieldPromise.current;
            await invalidateQueries([tokenUserBalancesQueryKey, vaultUserBalancesQueryKey, currentYieldQueryKey]);
        } catch (error) {
            toast.error('Failed to harvest yield' + getErrorMessage(error));
            console.error(error);
        }
    };

    return (
        <div className="space-y-3">
            <Button variant="default" className="w-full" onClick={handleRedeemWinningTokens} disabled={redeemWinningTokensLoading}>
                {redeemWinningTokensLoading && <Loader className="w-4 h-4 animate-spin" />}
                <Coins className="w-4 h-4 mr-1" />
                Redeem winning tokens
            </Button>
            <Button variant="default" className="w-full" onClick={handleHarvestYield} disabled={harvestYieldLoading}>
                {harvestYieldLoading && <Loader className="w-4 h-4 animate-spin" />}
                <Sprout className="w-4 h-4 mr-1" />
                Harvest yield
            </Button>
        </div>
    );
}

function CreateVaultCallout({ market, reloadQueryKeys }: { market: ParsedPolymarketMarket; reloadQueryKeys: QueryKey[] }) {
    const { chainId, isConnected } = useProxyAccount();
    const invalidateQueries = useInvalidateQueries();

    const {
        write: createVault,
        isLoading: createVaultLoading,
        promise: createVaultPromise,
    } = useProxyContractInteraction([useWriteRobinVaultManagerCreateVault]);

    const handleCreateVault = async () => {
        try {
            if (!market?.conditionId) throw new Error('No conditionId');
            if (chainId !== TARGET_CHAIN_ID) throw new Error('Wrong chain');
            if (!isConnected) throw new Error('Wallet not connected');

            await createVault({
                address: USED_CONTRACTS.VAULT_MANAGER,
                args: [market.conditionId as `0x${string}`],
                hookIndex: 0,
            });
            await createVaultPromise.current;
            await invalidateQueries(reloadQueryKeys);
        } catch (error) {
            toast.error('Failed to create vault' + getErrorMessage(error));
            console.error(error);
        }
    };

    return (
        <div className="rounded-xl p-3">
            <div className="text-sm">Be the first to stake tokens</div>
            <Button onClick={handleCreateVault} disabled={createVaultLoading} className="w-full mt-2">
                {createVaultLoading && <Loader className="w-4 h-4 animate-spin" />}
                {'Create'}
            </Button>
        </div>
    );
}

function NoVaultEndedNotice() {
    return <div className="p-3 text-sm">No tokens were staked on this market.</div>;
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error && error.message.length > 0 && error.message.length < 50) return ': ' + error.message;
    return '';
}
