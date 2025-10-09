import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatAddress, getEventData, getSelectedTitleElement, getMobileSelectedTitleElement, rootPath } from '../inpage_utils';
import { ParsedPolymarketMarket, parsePolymarketMarket, Outcome } from '@robin-pm-staking/common/types/market';
import { PolymarketEventWithMarkets } from '@robin-pm-staking/common/types/event';
import { TARGET_CHAIN_ID, UNDERYLING_DECIMALS, UNDERYLING_PRECISION_BIG_INT } from '@robin-pm-staking/common/constants';
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
import { ArrowDownToLine, ArrowUpFromLine, Coins, Sprout, Loader, ExternalLink, ChevronDown } from 'lucide-react';
import { parseUnits, zeroAddress } from 'viem';
import useInvalidateQueries from '@robin-pm-staking/common/hooks/use-invalidate-queries';
import { Separator } from './ui/separator';
import OutcomeToken from '@robin-pm-staking/common/components/outcome-token';
import { QueryKey } from '@tanstack/react-query';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import useProxyContractInteraction from '@robin-pm-staking/common/hooks/use-proxy-contract-interaction';
import { toast } from 'sonner';
import AmountSlider from '@robin-pm-staking/common/components/amount-slider';
import { useVaultInfo } from '../../../common/src/hooks/use-vault-info';
import { useVaultUserInfo } from '../../../common/src/hooks/use-vault-user-info';
import { formatUnits, getErrorMessage } from '@robin-pm-staking/common/lib/utils';
import ValueState from './value-state';
import { DateTime } from 'luxon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

type StakingCardProps = {
    isMobile?: boolean;
    mobileDialog?: HTMLElement | null;
};

