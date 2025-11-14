'use client';

import { useState } from 'react';
import TopMetrics from '@/components/promo/TopMetrics';
import PotentialEarnings from '@/components/promo/PotentialEarnings';
import VaultCapacity from '@/components/promo/VaultCapacity';
import ManagePromoPositions from '@/components/promo/manage-promo-positions';
import Activities from '@/components/promo/Activities';
import FAQ from '@/components/promo/FAQ';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { useIsXlScreen } from '@/hooks/use-xl-screen';

export default function PromoVaultPage() {
    const [section, setSection] = useState<'faq' | 'activity'>('faq');
    const isXl = useIsXlScreen();
    return (
        <div className="min-h-screen bg-background">
            <div className="h-full container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-bold">Genesis Reward Vault</h1>
                        <Button variant="ghost" size="icon" asChild aria-label="View contract on explorer">
                            <a
                                href={`${USED_CONTRACTS.EXPLORER_URL}/address/${USED_CONTRACTS.PROMOTION_VAULT}`}
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
                                <ManagePromoPositions />
                            </div>
                        )}
                        <div className="flex w-full items-center justify-start gap-8 border-b border-border mt-40">
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
                        </div>
                        <div className="pt-4">{section === 'faq' ? <FAQ /> : <Activities />}</div>
                    </div>
                    {isXl && (
                        <div className="xl:col-span-1">
                            <PotentialEarnings />
                            <ManagePromoPositions />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
