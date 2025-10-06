'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ArrowDownToLine, ArrowUpToLine, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DateTime } from 'luxon';
import { Market, ParsedPolymarketMarket } from '@robin-pm-staking/common/types/market';
import { Outcome } from '@robin-pm-staking/common/types/market';
import OutcomeToken from '@robin-pm-staking/common/components/outcome-token';
import AmountSlider from '@robin-pm-staking/common/components/amount-slider';
import { parseUnits } from 'viem';
import { UNDERYLING_DECIMALS, USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { formatUnits, getErrorMessage } from '@robin-pm-staking/common/lib/utils';
import { toast } from 'sonner';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import useInvalidateQueries from '@robin-pm-staking/common/hooks/use-invalidate-queries';
import { useVaultUserInfo } from '@robin-pm-staking/common/hooks/use-vault-user-info';
import {
    useReadConditionalTokensIsApprovedForAll,
    useWriteConditionalTokensSetApprovalForAll,
    useWriteRobinStakingVaultDeposit,
    useWriteRobinStakingVaultWithdraw,
} from '@robin-pm-staking/common/types/contracts';
import useProxyContractInteraction from '@robin-pm-staking/common/hooks/use-proxy-contract-interaction';

type ManagePositionCardProps = {
    market: Market;
    polymarketMarket: ParsedPolymarketMarket;
};

export default function ManagePositionCard({ market, polymarketMarket }: ManagePositionCardProps) {
    const [tab, setTab] = useState<'stake' | 'withdraw'>('stake');
    const [stakeAmount, setStakeAmount] = useState<string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [side, setSide] = useState<Outcome>(Outcome.Yes);

    const { proxyAddress } = useProxyAccount();
    const invalidateQueries = useInvalidateQueries();
    const vaultAddress = market.contractAddress as `0x${string}`;

    const {
        vaultUserBalancesQueryKey,
        tokenUserBalancesQueryKey,
        vaultCurrentApyQueryKey,
        getUserBalances,
        calculateUserInfo,
        calculateExpectedYield,
    } = useVaultUserInfo(vaultAddress as `0x${string}`, proxyAddress as `0x${string}`, market);

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

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { currentNoApyBps, currentYesApyBps } = calculateUserInfo(
        Number(polymarketMarket.outcomePrices[0]),
        Number(polymarketMarket.outcomePrices[1])
    );

    const expectedYield = calculateExpectedYield(
        stakeAmount,
        side,
        Number(polymarketMarket.outcomePrices[0]),
        Number(polymarketMarket.outcomePrices[1])
    );

    const updateQueryParams = (updates: Record<string, string | null | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        const prev = searchParams.toString();
        const next = params.toString();
        if (prev !== next) {
            router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
        }
    };

    const loadQueryParams = () => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'stake' || tabParam === 'withdraw') {
            if (tabParam !== tab) setTab(tabParam);
        }

        const sideParam = searchParams.get('side');
        if (sideParam === Outcome.Yes || sideParam === Outcome.No) {
            if (sideParam !== side) setSide(sideParam);
        }
    };

    useEffect(() => {
        loadQueryParams();
    }, [searchParams]);

    const handleMaxStake = () => {
        setStakeAmount(formatUnits(side === Outcome.Yes ? tokenUserYes : tokenUserNo, UNDERYLING_DECIMALS));
    };

    const handleMaxWithdraw = () => {
        setWithdrawAmount(formatUnits(side === Outcome.Yes ? vaultUserYes : vaultUserNo, UNDERYLING_DECIMALS));
    };

    const handleTabChange = (value: string) => {
        const tab = value === 'withdraw' ? 'withdraw' : 'stake';
        setTab(tab);
        updateQueryParams({ tab });
    };

    const handleSideChange = (value: string) => {
        const side = value === Outcome.No ? Outcome.No : Outcome.Yes;
        setSide(side);
        updateQueryParams({ side });
    };

    const handleStake = async () => {
        try {
            await stake([
                // @ts-expect-error fix typing
                ...(approvedForAll
                    ? []
                    : [
                          {
                              address: USED_CONTRACTS.CONDITIONAL_TOKENS,
                              args: [vaultAddress as `0x${string}`, true],
                              hookIndex: 0,
                          },
                      ]),
                {
                    address: vaultAddress as `0x${string}`,
                    // @ts-expect-error fix typing
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

    const { tokenUserYes, tokenUserNo, vaultUserYes, vaultUserNo } = getUserBalances();
    const outcomeSymbol = side === Outcome.Yes ? market.outcomes[0] : market.outcomes[1];

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
        <Card>
            <CardHeader>
                <CardTitle>Manage Position</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={tab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="stake">Stake</TabsTrigger>
                        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stake" className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3 border-b pb-4">
                                <Input
                                    id="stake-amount"
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0"
                                    min={0}
                                    value={stakeAmount}
                                    onChange={e => setStakeAmount(e.target.value)}
                                    className="flex-1 border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 h-auto px-0 py-0 text-4xl sm:text-4xl md:text-4xl appearance-none font-semibold tracking-tight"
                                />
                                <Select value={side} onValueChange={handleSideChange}>
                                    <SelectTrigger className="px-4 py-2 rounded-full border text-sm font-medium">
                                        <OutcomeToken outcome={side} symbolHolder={market} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={Outcome.Yes}>
                                            <OutcomeToken outcome={Outcome.Yes} symbolHolder={market} />
                                        </SelectItem>
                                        <SelectItem value={Outcome.No}>
                                            <OutcomeToken outcome={Outcome.No} symbolHolder={market} />
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <AmountSlider
                                className="py-2"
                                amount={stakeAmount}
                                max={side === Outcome.Yes ? tokenUserYes : tokenUserNo}
                                onAmountChange={setStakeAmount}
                                showMax={false}
                            />
                            <div className="flex space-x-2 justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Balance: {formatUnits(side === Outcome.Yes ? tokenUserYes : tokenUserNo, UNDERYLING_DECIMALS)}
                                </p>
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleMaxStake}>
                                    Max
                                </Button>
                            </div>
                        </div>

                        {stakeAmountParsed > 0 && (
                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <h4 className="font-medium">Position Preview</h4>
                                <div className="flex justify-between text-sm">
                                    <span>Your Position:</span>
                                    <span>
                                        {stakeAmount} {outcomeSymbol}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>APY:</span>
                                    <span className="text-primary">
                                        {((Number(side === Outcome.Yes ? currentYesApyBps : currentNoApyBps) / 10_000) * 100).toFixed(2)}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>
                                        Expected Yield by{' '}
                                        {market.endDate ? DateTime.fromMillis(market.endDate).toLocaleString(DateTime.DATE_MED) : '—'}:
                                    </span>
                                    <span className="text-primary">${formatUnits(expectedYield, UNDERYLING_DECIMALS)}</span>
                                </div>
                            </div>
                        )}
                        {stakeAmountInvalid && stakeAmount != '' && <span className="text-xs text-destructive mt-2">Invalid amount</span>}
                        <Button className="w-full mt-2" onClick={handleStake} disabled={stakeLoading || stakeAmountInvalid}>
                            {stakeLoading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowUpToLine className="w-4 h-4" />}
                            {`Deposit ${stakeAmount || '0.00'} ${outcomeSymbol}`}
                        </Button>
                    </TabsContent>

                    <TabsContent value="withdraw" className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3 border-b pb-4">
                                <Input
                                    id="withdraw-amount"
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0"
                                    min={0}
                                    value={withdrawAmount}
                                    onChange={e => setWithdrawAmount(e.target.value)}
                                    className="flex-1 border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 h-auto px-0 py-0 text-4xl sm:text-4xl md:text-4xl appearance-none font-semibold tracking-tight"
                                />
                                <Select value={side} onValueChange={handleSideChange}>
                                    <SelectTrigger className="px-4 py-2 rounded-full border text-sm font-medium">
                                        <OutcomeToken outcome={side} symbolHolder={market} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={Outcome.Yes}>
                                            <OutcomeToken outcome={Outcome.Yes} symbolHolder={market} />
                                        </SelectItem>
                                        <SelectItem value={Outcome.No}>
                                            <OutcomeToken outcome={Outcome.No} symbolHolder={market} />
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <AmountSlider
                                className="py-2"
                                amount={withdrawAmount}
                                max={side === Outcome.Yes ? vaultUserYes : vaultUserNo}
                                onAmountChange={setWithdrawAmount}
                                showMax={false}
                            />
                            <div className="flex space-x-2 justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Balance: {formatUnits(side === Outcome.Yes ? vaultUserYes : vaultUserNo, UNDERYLING_DECIMALS)}
                                </p>
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleMaxWithdraw}>
                                    Max
                                </Button>
                            </div>
                        </div>

                        {withdrawAmountParsed > 0 && (
                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <h4 className="font-medium">Withdrawal Preview</h4>
                                <div className="flex justify-between text-sm">
                                    <span>Withdrawal Amount:</span>
                                    <span>
                                        {withdrawAmount} {outcomeSymbol}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Remaining Position:</span>
                                    <span>
                                        {formatUnits((side === Outcome.Yes ? vaultUserYes : vaultUserNo) - withdrawAmountParsed, UNDERYLING_DECIMALS)}{' '}
                                        {outcomeSymbol}
                                    </span>
                                </div>
                            </div>
                        )}
                        {withdrawAmountInvalid && withdrawAmount != '' && <span className="text-xs text-destructive mt-2">Invalid amount</span>}
                        <Button
                            className="w-full mt-2"
                            variant="secondary"
                            onClick={handleWithdraw}
                            disabled={withdrawLoading || withdrawAmountInvalid}
                        >
                            {withdrawLoading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                            {`Withdraw ${withdrawAmount || '0.00'} ${outcomeSymbol}`}
                        </Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
