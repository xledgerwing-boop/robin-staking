'use client';

import { DEFAULT_QUERY_STALE_TIME } from '@robin-pm-staking/common/constants';
import {
    useReadPromotionVaultTotalValueUsd,
    useReadPromotionVaultTvlCapUsd,
    useReadPromotionVaultViewCurrentApyBps,
    useReadPromotionVaultCampaignEndTimestamp,
} from '@robin-pm-staking/common/types/contracts-promo';
import { zeroAddress } from 'viem';

export function usePromotionVaultInfo(vaultAddress: `0x${string}`) {
    const enabled = !!vaultAddress && vaultAddress !== zeroAddress;

    const {
        data: totalValueUsd,
        isLoading: totalValueUsdLoading,
        error: totalValueUsdError,
        queryKey: totalValueUsdQueryKey,
    } = useReadPromotionVaultTotalValueUsd({
        address: vaultAddress,
        args: [],
        query: { enabled, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: tvlCapUsd,
        isLoading: tvlCapUsdLoading,
        error: tvlCapUsdError,
        queryKey: tvlCapUsdQueryKey,
    } = useReadPromotionVaultTvlCapUsd({
        address: vaultAddress,
        args: [],
        query: { enabled, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: apyBps,
        isLoading: apyBpsLoading,
        error: apyBpsError,
        queryKey: apyBpsQueryKey,
    } = useReadPromotionVaultViewCurrentApyBps({
        address: vaultAddress,
        args: [],
        query: { enabled, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: campaignEndTimestamp,
        isLoading: endLoading,
        error: endError,
        queryKey: endQueryKey,
    } = useReadPromotionVaultCampaignEndTimestamp({
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
        endLoading,
        endError,
        endQueryKey,
    };
}
