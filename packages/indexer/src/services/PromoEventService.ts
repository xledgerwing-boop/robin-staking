import { ethers } from 'ethers';
import { DBService } from './DbService';
import { PromoActivityRow } from '@robin-pm-staking/common/types/promo-activity';
import { PromoVaultEventInfo } from '@robin-pm-staking/common/types/promo-events';
import { LogInfo } from './EventService';
import { logger } from '../utils/logger';
import { eventInfoToDb } from '@robin-pm-staking/common/lib/utils';

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
            type: parsedLog.name as unknown as PromoActivityRow['type'],
            userAddress: null,
            position: null,
            blockNumber: Number.parseInt(logInfo.blockNumber).toString(),
            info: eventInfoToDb(logData),
        };

        const existing = await this.dbService.getPromoActivity(activity.id);
        if (existing) {
            logger.warn(`Promo activity already exists: ${activity.id}`);
            return;
        }

        await this.dbService.insertPromoActivity(activity);
    }
}
