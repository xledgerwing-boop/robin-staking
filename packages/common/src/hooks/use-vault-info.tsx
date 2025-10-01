import { DEFAULT_QUERY_STALE_TIME } from '../constants';
import { useReadRobinStakingVaultFinalized, useReadRobinStakingVaultYieldUnlocked } from '../types/contracts';
import { zeroAddress } from 'viem';

export function useVaultInfo(vaultAddress: `0x${string}`) {
    const {
        data: vaultFinalized,
        isLoading: vaultFinalizedLoading,
        error: vaultFinalizedError,
        queryKey: vaultFinalizedQueryKey,
    } = useReadRobinStakingVaultFinalized({
        address: vaultAddress,
        args: [],
        query: { enabled: !!vaultAddress && vaultAddress !== zeroAddress, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    const {
        data: vaultYieldUnlocked,
        isLoading: vaultYieldUnlockedLoading,
        error: vaultYieldUnlockedError,
        queryKey: vaultYieldUnlockedQueryKey,
    } = useReadRobinStakingVaultYieldUnlocked({
        address: vaultAddress,
        args: [],
        query: { enabled: !!vaultAddress && vaultAddress !== zeroAddress, staleTime: DEFAULT_QUERY_STALE_TIME },
    });

    return {
        vaultFinalized,
        vaultFinalizedLoading,
        vaultFinalizedError,
        vaultFinalizedQueryKey,

        vaultYieldUnlocked,
        vaultYieldUnlockedLoading,
        vaultYieldUnlockedError,
        vaultYieldUnlockedQueryKey,
    };
}
