'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { USED_CONTRACTS, UNDERYLING_DECIMALS } from '@robin-pm-staking/common/src/constants';
import { formatUnits, formatUnitsLocale } from '@robin-pm-staking/common/lib/utils';
import { useGenesisVaultInfo } from '@/hooks/use-genesis-vault-info';
import { useProxyAccount } from '@robin-pm-staking/common/src/hooks/use-proxy-account';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

export default function VaultCapacity() {
    const VAULT = USED_CONTRACTS.GENESIS_VAULT as `0x${string}`;
    const { totalValueUsd, tvlCapUsd } = useGenesisVaultInfo(VAULT);
    const { proxyAddress, isConnected, isConnecting } = useProxyAccount();
    const [registeredUsd, setRegisteredUsd] = useState<bigint>(0n);
    const [loading, setLoading] = useState(false);

    const capReached = useMemo(() => {
        if (!tvlCapUsd || tvlCapUsd === 0n) return false;
        const fiftyCents = 500_000n; // 0.5 USD in 6 decimals
        const threshold = tvlCapUsd > fiftyCents ? tvlCapUsd - fiftyCents : 0n;
        return (totalValueUsd ?? 0n) >= threshold;
    }, [totalValueUsd, tvlCapUsd]);
    const capPctBps = useMemo(() => (tvlCapUsd ? ((totalValueUsd ?? 0n) * 10_000n * 100n) / (tvlCapUsd ?? 1n) : 0n), [totalValueUsd, tvlCapUsd]);

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
            <Progress value={Number(capPctBps / 10_000n)} className="h-8" />
            <div className="w-full flex items-center justify-between px-2 mt-1">
                <span className="text-sm text-foreground/80">TVL Cap{capReached ? ' • Cap reached' : ''}</span>
                <span className="text-sm font-medium">
                    ${formatUnitsLocale(totalValueUsd ?? 0n, UNDERYLING_DECIMALS, 1)} of ${formatUnitsLocale(tvlCapUsd ?? 0n, UNDERYLING_DECIMALS, 0)}{' '}
                    ({formatUnits(capPctBps, 4, 0)}%)
                </span>
            </div>
            {(registeredUsd > 0n || capReached) && (
                <div className="w-[50%] lg:w-[20%] mx-auto">
                    <p className="text-sm text-muted-foreground text-center mt-3">Registered interest</p>
                    <div className="text-2xl font-bold text-center">${formatUnitsLocale(registeredUsd, UNDERYLING_DECIMALS, 0)}</div>
                    {capReached && (
                        <div className="mt-3">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Button className="w-full" variant="secondary" onClick={onRegisterInterest} disabled={loading}>
                                    {loading ? 'Registering...' : 'Register Interest'}
                                </Button>
                                <div className="relative inline-flex items-center group">
                                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                    <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-48 -translate-x-1/2 whitespace-normal rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md group-hover:block">
                                        This will log your stakeable portfolio value to show popularity of the vault
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
