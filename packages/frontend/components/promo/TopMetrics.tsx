'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ValueState } from '@/components/value-state';
import { TrendingUp, DollarSign, User } from 'lucide-react';
import { UNDERYLING_DECIMALS, USED_CONTRACTS } from '@robin-pm-staking/common/src/constants';
import { useProxyAccount } from '@robin-pm-staking/common/src/hooks/use-proxy-account';
import { formatUnits } from '@robin-pm-staking/common/lib/utils';
import { usePromotionVaultInfo } from '@/hooks/use-promotion-vault-info';
import { usePromotionVaultUserInfo } from '@/hooks/use-promotion-vault-user-info';

export default function TopMetrics() {
    const VAULT = USED_CONTRACTS.PROMOTION_VAULT as `0x${string}`;
    const { proxyAddress, isConnected } = useProxyAccount();

    const { totalValueUsd, totalValueUsdLoading, totalValueUsdError, apyBps, apyBpsLoading, apyBpsError } = usePromotionVaultInfo(VAULT);

    const {
        userCurrentValues,
        userCurrentValuesLoading,
        userCurrentValuesError,
        userEstimatedEarnings,
        userEstimatedEarningsLoading,
        userEstimatedEarningsError,
    } = usePromotionVaultUserInfo(VAULT, proxyAddress as `0x${string}`);

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
                                <ValueState
                                    value={`$${formatUnits(totalValueUsd ?? 0n, UNDERYLING_DECIMALS, 0)}`}
                                    loading={totalValueUsdLoading}
                                    error={!!totalValueUsdError}
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
                            <p className="text-sm text-muted-foreground">My TVL</p>
                            <div className="text-2xl font-bold text-right">
                                <ValueState
                                    value={isConnected ? `$${formatUnits(userCurrentValues?.[0] ?? 0n, UNDERYLING_DECIMALS, 0)}` : '—'}
                                    loading={userCurrentValuesLoading}
                                    error={!!userCurrentValuesError}
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
                            <p className="text-sm text-muted-foreground">My Earnings</p>
                            <div className="text-2xl font-bold text-right">
                                <ValueState
                                    value={isConnected ? `$${formatUnits(userEstimatedEarnings?.[0] ?? 0n, UNDERYLING_DECIMALS, 0)}` : '—'}
                                    loading={userEstimatedEarningsLoading}
                                    error={!!userEstimatedEarningsError}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
