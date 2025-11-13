'use client';

import { DEFAULT_QUERY_STALE_TIME } from '@robin-pm-staking/common/constants';
import {
    useReadPromotionVaultViewUserCurrentValues,
    useReadPromotionVaultViewUserEstimatedEarnings,
    useReadPromotionVaultViewUserStakeableValue,
} from '@robin-pm-staking/common/types/contracts-promo';
import { zeroAddress } from 'viem';

export function usePromotionVaultUserInfo(vaultAddress: `0x${string}`, userAddress: `0x${string}` | null | undefined) {
    const enabledBase = !!vaultAddress && vaultAddress !== zeroAddress;
    const enabledUser = enabledBase && !!userAddress && userAddress !== zeroAddress;

    const {
        data: userCurrentValues,
        isLoading: userCurrentValuesLoading,
        error: userCurrentValuesError,
        queryKey: userCurrentValuesQueryKey,
    } = useReadPromotionVaultViewUserCurrentValues({
        address: vaultAddress,
        args: [userAddress as `0x${string}`],
        query: { enabled: enabledUser, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: userEstimatedEarnings,
        isLoading: userEstimatedEarningsLoading,
        error: userEstimatedEarningsError,
        queryKey: userEstimatedEarningsQueryKey,
    } = useReadPromotionVaultViewUserEstimatedEarnings({
        address: vaultAddress,
        args: [userAddress as `0x${string}`],
        query: { enabled: enabledUser, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: userStakeableValue,
        isLoading: userStakeableValueLoading,
        error: userStakeableValueError,
        queryKey: userStakeableValueQueryKey,
    } = useReadPromotionVaultViewUserStakeableValue({
        address: vaultAddress,
        args: [userAddress as `0x${string}`],
        query: { enabled: enabledUser, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    return {
        userCurrentValues,
        userCurrentValuesLoading,
        userCurrentValuesError,
        userCurrentValuesQueryKey,

        userEstimatedEarnings,
        userEstimatedEarningsLoading,
        userEstimatedEarningsError,
        userEstimatedEarningsQueryKey,

        userStakeableValue,
        userStakeableValueLoading,
        userStakeableValueError,
        userStakeableValueQueryKey,
    };
}
