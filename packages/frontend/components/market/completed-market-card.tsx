'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck, Coins, Sprout } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MarketWithEvent } from '@/types/market';
import OutcomeToken from './outcome-token';

type UserPosition = {
    yesTokens: string;
    noTokens: string;
    earnedYield: string; // formatted like $50.50
};

export default function CompletedMarketCard({ market, userPosition }: { market: MarketWithEvent; userPosition: UserPosition }) {
    const [winner, setWinner] = useState<'yes' | 'no' | null>('yes');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);

    const redemptionAmountUsd = useMemo(() => {
        if (!winner) return 0;
        const yesCount = parseNumber(userPosition.yesTokens);
        const noCount = parseNumber(userPosition.noTokens);
        const tokens = winner === 'yes' ? yesCount : noCount;
        // Winner shares redeem 1:1 for USDC in $ terms
        return tokens;
    }, [userPosition.noTokens, userPosition.yesTokens, winner]);

    const earnedYieldUsd = useMemo(() => parseCurrency(userPosition.earnedYield), [userPosition.earnedYield]);

    const handleRedeem = async () => {
        setIsRedeeming(true);
        try {
            // TODO: integrate smart contract call to redeem winning shares to USDC
            await new Promise(r => setTimeout(r, 800));
        } finally {
            setIsRedeeming(false);
        }
    };

    const handleHarvest = async () => {
        setIsHarvesting(true);
        try {
            // TODO: integrate yield harvest call
            await new Promise(r => setTimeout(r, 800));
        } finally {
            setIsHarvesting(false);
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
            <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Winning Token</div>
                        <OutcomeToken isYes={winner === 'yes'} className="text-lg font-semibold" />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">Redemption (USDC)</div>
                        <div className="text-lg font-semibold text-primary">${formatNumber(redemptionAmountUsd)}</div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">Earned Yield</div>
                        <div className="text-lg font-semibold text-primary">${formatNumber(earnedYieldUsd)}</div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                    <Button onClick={handleRedeem} disabled={!winner || redemptionAmountUsd <= 0 || isRedeeming} className="w-full">
                        <Coins className="w-4 h-4 mr-1" />
                        {isRedeeming ? 'Redeeming…' : 'Redeem Winning Tokens'}
                    </Button>
                    <Button onClick={handleHarvest} variant="secondary" disabled={earnedYieldUsd <= 0 || isHarvesting} className="w-full">
                        <Sprout className="w-4 h-4 mr-1" />
                        {isHarvesting ? 'Harvesting…' : `Harvest Yield`}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function parseNumber(input: string): number {
    const sanitized = input.replace(/[$,]/g, '').trim();
    const n = Number.parseFloat(sanitized);
    return Number.isFinite(n) ? n : 0;
}

function parseCurrency(input: string): number {
    return parseNumber(input);
}

function formatNumber(n: number): string {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
