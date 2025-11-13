'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ValueState } from '@/components/value-state';
import { TrendingUp, DollarSign, User } from 'lucide-react';
import { UNDERYLING_DECIMALS, USED_CONTRACTS } from '@robin-pm-staking/common/src/constants';
import {
    useReadPromotionVaultTotalValueUsd,
    useReadPromotionVaultViewCurrentApyBps,
    useReadPromotionVaultViewUserCurrentValues,
    useReadPromotionVaultViewUserEstimatedEarnings,
} from '@robin-pm-staking/common/src/types/contracts-promo';
import { useProxyAccount } from '@robin-pm-staking/common/src/hooks/use-proxy-account';
import { formatUnits } from '@robin-pm-staking/common/lib/utils';

export default function TopMetrics() {
    const VAULT = USED_CONTRACTS.PROMOTION_VAULT as `0x${string}`;
    const { proxyAddress, isConnected } = useProxyAccount();

    const { data: tvl, isLoading: tvlLoading, error: tvlError } = useReadPromotionVaultTotalValueUsd({ address: VAULT, args: [] });

    const {
        data: userValues,
        isLoading: userValuesLoading,
        error: userValuesError,
    } = useReadPromotionVaultViewUserCurrentValues({
        address: VAULT,
        args: [proxyAddress as `0x${string}`],
        query: { enabled: isConnected && !!proxyAddress },
    });

    const {
        data: userEarnings,
        isLoading: userEarnLoading,
        error: userEarnError,
    } = useReadPromotionVaultViewUserEstimatedEarnings({
        address: VAULT,
        args: [proxyAddress as `0x${string}`],
        query: { enabled: isConnected && !!proxyAddress },
    });

    const {
        data: apyBps,
        isLoading: apyBpsLoading,
        error: apyBpsError,
    } = useReadPromotionVaultViewCurrentApyBps({
        address: VAULT,
        args: [],
    });

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
                <CardContent className="p-3 sm:p-6 md:p-6">
                    <div className="flex items-center w-full h-full justify-between space-x-2">
                        <div className="text-center p-2 md:p-4 bg-muted/50 rounded-lg">
                            <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total TVL</p>
                            <div className="text-2xl font-bold text-right">
                                <ValueState value={`$${formatUnits(tvl ?? 0n, UNDERYLING_DECIMALS, 0)}`} loading={tvlLoading} error={!!tvlError} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-3 sm:p-6 md:p-6">
                    <div className="flex items-center w-full h-full justify-between space-x-2">
                        <div className="text-center p-2 md:p-4 bg-muted/50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Current APY</p>
                            <div className="text-2xl font-bold text-right">
                                <ValueState
                                    value={apyBps == null ? '—' : `${formatUnits(apyBps, 4 - 2, 1)}%`}
                                    loading={apyBpsLoading}
                                    error={!!apyBpsError}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-3 sm:p-6 md:p-6">
                    <div className="flex items-center w-full h-full justify-between space-x-2">
                        <div className="text-center p-2 md:p-4 bg-muted/50 rounded-lg">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">My Staked Value</p>
                            <div className="text-2xl font-bold text-right">
                                <ValueState
                                    value={isConnected ? `$${formatUnits(userValues?.[0] ?? 0n, UNDERYLING_DECIMALS, 0)}` : '—'}
                                    loading={userValuesLoading}
                                    error={!!userValuesError}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-3 sm:p-6 md:p-6">
                    <div className="flex items-center w-full h-full justify-between space-x-2">
                        <div className="text-center p-2 md:p-4 bg-muted/50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">My Earned</p>
                            <div className="text-2xl font-bold text-right">
                                <ValueState
                                    value={isConnected ? `$${formatUnits(userEarnings?.[0] ?? 0n, UNDERYLING_DECIMALS, 0)}` : '—'}
                                    loading={userEarnLoading}
                                    error={!!userEarnError}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
