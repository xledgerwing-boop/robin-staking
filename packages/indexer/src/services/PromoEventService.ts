import { ethers } from 'ethers';
import { DBService } from './DbService';
import { PromoActivityRow, PromoActivityType } from '@robin-pm-staking/common/types/promo-activity';
import {
    ClaimEvent,
    PromoDepositEvent,
    PromoVaultEventInfo,
    PromoWithdrawEvent,
    PromoVaultEvent,
    MarketAddedEvent,
    MarketEndedEvent,
} from '@robin-pm-staking/common/types/promo-events';
import { LogInfo } from './EventService';
import { logger } from '../utils/logger';
import { eventInfoToDb } from '@robin-pm-staking/common/lib/utils';
import { getAndSaveEventAndMarkets } from '@robin-pm-staking/common/lib/repos';

export class PromoEventService {
    private dbService: DBService;

    constructor(postgresUri: string) {
        this.dbService = DBService.getInstance(postgresUri);
    }

    public async handlePromoEvent(logInfo: LogInfo, logData: PromoVaultEventInfo, parsedLog: ethers.LogDescription) {
        const vaultAddress = logInfo.address.toLowerCase();
        const activity: PromoActivityRow = {
            id: logInfo.transactionHash + logInfo.logIndex.toString(),
            transactionHash: logInfo.transactionHash,
            vaultAddress,
            timestamp: Number.parseInt(logInfo.timestamp).toString(),
            type: parsedLog.name as PromoActivityType,
            userAddress: null,
            position: null,
            blockNumber: Number.parseInt(logInfo.blockNumber).toString(),
            info: eventInfoToDb(logData),
        };

        if (activity.type === PromoVaultEvent.Deposit) {
            const d = logData as PromoDepositEvent;
            activity.userAddress = d.user.toLowerCase();
            // Optionally adjust promo interest (remainingUsd) for this user if present
            try {
                await this.dbService.updateUserPromoInterest({
                    vaultAddress: vaultAddress,
                    userAddress: d.user.toLowerCase(),
                    totalTokens: d.totalTokens,
                    totalUsd: d.totalUsd,
                    eligibleUsd: d.eligibleUsd,
                });
            } catch (e) {
                logger.warn('Failed to update user promo interest on deposit', e);
            }
        } else if (activity.type === PromoVaultEvent.Withdraw) {
            activity.userAddress = (logData as PromoWithdrawEvent).user.toLowerCase();
        } else if (activity.type === PromoVaultEvent.Claim) {
            activity.userAddress = (logData as ClaimEvent).user.toLowerCase();
        } else if (activity.type === PromoVaultEvent.MarketAdded) {
            const d = logData as MarketAddedEvent;
            // Ensure market exists by conditionId (may not be in DB yet)
            const conditionId = d.conditionId.toLowerCase();
            const existingMarket = await this.dbService.getMarket(conditionId);
            if (!existingMarket) {
                await getAndSaveEventAndMarkets(this.dbService.knex, undefined, conditionId);
            }
            await this.dbService.updateMarket(conditionId, {
                promotionIndex: Number(d.index),
                eligible: d.extraEligible,
                promoStartedAt: Number.parseInt(logInfo.timestamp).toString(),
            });
        } else if (activity.type === PromoVaultEvent.MarketEnded) {
            const d = logData as MarketEndedEvent;
            await this.dbService.updateMarketPromotionOnEnded({
                index: Number(d.index),
                endedAt: BigInt(logInfo.timestamp),
            });
        }

        const existing = await this.dbService.getPromoActivity(activity.id);
        if (existing) {
            logger.warn(`Promo activity already exists: ${activity.id}`);
            return;
        }

        await this.dbService.insertPromoActivity(activity);
    }
}
