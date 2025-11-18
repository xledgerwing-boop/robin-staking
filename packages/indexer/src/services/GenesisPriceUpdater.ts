import { ethers } from 'ethers';
import { DBService } from './DbService';
import { UNDERYLING_PRECISION, USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { robinGenesisVaultAbi } from '@robin-pm-staking/common/types/contracts-genesis';
import { NotificationService } from './NotificationService';
import { Knex } from 'knex';
import { MARKETS_TABLE } from '@robin-pm-staking/common/lib/repos';
import { fetchMarketsByConditionIds } from '@robin-pm-staking/common/lib/polymarket';
import { Market, MarketRow, MarketRowToMarket, ParsedPolymarketMarket, parsePolymarketMarket } from '@robin-pm-staking/common/types/market';

export class GenesisPriceUpdater {
    private db: DBService;
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private checkIntervalMs = 10 * 60 * 1000; // 10 minutes
    private minEarlyUpdateGapMs = 15 * 60 * 1000; // 15 minutes
    private standardUpdateGapMs = 4 * 60 * 60 * 1000; // 4 hours
    private running = false;

    constructor(db: DBService, rpcUrl: string, privateKey: string) {
        this.db = db;
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
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
            const pmkts = (await fetchMarketsByConditionIds(conditionIds)).map(m => parsePolymarketMarket(m));
            if (pmkts.length != conditionIds.length) {
                await NotificationService.sendNotification(
                    `❌ Genesis price update failed: Missing Polymarket markets: ${conditionIds
                        .filter(id => !pmkts.some(m => m.conditionId.toLowerCase() === id.toLowerCase()))
                        .join(', ')}`
                );
                return;
            }
            const conditionToPriceA: Record<string, bigint | undefined> = {};
            const closedMarkets: ParsedPolymarketMarket[] = [];
            for (const mk of pmkts) {
                // outcomePrices[0] is YES/first market price in frontend usage
                const p = mk.outcomePrices?.[0];
                const priceA = p ? BigInt(Math.round(Number.parseFloat(p) * UNDERYLING_PRECISION)) : undefined;
                conditionToPriceA[mk.conditionId.toLowerCase()] = priceA;
                if (mk.closed) closedMarkets.push(mk);
            }
            if (closedMarkets.length > 0) {
                await NotificationService.sendNotification(
                    `One or more Polymarket markets appear resolved (closed=true): ${closedMarkets.map(m => m.question).join(', ')}`
                );
            }

            // Compose full price array aligned to genesisIndex order (including ended markets)
            const pricesA: bigint[] = [];
            const largeShift = this.detectLargeShift(markets, conditionToPriceA);
            const now = Date.now();
            const lastSubmittedAtMax = markets.reduce((acc, m) => {
                const t = m.genesisLastSubmittedAt ?? 0;
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
                let priceA = fromApi ?? m.genesisLastSubmittedPriceA ?? 500_000n;
                pricesA.push(priceA);
            }

            // Submit batchUpdatePrices
            const iface = new ethers.Interface(robinGenesisVaultAbi);
            const tx = await this.wallet.sendTransaction({
                to: USED_CONTRACTS.GENESIS_VAULT,
                data: iface.encodeFunctionData('batchUpdatePrices', [pricesA]),
            });
            const receipt = await tx.wait();

            // Save last submitted prices + timestamps
            await this.saveSubmittedPrices(this.db.knex, markets, pricesA);

            // Notify with gas and balance
            const gasUsed = receipt?.gasUsed ?? 0n;
            const effPrice = receipt?.gasPrice ?? 0n;
            const costWei = gasUsed * effPrice;
            const balanceWei = await this.provider.getBalance(this.wallet.address);
            const costMatic = Number(ethers.formatEther(costWei));
            const balMatic = Number(ethers.formatEther(balanceWei));
            await NotificationService.sendNotification(
                `✅ Genesis price update submitted${
                    canEarly ? ' (due to LARGE PRICE SHIFT)' : ''
                }. Gas used: ${gasUsed.toString()} (≈ ${costMatic.toFixed(2)} POL). Wallet balance: ${balMatic.toFixed(2)} POL.`
            );
        } catch (e: any) {
            await NotificationService.sendNotification(`❌ Genesis price update failed: ${(e && e.message) || String(e)}`);
        }
    }

    private detectLargeShift(markets: Market[], conditionToPriceA: Record<string, bigint | undefined>): boolean {
        for (const m of markets) {
            const prev = m.genesisLastSubmittedPriceA;
            const curr = conditionToPriceA[m.conditionId.toLowerCase()];
            if (curr == null) continue;
            if (prev === 0n || prev == null) return true;
            const diff = prev > curr ? prev - curr : curr - prev;
            // 10% shift threshold
            if (diff * 100n >= prev * 10n) return true;
        }
        return false;
    }

    private async getGenesisMarketsOrdered(knex: Knex): Promise<Market[]> {
        const rows = await knex<MarketRow>(MARKETS_TABLE).whereNotNull('genesisIndex').orderBy('genesisIndex', 'asc');
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
