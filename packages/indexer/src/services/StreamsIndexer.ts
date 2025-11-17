import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import { robinVaultManagerAbi, polymarketAaveStakingVaultAbi } from '@robin-pm-staking/common/types/contracts';
import { promotionVaultAbi } from '@robin-pm-staking/common/types/contracts-promo';
import { EventService, LogInfo } from './EventService';
import {
    DepositedEvent,
    HarvestedProtocolYieldEvent,
    HarvestedYieldEvent,
    MarketFinalizedEvent,
    RedeemedWinningForUSDEvent,
    VaultCreatedEvent,
    VaultEvent,
    VaultEventInfo,
    VaultManagerEvent,
    WithdrawnEvent,
    YieldUnlockedEvent,
    YieldUnlockProgressEvent,
    YieldUnlockStartedEvent,
} from '@robin-pm-staking/common/types/conract-events';
import { PromoEventService } from './PromoEventService';
import { PromoVaultEvent, PromoVaultEventInfo } from '@robin-pm-staking/common/types/promo-events';
import { USED_CONTRACTS } from '@robin-pm-staking/common/constants';

export class StreamsIndexer {
    private provider: ethers.JsonRpcProvider;
    private manager: ethers.Contract;
    private promoVault: ethers.Contract;
    private vaultInterface: ethers.Interface;
    private promoVaultInterface: ethers.Interface;
    private eventService: EventService;
    private promoEventService: PromoEventService;

