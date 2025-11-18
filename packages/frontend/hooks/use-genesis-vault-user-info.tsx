'use client';

import { DEFAULT_QUERY_STALE_TIME, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';
import {
    useReadRobinGenesisVaultViewUserCurrentValues,
    useReadRobinGenesisVaultViewUserEstimatedEarnings,
    useReadRobinGenesisVaultViewUserStakeableValue,
} from '@robin-pm-staking/common/types/contracts-genesis';
import { zeroAddress } from 'viem';

export function useGenesisVaultUserInfo(vaultAddress: `0x${string}`, userAddress: `0x${string}` | null | undefined) {
    const enabledBase = !!vaultAddress && vaultAddress !== zeroAddress;
    const enabledUser = enabledBase && !!userAddress && userAddress !== zeroAddress;

    const {
        data: userCurrentValues,
        isLoading: userCurrentValuesLoading,
        error: userCurrentValuesError,
        queryKey: userCurrentValuesQueryKey,
    } = useReadRobinGenesisVaultViewUserCurrentValues({
        address: vaultAddress,
        args: [userAddress as `0x${string}`],
        query: { enabled: enabledUser, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: userEstimatedEarnings,
        isLoading: userEstimatedEarningsLoading,
        error: userEstimatedEarningsError,
        queryKey: userEstimatedEarningsQueryKey,
    } = useReadRobinGenesisVaultViewUserEstimatedEarnings({
        address: vaultAddress,
        args: [userAddress as `0x${string}`],
        query: { enabled: enabledUser, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: userStakeableValue,
        isLoading: userStakeableValueLoading,
        error: userStakeableValueError,
        queryKey: userStakeableValueQueryKey,
    } = useReadRobinGenesisVaultViewUserStakeableValue({
        address: vaultAddress,
        args: [userAddress as `0x${string}`],
        query: { enabled: enabledUser, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const calculateRobinPoints = (apyBps?: bigint, campaignEndTimestamp?: bigint) => {
        // Calculate potential Robin points from stakeable value (same as PotentialEarnings.tsx)
        const totalUsd = userStakeableValue?.[1];
        const eligibleUsd = userStakeableValue?.[2];
        const nonEligibleUsd = totalUsd != null && eligibleUsd != null ? (totalUsd > eligibleUsd ? totalUsd - eligibleUsd : 0n) : undefined;
        const nowSec = BigInt(Math.floor(Date.now() / 1000));
        const endSec = campaignEndTimestamp ?? 0n;
        const timeLeftSec = endSec > nowSec ? endSec - nowSec : 0n;
        const secondsPerYear = 365n * 24n * 3600n;
        const nonEligibleYield =
            nonEligibleUsd == null || apyBps == null ? undefined : (nonEligibleUsd * apyBps * timeLeftSec) / (10_000n * secondsPerYear);
        const robinPointsPoolUsd = 500n * 10n ** BigInt(UNDERYLING_DECIMALS);
        const potentialRobinPoints = nonEligibleYield == null ? undefined : (nonEligibleYield * 50_000n) / robinPointsPoolUsd;

        // Calculate current daily earning rate from staked funds
        const stakedTotalUsd = userCurrentValues?.[0];
        const stakedEligibleUsd = userCurrentValues?.[1];
        const stakedNonEligibleUsd =
            stakedTotalUsd != null && stakedEligibleUsd != null
                ? stakedTotalUsd > stakedEligibleUsd
                    ? stakedTotalUsd - stakedEligibleUsd
                    : 0n
                : undefined;
        const dailyNonEligibleYield =
            stakedNonEligibleUsd == null || apyBps == null ? undefined : (stakedNonEligibleUsd * apyBps * 86400n) / (10_000n * secondsPerYear);
        const dailyRobinPoints = dailyNonEligibleYield == null ? undefined : (dailyNonEligibleYield * 50_000n) / robinPointsPoolUsd;

        // Calculate outstanding points from base earnings (will be 0 if claimed)
        let outstandingRobinPoints: bigint | undefined = undefined;
        if (userEstimatedEarnings != null) {
            const baseEarnings = userEstimatedEarnings[1];
            if (baseEarnings != null && baseEarnings !== 0n) {
                outstandingRobinPoints = (baseEarnings * 50_000n) / robinPointsPoolUsd;
            }
        }

        return {
            potentialRobinPoints,
            dailyRobinPoints,
            outstandingRobinPoints,
        };
    };

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

        calculateRobinPoints,
    };
}
