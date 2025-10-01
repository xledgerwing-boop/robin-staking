import { DEFAULT_QUERY_STALE_TIME, UNDERYLING_DECIMALS, UNDERYLING_PRECISION, UNDERYLING_PRECISION_BIG_INT, USED_CONTRACTS } from '../constants';
import {
    useReadRobinStakingVaultGetCurrentApy,
    useReadRobinStakingVaultGetUserBalances,
    useReadIConditionalTokensBalanceOfBatch,
    useReadRobinStakingVaultGetCurrentUserYield,
} from '../types/contracts';
import { ParsedPolymarketMarket } from '../types/market';
import { zeroAddress } from 'viem';

export function useVaultUserInfo(vaultAddress: `0x${string}`, userAddress: `0x${string}`, market: ParsedPolymarketMarket) {
    const {
        data: vaultCurrentApy,
        isLoading: vaultCurrentApyLoading,
        error: vaultCurrentApyError,
        queryKey: vaultCurrentApyQueryKey,
    } = useReadRobinStakingVaultGetCurrentApy({
        address: vaultAddress,
        args: [],
        query: {
            enabled: !!vaultAddress && vaultAddress !== zeroAddress && !!userAddress && userAddress !== zeroAddress,
            staleTime: DEFAULT_QUERY_STALE_TIME,
        },
    });

    const {
        data: vaultUserBalances,
        isLoading: vaultUserBalancesLoading,
        error: vaultUserBalancesError,
        queryKey: vaultUserBalancesQueryKey,
    } = useReadRobinStakingVaultGetUserBalances({
        address: vaultAddress,
        args: [userAddress],
        query: {
            enabled: !!vaultAddress && vaultAddress !== zeroAddress && !!userAddress && userAddress !== zeroAddress,
            staleTime: DEFAULT_QUERY_STALE_TIME,
        },
    });

    const {
        data: tokenUserBalances,
        isLoading: tokenUserBalancesLoading,
        error: tokenUserBalancesError,
        queryKey: tokenUserBalancesQueryKey,
    } = useReadIConditionalTokensBalanceOfBatch({
        address: USED_CONTRACTS.CONDITIONAL_TOKENS,
        args: [
            [userAddress, userAddress],
            [market.clobTokenIds[0], market.clobTokenIds[1]],
        ],
        query: {
            enabled: !!vaultAddress && vaultAddress !== zeroAddress && !!userAddress && userAddress !== zeroAddress,
            staleTime: DEFAULT_QUERY_STALE_TIME,
        },
    });

    const {
        data: currentYield,
        isLoading: currentYieldLoading,
        error: currentYieldError,
        queryKey: currentYieldQueryKey,
    } = useReadRobinStakingVaultGetCurrentUserYield({
        address: vaultAddress,
        args: [userAddress],
        query: {
            enabled: !!vaultAddress && vaultAddress !== zeroAddress && !!userAddress && userAddress !== zeroAddress,
            staleTime: DEFAULT_QUERY_STALE_TIME,
        },
    });

    const getUserBalances = () => {
        const vaultUserYes = vaultUserBalances?.[0] ?? 0n;
        const tokenUserYes = tokenUserBalances?.[0] ?? 0n;
        const vaultUserNo = vaultUserBalances?.[1] ?? 0n;
        const tokenUserNo = tokenUserBalances?.[1] ?? 0n;
        return { vaultUserYes, tokenUserYes, vaultUserNo, tokenUserNo };
    };

    const calculateUserInfo = () => {
        const { vaultUserYes, tokenUserYes, vaultUserNo, tokenUserNo } = getUserBalances();

        const yesPrice = BigInt(Math.round(Number(market.outcomePrices[0]) * UNDERYLING_PRECISION)) || 0n;
        const noPrice = BigInt(Math.round(Number(market.outcomePrices[1]) * UNDERYLING_PRECISION)) || 0n;

        const halfUnderlying = UNDERYLING_PRECISION_BIG_INT / 2n;
        const currentYesApyBps =
            (((halfUnderlying * UNDERYLING_PRECISION_BIG_INT) / yesPrice) * (vaultCurrentApy ?? 0n)) / UNDERYLING_PRECISION_BIG_INT;
        const currentNoApyBps =
            (((halfUnderlying * UNDERYLING_PRECISION_BIG_INT) / noPrice) * (vaultCurrentApy ?? 0n)) / UNDERYLING_PRECISION_BIG_INT;

        const userYesWorth = vaultUserYes * yesPrice;
        const userNoWorth = vaultUserNo * noPrice;
        const userYesApyBps = currentYesApyBps * userYesWorth;
        const userNoApyBps = currentNoApyBps * userNoWorth;
        const userResultingApyBps = (userYesApyBps + userNoApyBps) / ((userYesWorth || 1n) + (userNoWorth || 1n));

        const earningsPerDay =
            ((vaultUserYes * yesPrice + vaultUserNo * noPrice) * userResultingApyBps) / 10n ** BigInt(UNDERYLING_DECIMALS) / 10_000n / 365n;

        return {
            tokenUserYes,
            tokenUserNo,
            vaultUserYes,
            vaultUserNo,
            currentYesApyBps,
            currentNoApyBps,
            userResultingApyBps,
            earningsPerDay,
        };
    };

    return {
        vaultCurrentApy,
        vaultCurrentApyLoading,
        vaultCurrentApyError,
        vaultCurrentApyQueryKey,

        vaultUserBalances,
        vaultUserBalancesLoading,
        vaultUserBalancesError,
        vaultUserBalancesQueryKey,

        tokenUserBalances,
        tokenUserBalancesLoading,
        tokenUserBalancesError,
        tokenUserBalancesQueryKey,

        currentYield,
        currentYieldLoading,
        currentYieldError,
        currentYieldQueryKey,

        calculateUserInfo,
        getUserBalances,
    };
}
