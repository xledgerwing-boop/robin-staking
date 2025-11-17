'use client';

import { DEFAULT_QUERY_STALE_TIME } from '@robin-pm-staking/common/constants';
import {
    useReadRobinGenesisVaultTotalValueUsd,
    useReadRobinGenesisVaultTvlCapUsd,
    useReadRobinGenesisVaultViewCurrentApyBps,
    useReadRobinGenesisVaultCampaignEndTimestamp,
} from '@robin-pm-staking/common/types/contracts-genesis';
import { zeroAddress } from 'viem';

export function useGenesisVaultInfo(vaultAddress: `0x${string}`) {
    const enabled = !!vaultAddress && vaultAddress !== zeroAddress;

    const {
        data: totalValueUsd,
        isLoading: totalValueUsdLoading,
        error: totalValueUsdError,
        queryKey: totalValueUsdQueryKey,
    } = useReadRobinGenesisVaultTotalValueUsd({
        address: vaultAddress,
        args: [],
        query: { enabled, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: tvlCapUsd,
        isLoading: tvlCapUsdLoading,
        error: tvlCapUsdError,
        queryKey: tvlCapUsdQueryKey,
    } = useReadRobinGenesisVaultTvlCapUsd({
        address: vaultAddress,
        args: [],
        query: { enabled, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: apyBps,
        isLoading: apyBpsLoading,
        error: apyBpsError,
        queryKey: apyBpsQueryKey,
    } = useReadRobinGenesisVaultViewCurrentApyBps({
        address: vaultAddress,
        args: [],
        query: { enabled, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: campaignEndTimestamp,
        isLoading: campaignEndTimestampLoading,
        error: campaignEndTimestampError,
        queryKey: campaignEndTimestampQueryKey,
    } = useReadRobinGenesisVaultCampaignEndTimestamp({
        address: vaultAddress,
        args: [],
        query: { enabled, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    return {
        totalValueUsd,
        totalValueUsdLoading,
        totalValueUsdError,
        totalValueUsdQueryKey,

        tvlCapUsd,
        tvlCapUsdLoading,
        tvlCapUsdError,
        tvlCapUsdQueryKey,

        apyBps,
        apyBpsLoading,
        apyBpsError,
        apyBpsQueryKey,

        campaignEndTimestamp,
        campaignEndTimestampLoading,
        campaignEndTimestampError,
        campaignEndTimestampQueryKey,
    };
}
