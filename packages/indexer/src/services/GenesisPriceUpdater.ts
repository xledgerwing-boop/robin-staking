import { ethers } from 'ethers';
import { DBService } from './DbService';
import { USED_CONTRACTS } from '@robin-pm-staking/common/src/constants';
import { robinGenesisVaultAbi } from '@robin-pm-staking/common/src/types/contracts-genesis';
import { NotificationService } from './NotificationService';
import { Knex } from 'knex';
import { MARKETS_TABLE } from '@robin-pm-staking/common/src/lib/repos';
import { fetchMarketsByConditionIds } from '@robin-pm-staking/common/src/lib/polymarket';
import { Market, MarketRow, MarketRowToMarket } from '@robin-pm-staking/common/types/market';

export class GenesisPriceUpdater {
    private db: DBService;
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;
    private checkIntervalMs = 10 * 60 * 1000; // 10 minutes
    private minEarlyUpdateGapMs = 15 * 60 * 1000; // 15 minutes
    private standardUpdateGapMs = 60 * 60 * 1000; // 60 minutes
    private running = false;

    constructor(db: DBService, rpcUrl: string, privateKey: string) {
        this.db = db;
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contract = new ethers.Contract(USED_CONTRACTS.GENESIS_VAULT, robinGenesisVaultAbi, this.wallet);
    }

    public start() {
        if (this.running) return;
        this.running = true;
        // kick once on start
        this.tick().catch(() => undefined);
        setInterval(() => this.tick().catch(() => undefined), this.checkIntervalMs);
    }

    private async tick() {
        try {
            const markets = await this.getGenesisMarketsOrdered(this.db.knex);
            if (markets.length === 0) return;

            // Build latest prices from Polymarket
            const conditionIds = markets.map(m => m.conditionId);
            const pmkts = await fetchMarketsByConditionIds(conditionIds);
            const conditionToPriceA: Record<string, bigint> = {};
            let anyClosed = false;
            for (const mk of pmkts) {
                // outcomePrices[0] is YES/first market price in frontend usage
                const p = Array.isArray((mk as any).outcomePrices) ? Number((mk as any).outcomePrices[0]) : 0.5;
                const priceA = BigInt(Math.round(p * 1_000_000));
                conditionToPriceA[(mk as any).conditionId?.toLowerCase?.() || (mk as any).conditionId] = priceA;
                if ((mk as any).closed === true) anyClosed = true;
            }
            if (anyClosed) {
                await NotificationService.sendNotification('One or more Polymarket markets appear resolved (closed=true).');
            }

            // Compose full price array aligned to genesisIndex order (including ended markets)
            const pricesA: bigint[] = [];
            const largeShift = this.detectLargeShift(markets, conditionToPriceA);
            const now = Date.now();
            const lastSubmittedAtMax = markets.reduce((acc, m) => {
                const t = m.genesisLastSubmittedAt ? Number(m.genesisLastSubmittedAt) : 0;
                return Math.max(acc, t);
            }, 0);
            const canStandard = now - lastSubmittedAtMax >= this.standardUpdateGapMs;
            const canEarly = now - lastSubmittedAtMax >= this.minEarlyUpdateGapMs && largeShift;
            if (!canStandard && !canEarly) {
                return;
            }

            for (const m of markets) {
                const cid = m.conditionId.toLowerCase();
                const fromApi = conditionToPriceA[cid];
                // fallback to last submitted if market missing in API (shouldn't happen), else mid price
                let priceA = fromApi ?? (m.genesisLastSubmittedPriceA ? BigInt(m.genesisLastSubmittedPriceA) : (BigInt(500_000) as bigint));
                pricesA.push(priceA);
            }

            // Submit batchUpdatePrices
            const iface = new ethers.Interface(robinGenesisVaultAbi as any);
            const tx = await this.wallet.sendTransaction({
                to: USED_CONTRACTS.GENESIS_VAULT,
                data: iface.encodeFunctionData('batchUpdatePrices', [pricesA]),
            });
            const receipt = await tx.wait();

            // Save last submitted prices + timestamps
            await this.saveSubmittedPrices(this.db.knex, markets, pricesA);

            // Notify with gas and balance
            const gasUsed = receipt?.gasUsed ? BigInt(receipt.gasUsed.toString()) : 0n;
            const effPrice = (receipt as any)?.effectiveGasPrice ? BigInt((receipt as any).effectiveGasPrice.toString()) : 0n;
            const costWei = gasUsed * effPrice;
            const balanceWei = await this.provider.getBalance(this.wallet.address);
            const costMatic = Number(ethers.formatEther(costWei));
            const balMatic = Number(ethers.formatEther(balanceWei));
            await NotificationService.sendNotification(
                `✅ Genesis price update submitted. Gas used: ${gasUsed.toString()} (≈ ${costMatic.toFixed(
                    6
                )} POL). Wallet balance: ${balMatic.toFixed(4)} POL.`
            );
        } catch (e: any) {
            await NotificationService.sendNotification(`❌ Genesis price update failed: ${(e && e.message) || String(e)}`);
        }
    }

    private detectLargeShift(markets: Market[], conditionToPriceA: Record<string, bigint>): boolean {
        for (const m of markets) {
            const prev = m.genesisLastSubmittedPriceA;
            const curr = conditionToPriceA[m.conditionId.toLowerCase()];
            if (prev == null || curr == null) continue;
            if (prev === 0n) return true;
            const diff = prev > curr ? prev - curr : curr - prev;
            // 10% shift threshold
            if (diff * 100n >= prev * 10n) return true;
        }
        return false;
    }

    private async getGenesisMarketsOrdered(knex: Knex): Promise<Market[]> {
        const rows = await knex(MARKETS_TABLE)
            .select<MarketRow[]>('genesisIndex', 'conditionId', 'genesisEndedAt', 'genesisLastSubmittedPriceA', 'genesisLastSubmittedAt')
            .whereNotNull('genesisIndex')
            .orderBy('genesisIndex', 'asc');
        return rows.map(MarketRowToMarket);
    }

    private async saveSubmittedPrices(knex: Knex, markets: Market[], prices: bigint[]) {
        const now = Date.now().toString();
        const updates = markets.map((m, i) =>
            knex(MARKETS_TABLE)
                .where({ genesisIndex: m.genesisIndex })
                .update({ genesisLastSubmittedPriceA: prices[i].toString(), genesisLastSubmittedAt: now })
        );
        await Promise.all(updates);
    }
}
