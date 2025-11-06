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
import { getAndSaveEventAndMarkets, MARKETS_TABLE, ACTIVITIES_TABLE } from '@robin-pm-staking/common/lib/repos';
import { ethers } from 'ethers';
import { eventInfoToDb, eventInfoFromDb } from '@robin-pm-staking/common/lib/utils';

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

        const existingActivity = await this.dbService.getActivity(activity.id);
        if (existingActivity) {
            logger.warn(`Activity already exists: ${activity.id}`);
            return;
        }

        // Adjust based on event
        if (activity.type === VaultEvent.Deposited) {
            const depositedData = logData as DepositedEvent;
            activity.userAddress = depositedData.user;
            activity.position = depositedData.isYes ? ActivityPosition.Yes : ActivityPosition.No;
            const yesDelta = depositedData.isYes ? depositedData.amount : 0n;
            const noDelta = depositedData.isYes ? 0n : depositedData.amount;
            const calculatedAmounts = this.calculateTokenAmounts(yesDelta, noDelta, market);
            await this.dbService.updateMarket(market.conditionId, {
                matchedTokens: calculatedAmounts.matchedTokens.toString(),
                unmatchedYesTokens: calculatedAmounts.unmatchedYesTokens.toString(),
                unmatchedNoTokens: calculatedAmounts.unmatchedNoTokens.toString(),
                tvl: calculatedAmounts.matchedTokens.toString(),
            });
            await this.dbService.adjustUserPosition(depositedData.user, market.conditionId, vaultAddress, {
                yesDelta: yesDelta,
                noDelta: noDelta,
            });
        } else if (activity.type === VaultEvent.Withdrawn) {
            const withdrawnData = logData as WithdrawnEvent;
            activity.userAddress = withdrawnData.user;
            activity.position = ActivityPosition.Both;
            const calculatedAmounts = this.calculateTokenAmounts(-withdrawnData.yesAmount, -withdrawnData.noAmount, market);
            await this.dbService.updateMarket(market.conditionId, {
                matchedTokens: calculatedAmounts.matchedTokens.toString(),
                unmatchedYesTokens: calculatedAmounts.unmatchedYesTokens.toString(),
                unmatchedNoTokens: calculatedAmounts.unmatchedNoTokens.toString(),
                tvl: calculatedAmounts.matchedTokens.toString(),
            });
            await this.dbService.adjustUserPosition(withdrawnData.user, market.conditionId, vaultAddress, {
                yesDelta: -withdrawnData.yesAmount,
                noDelta: -withdrawnData.noAmount,
            });
        } else if (activity.type === VaultEvent.MarketFinalized) {
            const finalizedData = logData as MarketFinalizedEvent;
            activity.position =
                finalizedData.winningPosition === WinningPosition.Yes
                    ? ActivityPosition.Yes
                    : finalizedData.winningPosition === WinningPosition.No
                    ? ActivityPosition.No
                    : ActivityPosition.Both;
            await this.dbService.updateMarket(market.conditionId, {
                winningPosition:
                    finalizedData.winningPosition === WinningPosition.Yes
                        ? Outcome.Yes
                        : finalizedData.winningPosition === WinningPosition.No
                        ? Outcome.No
                        : Outcome.Both,
                status: MarketStatus.Finalized,
            });
        } else if (activity.type === VaultEvent.YieldUnlockStarted) {
            activity.position = null;
        } else if (activity.type === VaultEvent.YieldUnlockProgress) {
            activity.position = null;
        } else if (activity.type === VaultEvent.YieldUnlocked) {
            activity.position = null;
            await this.dbService.updateMarket(market.conditionId, {
                status: MarketStatus.Unlocked,
            });
        } else if (activity.type === VaultEvent.HarvestedYield) {
            const harvestedYieldData = logData as HarvestedYieldEvent;
            activity.position = null;
            activity.userAddress = harvestedYieldData.user;
            await this.dbService.adjustUserPosition(harvestedYieldData.user, market.conditionId, vaultAddress, {
                yieldDelta: harvestedYieldData.amount,
            });
        } else if (activity.type === VaultEvent.RedeemedWinningForUSD) {
            const redeemedWinningForUSDData = logData as RedeemedWinningForUSDEvent;
            activity.position =
                market.winningPosition === Outcome.Yes
                    ? ActivityPosition.Yes
                    : market.winningPosition === Outcome.No
                    ? ActivityPosition.No
                    : ActivityPosition.Both;
            activity.userAddress = redeemedWinningForUSDData.user;
            let yesDelta = market.winningPosition === Outcome.Yes ? -redeemedWinningForUSDData.winningAmount : 0n;
            let noDelta = market.winningPosition === Outcome.No ? -redeemedWinningForUSDData.winningAmount : 0n;
            if (market.winningPosition === Outcome.Both) {
                yesDelta = -redeemedWinningForUSDData.winningAmount / 2n;
                noDelta = -redeemedWinningForUSDData.winningAmount / 2n;
            }
            const calculatedAmounts = this.calculateTokenAmounts(yesDelta, noDelta, market);
            await this.dbService.updateMarket(market.conditionId, {
                matchedTokens: calculatedAmounts.matchedTokens.toString(),
                unmatchedYesTokens: calculatedAmounts.unmatchedYesTokens.toString(),
                unmatchedNoTokens: calculatedAmounts.unmatchedNoTokens.toString(),
                tvl: calculatedAmounts.matchedTokens.toString(),
            });
            // Adjust user side: remove winning tokens and record USD redeemed
            await this.dbService.adjustUserPosition(redeemedWinningForUSDData.user, market.conditionId, vaultAddress, {
                yesDelta: yesDelta,
                noDelta: noDelta,
                usdRedeemedDelta: redeemedWinningForUSDData.usdPaid,
            });
        } else if (activity.type === VaultEvent.HarvestedProtocolYield) {
            const harvestedProtocolYieldData = logData as HarvestedProtocolYieldEvent;
            activity.position = null;
            activity.userAddress = harvestedProtocolYieldData.receiver;
        } else {
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

        const newMatchedTokens = overallYesTokens > overallNoTokens ? overallNoTokens : overallYesTokens;
        const newUnmatchedYesTokens = overallYesTokens - newMatchedTokens;
        const newUnmatchedNoTokens = overallNoTokens - newMatchedTokens;

        return {
            matchedTokens: newMatchedTokens,
            unmatchedYesTokens: newUnmatchedYesTokens,
            unmatchedNoTokens: newUnmatchedNoTokens,
        };
    }

    public async recomputeAllMarkets() {
        const markets: MarketRow[] = await this.dbService.knex(MARKETS_TABLE).whereNot('status', MarketStatus.Uninitialized);

        for (const market of markets) {
            const vaultAddress = market.contractAddress?.toLowerCase();
            if (!vaultAddress) {
                continue;
            }

            const activities: ActivityRow[] = await this.dbService
                .knex(ACTIVITIES_TABLE)
                .where('vaultAddress', vaultAddress)
                .orderBy('blockNumber', 'asc')
                .orderBy('id', 'asc');

            // Start from zero for recomputation
            const running: MarketRow = {
                ...market,
                matchedTokens: '0',
                unmatchedYesTokens: '0',
                unmatchedNoTokens: '0',
            };

            for (const a of activities) {
                const type = a.type;
                const rawInfo = a.info;
                const info = typeof rawInfo === 'string' ? eventInfoFromDb(JSON.parse(rawInfo)) : eventInfoFromDb(rawInfo);

                let yesDelta: bigint = 0n;
                let noDelta: bigint = 0n;

                if (type === VaultEvent.Deposited) {
                    const { isYes, amount } = info as DepositedEvent;
                    const isYesBool = isYes;
                    const amountBig = amount;
                    yesDelta = isYesBool ? amountBig : 0n;
                    noDelta = isYesBool ? 0n : amountBig;
                } else if (type === VaultEvent.Withdrawn) {
                    const { yesAmount, noAmount } = info as WithdrawnEvent;
                    const yesAmountBig = yesAmount;
                    const noAmountBig = noAmount;
                    yesDelta = -yesAmountBig;
                    noDelta = -noAmountBig;
                } else if (type === VaultEvent.MarketFinalized) {
                    const { winningPosition } = info as MarketFinalizedEvent;
                    const wp = winningPosition;
                    if (wp === WinningPosition.Yes) running.winningPosition = Outcome.Yes;
                    else if (wp === WinningPosition.No) running.winningPosition = Outcome.No;
                    else if (wp === WinningPosition.Both) running.winningPosition = Outcome.Both;
                    else running.winningPosition = undefined;
                    continue; // status change only
                } else if (type === VaultEvent.RedeemedWinningForUSD) {
                    const { winningAmount } = info as RedeemedWinningForUSDEvent;
                    if (running.winningPosition === Outcome.Yes) {
                        yesDelta = -winningAmount;
                        noDelta = 0n;
                    } else if (running.winningPosition === Outcome.No) {
                        yesDelta = 0n;
                        noDelta = -winningAmount;
                    } else if (running.winningPosition === Outcome.Both) {
                        yesDelta = -winningAmount / 2n;
                        noDelta = -winningAmount / 2n;
                    } else {
                        // If unresolved, skip as we cannot attribute side
                        continue;
                    }
                } else {
                    // Other activity types do not affect token balances
                    continue;
                }

                const calculated = this.calculateTokenAmounts(yesDelta, noDelta, running);
                running.matchedTokens = calculated.matchedTokens.toString();
                running.unmatchedYesTokens = calculated.unmatchedYesTokens.toString();
                running.unmatchedNoTokens = calculated.unmatchedNoTokens.toString();
            }

            const tvl = running.matchedTokens;

            await this.dbService.updateMarket(market.conditionId, {
                matchedTokens: running.matchedTokens,
                unmatchedYesTokens: running.unmatchedYesTokens,
                unmatchedNoTokens: running.unmatchedNoTokens,
                tvl,
            });
        }

        return true;
    }
}
