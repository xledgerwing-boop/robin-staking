import OutcomeToken from '@robin-pm-staking/common/components/outcome-token';
import { UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';
import { formatUnits } from '@robin-pm-staking/common/lib/utils';
import { Market, Outcome, ParsedPolymarketMarket } from '@robin-pm-staking/common/types/market';

//Use ParsedPolymarketMarket if the result has been reported to COnditionalTokens, but the vault hasn't been finalized yet.
export default function MarketResult({
    market,
    vaultUserBalances,
}: {
    market: Market | ParsedPolymarketMarket;
    vaultUserBalances: readonly [bigint, bigint] | undefined;
}) {
    const winner = market.winningPosition;
    const userWinningTokens =
        winner === Outcome.Yes
            ? vaultUserBalances?.[0] ?? 0n
            : winner === Outcome.No
            ? vaultUserBalances?.[1] ?? 0n
            : winner === Outcome.Both
            ? (vaultUserBalances?.[0] ?? 0n) + (vaultUserBalances?.[1] ?? 0n)
            : 0n;

    return winner ? (
        <div className="w-full flex justify-around items-center">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Outcome</p>
                <span className="text-lg font-bold">
                    <OutcomeToken outcome={winner} symbolHolder={market} />
                </span>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Your Winnings</p>
                <span className="text-lg font-bold">${formatUnits(userWinningTokens, UNDERYLING_DECIMALS)}</span>
            </div>
        </div>
    ) : null;
}
