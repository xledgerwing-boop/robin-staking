import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { useWriteRobinStakingVaultFinalizeMarket } from '@robin-pm-staking/common/types/contracts';
import { Market, ParsedPolymarketMarket } from '@robin-pm-staking/common/types/market';
import { CircleCheck, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import useProxyContractInteraction from '@robin-pm-staking/common/hooks/use-proxy-contract-interaction';
import { getErrorMessage } from '@robin-pm-staking/common/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useVaultUserInfo } from '@robin-pm-staking/common/hooks/use-vault-user-info';
import MarketResult from './market-result';

export default function EndedMarketActions({
    market,
    polymarketMarket,
    onFinalized,
}: {
    market: Market;
    polymarketMarket: ParsedPolymarketMarket;
    onFinalized: () => void;
}) {
    const { isConnected, proxyAddress } = useProxyAccount();

    const { vaultUserBalances } = useVaultUserInfo(market.contractAddress as `0x${string}`, proxyAddress as `0x${string}`, market);

    const {
        write: finalizeVault,
        isLoading: finalizeVaultLoading,
        promise: finalizeVaultPromise,
    } = useProxyContractInteraction([useWriteRobinStakingVaultFinalizeMarket]);

    const handleFinalizeVault = async () => {
        try {
            if (!isConnected) throw new Error('Wallet not connected');

            await finalizeVault({
                address: market.contractAddress as `0x${string}`,
                args: [],
                hookIndex: 0,
            });
            await finalizeVaultPromise.current;
            onFinalized();
        } catch (error) {
            toast.error('Failed to finalize vault' + getErrorMessage(error));
            console.error(error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CircleCheck className="w-5 h-5 text-primary" />
                    <span>Market Resolved</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Finalize market to enable redemption and harvesting.</p>
                <MarketResult market={polymarketMarket} vaultUserBalances={vaultUserBalances} />
                <Button className="w-full mt-2" onClick={handleFinalizeVault} disabled={finalizeVaultLoading}>
                    {finalizeVaultLoading && <Loader className="w-4 h-4 animate-spin" />}
                    Finalize market
                </Button>
            </CardContent>
        </Card>
    );
}
