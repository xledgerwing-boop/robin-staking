import { ethers } from 'ethers';
import { DBService } from './DbService';
import { GenesisActivityRow, GenesisActivityType } from '@robin-pm-staking/common/types/genesis-activity';
import {
    ClaimEvent,
    GenesisDepositEvent,
    GenesisVaultEventInfo,
    GenesisWithdrawEvent,
    GenesisVaultEvent,
    MarketAddedEvent,
    MarketEndedEvent,
    GenesisBatchDepositEvent,
    GenesisBatchWithdrawEvent,
} from '@robin-pm-staking/common/types/genesis-events';
import { LogInfo } from './EventService';
import { logger } from '../utils/logger';
import { eventInfoToDb } from '@robin-pm-staking/common/lib/utils';
import { getAndSaveEventAndMarkets } from '@robin-pm-staking/common/lib/repos';

export class GenesisEventService {
    private dbService: DBService;

    constructor(postgresUri: string) {
        this.dbService = DBService.getInstance(postgresUri);
    }

    public async handleGenesisEvent(logInfo: LogInfo, logData: GenesisVaultEventInfo, parsedLog: ethers.LogDescription) {
        const vaultAddress = logInfo.address.toLowerCase();
        const activity: GenesisActivityRow = {
            id: logInfo.transactionHash + logInfo.logIndex.toString(),
            transactionHash: logInfo.transactionHash,
            vaultAddress,
            timestamp: Number.parseInt(logInfo.timestamp).toString(),
            type: parsedLog.name as GenesisActivityType,
            userAddress: null,
            position: null,
            blockNumber: Number.parseInt(logInfo.blockNumber).toString(),
            info: eventInfoToDb(logData),
        };

        if (activity.type === GenesisVaultEvent.Deposit || activity.type === GenesisVaultEvent.BatchDeposit) {
            const d = logData as GenesisDepositEvent | GenesisBatchDepositEvent;
            activity.userAddress = d.user.toLowerCase();
            // Optionally adjust genesis interest (remainingUsd) for this user if present
            try {
                await this.dbService.updateUserGenesisInterest({
                    vaultAddress: vaultAddress,
                    userAddress: d.user.toLowerCase(),
                    totalTokens: d.totalTokens,
                    totalUsd: d.totalUsd,
                    eligibleUsd: d.eligibleUsd,
                });
            } catch (e) {
                logger.warn('Failed to update user genesis interest on deposit', e);
            }
        } else if (activity.type === GenesisVaultEvent.Withdraw || activity.type === GenesisVaultEvent.BatchWithdraw) {
            activity.userAddress = (logData as GenesisWithdrawEvent | GenesisBatchWithdrawEvent).user.toLowerCase();
        } else if (activity.type === GenesisVaultEvent.Claim) {
            activity.userAddress = (logData as ClaimEvent).user.toLowerCase();
        } else if (activity.type === GenesisVaultEvent.MarketAdded) {
            const d = logData as MarketAddedEvent;
            // Ensure market exists by conditionId (may not be in DB yet)
            const conditionId = d.conditionId.toLowerCase();
            const existingMarket = await this.dbService.getMarket(conditionId);
            if (!existingMarket) {
                await getAndSaveEventAndMarkets(this.dbService.knex, undefined, conditionId);
            }
            await this.dbService.updateMarket(conditionId, {
                genesisIndex: Number(d.index),
                genesisEligible: d.extraEligible,
                genesisStartedAt: Number.parseInt(logInfo.timestamp).toString(),
            });
        } else if (activity.type === GenesisVaultEvent.MarketEnded) {
            const d = logData as MarketEndedEvent;
            await this.dbService.updateMarketGenesisOnEnded({
                index: Number(d.index),
                endedAt: BigInt(logInfo.timestamp),
            });
        }

        const existing = await this.dbService.getGenesisActivity(activity.id);
        if (existing) {
            logger.warn(`Genesis activity already exists: ${activity.id}`);
            return;
        }

        await this.dbService.insertGenesisActivity(activity);
    }
}
