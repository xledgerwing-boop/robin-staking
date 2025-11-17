'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { USED_CONTRACTS, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/src/constants';
import { formatUnits, formatUnitsLocale } from '@robin-pm-staking/common/lib/utils';
import { useGenesisVaultInfo } from '@/hooks/use-genesis-vault-info';
import { useProxyAccount } from '@robin-pm-staking/common/src/hooks/use-proxy-account';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export default function VaultCapacity() {
    const VAULT = USED_CONTRACTS.GENESIS_VAULT as `0x${string}`;
    let { totalValueUsd, tvlCapUsd } = useGenesisVaultInfo(VAULT);
    const { proxyAddress, isConnected, isConnecting } = useProxyAccount();
    const [registeredUsd, setRegisteredUsd] = useState<bigint>(0n);
    const [loading, setLoading] = useState(false);

    const capReached = useMemo(() => (totalValueUsd ?? 0n) >= (tvlCapUsd ?? 0n) && (tvlCapUsd ?? 0n) > 0n, [totalValueUsd, tvlCapUsd]);
    const capPctBps = useMemo(() => (tvlCapUsd ? ((totalValueUsd ?? 0n) * 10_000n * 100n) / (tvlCapUsd ?? 1n) : 0n), [totalValueUsd, tvlCapUsd]);
    const overflowPct = useMemo(() => {
        if (!tvlCapUsd) return 0;
        const over = registeredUsd ? Number((registeredUsd * 100n) / tvlCapUsd) : 0;
        return Math.max(0, over);
    }, [registeredUsd, tvlCapUsd]);
    const extraBars = useMemo(() => {
        if (!tvlCapUsd || tvlCapUsd === 0n) return { full: 0, remainderPct: 0 };
        const full = Number(registeredUsd / tvlCapUsd);
        const rem = registeredUsd % tvlCapUsd;
        const remainderPct = Number((rem * 100n) / tvlCapUsd);
        return { full, remainderPct };
    }, [registeredUsd, tvlCapUsd]);

    useEffect(() => {
        const load = async () => {
            try {
                const resp = await fetch(`/api/genesis/interest?vault=${VAULT}`);
                const json = await resp.json();
                const v = BigInt(json?.registeredUsd ?? '0');
                setRegisteredUsd(v);
            } catch {
                setRegisteredUsd(0n);
            }
        };
        load();
    }, [VAULT, totalValueUsd?.toString()]);

    const onRegisterInterest = async () => {
        if (!isConnected || isConnecting || !proxyAddress) {
            toast.info('Connect wallet to register interest.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/genesis/interest/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proxyAddress, vaultAddress: VAULT }),
            });
            if (!res.ok) throw new Error('Failed to register');
            toast.success('Interest registered');
            // refresh registered interest
            const over = await fetch(`/api/genesis/interest?vault=${VAULT}`).then(r => r.json());
            setRegisteredUsd(BigInt(over?.registeredUsd ?? '0'));
        } catch (e) {
            toast.error('Failed to load registered interest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="">
            <div className="relative h-8 rounded-full bg-muted overflow-visible flex items-center">
                <div
                    className="absolute left-0 top-0 h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(Number(capPctBps / 10_000n), 100)}%` }}
                />
                <div className="relative z-10 w-full flex items-center justify-between px-2">
                    <span className="text-xs text-foreground/80">TVL Cap{capReached ? ' • Cap reached' : ''}</span>
                    <span className="text-xs font-medium">
                        ${formatUnitsLocale(totalValueUsd ?? 0n, UNDERYLING_DECIMALS, 0)} / $
                        {formatUnitsLocale(tvlCapUsd ?? 0n, UNDERYLING_DECIMALS, 0)} ({formatUnits(capPctBps, 4, 0)}%)
                    </span>
                </div>
            </div>
            {(extraBars.full > 0 || extraBars.remainderPct > 0) && (
                <div className="mt-2 space-y-1">
                    {Array.from({ length: extraBars.full }).map((_, i) => (
                        <div key={`extra-full-${i}`} className="relative h-2 rounded-full bg-muted">
                            <div className="absolute left-0 top-0 h-full w-full rounded-full bg-secondary" />
                        </div>
                    ))}
                    {extraBars.remainderPct > 0 && (
                        <div className="relative h-2 rounded-full bg-muted">
                            <div className="absolute left-0 top-0 h-full rounded-full bg-secondary" style={{ width: `${extraBars.remainderPct}%` }} />
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                        Registered interest: ${formatUnitsLocale(registeredUsd ?? 0n, UNDERYLING_DECIMALS, 0)}
                    </div>
                </div>
            )}
            {capReached && (
                <div className="mt-3">
                    <Button className="w-full" variant="outline" onClick={onRegisterInterest} disabled={loading}>
                        {loading ? 'Registering...' : 'Register Interest'}
                    </Button>
                </div>
            )}
        </div>
    );
}