    constructor(rpcUrl: string, chainId: number, managerAddress: string, postgresUri: string) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl, ethers.Network.from(chainId), {
            staticNetwork: true,
        });
        this.eventService = new EventService(postgresUri);
        this.promoEventService = new PromoEventService(postgresUri);
        this.manager = new ethers.Contract(managerAddress, robinVaultManagerAbi, this.provider);
        this.promoVault = new ethers.Contract(USED_CONTRACTS.PROMOTION_VAULT, promotionVaultAbi, this.provider);
        this.vaultInterface = new ethers.Interface(polymarketAaveStakingVaultAbi);
        this.promoVaultInterface = new ethers.Interface(promotionVaultAbi);
    }

    public async start(): Promise<void> {
        logger.info('Starting StreamsIndexer service...');
        logger.info('StreamsIndexer ready to receive webhooks');
    }

    public async stop(): Promise<void> {
        logger.info('Stopping StreamsIndexer service...');
        this.provider.destroy();
        logger.info('StreamsIndexer service stopped successfully');
    }

    public async processWebhook(webhookData: LogInfo[]): Promise<void> {
        try {
            logger.info(`Processing webhook data: ${webhookData.length}`);

            for (const log of webhookData) {
                await this.processWebhookLog(log);
            }

            logger.info('Webhook processing completed successfully');
        } catch (error) {
            logger.error('Error processing webhook:', error);
            logger.info('Webhook data:', webhookData);
            throw error;
        }
    }

    public async processPromoWebhook(webhookData: LogInfo[]): Promise<void> {
        try {
            logger.info(`Processing promo webhook data: ${webhookData.length}`);
            for (const log of webhookData) {
                await this.processPromoWebhookLog(log);
            }
            logger.info('Promo webhook processing completed successfully');
        } catch (error) {
            logger.error('Error processing promo webhook:', error);
            logger.info('Promo webhook data:', webhookData);
            throw error;
        }
    }

    private async processWebhookLog(log: LogInfo): Promise<void> {
        const logAddress = log.address.toLowerCase();
        try {
            // Determine event type and route to appropriate handler
            if (logAddress === this.manager.target.toString().toLowerCase()) {
                await this.handleVaultCreated(log);
            } else {
                await this.handleVaultEvent(log);
            }
        } catch (error) {
            logger.error('Error processing webhook log:', error);
            throw error;
        }
    }

    private async processPromoWebhookLog(log: LogInfo): Promise<void> {
        try {
            await this.handlePromoVaultEvent(log);
        } catch (error) {
            logger.error('Error processing promo webhook log:', error);
            throw error;
        }
    }

    private async handleVaultCreated(log: LogInfo) {
        const parsedEvent = this.manager.interface.parseLog(log);
        if (parsedEvent?.name !== VaultManagerEvent.VaultCreated) {
            logger.warn(`Received log for unknown event: ${parsedEvent?.name}`);
            return;
        }
        if (!parsedEvent) {
            throw new Error(`Failed to parse market created log ${log.transactionHash}`);
        }
        const conditionId = parsedEvent.args[0].toLowerCase();
        const vaultAddress = parsedEvent.args[1].toLowerCase();
        const creator = parsedEvent.args[2].toLowerCase();

        const vaultCreatedEvent: VaultCreatedEvent = {
            conditionId,
            vault: vaultAddress,
            creator,
        };

        await this.eventService.handleVaultCreated(log, vaultCreatedEvent);
    }

    private async handleVaultEvent(event: LogInfo) {
        const parsedEvent = this.vaultInterface.parseLog(event);
        if (!parsedEvent) {
            throw new Error(`Failed to parse vault log ${event.transactionHash}`);
        }

        const eventName = parsedEvent.name as VaultEvent;
        const args = parsedEvent.args;
        let info: VaultEventInfo;

        // Adjust based on event
        switch (eventName) {
            case VaultEvent.Deposited:
                info = {
                    user: args[0].toLowerCase(),
                    isYes: args[1],
                    amount: args[2],
                } as DepositedEvent;
                break;
            case VaultEvent.Withdrawn:
                info = {
                    user: args[0].toLowerCase(),
                    yesAmount: args[1],
                    noAmount: args[2],
                } as WithdrawnEvent;
                break;
            case VaultEvent.MarketFinalized:
                info = {
                    winningPosition: Number(args[0]), //important to parse as number to avoid wrong comparison between bigint and number
                } as MarketFinalizedEvent;
                break;
            case VaultEvent.YieldUnlockStarted:
                info = {
                    leftoverUsd: args[0],
                    principalAtStart: args[1],
                } as YieldUnlockStartedEvent;
                break;
            case VaultEvent.YieldUnlockProgress:
                info = {
                    withdrawnThisCall: args[0],
                    cumulativeWithdrawn: args[1],
                    remainingInStrategy: args[2],
                } as YieldUnlockProgressEvent;
                break;
            case VaultEvent.YieldUnlocked:
                info = {
                    totalWithdrawnUsd: args[0],
                    totalYield: args[1],
                    userYield: args[2],
                    protocolYield: args[3],
                } as YieldUnlockedEvent;
                break;
            case VaultEvent.HarvestedYield:
                info = {
                    user: args[0].toLowerCase(),
                    amount: args[1],
                } as HarvestedYieldEvent;
                break;
            case VaultEvent.RedeemedWinningForUSD:
                info = {
                    user: args[0].toLowerCase(),
                    winningAmount: args[1],
                    usdPaid: args[2],
                } as RedeemedWinningForUSDEvent;
                break;
            case VaultEvent.HarvestedProtocolYield:
                info = {
                    receiver: args[0].toLowerCase(),
                    amount: args[1],
                } as HarvestedProtocolYieldEvent;
                break;
            default:
                logger.warn(`Unknown market event: ${eventName}`);
                return;
        }

        await this.eventService.handleMarketEvent(event, info, parsedEvent);
    }

    private async handlePromoVaultEvent(event: LogInfo) {
        const parsedEvent = this.promoVaultInterface.parseLog(event);
        if (!parsedEvent) {
            throw new Error(`Failed to parse promo vault log ${event.transactionHash}`);
        }
        const eventName = parsedEvent.name as PromoVaultEvent;
        const args = parsedEvent.args;
        let info: PromoVaultEventInfo;

        switch (eventName) {
            case PromoVaultEvent.CampaignStarted:
                info = {
                    starter: args[0].toLowerCase(),
                    baseFunded: args[1],
                    startTs: args[2],
                    endTs: args[3],
                };
                break;
            case PromoVaultEvent.PricesUpdated:
                info = {
                    timestamp: args[0],
                };
                break;
            case PromoVaultEvent.Deposit:
                const user = args[0].toLowerCase();
                const [totalTokens, totalUsd, eligibleUsd] = await this.promoVault.viewUserStakeableValue(user);
                info = {
                    user,
                    marketIndex: args[1],
                    isA: args[2],
                    amount: args[3],
                    totalTokens,
                    totalUsd,
                    eligibleUsd,
                };
                break;
            case PromoVaultEvent.BatchDeposit:
                const [totalTokens1, totalUsd1, eligibleUsd1] = await this.promoVault.viewUserStakeableValue(args[0].toLowerCase());
                info = {
                    user: args[0].toLowerCase(),
                    tokenAmount: args[1],
                    totalTokens: totalTokens1,
                    totalUsd: totalUsd1,
                    eligibleUsd: eligibleUsd1,
                };
                break;
            case PromoVaultEvent.Withdraw:
                info = {
                    user: args[0].toLowerCase(),
                    marketIndex: args[1],
                    isA: args[2],
                    amount: args[3],
                };
                break;
            case PromoVaultEvent.BatchWithdraw:
                info = {
                    user: args[0].toLowerCase(),
                    tokenAmount: args[1],
                };
                break;
            case PromoVaultEvent.Claim:
                info = {
                    user: args[0].toLowerCase(),
                    basePaid: args[1],
                    extraPaid: args[2],
                };
                break;
            case PromoVaultEvent.MarketAdded:
                info = {
                    index: args[0],
                    tokenIdA: args[1],
                    tokenIdB: args[2],
                    extraEligible: args[3],
                };
                break;
            case PromoVaultEvent.MarketEnded:
                info = {
                    index: args[0],
                };
                break;
            case PromoVaultEvent.CampaignFinalized:
                info = {
                    timestamp: args[0],
                    totalValueTime: args[1],
                    totalExtraValueTime: args[2],
                    baseDistributed: args[3],
                    extraPool: args[4],
                };
                break;
            case PromoVaultEvent.TvlCapUpdated:
                info = {
                    newCapUsd: args[0],
                    newBaseRewardPool: args[1],
                };
                break;
            case PromoVaultEvent.LeftoversSwept:
                info = {
                    to: args[0].toLowerCase(),
                    amount: args[1],
                };
                break;
            case PromoVaultEvent.EmergencyModeEnabled:
                info = {
                    timestamp: args[0],
                };
                break;
            case PromoVaultEvent.EmergencyWithdrawal:
                info = {
                    user: args[0].toLowerCase(),
                };
                break;
            default:
                logger.warn(`Unknown promo event: ${eventName}`);
                return;
        }

        await this.promoEventService.handlePromoEvent(event, info, parsedEvent);
    }
}
