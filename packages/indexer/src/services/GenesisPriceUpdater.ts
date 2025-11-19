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
    private iface: ethers.Interface;
    private checkIntervalMs = 10 * 60 * 1000; // 10 minutes
    private minEarlyUpdateGapMs = 15 * 60 * 1000; // 15 minutes
    private standardUpdateGapMs = 4 * 60 * 60 * 1000; // 4 hours
    private resolvedNotificationCooldownMs = 60 * 60 * 1000; // 1 hour
    private largePriceShiftThresholdBps = 500; // 5% (500 basis points)
    private resolvedMarketNotifications = new Map<string, number>(); // conditionId -> last notification timestamp
    private running = false;

    constructor(db: DBService, rpcUrl: string, privateKey: string) {
        this.db = db;
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.iface = new ethers.Interface(robinGenesisVaultAbi);
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
            const now = Date.now();
            for (const mk of pmkts) {
                // outcomePrices[0] is YES/first market price in frontend usage
                const p = mk.outcomePrices?.[0];
                const priceA = p ? BigInt(Math.round(Number.parseFloat(p) * UNDERYLING_PRECISION)) : undefined;
                const conditionId = mk.conditionId.toLowerCase();
                conditionToPriceA[conditionId] = priceA;
                const dbMarket = markets.find(m => m.conditionId.toLowerCase() === conditionId);
                if (mk.closed && dbMarket?.genesisEndedAt == null) {
                    //only notify if not notified in the last hour
                    const lastNotified = this.resolvedMarketNotifications.get(conditionId);
                    if (lastNotified == null || now - lastNotified >= this.resolvedNotificationCooldownMs) {
                        closedMarkets.push(mk);
                        this.resolvedMarketNotifications.set(conditionId, now);
                    }
                }
            }

            if (closedMarkets.length > 0) {
                await NotificationService.sendNotification(
                    `One or more Polymarket markets appear resolved (closed=true):\n ${closedMarkets.map(m => m.question).join('\n')}`
                );
            }

            // Check for regular update (using minimum last update time)
            const lastSubmittedAtMin = markets.reduce((acc, m) => {
                const t = m.genesisLastSubmittedAt ?? 0;
                return acc === null || t < acc ? t : acc;
            }, null as number | null);
            const canStandard = lastSubmittedAtMin !== null && now - lastSubmittedAtMin >= this.standardUpdateGapMs;

            if (canStandard) {
                await this.handleStandardUpdate(markets, conditionToPriceA, false);
                return;
            }

            // Detect markets with large price shifts
            const marketsWithLargeShift = this.detectLargeShiftMarkets(markets, conditionToPriceA);
            const largeShiftCount = marketsWithLargeShift.length;
            if (largeShiftCount === 0) return;

            const canEarlyBatch = largeShiftCount >= 5 && now - (lastSubmittedAtMin ?? 0) >= this.minEarlyUpdateGapMs;
            if (canEarlyBatch) {
                await this.handleStandardUpdate(markets, conditionToPriceA, true);
                return;
            }

            // Check if we can do early individual updates (only if next regular update is far enough away)
            const nextRegularUpdateTime = lastSubmittedAtMin !== null ? lastSubmittedAtMin + this.standardUpdateGapMs : now;
            const canEarlyIndividual = nextRegularUpdateTime - now > this.minEarlyUpdateGapMs;

            if (canEarlyIndividual && largeShiftCount < 5) {
                await this.handleIndividualUpdate(marketsWithLargeShift);
            }
        } catch (e: any) {
            await NotificationService.sendNotification(`❌ Genesis price update failed: ${(e && e.message) || String(e)}`);
        }
    }

    private async handleStandardUpdate(markets: Market[], conditionToPriceA: Record<string, bigint | undefined>, largeShift: boolean) {
        // Regular batch update for all markets
        const pricesA: bigint[] = [];
        for (const m of markets) {
            const cid = m.conditionId.toLowerCase();
            const fromApi = conditionToPriceA[cid];
            // fallback to last submitted if market missing in API (shouldn't happen), else mid price
            let priceA = fromApi ?? m.genesisLastSubmittedPriceA ?? 500_000n;
            pricesA.push(priceA);
        }

        const tx = await this.wallet.sendTransaction({
            to: USED_CONTRACTS.GENESIS_VAULT,
            data: this.iface.encodeFunctionData('batchUpdatePrices', [pricesA]),
        });
        const receipt = await tx.wait();
        const totalGasUsed = receipt?.gasUsed ?? 0n;
        const effPrice = receipt?.gasPrice ?? 0n;
        const totalCostWei = totalGasUsed * effPrice;
        const costMatic = Number(ethers.formatEther(totalCostWei));
        const balanceWei = await this.provider.getBalance(this.wallet.address);
        const balMatic = Number(ethers.formatEther(balanceWei));
        await NotificationService.sendNotification(`Wallet balance: ${balMatic.toFixed(2)} POL.`);

        // Save last submitted prices + timestamps
        await this.saveSubmittedPrices(this.db.knex, markets, pricesA);

        await NotificationService.sendNotification(
            `✅ Genesis price update submitted${
                largeShift ? ' (due to LARGE PRICE SHIFT)' : ''
            }. Gas used: ${totalGasUsed.toString()} (≈ ${costMatic.toFixed(2)} POL). Wallet balance: ${balMatic.toFixed(2)} POL.`
        );
    }

    private async handleIndividualUpdate(marketsWithLargeShift: Array<{ market: Market; newPriceA: bigint }>) {
        // Update individual markets with large shifts
        let totalGasUsed = 0n;
        let totalCostWei = 0n;
        for (const { market, newPriceA } of marketsWithLargeShift) {
            const tx = await this.wallet.sendTransaction({
                to: USED_CONTRACTS.GENESIS_VAULT,
                data: this.iface.encodeFunctionData('updateMarketPrice', [market.genesisIndex, newPriceA]),
            });
            const receipt = await tx.wait();
            const gasUsed = receipt?.gasUsed ?? 0n;
            const effPrice = receipt?.gasPrice ?? 0n;
            totalGasUsed += gasUsed;
            totalCostWei += gasUsed * effPrice;

            // Update the specific market's price in DB
            await this.saveSubmittedPriceForMarket(this.db.knex, market, newPriceA);
        }

        const costMatic = Number(ethers.formatEther(totalCostWei));
        const balanceWei = await this.provider.getBalance(this.wallet.address);
        const balMatic = Number(ethers.formatEther(balanceWei));
        await NotificationService.sendNotification(
            `✅ Genesis price update: ${
                marketsWithLargeShift.length
            } market(s) updated (due to LARGE PRICE SHIFT). Gas used: ${totalGasUsed.toString()} (≈ ${costMatic.toFixed(
                2
            )} POL). Wallet balance: ${balMatic.toFixed(2)} POL.`
        );
    }

    private detectLargeShiftMarkets(
        markets: Market[],
        conditionToPriceA: Record<string, bigint | undefined>
    ): Array<{ market: Market; newPriceA: bigint }> {
        const result: Array<{ market: Market; newPriceA: bigint }> = [];
        const now = Date.now();
        for (let i = 0; i < markets.length; i++) {
            const m = markets[i];
            if (m.genesisIndex == null) continue; // Skip if no genesisIndex
            const prev = m.genesisLastSubmittedPriceA;
            const curr = conditionToPriceA[m.conditionId.toLowerCase()];
            if (curr == null) continue;
            if (prev === 0n || prev == null) {
                result.push({ market: m, newPriceA: curr });
                continue;
            }
            const diff = prev > curr ? prev - curr : curr - prev;
            const isLargeShift = diff * 10_000n >= prev * BigInt(this.largePriceShiftThresholdBps);
            const reachedTimeThreshold = now - (m.genesisLastSubmittedAt ?? 0) >= this.minEarlyUpdateGapMs;
            // 5% shift threshold (500 basis points)
            if (isLargeShift && reachedTimeThreshold) {
                result.push({ market: m, newPriceA: curr });
            }
        }
        return result;
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

    private async saveSubmittedPriceForMarket(knex: Knex, market: Market, priceA: bigint) {
        const now = Date.now().toString();
        await knex(MARKETS_TABLE)
            .where({ genesisIndex: market.genesisIndex })
            .update({ genesisLastSubmittedPriceA: priceA.toString(), genesisLastSubmittedAt: now });
    }
}
