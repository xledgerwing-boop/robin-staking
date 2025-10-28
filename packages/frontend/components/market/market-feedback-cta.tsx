import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';

export function MarketFeedbackCta({ updateEligible = false }: { updateEligible?: boolean }) {
    const [eligible, setEligible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { proxyAddress, address, isConnected } = useProxyAccount();

    useEffect(() => {
        const run = async () => {
            if (!isConnected || !address) {
                setEligible(false);
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await fetch(`/api/rewards?address=${address}`);
                const data = (await res.json()) as { points: number; hasSubmittedFeedback: boolean };
                if (data.hasSubmittedFeedback) {
                    setEligible(false);
                } else if (proxyAddress) {
                    const elig = await fetch(`/api/rewards/eligibility?proxyAddress=${proxyAddress}`);
                    const ejson = (await elig.json()) as { hasDeposit: boolean };
                    setEligible(ejson.hasDeposit);
                } else {
                    setEligible(false);
                }
            } catch {
                setEligible(false);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [isConnected, address, proxyAddress, updateEligible]);

    if (loading || !eligible) return null;

    return (
        <Card className={`pmx-gradient-border mt-6`}>
            <div className={`pmx-gradient-inner`}>
                <CardContent className="p-3">
                    <div className="mb-2">
                        <div className="font-medium">Give feedback to earn rewards</div>
                        <div className="text-sm text-muted-foreground">Earn 100 points by submitting a feedback form.</div>
                    </div>
                    <Link href="/rewards/feedback" className="text-primary font-medium hover:underline">
                        Go to form
                    </Link>
                </CardContent>
            </div>
        </Card>
    );
}
