import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatAddress, getEventData, getSelectedTitleElement, rootPath } from '../inpage_utils';
import { PolymarketEvent, TARGET_CHAIN_ID, Market, parseMarket, Outcome } from '../types/types';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Progress } from './ui/progress';
import {
    useReadIConditionalTokens,
    useReadIConditionalTokensBalanceOfBatch,
    useReadRobinStakingVaultFinalized,
    useReadRobinStakingVaultGetCurrentApy,
    useReadRobinStakingVaultGetCurrentUserYield,
    useReadRobinStakingVaultGetUserBalances,
    useReadRobinStakingVaultYieldUnlocked,
    useReadRobinVaultManagerVaultForConditionId,
    useReadRobinVaultManagerVaultOf,
    useWriteRobinVaultManagerCreateVault,
} from '@/types/contracts';
import { USED_CONTRACTS } from '@/constants';
import useContractInteraction from '@/hooks/use-contract-interaction';
import { ArrowDownToLine, ArrowUpFromLine, Coins, Sprout, Loader } from 'lucide-react';
import { formatUnits, zeroAddress } from 'viem';
import useInvalidateQueries from '@/hooks/use-invalidate-queries';
import { Separator } from './ui/separator';
import OutcomeToken from './outcome-token';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import { QueryKey } from '@tanstack/react-query';
import { useProxyAccount } from '@/hooks/use-proxy-account';

export function StakingCard() {
    const [market, setMarket] = useState<Market | null>(null);
    const [marketLoading, setMarketLoading] = useState(false);
    const { address, chainId, isConnected } = useAccount();
    const eventData = useRef<PolymarketEvent | null>(null);
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
        data: vaultFinalized,
        isLoading: vaultFinalizedLoading,
        error: vaultFinalizedError,
        queryKey: vaultFinalizedQueryKey,
    } = useReadRobinStakingVaultFinalized({
        address: vaultAddress as `0x${string}`,
        args: [],
        query: { enabled: !!vaultAddress && vaultAddress !== zeroAddress },
    });

    const {
        data: vaultYieldUnlocked,
        isLoading: vaultYieldUnlockedLoading,
        error: vaultYieldUnlockedError,
        queryKey: vaultYieldUnlockedQueryKey,
    } = useReadRobinStakingVaultYieldUnlocked({
        address: vaultAddress as `0x${string}`,
        args: [],
        query: { enabled: !!vaultAddress && vaultAddress !== zeroAddress },
    });

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
                setMarket(parseMarket(eventData.current.markets[0]));
                return;
            }
            if (!pageMarketTitle) return;
            const market = eventData.current.markets.find(m => m.groupItemTitle.trim().toLowerCase() === pageMarketTitle.trim().toLowerCase());
            if (!market) return;
            setMarket(parseMarket(market));
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
                                    {!market.closed && <StakeWithdrawTabs />}
                                    {market.closed && !isVaultFinalized && (
                                        <EndedVaultActions
                                            vaultAddress={vaultAddress}
                                            reloadQueryKeys={[vaultFinalizedQueryKey, vaultYieldUnlockedQueryKey]}
                                        />
                                    )}
                                    {market.closed && isVaultFinalized && !isVaultYieldUnlocked && (
                                        <PartialUnlockActions vaultAddress={vaultAddress} reloadQueryKeys={[vaultYieldUnlockedQueryKey]} />
                                    )}
                                    {market.closed && isVaultFinalized && isVaultYieldUnlocked && <VaultUnlockedActions />}
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

