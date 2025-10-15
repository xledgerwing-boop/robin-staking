'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck, Coins, Loader, Sprout } from 'lucide-react';
import { Market } from '@robin-pm-staking/common/types/market';
import { Outcome } from '@robin-pm-staking/common/types/market';
import OutcomeToken from '@robin-pm-staking/common/components/outcome-token';
import { useVaultUserInfo } from '@robin-pm-staking/common/hooks/use-vault-user-info';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import useInvalidateQueries from '@robin-pm-staking/common/hooks/use-invalidate-queries';
import useProxyContractInteraction from '@robin-pm-staking/common/hooks/use-proxy-contract-interaction';
import { useWriteRobinStakingVaultHarvestYield, useWriteRobinStakingVaultRedeemWinningForUsd } from '@robin-pm-staking/common/types/contracts';
import { formatUnits, getErrorMessage } from '@robin-pm-staking/common/lib/utils';
import { toast } from 'sonner';
import { UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';
import { ValueState } from '../value-state';

type CompletedMarketCardProps = {
    market: Market;
    onAction: () => void;
};

export default function CompletedMarketCard({ market, onAction }: CompletedMarketCardProps) {
    const { proxyAddress, isConnected } = useProxyAccount();
    const invalidateQueries = useInvalidateQueries();

    const {
        tokenUserBalancesQueryKey,
        vaultUserBalancesQueryKey,
        vaultUserBalancesError,
        vaultUserBalancesLoading,
        vaultUserBalances,
        currentYield,
        currentYieldQueryKey,
        currentYieldLoading,
        currentYieldError,
    } = useVaultUserInfo(market.contractAddress as `0x${string}`, proxyAddress as `0x${string}`, market);

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
            if (!isConnected) throw new Error('Wallet not connected');
            if (!market.contractAddress) throw new Error('Vault address not found');
            if (!proxyAddress) throw new Error('Proxy address not found');

            await redeemWinningTokens({
                address: market.contractAddress as `0x${string}`,
                args: [],
                hookIndex: 0,
            });
            await redeemWinningTokensPromise.current;
            await invalidateQueries([tokenUserBalancesQueryKey, vaultUserBalancesQueryKey]);
            onAction();
        } catch (error) {
            toast.error('Failed to redeem winning tokens' + getErrorMessage(error));
            console.error(error);
        }
    };

    const handleHarvestYield = async () => {
        try {
            if (!isConnected) throw new Error('Wallet not connected');
            if (!market.contractAddress) throw new Error('Vault address not found');
            if (!proxyAddress) throw new Error('Proxy address not found');

            await harvestYield({
                address: market.contractAddress as `0x${string}`,
                args: [],
                hookIndex: 0,
            });
            await harvestYieldPromise.current;
            await invalidateQueries([tokenUserBalancesQueryKey, vaultUserBalancesQueryKey, currentYieldQueryKey]);
            onAction();
        } catch (error) {
            toast.error('Failed to harvest yield' + getErrorMessage(error));
            console.error(error);
        }
    };

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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CircleCheck className="w-5 h-5 text-primary" />
                    <span>Market Resolved</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Winning Token</div>
                        {winner ? (
                            <OutcomeToken outcome={winner} symbolHolder={market} className="text-lg font-semibold" />
                        ) : (
                            <span className="text-lg font-semibold">-</span>
                        )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">Redemption (USDC)</div>
                        <div className="text-lg font-semibold text-primary">
                            $
                            <ValueState
                                value={formatUnits(userWinningTokens, UNDERYLING_DECIMALS)}
                                loading={vaultUserBalancesLoading}
                                error={!!vaultUserBalancesError}
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">Earned Yield</div>
                        <div className="text-lg font-semibold text-primary">
                            $
                            <ValueState
                                value={formatUnits(currentYield ?? 0n, UNDERYLING_DECIMALS)}
                                loading={currentYieldLoading}
                                error={!!currentYieldError}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                    <Button
                        onClick={handleRedeemWinningTokens}
                        disabled={!winner || userWinningTokens <= 0n || redeemWinningTokensLoading}
                        className="w-full"
                    >
                        {redeemWinningTokensLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                        Redeem
                    </Button>
                    <Button
                        onClick={handleHarvestYield}
                        variant="secondary"
                        disabled={(currentYield ?? 0n) <= 0n || harvestYieldLoading}
                        className="w-full"
                    >
                        {harvestYieldLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Sprout className="w-4 h-4" />}
                        Harvest Yield
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
