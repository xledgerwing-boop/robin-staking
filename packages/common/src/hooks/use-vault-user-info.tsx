import { DEFAULT_QUERY_STALE_TIME, UNDERYLING_DECIMALS, UNDERYLING_PRECISION, UNDERYLING_PRECISION_BIG_INT, USED_CONTRACTS } from '../constants';
import {
    useReadRobinStakingVaultGetCurrentApy,
    useReadRobinStakingVaultGetUserBalances,
    useReadConditionalTokensBalanceOfBatch,
    useReadRobinStakingVaultGetCurrentUserYield,
} from '../types/contracts';
import { Market, Outcome, ParsedPolymarketMarket } from '../types/market';
import { parseUnits, zeroAddress } from 'viem';
import { DateTime } from 'luxon';

export function useVaultUserInfo(vaultAddress: `0x${string}`, userAddress: `0x${string}`, market: ParsedPolymarketMarket | Market) {
    const {
        data: vaultCurrentApy,
        isLoading: vaultCurrentApyLoading,
        error: vaultCurrentApyError,
        queryKey: vaultCurrentApyQueryKey,
    } = useReadRobinStakingVaultGetCurrentApy({
        address: vaultAddress,
        args: [],
        query: {
            enabled: !!vaultAddress && vaultAddress !== zeroAddress,
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
    } = useReadConditionalTokensBalanceOfBatch({
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

    const getVaultApys = (yesPrice: bigint, noPrice: bigint) => {
        const halfUnderlying = UNDERYLING_PRECISION_BIG_INT / 2n;
        const currentYesApyBps =
            (((halfUnderlying * UNDERYLING_PRECISION_BIG_INT) / (yesPrice || 1n)) * (vaultCurrentApy ?? 0n)) / UNDERYLING_PRECISION_BIG_INT;
        const currentNoApyBps =
            (((halfUnderlying * UNDERYLING_PRECISION_BIG_INT) / (noPrice || 1n)) * (vaultCurrentApy ?? 0n)) / UNDERYLING_PRECISION_BIG_INT;
        return { currentYesApyBps, currentNoApyBps };
    };

    const calculateUserInfo = (yesPriceNum: number, noPriceNum: number) => {
        const { vaultUserYes, tokenUserYes, vaultUserNo, tokenUserNo } = getUserBalances();

        const yesPrice = BigInt(Math.round(Number(yesPriceNum) * UNDERYLING_PRECISION)) || 0n;
        const noPrice = BigInt(Math.round(Number(noPriceNum) * UNDERYLING_PRECISION)) || 0n;
        const { currentYesApyBps, currentNoApyBps } = getVaultApys(yesPrice, noPrice);

        const userYesWorth = vaultUserYes * yesPrice;
        const userNoWorth = vaultUserNo * noPrice;
        const userYesApyBps = currentYesApyBps * userYesWorth;
        const userNoApyBps = currentNoApyBps * userNoWorth;
        const userResultingApyBps = (userYesApyBps + userNoApyBps) / ((userYesWorth || 1n) + (userNoWorth || 1n));

        const earningsPerDay =
            ((vaultUserYes * yesPrice + vaultUserNo * noPrice) * userResultingApyBps) / UNDERYLING_PRECISION_BIG_INT / 10_000n / 365n;

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

    const calculateExpectedYield = (amount: string, side: Outcome, yesPriceNum: number, noPriceNum: number) => {
        const numAmount = parseUnits(amount, UNDERYLING_DECIMALS) || 0n;

        const yesPrice = BigInt(Math.round(Number(yesPriceNum) * UNDERYLING_PRECISION)) || 0n;
        const noPrice = BigInt(Math.round(Number(noPriceNum) * UNDERYLING_PRECISION)) || 0n;
        const { currentYesApyBps, currentNoApyBps } = getVaultApys(yesPrice, noPrice);
        const apy = side === Outcome.Yes ? currentYesApyBps : currentNoApyBps;
        const price = side === Outcome.Yes ? yesPrice : noPrice;

        const yieldPerDay = (numAmount * price * apy) / UNDERYLING_PRECISION_BIG_INT / 10_000n / 365n;

        const daysUntilResolution = DateTime.fromMillis(market.endDate ?? Date.now()).diff(DateTime.now(), 'days').days;
        const expectedYield = (yieldPerDay * BigInt(Math.round(daysUntilResolution * 100))) / 100n;
        return expectedYield;
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
        calculateExpectedYield,
    };
}
