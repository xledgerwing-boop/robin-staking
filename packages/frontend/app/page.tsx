'use client';

import { useState } from 'react';
import TopMetrics from '@/components/genesis/TopMetrics';
import PotentialEarnings from '@/components/genesis/PotentialEarnings';
import VaultCapacity from '@/components/genesis/VaultCapacity';
import ManageGenesisPositions from '@/components/genesis/manage-genesis-positions';
import Activities from '@/components/genesis/Activities';
import FAQ from '@/components/genesis/FAQ';
import AvailableMarkets from '@/components/genesis/AvailableMarkets';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { useIsXlScreen } from '@/hooks/use-xl-screen';

export default function GenesisVaultPage() {
    const [section, setSection] = useState<'faq' | 'activity' | 'markets'>('faq');
    const isXl = useIsXlScreen();
    return (
        <div className="min-h-screen bg-background">
            <div className="h-full container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-bold">Genesis Reward Vault</h1>
                        <Button variant="ghost" size="icon" asChild aria-label="View contract on explorer">
                            <a
                                href={`${USED_CONTRACTS.EXPLORER_URL}/address/${USED_CONTRACTS.GENESIS_VAULT}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View contract on explorer"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                    </div>
                    <p className="text-muted-foreground text-lg">Stake your outcome tokens across eligible markets and earn USDC over time.</p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start xl:mt-20">
                    <div className="xl:col-span-2 space-y-6">
                        <TopMetrics />
                        <VaultCapacity />
                        {!isXl && (
                            <div className="space-y-6">
                                <PotentialEarnings />
                                <ManageGenesisPositions />
                            </div>
                        )}
                        <div className="flex w-full items-center justify-start gap-8 border-b border-border mt-16 xl:mt-40">
                            <button
                                type="button"
                                onClick={() => setSection('faq')}
                                className={`relative pb-3 text-sm font-medium ${
                                    section === 'faq'
                                        ? 'text-foreground after:absolute after:left-0 after:bottom-[-1px] after:h-[2px] after:w-full after:bg-primary'
                                        : 'text-muted-foreground hover:text-foreground/80'
                                }`}
                            >
                                FAQ
                            </button>
                            <button
                                type="button"
                                onClick={() => setSection('activity')}
                                className={`relative pb-3 text-sm font-medium ${
                                    section === 'activity'
                                        ? 'text-foreground after:absolute after:left-0 after:bottom-[-1px] after:h-[2px] after:w-full after:bg-primary'
                                        : 'text-muted-foreground hover:text-foreground/80'
                                }`}
                            >
                                Activity
                            </button>
                            <button
                                type="button"
                                onClick={() => setSection('markets')}
                                className={`relative pb-3 text-sm font-medium ${
                                    section === 'markets'
                                        ? 'text-foreground after:absolute after:left-0 after:bottom-[-1px] after:h-[2px] after:w-full after:bg-primary'
                                        : 'text-muted-foreground hover:text-foreground/80'
                                }`}
                            >
                                Markets
                            </button>
                        </div>
                        <div className="">
                            {section === 'faq' && <FAQ />}
                            {section === 'activity' && <Activities />}
                            {section === 'markets' && <AvailableMarkets />}
                        </div>
                    </div>
                    {isXl && (
                        <div className="xl:col-span-1">
                            <PotentialEarnings />
                            <ManageGenesisPositions />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