function HoldingsSummaryRow({ market, vaultAddress }: { market: Market; vaultAddress: string }) {
    const { address } = useProxyAccount();

    const {
        data: vaultCurrentApy,
        isLoading: vaultCurrentApyLoading,
        queryKey: vaultCurrentApyQueryKey,
    } = useReadRobinStakingVaultGetCurrentApy({
        address: vaultAddress as `0x${string}`,
        args: [],
    });

    const {
        data: vaultUserBalances,
        isLoading: vaultUserBalancesLoading,
        queryKey: vaultUserBalancesQueryKey,
    } = useReadRobinStakingVaultGetUserBalances({
        address: vaultAddress as `0x${string}`,
        args: [address as `0x${string}`],
        query: { enabled: !!address },
    });

    const {
        data: tokenUserBalances,
        isLoading: tokenUserBalancesLoading,
        queryKey: tokenUserBalancesQueryKey,
    } = useReadIConditionalTokensBalanceOfBatch({
        address: USED_CONTRACTS.CONDITIONAL_TOKENS,
        args: [
            [address as `0x${string}`, address as `0x${string}`],
            [market.clobTokenIds[0], market.clobTokenIds[1]],
        ],
        query: { enabled: !!address },
    });

    const {
        data: currentYield,
        isLoading: currentYieldLoading,
        queryKey: currentYieldQueryKey,
    } = useReadRobinStakingVaultGetCurrentUserYield({
        address: vaultAddress as `0x${string}`,
        args: [address as `0x${string}`],
        query: { enabled: !!address },
    });

    const loading = vaultUserBalancesLoading || tokenUserBalancesLoading || vaultCurrentApyLoading || currentYieldLoading;

    const vaultUserYes = 1n * 10n ** 18n; //vaultUserBalances?.[0] ?? 0n;
    const tokenUserYes = tokenUserBalances?.[0] ?? 0n;
    const userYes = `${formatUnits(vaultUserYes, 18)} / ${formatUnits(tokenUserYes + vaultUserYes, 18)}`;
    const userYesProgress = vaultUserYes === 0n && tokenUserYes === 0n ? 50 : (Number(vaultUserYes) / Number(tokenUserYes)) * 100;

    const vaultUserNo = 1n * 10n ** 18n; //vaultUserBalances?.[1] ?? 0n;
    const tokenUserNo = tokenUserBalances?.[1] ?? 0n;
    const userNo = `${formatUnits(vaultUserNo, 18)} / ${formatUnits(tokenUserNo + vaultUserNo, 18)}`;
    const userNoProgress = vaultUserNo === 0n && tokenUserNo === 0n ? 50 : (Number(vaultUserNo) / Number(tokenUserNo)) * 100;

    const DolDecimals = 6;
    const DolPrecision = 10 ** DolDecimals;
    const DolPrecisionBigInt = BigInt(DolPrecision);
    const yesPrice = BigInt(Math.round(Number(market.outcomePrices[0]) * DolPrecision)) || 0n;
    const noPrice = BigInt(Math.round(Number(market.outcomePrices[1]) * DolPrecision)) || 0n;
    const halfDol = 5n * 10n ** 5n;
    const currentYesApyBps = (((halfDol * DolPrecisionBigInt) / yesPrice) * (vaultCurrentApy ?? 0n)) / DolPrecisionBigInt;
    const currentNoApyBps = (((halfDol * DolPrecisionBigInt) / noPrice) * (vaultCurrentApy ?? 0n)) / DolPrecisionBigInt;

    const userYesWorth = vaultUserYes * yesPrice;
    const userNoWorth = vaultUserNo * noPrice;
    const userYesApyBps = currentYesApyBps * userYesWorth;
    const userNoApyBps = currentNoApyBps * userNoWorth;
    const userResultingApyBps = (userYesApyBps + userNoApyBps) / ((userYesWorth || 1n) + (userNoWorth || 1n));

    const earningsPerDay = ((vaultUserYes * yesPrice + vaultUserNo * noPrice) * userResultingApyBps) / 10n ** 18n / 10_000n / 365n;
    const earningsPerDayString = earningsPerDay > 10n ** BigInt(DolDecimals - 2) ? formatUnits(earningsPerDay, DolDecimals) : '<0.01';

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="p-1 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{market.outcomes[0]}</span>
                    <span className="text-xs text-primary">~{(Number(currentYesApyBps) / 100).toFixed(1)}%</span>
                </div>
                <Separator />

                <div className="h-8 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">{userYes}</span>
                    <Progress value={userYesProgress} />
                </div>
            </div>

            <div className="border-l border-muted p-1 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{market.outcomes[1]}</span>
                    <span className="text-xs text-primary">~{(Number(currentNoApyBps) / 100).toFixed(1)}%</span>
                </div>
                <Separator />
                <div className="h-8 flex flex-col items-center justify-center">
                    <span className="text-xs text-muted-foreground">{userNo}</span>
                    <Progress value={userNoProgress} />
                </div>
            </div>

            <div className="border-l border-muted p-1 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Earning</span>
                    <span className="text-xs text-primary">~{(Number(userResultingApyBps) / 100).toFixed(1)}%</span>
                </div>
                <Separator />
                <div className="h-8 flex flex-col items-center justify-center">
                    <span className="text-base text-primary">{formatUnits(currentYield ?? 0n, DolPrecision)}$</span>
                    <span className="text-xs text-muted-foreground">{earningsPerDayString}$ / day</span>
                </div>
            </div>
        </div>
    );
}

