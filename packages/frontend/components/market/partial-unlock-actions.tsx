import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { Market, Outcome } from '@robin-pm-staking/common/types/market';
import useInvalidateQueries from '@robin-pm-staking/common/hooks/use-invalidate-queries';
import { useVaultUserInfo } from '@robin-pm-staking/common/hooks/use-vault-user-info';
import { useReadRobinStakingVaultGetTvlUsd, useWriteRobinStakingVaultRedeemWinningForUsd } from '@robin-pm-staking/common/types/contracts';
import { useReadErc20BalanceOf } from '@robin-pm-staking/common/types/contracts';
import { useWriteRobinStakingVaultUnlockYield } from '@robin-pm-staking/common/types/contracts';
import { formatUnits, getErrorMessage } from '@robin-pm-staking/common/lib/utils';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Coins, Loader, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import { UNDERYLING_DECIMALS, UNDERYLING_PRECISION_BIG_INT, USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import useProxyContractInteraction from '@robin-pm-staking/common/hooks/use-proxy-contract-interaction';
import { ValueState } from '../value-state';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import MarketResult from './market-result';

export default function PartialUnlockActions({ market, onUnlocked }: { market: Market; onUnlocked: () => void }) {
    const { proxyAddress, isConnected } = useProxyAccount();
    const invalidateQueries = useInvalidateQueries();

    const { tokenUserBalancesQueryKey, vaultUserBalancesQueryKey, vaultUserBalances } = useVaultUserInfo(
        market.contractAddress as `0x${string}`,
        proxyAddress as `0x${string}`,
        market
    );

    const {
        data: tvlUsd,
        isLoading: tvlUsdLoading,
        error: tvlUsdError,
        queryKey: tvlUsdQueryKey,
    } = useReadRobinStakingVaultGetTvlUsd({
        address: market.contractAddress as `0x${string}`,
    });

    const {
        data: vaultUsdBalance,
        isLoading: vaultUsdBalanceLoading,
        error: vaultUsdBalanceError,
        queryKey: vaultUsdBalanceQueryKey,
    } = useReadErc20BalanceOf({
        address: USED_CONTRACTS.USDCE,
        args: [market.contractAddress as `0x${string}`],
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
            if (!isConnected) throw new Error('Wallet not connected');
            if (!market.contractAddress) throw new Error('Vault address not found');
            if (!proxyAddress) throw new Error('Proxy address not found');

            await unlockYield({
                address: market.contractAddress as `0x${string}`,
                args: [],
                hookIndex: 0,
            });
            await unlockYieldPromise.current;
            await invalidateQueries([tvlUsdQueryKey, vaultUsdBalanceQueryKey]);
            onUnlocked();
        } catch (error) {
            toast.error('Failed to unlock yield' + getErrorMessage(error));
            console.error(error);
        }
    };

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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <span>Unlock in progress</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="mb-2">
                        Fund unlocking in progress. You can redeem winning tokens now if enough liquidity is available. You can harvest yield once
                        unlocking is complete.
                    </div>
                    <div className="h-8 flex flex-col items-center justify-center">
                        <span className="text-muted-foreground">
                            <ValueState
                                value={formatUnits(vaultUsd, UNDERYLING_DECIMALS)}
                                loading={vaultUsdBalanceLoading}
                                error={!!vaultUsdBalanceError}
                            />{' '}
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
                        <MarketResult market={market} vaultUserBalances={vaultUserBalances} />
                        <Button
                            variant="default"
                            className="w-full"
                            onClick={handleRedeemWinningTokens}
                            disabled={redeemWinningTokensLoading || userWinningTokens === 0n}
                        >
                            {redeemWinningTokensLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                            Redeem winning tokens
                        </Button>
                        <Button disabled variant="default" className="w-full">
                            <Sprout className="w-4 h-4" />
                            Harvest yield
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
