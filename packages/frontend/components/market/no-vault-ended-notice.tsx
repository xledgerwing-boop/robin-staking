import { ParsedPolymarketMarket } from '@robin-pm-staking/common/types/market';
import { Card, CardTitle, CardContent, CardHeader } from '../ui/card';
import OutcomeToken from '@robin-pm-staking/common/components/outcome-token';

export default function NoVaultEndedNotice({ polymarketMarket }: { polymarketMarket: ParsedPolymarketMarket }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <span>Market Resolved</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Outcome</p>
                    <span className="text-lg font-bold">
                        <OutcomeToken outcome={polymarketMarket.winningPosition} symbolHolder={polymarketMarket} className="w-full justify-center" />
                    </span>
                </div>
                <div className="text-sm mt-2">No tokens were staked on this market.</div>
            </CardContent>
        </Card>
    );
}
