import { WalletMinimal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MarketWithEvent, ParsedPolymarketMarket } from '@robin-pm-staking/common/types/market';
import { UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';
import { formatUnits } from '@robin-pm-staking/common/lib/utils';
import { useVaultUserInfo } from '@robin-pm-staking/common/hooks/use-vault-user-info';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { ValueState } from '../value-state';

export default function UserPosition({ market, polymarketMarket }: { market: MarketWithEvent; polymarketMarket: ParsedPolymarketMarket }) {
    const { proxyAddress } = useProxyAccount();

    const {
        vaultCurrentApyLoading,
        vaultCurrentApyError,

        vaultUserBalancesLoading,
        vaultUserBalancesError,

        tokenUserBalancesLoading,
        tokenUserBalancesError,

        currentYield,
        currentYieldLoading,
        currentYieldError,

        calculateUserInfo,
    } = useVaultUserInfo(market.contractAddress as `0x${string}`, proxyAddress as `0x${string}`, market);

    const { vaultUserYes, vaultUserNo, userResultingApyBps, earningsPerDay } = calculateUserInfo(
        Number(polymarketMarket.outcomePrices[0]),
        Number(polymarketMarket.outcomePrices[1])
    );

    const loading = vaultUserBalancesLoading || tokenUserBalancesLoading || vaultCurrentApyLoading || currentYieldLoading;

    const userYes = `${formatUnits(vaultUserYes, UNDERYLING_DECIMALS)}`;
    const userNo = `${formatUnits(vaultUserNo, UNDERYLING_DECIMALS)}`;
    const earningsPerDayString = formatUnits(earningsPerDay, UNDERYLING_DECIMALS);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <WalletMinimal className="w-5 h-5" />
                    <span>Your Position</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{market.outcomes[0]} Tokens</p>
                        <span className="text-lg font-bold">
                            <ValueState value={userYes} loading={loading} error={!!vaultUserBalancesError || !!tokenUserBalancesError} />
                        </span>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{market.outcomes[1]} Tokens</p>
                        <span className="text-lg font-bold">
                            <ValueState value={userNo} loading={loading} error={!!vaultUserBalancesError || !!tokenUserBalancesError} />
                        </span>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Earned Yield</p>
                        <span className="text-lg font-bold text-primary">
                            <ValueState value={formatUnits(currentYield ?? 0n, UNDERYLING_DECIMALS)} loading={loading} error={!!currentYieldError} />$
                        </span>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Earning</p>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-lg font-bold text-primary">
                                ~
                                <ValueState value={(Number(userResultingApyBps) / 100).toFixed(1)} loading={loading} error={!!vaultCurrentApyError} />
                                % APY
                            </span>
                            <span className="text-xs text-muted-foreground">
                                <ValueState value={earningsPerDayString} loading={loading} error={!!currentYieldError} /> $ / day
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
