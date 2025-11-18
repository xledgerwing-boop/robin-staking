'use client';

import { ValueState } from '@/components/value-state';
import { UNDERYLING_DECIMALS, USED_CONTRACTS, GENESIS_VAULT_INFOS } from '@robin-pm-staking/common/src/constants';
import { useProxyAccount } from '@robin-pm-staking/common/src/hooks/use-proxy-account';
import { formatUnits, formatUnitsLocale } from '@robin-pm-staking/common/lib/utils';
import { useGenesisVaultInfo } from '@/hooks/use-genesis-vault-info';
import { useGenesisVaultUserInfo } from '@/hooks/use-genesis-vault-user-info';
import { useMemo } from 'react';

export default function TopMetrics() {
    const VAULT = USED_CONTRACTS.GENESIS_VAULT as `0x${string}`;
    const { proxyAddress } = useProxyAccount();

    const { totalValueUsd, totalValueUsdLoading, totalValueUsdError, apyBps, campaignEndTimestamp, apyBpsLoading, apyBpsError } =
        useGenesisVaultInfo(VAULT);

    const {
        calculateRobinPoints,
        userCurrentValues,
        userCurrentValuesLoading,
        userCurrentValuesError,
        userEstimatedEarnings,
        userEstimatedEarningsLoading,
        userEstimatedEarningsError,
    } = useGenesisVaultUserInfo(VAULT, proxyAddress as `0x${string}`);

    const { outstandingRobinPoints: robinPoints } = calculateRobinPoints(apyBps, campaignEndTimestamp);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 mt-8">
            <div>
                <p className="text-sm text-muted-foreground text-center">Total TVL</p>
                <div className="text-2xl font-bold text-center">
                    <ValueState
                        value={totalValueUsd == null ? undefined : `$${formatUnitsLocale(totalValueUsd, UNDERYLING_DECIMALS, 0)}`}
                        loading={totalValueUsdLoading}
                        error={!!totalValueUsdError}
                    />
                </div>
            </div>
            <div>
                <p className="text-sm text-muted-foreground text-center">Current APY</p>
                <div className="text-2xl font-bold text-center">
                    {apyBps == null ? (
                        <ValueState value={undefined} loading={apyBpsLoading} error={!!apyBpsError} />
                    ) : (
                        <div className="flex flex-col items-center">
                            <ValueState value={`${formatUnits(apyBps, 4 - 2, 1)}%`} loading={apyBpsLoading} error={!!apyBpsError} />
                            <span className="text-xs text-primary font-medium mt-0.5">
                                +{formatUnits(GENESIS_VAULT_INFOS.EXTRA_APY_BPS, 4 - 2, 1)}% on selected
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <p className="text-sm text-muted-foreground text-center">My TVL</p>
                <div className="text-2xl font-bold text-center">
                    {userCurrentValues == null ? (
                        '-'
                    ) : (
                        <ValueState
                            value={`$${formatUnitsLocale(userCurrentValues[0], UNDERYLING_DECIMALS, 0)}`}
                            loading={userCurrentValuesLoading}
                            error={!!userCurrentValuesError}
                        />
                    )}
                </div>
            </div>
            <div>
                <p className="text-sm text-muted-foreground text-center">My Earnings</p>
                <div className="text-2xl font-bold text-center">
                    {userEstimatedEarnings == null ? (
                        '-'
                    ) : (
                        <ValueState
                            value={`$${formatUnitsLocale(userEstimatedEarnings[0], UNDERYLING_DECIMALS, 0)}`}
                            loading={userEstimatedEarningsLoading}
                            error={!!userEstimatedEarningsError}
                        />
                    )}
                </div>
                <div className="text-xs text-center text-primary font-medium mt-0.5">
                    {robinPoints == null ? (
                        <ValueState value={undefined} loading={userEstimatedEarningsLoading} error={!!userEstimatedEarningsError} />
                    ) : (
                        `${formatUnitsLocale(robinPoints, 0, 0)} Robin Points`
                    )}
                </div>
            </div>
        </div>
    );
}
