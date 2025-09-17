'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';
import { useState } from 'react';
import { MarketWithEvent } from '@/types/market';

export default function InitializeMarketCard({ market }: { market: MarketWithEvent }) {
    const [isInitializing, setIsInitializing] = useState(false);

    const handleInitialize = async () => {
        setIsInitializing(true);
        try {
            // TODO: Integrate initialization action (contract call / API)
            await new Promise(r => setTimeout(r, 800));
        } finally {
            setIsInitializing(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span>Initialize Market Vault</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Create this market vault on-chain to start depositing tokens</p>
                <Button className="w-full" onClick={handleInitialize} disabled={isInitializing}>
                    <Rocket className="w-4 h-4 mr-2" />
                    {isInitializing ? 'Initializing…' : 'Initialize'}
                </Button>
            </CardContent>
        </Card>
    );
}
