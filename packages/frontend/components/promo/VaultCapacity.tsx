'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function VaultCapacity() {
    const [tvlUsd, setTvlUsd] = useState<number>(0);
    const [tvlCapUsd] = useState<number>(100_000);
    const [capReached, setCapReached] = useState<boolean>(false);

    useEffect(() => {
        setTvlUsd(52_300);
        setCapReached(52_300 >= tvlCapUsd);
    }, [tvlCapUsd]);

    const tvlCapPct = useMemo(() => Math.min(100, Math.round((tvlUsd / tvlCapUsd) * 100)), [tvlUsd, tvlCapUsd]);

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-xl">Vault Capacity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">TVL Cap</span>
                    <span className="text-sm font-medium">
                        ${tvlUsd.toLocaleString()} / ${tvlCapUsd.toLocaleString()} ({tvlCapPct}%)
                    </span>
                </div>
                <Progress value={tvlCapPct} />
                {capReached && (
                    <div className="mt-3">
                        <Button className="w-full" variant="outline">
                            Register Interest
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
