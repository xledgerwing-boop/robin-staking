import { logger } from '../utils/logger';
import { ActivityPosition, ActivityRow, ActivityType } from '@robin-pm-staking/common/types/activity';
import { DBService } from './DbService';
import {
    DepositedEvent,
    HarvestedProtocolYieldEvent,
    HarvestedYieldEvent,
    MarketFinalizedEvent,
    RedeemedWinningForUSDEvent,
    VaultCreatedEvent,
    VaultEvent,
    VaultEventInfo,
    WinningPosition,
    WithdrawnEvent,
} from '@robin-pm-staking/common/types/conract-events';
import { MarketRow, MarketStatus, Outcome } from '@robin-pm-staking/common/types/market';
import { getAndSaveEventAndMarkets } from '@robin-pm-staking/common/lib/repos';
import { ethers } from 'ethers';
import { eventInfoToDb } from '@robin-pm-staking/common/lib/utils';

export interface LogInfo {
    address: string;
    blockHash: string;
    blockNumber: string;
    timestamp: string;
    data: string;
    logIndex: string;
    removed: boolean;
    topics: string[];
    transactionHash: string;
    transactionIndex: string;
}

export class EventService {
    private dbService: DBService;

    constructor(postgresUri: string) {
        this.dbService = DBService.getInstance(postgresUri);
    }

    public async handleVaultCreated(log: LogInfo, vaultData: VaultCreatedEvent) {
        const { conditionId, vault, creator } = vaultData;

        const existingMarket = await this.dbService.getMarket(conditionId);
        if (!existingMarket) {
            await getAndSaveEventAndMarkets(this.dbService.knex, undefined, conditionId);
        }

        await this.dbService.updateMarket(conditionId, {
            contractAddress: vault,
            status: MarketStatus.Active,
            vaultCreatedBlockNumber: Number.parseInt(log.blockNumber).toString(), //arrives as hex string, we want decimal string
            vaultCreatedAt: Number.parseInt(log.timestamp).toString(), //arrives as hex string, we want decimal string
            creator,
        });

        logger.info(`Vault created: ${vault}`);
    }