function StakeWithdrawTabs() {
    const [tab, setTab] = useState<'stake' | 'withdraw'>('stake');
    const [sliderValue, setSliderValue] = useState<number[]>([0]);

    const [depositAmount, setDepositAmount] = useState<string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [depositSide, setDepositSide] = useState<Outcome>(Outcome.Yes);

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
                                id="deposit-amount"
                                type="number"
                                inputMode="decimal"
                                placeholder="0"
                                value={depositAmount}
                                onChange={e => setDepositAmount(e.target.value)}
                                className="border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 h-auto px-0 py-0 text-4xl sm:text-4xl md:text-4xl appearance-none font-semibold tracking-tight"
                            />
                            <Select value={depositSide} onValueChange={setDepositSide as (value: string) => void}>
                                <SelectTrigger className="px-4 py-2 rounded-full border text-sm font-medium flex-1">
                                    <OutcomeToken outcome={depositSide} />
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
                        <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
                        <Button variant="default" className="w-full mt-2">
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
                                value={withdrawAmount}
                                onChange={e => setWithdrawAmount(e.target.value)}
                                className="border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 h-auto px-0 py-0 text-4xl sm:text-4xl md:text-4xl appearance-none font-semibold tracking-tight"
                            />
                            <Select value={depositSide} onValueChange={setDepositSide as (value: string) => void}>
                                <SelectTrigger className="px-4 py-2 rounded-full border text-sm font-medium flex-1">
                                    <OutcomeToken outcome={depositSide} />
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
                        <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
                        <Button variant="secondary" className="w-full mt-2">
                            <ArrowDownToLine /> Withdraw
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EndedVaultActions({ vaultAddress, reloadQueryKeys }: { vaultAddress: string; reloadQueryKeys: QueryKey[] }) {
    return (
        <div className="space-y-3">
            <div className="p-3">
                <div className="text-sm font-medium mb-2">Market ended</div>
                <div className="text-sm text-muted-foreground">Finalize market to enable redemption and harvesting.</div>
                <Button className="w-full mt-2">Finalize market</Button>
            </div>
        </div>
    );
}

function PartialUnlockActions({ vaultAddress, reloadQueryKeys }: { vaultAddress: string; reloadQueryKeys: QueryKey[] }) {
    return (
        <div className="space-y-3">
            <div className="text-sm mb-2">
                Fund unlocking in progress. You can redeem winning tokens now if enough liquidity is available. You can harvest yield once unlocking
                is complete.
            </div>
            <div className="h-8 flex flex-col items-center justify-center">
                <span className="text-muted-foreground">4,000 / 8,000 Unlocked</span>
                <Progress value={50} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="secondary" className="w-full">
                    Try unlock remaining
                </Button>
                <Separator />
                <Button variant="default" className="w-full">
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

function VaultUnlockedActions() {
    return (
        <div className="space-y-3">
            <Button variant="default" className="w-full">
                <Coins className="w-4 h-4 mr-1" />
                Redeem winning tokens
            </Button>
            <Button variant="default" className="w-full">
                <Sprout className="w-4 h-4 mr-1" />
                Harvest yield
            </Button>
        </div>
    );
}

function CreateVaultCallout({ market, reloadQueryKeys }: { market: Market; reloadQueryKeys: QueryKey[] }) {
    const { chainId, isConnected } = useAccount();
    const invalidateQueries = useInvalidateQueries();

    const {
        write: createVault,
        isLoading: createVaultLoading,
        promise: createVaultPromise,
    } = useContractInteraction(useWriteRobinVaultManagerCreateVault);

    const handleCreateVault = async () => {
        if (!market?.conditionId) throw new Error('No conditionId');
        if (chainId !== TARGET_CHAIN_ID) throw new Error('Wrong chain');
        if (!isConnected) throw new Error('Wallet not connected');

        await createVault({
            address: USED_CONTRACTS.VAULT_MANAGER,
            args: [market.conditionId as `0x${string}`],
        });
        await createVaultPromise.current;
        await invalidateQueries(reloadQueryKeys);
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
