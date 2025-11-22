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
import { insertRewardActivity } from '@robin-pm-staking/common/lib/rewards';
import { GENESIS_VAULT_INFOS } from '@robin-pm-staking/common/constants';
import { NotificationService } from './NotificationService';
import { matchDepositAndCalculateValue, matchWithdrawAndDecreaseValue } from '@robin-pm-staking/common/lib/referral';

export class GenesisEventService {
    private dbService: DBService;
    private provider: ethers.JsonRpcProvider;

    constructor(postgresUri: string, rpcUrl: string) {
        this.dbService = DBService.getInstance(postgresUri);
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
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
                await NotificationService.sendNotification(`Failed to update user genesis interest on deposit: ${e}`);
                logger.warn('Failed to update user genesis interest on deposit', e);
            }

            // Process referral matching
            try {
                if (activity.type === GenesisVaultEvent.Deposit) {
                    const singleDeposit = d as GenesisDepositEvent;
                    await matchDepositAndCalculateValue(this.dbService.knex, this.provider, {
                        userAddress: singleDeposit.user,
                        totalTokens: singleDeposit.amount,
                        eventTimestamp: Number.parseInt(logInfo.timestamp) * 1000,
                        transactionHash: logInfo.transactionHash,
                        marketIndex: Number(singleDeposit.marketIndex),
                        isA: singleDeposit.isA,
                        amount: singleDeposit.amount,
                    });
                } else {
                    const batchDeposit = d as GenesisBatchDepositEvent;
                    await matchDepositAndCalculateValue(this.dbService.knex, this.provider, {
                        userAddress: batchDeposit.user,
                        totalTokens: batchDeposit.tokenAmount,
                        eventTimestamp: Number.parseInt(logInfo.timestamp) * 1000,
                        transactionHash: logInfo.transactionHash,
                    });
                }
            } catch (e) {
                logger.warn('Failed to process referral deposit matching', e);
            }
        } else if (activity.type === GenesisVaultEvent.Withdraw || activity.type === GenesisVaultEvent.BatchWithdraw) {
            const d = logData as GenesisWithdrawEvent | GenesisBatchWithdrawEvent;
            activity.userAddress = d.user.toLowerCase();

            // Process referral matching
            try {
                if (activity.type === GenesisVaultEvent.Withdraw) {
                    const singleWithdraw = d as GenesisWithdrawEvent;
                    await matchWithdrawAndDecreaseValue(this.dbService.knex, this.provider, {
                        userAddress: singleWithdraw.user,
                        totalTokens: singleWithdraw.amount,
                        eventTimestamp: Number.parseInt(logInfo.timestamp) * 1000,
                        transactionHash: logInfo.transactionHash,
                        marketIndex: Number(singleWithdraw.marketIndex),
                        isA: singleWithdraw.isA,
                        amount: singleWithdraw.amount,
                    });
                } else {
                    const batchWithdraw = d as GenesisBatchWithdrawEvent;
                    await matchWithdrawAndDecreaseValue(this.dbService.knex, this.provider, {
                        userAddress: batchWithdraw.user,
                        totalTokens: batchWithdraw.tokenAmount,
                        eventTimestamp: Number.parseInt(logInfo.timestamp) * 1000,
                        transactionHash: logInfo.transactionHash,
                    });
                }
            } catch (e) {
                logger.warn('Failed to process referral withdraw matching', e);
            }
        } else if (activity.type === GenesisVaultEvent.Claim) {
            const d = logData as ClaimEvent;
            activity.userAddress = d.user.toLowerCase();

            try {
                const rewardPoints = (d.basePaid * GENESIS_VAULT_INFOS.ROBIN_POINTS_POOL) / GENESIS_VAULT_INFOS.BASE_REWARD_POOL;
                await insertRewardActivity(this.dbService.knex, {
                    userAddress: activity.userAddress,
                    points: Number(rewardPoints),
                    type: 'Genesis Rewards',
                    details: { basePaid: d.basePaid.toString() },
                });
            } catch (e) {
                await NotificationService.sendNotification(`Failed to insert genesis rewards: ${e}`);
                logger.warn('Failed to insert genesis rewards', e);
            }
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
