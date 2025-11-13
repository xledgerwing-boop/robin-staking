import TopMetrics from '@/components/promo/TopMetrics';
import PotentialEarnings from '@/components/promo/PotentialEarnings';
import VaultCapacity from '@/components/promo/VaultCapacity';
import ManagePromoPositions from '@/components/promo/manage-promo-positions';
import Activities from '@/components/promo/Activities';
import FAQ from '@/components/promo/FAQ';

export default function PromoVaultPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="h-full container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Promotion Vault</h1>
                    <p className="text-muted-foreground text-lg">Stake your outcome tokens across eligible markets and earn USDC over time.</p>
                </div>
                <TopMetrics />
                <PotentialEarnings />
                <VaultCapacity />
                <ManagePromoPositions />
                <Activities />
                <FAQ />
            </div>
        </div>
    );
}