    public async handleMarketEvent(logInfo: LogInfo, logData: VaultEventInfo, parsedLog: ethers.LogDescription) {
        logger.info(`Handling market event: ${parsedLog.name}`);
        const vaultAddress = logInfo.address.toLowerCase();
        const market = await this.dbService.getMarketByAddress(vaultAddress);
        if (!market) {
            logger.warn(`Market not found: ${vaultAddress}`);
            return;
        }

        let activity: ActivityRow = {
            id: logInfo.transactionHash + logInfo.logIndex.toString(),
            transactionHash: logInfo.transactionHash,
            vaultAddress: vaultAddress,
            timestamp: Number.parseInt(logInfo.timestamp).toString(),
            type: parsedLog.name as ActivityType,
            userAddress: null,
            position: null,
            blockNumber: Number.parseInt(logInfo.blockNumber).toString(),
            info: eventInfoToDb(logData),
        };

        // Adjust based on event
        switch (activity.type) {
            case VaultEvent.Deposited:
                const depositedData = logData as DepositedEvent;
                activity.userAddress = depositedData.user;
                activity.position = depositedData.isYes ? ActivityPosition.Yes : ActivityPosition.No;
                const {
                    matchedTokens: nt1,
                    unmatchedYesTokens: nyt1,
                    unmatchedNoTokens: nnt1,
                } = this.calculateTokenAmounts(depositedData.amount, 0n, market);
                await this.dbService.updateMarket(vaultAddress, {
                    matchedTokens: nt1.toString(),
                    unmatchedYesTokens: nyt1.toString(),
                    unmatchedNoTokens: nnt1.toString(),
                    tvl: nt1.toString(),
                });
                break;
            case VaultEvent.Withdrawn:
                const withdrawnData = logData as WithdrawnEvent;
                activity.userAddress = withdrawnData.user;
                activity.position = ActivityPosition.Both;
                const {
                    matchedTokens: nt2,
                    unmatchedYesTokens: nyt2,
                    unmatchedNoTokens: nnt2,
                } = this.calculateTokenAmounts(-withdrawnData.yesAmount, -withdrawnData.noAmount, market);
                await this.dbService.updateMarket(vaultAddress, {
                    matchedTokens: nt2.toString(),
                    unmatchedYesTokens: nyt2.toString(),
                    unmatchedNoTokens: nnt2.toString(),
                    tvl: nt2.toString(),
                });
                break;
            case VaultEvent.MarketFinalized:
                const finalizedData = logData as MarketFinalizedEvent;
                activity.position =
                    finalizedData.winningPosition === WinningPosition.Yes
                        ? ActivityPosition.Yes
                        : finalizedData.winningPosition === WinningPosition.No
                        ? ActivityPosition.No
                        : ActivityPosition.Both;
                await this.dbService.updateMarket(vaultAddress, {
                    winningPosition:
                        finalizedData.winningPosition === WinningPosition.Yes
                            ? Outcome.Yes
                            : finalizedData.winningPosition === WinningPosition.No
                            ? Outcome.No
                            : Outcome.Both,
                    status: MarketStatus.Finalized,
                });
                break;
            case VaultEvent.YieldUnlockStarted:
                activity.position = null;
                break;
            case VaultEvent.YieldUnlockProgress:
                activity.position = null;
                break;
            case VaultEvent.YieldUnlocked:
                activity.position = null;
                await this.dbService.updateMarket(vaultAddress, {
                    status: MarketStatus.Unlocked,
                });
                break;
            case VaultEvent.HarvestedYield:
                const harvestedYieldData = logData as HarvestedYieldEvent;
                activity.position = null;
                activity.userAddress = harvestedYieldData.user;
                break;
            case VaultEvent.RedeemedWinningForUSD:
                const redeemedWinningForUSDData = logData as RedeemedWinningForUSDEvent;
                activity.position =
                    market.winningPosition === Outcome.Yes
                        ? ActivityPosition.Yes
                        : market.winningPosition === Outcome.No
                        ? ActivityPosition.No
                        : ActivityPosition.Both;
                activity.userAddress = redeemedWinningForUSDData.user;
                let yesDelta = market.winningPosition === Outcome.Yes ? redeemedWinningForUSDData.winningAmount : 0n;
                let noDelta = market.winningPosition === Outcome.No ? redeemedWinningForUSDData.winningAmount : 0n;
                if (market.winningPosition === Outcome.Both) {
                    yesDelta = redeemedWinningForUSDData.winningAmount / 2n;
                    noDelta = redeemedWinningForUSDData.winningAmount / 2n;
                }
                const {
                    matchedTokens: nt3,
                    unmatchedYesTokens: nyt3,
                    unmatchedNoTokens: nnt3,
                } = this.calculateTokenAmounts(yesDelta, noDelta, market);
                await this.dbService.updateMarket(vaultAddress, {
                    matchedTokens: nt3.toString(),
                    unmatchedYesTokens: nyt3.toString(),
                    unmatchedNoTokens: nnt3.toString(),
                    tvl: nt3.toString(),
                });
                break;
            case VaultEvent.HarvestedProtocolYield:
                const harvestedProtocolYieldData = logData as HarvestedProtocolYieldEvent;
                activity.position = null;
                activity.userAddress = harvestedProtocolYieldData.receiver;
                break;
            default:
                logger.warn(`Unknown market event: ${activity.type}`);
                return;
        }

        await this.dbService.insertActivity(activity);
    }

    public calculateTokenAmounts(yesDelta: bigint, noDelta: bigint, market: MarketRow) {
        const currentMatchedTokens = BigInt(market.matchedTokens);
        const currentUnmatchedYesTokens = BigInt(market.unmatchedYesTokens);
        const currentUnmatchedNoTokens = BigInt(market.unmatchedNoTokens);

        let overallYesTokens = currentUnmatchedYesTokens + currentMatchedTokens + yesDelta;
        let overallNoTokens = currentUnmatchedNoTokens + currentMatchedTokens + noDelta;

        const newMatchedTokens = overallYesTokens > overallNoTokens ? overallYesTokens : overallNoTokens;
        const newUnmatchedYesTokens = overallYesTokens - newMatchedTokens;
        const newUnmatchedNoTokens = overallNoTokens - newMatchedTokens;

        return {
            matchedTokens: newMatchedTokens,
            unmatchedYesTokens: newUnmatchedYesTokens,
            unmatchedNoTokens: newUnmatchedNoTokens,
        };
    }
}