export function StakingCard({ isMobile = false, mobileDialog = null }: StakingCardProps) {
    const [market, setMarket] = useState<ParsedPolymarketMarket | null>(null);
    const [marketLoading, setMarketLoading] = useState(false);
    const { address, chainId, isConnected } = useAccount();
    const eventData = useRef<PolymarketEventWithMarkets | null>(null);
    const [pageMarketTitle, setPageMarketTitle] = useState('');

    const [side, setSide] = useState<Outcome>(Outcome.Yes);

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
            const title = isMobile
                ? getMobileSelectedTitleElement(mobileDialog as HTMLElement | null)
                : getSelectedTitleElement(eventData.current?.closed || false);
            if (!title) {
                console.log('Robin_', 'Title element not found');
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
    }, [isMobile, mobileDialog]);

    //check for changes in selected outcome buttons
    useEffect(() => {
        let attrObserver: MutationObserver | null = null;
        let mountObserver: MutationObserver | null = null;

        const updateSideFromOutcomeButtons = () => {
            const container = document.getElementById('outcome-buttons');
            if (!container) return;

            const yesButton = container.querySelector('button[value="0"]') as HTMLElement | null;
            const noButton = container.querySelector('button[value="1"]') as HTMLElement | null;

            const yesChecked = yesButton?.getAttribute('data-state') === 'checked';
            const noChecked = noButton?.getAttribute('data-state') === 'checked';

            if (yesChecked) setSide(Outcome.Yes);
            else if (noChecked) setSide(Outcome.No);
        };

        const attachAttributeObserver = () => {
            const container = document.getElementById('outcome-buttons');
            if (!container) return false;

            attrObserver = new MutationObserver(() => updateSideFromOutcomeButtons());
            try {
                attrObserver.observe(container, {
                    attributes: true,
                    attributeFilter: ['data-state'],
                    subtree: true,
                    childList: true,
                });
            } catch (_e) {
                // swallow
            }
            updateSideFromOutcomeButtons();
            return true;
        };

        if (!attachAttributeObserver()) {
            // If the container isn't in the DOM yet, watch for it to appear
            const target = document.body || document.documentElement;
            mountObserver = new MutationObserver(() => {
                if (attachAttributeObserver() && mountObserver) {
                    mountObserver.disconnect();
                    mountObserver = null;
                }
            });
            try {
                mountObserver.observe(target, { childList: true, subtree: true });
            } catch (_e) {
                // swallow
            }
        }

        return () => {
            attrObserver?.disconnect();
            mountObserver?.disconnect();
        };
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
            const prepGroupTitle = (title?: string) => title?.trim().toLowerCase().replace('.', '') || ''; //"vs." for example becomes "vs"
            let market = eventData.current.markets.find(m => prepGroupTitle(m.groupItemTitle) === prepGroupTitle(pageMarketTitle));
            if (!market) {
                console.log('Robin_', 'Market not found', pageMarketTitle);
                return;
            }
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
        <Card className={`${!isMobile ? 'pmx-gradient-border' : 'border-none pb-4'}`}>
            <div className={`${!isMobile ? 'pmx-gradient-inner' : ''}`}>
                <CardHeader className="p-3">
                    <CardTitle>
                        <div className="flex justify-between items-center">
                            <div className="">
                                <a
                                    className="flex items-center gap-2 text-primary w-5 h-5"
                                    href={
                                        !!market && !!vaultExists
                                            ? `https://staking.robin.markets/market/${market.slug}`
                                            : 'https://staking.robin.markets'
                                    }
                                    target="_blank"
                                >
                                    <img src={`${rootPath()}logo.png`} alt="Robin" width={20} height={20} className="w-5 h-5" /> Robin
                                    <div>{vaultExists && market?.slug && <ExternalLink className="w-3 h-3 text-foreground" />}</div>
                                </a>
                            </div>

                            <span className="text-sm">{isConnected ? `${formatAddress(address)}` : 'Wallet not connected'}</span>
                        </div>
                    </CardTitle>
                    <CardDescription>{market?.groupItemTitle}</CardDescription>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                    {vaultLoading || marketLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : market ? (
                        <div className="space-y-4">
                            {vaultExists ? (
                                <>
                                    <HoldingsSummaryRow market={market} vaultAddress={vaultAddress} side={side} />

                                    <Separator />
                                    {!market.closed && (
                                        <StakeWithdrawTabs vaultAddress={vaultAddress} market={market} side={side} setSide={setSide} />
                                    )}
                                    {market.closed && !isVaultFinalized && (
                                        <EndedMarketActions
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

function HoldingsSummaryRow({ market, vaultAddress, side }: { market: ParsedPolymarketMarket; vaultAddress: string; side: Outcome }) {
    const { proxyAddress } = useProxyAccount();
    const [open, setOpen] = useState(false);
    const [justifyEnd, setJustifyEnd] = useState(false);

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
        calculateUserInfo(Number(market.outcomePrices[0]), Number(market.outcomePrices[1]));

    const loading = vaultUserBalancesLoading || tokenUserBalancesLoading || vaultCurrentApyLoading || currentYieldLoading;

    const userYes = `${formatUnits(vaultUserYes, UNDERYLING_DECIMALS)} / ${formatUnits(tokenUserYes + vaultUserYes, UNDERYLING_DECIMALS)}`;
    const userYesProgress = vaultUserYes === 0n && tokenUserYes === 0n ? 0 : (Number(vaultUserYes) / Number(tokenUserYes + vaultUserYes)) * 100;
    const userNo = `${formatUnits(vaultUserNo, UNDERYLING_DECIMALS)} / ${formatUnits(tokenUserNo + vaultUserNo, UNDERYLING_DECIMALS)}`;
    const userNoProgress = vaultUserNo === 0n && tokenUserNo === 0n ? 0 : (Number(vaultUserNo) / Number(tokenUserNo + vaultUserNo)) * 100;
    const earningsPerDayString = formatUnits(earningsPerDay, UNDERYLING_DECIMALS);

    useEffect(() => {
        if (open) setTimeout(() => setJustifyEnd(true), 300);
        else setJustifyEnd(false);
    }, [open]);

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="mt-2">
            <CollapsibleTrigger className={`cursor-pointer w-full flex items-center ${!justifyEnd ? 'justify-between' : 'justify-end'} text-sm mb-1`}>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${open ? 'opacity-0' : 'opacity-100'}`}>
                    <OutcomeToken outcome={side} symbolHolder={market} />
                </div>
                <div
                    className={`flex items-center gap-1 text-primary font-bold transition-all duration-300 ease-in-out overflow-hidden ${
                        open ? 'opacity-0' : 'opacity-100'
                    }`}
                >
                    <ValueState
                        value={(Number(side === Outcome.Yes ? currentYesApyBps : currentNoApyBps) / 100).toFixed(1)}
                        loading={loading}
                        error={!!vaultCurrentApyError}
                    />
                    % APY
                </div>
                <div className="flex items-center font-bold">
                    Details <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className={`overflow-hidden ${open ? 'animate-collapsible-down' : 'animate-collapsible-up'}`}>
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
                                ~
                                <ValueState value={(Number(userResultingApyBps) / 100).toFixed(1)} loading={loading} error={!!vaultCurrentApyError} />
                                %
                            </span>
                        </div>
                        <Separator />
                        <div className="h-8 flex flex-col items-center justify-center">
                            <span className="text-base text-primary">
                                <ValueState
                                    value={formatUnits(currentYield ?? 0n, UNDERYLING_DECIMALS)}
                                    loading={loading}
                                    error={!!currentYieldError}
                                />
                                $
                            </span>
                            <span className="text-xs text-muted-foreground">
                                <ValueState value={earningsPerDayString} loading={loading} error={!!currentYieldError} />$ / day
                            </span>
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

function StakeWithdrawTabs({
    vaultAddress,
    market,
    side,
    setSide,
}: {
    vaultAddress: string;
    market: ParsedPolymarketMarket;
    side: Outcome;
    setSide: (side: Outcome) => void;
}) {
    const [tab, setTab] = useState<'stake' | 'withdraw'>('stake');

    const [stakeAmount, setStakeAmount] = useState<string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');

    const { proxyAddress } = useProxyAccount();
    const invalidateQueries = useInvalidateQueries();

    const { vaultUserBalancesQueryKey, tokenUserBalancesQueryKey, vaultCurrentApyQueryKey, getUserBalances, calculateExpectedYield } =
        useVaultUserInfo(vaultAddress as `0x${string}`, proxyAddress as `0x${string}`, market);

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
                    args: [side === Outcome.Yes, parseUnits(stakeAmount, UNDERYLING_DECIMALS)],
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
                args: [
                    side === Outcome.Yes ? parseUnits(withdrawAmount, UNDERYLING_DECIMALS) : 0n,
                    side === Outcome.No ? parseUnits(withdrawAmount, UNDERYLING_DECIMALS) : 0n,
                ],
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

    const toggleSide = () => setSide(side === Outcome.Yes ? Outcome.No : Outcome.Yes);

    const { tokenUserYes, tokenUserNo, vaultUserYes, vaultUserNo } = getUserBalances();

    const expectedYield = calculateExpectedYield(stakeAmount, side, Number(market.outcomePrices[0]), Number(market.outcomePrices[1]));

    const stakeAmountParsed = parseUnits(stakeAmount, UNDERYLING_DECIMALS);
    const withdrawAmountParsed = parseUnits(withdrawAmount, UNDERYLING_DECIMALS);
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
                    <TabsTrigger value="stake" className="data-[state=active]:bg-card" disabled={stakeLoading || withdrawLoading}>
                        Stake
                    </TabsTrigger>
                    <TabsTrigger value="withdraw" className="data-[state=active]:bg-card" disabled={stakeLoading || withdrawLoading}>
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
                                disabled={stakeLoading}
                            />
                            <Button variant="outline" onClick={toggleSide} disabled={stakeLoading}>
                                <OutcomeToken outcome={side} symbolHolder={market} />
                                {/* <RefreshCcw className="scale-85" /> */}
                            </Button>
                        </div>
                        <AmountSlider
                            amount={stakeAmount}
                            max={side === Outcome.Yes ? tokenUserYes : tokenUserNo}
                            onAmountChange={setStakeAmount}
                            disabled={stakeLoading}
                        />
                        {stakeAmountParsed > 0 && (
                            <div className="flex justify-between text-xs mt-4">
                                <span>
                                    Expected Yield by {market.endDate ? DateTime.fromMillis(market.endDate).toLocaleString(DateTime.DATE_MED) : '—'}:
                                </span>
                                <span className="text-primary">${formatUnits(expectedYield, UNDERYLING_DECIMALS)}</span>
                            </div>
                        )}
                        {stakeAmountInvalid && stakeAmount != '' && <span className="text-xs text-destructive mt-2">Invalid amount</span>}
                        <Button
                            variant="default"
                            className="w-full mt-2"
                            onClick={handleStake}
                            disabled={stakeLoading || !stakeAmount || stakeAmountInvalid}
                        >
                            {stakeLoading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowUpFromLine className="w-4 h-4" />}
                            Stake
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
                                disabled={withdrawLoading}
                            />
                            <Button variant="outline" onClick={toggleSide} disabled={withdrawLoading}>
                                <OutcomeToken outcome={side} symbolHolder={market} />
                            </Button>
                        </div>
                        <AmountSlider
                            amount={withdrawAmount}
                            max={side === Outcome.Yes ? vaultUserYes : vaultUserNo}
                            onAmountChange={setWithdrawAmount}
                            disabled={withdrawLoading}
                        />
                        {withdrawAmountInvalid && withdrawAmount != '' && <span className="text-xs text-destructive mt-2">Invalid amount</span>}
                        <Button
                            variant="secondary"
                            className="w-full mt-2"
                            onClick={handleWithdraw}
                            disabled={withdrawLoading || !withdrawAmount || withdrawAmountInvalid}
                        >
                            {withdrawLoading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                            Withdraw
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EndedMarketActions({ vaultAddress, reloadQueryKeys }: { vaultAddress: string; reloadQueryKeys: QueryKey[] }) {
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

    const { tokenUserBalancesQueryKey, vaultUserBalancesQueryKey, vaultUserBalances, vaultUserBalancesLoading, vaultUserBalancesError } =
        useVaultUserInfo(vaultAddress as `0x${string}`, proxyAddress as `0x${string}`, market);

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

    const tvl = tvlUsd?.[3] ?? 0n;
    const vaultUsd = vaultUsdBalance ?? 0n;
    const progress = Number(formatUnits((vaultUsd * UNDERYLING_PRECISION_BIG_INT) / (tvl || 1n), UNDERYLING_DECIMALS * 1)) * 100;

    const winner = market.winningPosition;
    const userWinningTokens =
        winner === Outcome.Yes
            ? vaultUserBalances?.[0] ?? 0n
            : winner === Outcome.No
            ? vaultUserBalances?.[1] ?? 0n
            : winner === Outcome.Both
            ? (vaultUserBalances?.[0] ?? 0n) + (vaultUserBalances?.[1] ?? 0n)
            : 0n;

    return (
        <div className="space-y-3">
            <div className="text-sm mb-2">
                Fund unlocking in progress. You can redeem winning tokens now if enough liquidity is available. You can harvest yield once unlocking
                is complete.
            </div>
            <div className="h-8 flex flex-col items-center justify-center">
                <span className="text-muted-foreground">
                    <ValueState value={formatUnits(vaultUsd, UNDERYLING_DECIMALS)} loading={vaultUsdBalanceLoading} error={!!vaultUsdBalanceError} />{' '}
                    / <ValueState value={formatUnits(tvl, UNDERYLING_DECIMALS)} loading={tvlUsdLoading} error={!!tvlUsdError} /> Unlocked
                </span>
                <Progress value={progress} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="secondary" className="w-full" onClick={handleUnlockYield} disabled={unlockYieldLoading}>
                    {unlockYieldLoading && <Loader className="w-4 h-4 animate-spin" />}
                    Try unlock remaining
                </Button>
                <Separator />
                {winner && (
                    <div className="p-4 bg-muted/50 rounded-lg w-full">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">Winning Token</div>
                            {winner ? (
                                <OutcomeToken outcome={winner} symbolHolder={market} className="text-xs font-semibold" />
                            ) : (
                                <span className="text-xs font-semibold">-</span>
                            )}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">Redemption</div>
                            <div className="text-xs font-semibold text-primary">
                                $
                                <ValueState
                                    value={formatUnits(userWinningTokens, UNDERYLING_DECIMALS)}
                                    loading={vaultUserBalancesLoading}
                                    error={!!vaultUserBalancesError}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <Button variant="default" className="w-full" onClick={handleRedeemWinningTokens} disabled={redeemWinningTokensLoading}>
                    {redeemWinningTokensLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                    Redeem winning tokens
                </Button>
                <Button disabled variant="default" className="w-full">
                    <Sprout className="w-4 h-4" />
                    Harvest yield
                </Button>
            </div>
        </div>
    );
}

function VaultUnlockedActions({ vaultAddress, market }: { vaultAddress: string; market: ParsedPolymarketMarket }) {
    const invalidateQueries = useInvalidateQueries();
    const { proxyAddress: userAddress } = useProxyAccount();

    const {
        tokenUserBalancesQueryKey,
        vaultUserBalancesQueryKey,
        currentYieldQueryKey,
        vaultUserBalances,
        vaultUserBalancesLoading,
        vaultUserBalancesError,
    } = useVaultUserInfo(vaultAddress as `0x${string}`, userAddress as `0x${string}`, market);

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

    const winner = market.winningPosition || Outcome.Both;
    const userWinningTokens =
        winner === Outcome.Yes
            ? vaultUserBalances?.[0] ?? 0n
            : winner === Outcome.No
            ? vaultUserBalances?.[1] ?? 0n
            : winner === Outcome.Both
            ? (vaultUserBalances?.[0] ?? 0n) + (vaultUserBalances?.[1] ?? 0n)
            : 0n;

    return (
        <div className="space-y-3">
            {winner && (
                <div className="p-4 bg-muted/50 rounded-lg w-full">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Winning Token</div>
                        {winner ? (
                            <OutcomeToken outcome={winner} symbolHolder={market} className="text-xs font-semibold" />
                        ) : (
                            <span className="text-xs font-semibold">-</span>
                        )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">Redemption</div>
                        <div className="text-xs font-semibold text-primary">
                            $
                            <ValueState
                                value={formatUnits(userWinningTokens, UNDERYLING_DECIMALS)}
                                loading={vaultUserBalancesLoading}
                                error={!!vaultUserBalancesError}
                            />
                        </div>
                    </div>
                </div>
            )}
            <Button variant="default" className="w-full" onClick={handleRedeemWinningTokens} disabled={redeemWinningTokensLoading}>
                {redeemWinningTokensLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                Redeem winning tokens
            </Button>
            <Button variant="default" className="w-full" onClick={handleHarvestYield} disabled={harvestYieldLoading}>
                {harvestYieldLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Sprout className="w-4 h-4" />}
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
                Create
            </Button>
        </div>
    );
}

function NoVaultEndedNotice() {
    return <div className="p-3 text-sm">No tokens were staked on this market.</div>;
}
