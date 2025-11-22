import { Knex } from 'knex';
import { REFERRAL_CODES_TABLE, REFERRAL_ENTRIES_TABLE, MARKETS_TABLE } from './repos';
import { MarketRow } from '../types/market';
import { ethers } from 'ethers';
import { UNDERYLING_PRECISION_BIG_INT, USED_CONTRACTS } from '../constants';
import { sleep } from './utils';

const PRICE_SCALE = UNDERYLING_PRECISION_BIG_INT;

export interface ReferralCodeRow {
    id: string;
    code: string;
    ownerAddress: string;
    ownerName: string;
    createdAt: string;
}

export interface ReferralEntryRow {
    id: string;
    referralCodeId: string;
    userAddress: string;
    totalTokens: string;
    realizedValue: string | null;
    timestamp: string;
    transactionHash: string | null;
    type: 'deposit' | 'withdraw';
}

/**
 * Create a referral entry from the frontend (before transaction confirmation)
 */
export async function createReferralEntry(
    db: Knex,
    params: {
        referralCodeId: string;
        userAddress: string;
        totalTokens: bigint;
        type: 'deposit' | 'withdraw';
        timestamp: number;
    }
): Promise<ReferralEntryRow> {
    const { referralCodeId, userAddress, totalTokens, type, timestamp } = params;
    const id = `${userAddress.toLowerCase()}:${timestamp}:${type}`;

    const entry: ReferralEntryRow = {
        id,
        referralCodeId,
        userAddress: userAddress.toLowerCase(),
        totalTokens: totalTokens.toString(),
        realizedValue: null,
        timestamp: timestamp.toString(),
        transactionHash: null,
        type,
    };

    await db(REFERRAL_ENTRIES_TABLE).insert(entry).onConflict('id').ignore();
    return entry;
}

/**
 * Match a deposit event with a referral entry and calculate realized value
 * Called from GenesisEventService when processing deposit events
 */
export async function matchDepositAndCalculateValue(
    db: Knex,
    provider: ethers.JsonRpcProvider,
    params: {
        userAddress: string;
        totalTokens: bigint;
        eventTimestamp: number;
        transactionHash: string;
        marketIndex?: number; // For single deposit
        isA?: boolean; // For single deposit
        amount?: bigint; // For single deposit
    }
): Promise<void> {
    const { userAddress, totalTokens, eventTimestamp, transactionHash, marketIndex, isA, amount } = params;

    // Find referral entry within 2 minutes
    const twoMinutesAgo = eventTimestamp - 2 * 60 * 1000;
    console.log(eventTimestamp, twoMinutesAgo, userAddress, totalTokens);
    let entry = await db<ReferralEntryRow>(REFERRAL_ENTRIES_TABLE)
        .where('userAddress', userAddress.toLowerCase())
        .where('type', 'deposit')
        .where('timestamp', '>=', twoMinutesAgo.toString())
        .where('totalTokens', totalTokens.toString())
        .whereNull('realizedValue')
        .orderBy('timestamp', 'desc')
        .first();

    if (!entry) {
        await sleep(1000 * 5);
        entry = await db<ReferralEntryRow>(REFERRAL_ENTRIES_TABLE)
            .where('userAddress', userAddress.toLowerCase())
            .where('type', 'deposit')
            .where('timestamp', '>=', twoMinutesAgo.toString())
            .where('totalTokens', totalTokens.toString())
            .whereNull('realizedValue')
            .orderBy('timestamp', 'desc')
            .first();
    }

    if (!entry) {
        console.log('No entry found');
        // Event arrived before frontend API call - create entry ourselves
        // const codes = await db<ReferralCodeRow>(REFERRAL_CODES_TABLE).select('id');
        // if (codes.length === 0) return; // No referral codes exist

        // For now, we can't determine which code to use, so we'll skip
        // In a real scenario, you might want to store the referral code in a cookie/session
        // and retrieve it here, or handle it differently
        return;
    }

    let totalUsdValue = 0n;

    if (marketIndex !== undefined && isA !== undefined && amount !== undefined) {
        // Single deposit: use market index, isA, and amount
        const market = await db<MarketRow>(MARKETS_TABLE).where('genesisIndex', marketIndex).first();

        if (market?.genesisLastSubmittedPriceA) {
            const priceA = BigInt(market.genesisLastSubmittedPriceA);
            const price = isA ? priceA : PRICE_SCALE - priceA;
            totalUsdValue = (amount * price) / PRICE_SCALE;
        }
    } else {
        // Last resort: query ERC-1155 transfers
        const receipt = await provider.getTransactionReceipt(transactionHash);
        if (receipt) {
            const transferSingleTopic = ethers.id('TransferSingle(address,address,address,uint256,uint256)');
            const transferBatchTopic = ethers.id('TransferBatch(address,address,address,uint256[],uint256[])');

            const tokenTransfers: Array<{ tokenId: bigint; amount: bigint }> = [];

            for (const log of receipt.logs) {
                if (log.topics[0] === transferSingleTopic && log.address.toLowerCase() === USED_CONTRACTS.CONDITIONAL_TOKENS.toLowerCase()) {
                    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['uint256', 'uint256'], log.data);
                    tokenTransfers.push({
                        tokenId: decoded[0],
                        amount: decoded[1],
                    });
                } else if (log.topics[0] === transferBatchTopic && log.address.toLowerCase() === USED_CONTRACTS.CONDITIONAL_TOKENS.toLowerCase()) {
                    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['uint256[]', 'uint256[]'], log.data);
                    const tokenIds = decoded[0] as bigint[];
                    const amounts = decoded[1] as bigint[];
                    for (let i = 0; i < tokenIds.length; i++) {
                        tokenTransfers.push({
                            tokenId: tokenIds[i],
                            amount: amounts[i],
                        });
                    }
                }
            }

            // Match tokens to markets via clobTokenIds
            const allMarkets = await db<MarketRow>(MARKETS_TABLE).whereNotNull('genesisIndex').whereNotNull('genesisLastSubmittedPriceA');

            console.log('tokenTransfers', tokenTransfers);
            for (const transfer of tokenTransfers) {
                for (const market of allMarkets) {
                    const clobTokenIds = (market.clobTokenIds as unknown as string[]) || [];
                    const tokenIndex = clobTokenIds.findIndex(id => BigInt(id) === transfer.tokenId);
                    if (tokenIndex >= 0 && market.genesisLastSubmittedPriceA) {
                        const priceA = BigInt(market.genesisLastSubmittedPriceA);
                        const price = tokenIndex === 0 ? priceA : PRICE_SCALE - priceA; // First token is YES
                        totalUsdValue += (transfer.amount * price) / PRICE_SCALE;
                        break;
                    }
                }
            }
        }
    }

    console.log('totalUsdValue', totalUsdValue);

    // Update matching entry with realized value
    await db(REFERRAL_ENTRIES_TABLE).where('id', entry.id).update({
        realizedValue: totalUsdValue.toString(),
        transactionHash,
    });
}

/**
 * Match a withdraw event with referral entries and decrease realized value
 * Called from GenesisEventService when processing withdraw events
 */
export async function matchWithdrawAndDecreaseValue(
    db: Knex,
    provider: ethers.JsonRpcProvider,
    params: {
        userAddress: string;
        totalTokens: bigint;
        eventTimestamp: number;
        transactionHash: string;
        marketIndex?: number;
        isA?: boolean;
        amount?: bigint;
    }
): Promise<void> {
    const { userAddress, totalTokens, eventTimestamp, transactionHash, marketIndex, isA, amount } = params;

    const twoMinutesAgo = eventTimestamp - 2 * 60 * 1000;
    let withdrawEntry = await db<ReferralEntryRow>(REFERRAL_ENTRIES_TABLE)
        .where('userAddress', userAddress.toLowerCase())
        .where('type', 'withdraw')
        .where('timestamp', '>=', twoMinutesAgo.toString())
        .where('totalTokens', totalTokens.toString())
        .orderBy('timestamp', 'desc')
        .first();

    if (!withdrawEntry) {
        await sleep(1000 * 5);
        withdrawEntry = await db<ReferralEntryRow>(REFERRAL_ENTRIES_TABLE)
            .where('userAddress', userAddress.toLowerCase())
            .where('type', 'withdraw')
            .where('timestamp', '>=', twoMinutesAgo.toString())
            .where('totalTokens', totalTokens.toString())
            .orderBy('timestamp', 'desc')
            .first();
    }

    if (!withdrawEntry) {
        console.log('No withdraw entry found');
        return;
    }

    // Find referral entries within 24 hours
    const twentyFourHoursAgo = eventTimestamp - 24 * 60 * 60 * 1000;
    const entries = await db<ReferralEntryRow>(REFERRAL_ENTRIES_TABLE)
        .where('userAddress', userAddress.toLowerCase())
        .where('type', 'deposit')
        .where('timestamp', '>=', twentyFourHoursAgo.toString())
        .where('referralCodeId', withdrawEntry.referralCodeId)
        .whereNotNull('realizedValue')
        .orderBy('timestamp', 'desc');

    if (entries.length === 0) {
        console.log('No entries found');
        // Event arrived before frontend API call - create entry ourselves
        // const codes = await db<ReferralCodeRow>(REFERRAL_CODES_TABLE).select('id');
        // if (codes.length === 0) return;

        // Similar to deposit, we can't determine which code to use
        return;
    }

    let totalUsdValue = 0n;

    if (marketIndex !== undefined && isA !== undefined && amount !== undefined) {
        // Single withdraw: use market index, isA, and amount
        const market = await db<MarketRow>(MARKETS_TABLE).where('genesisIndex', marketIndex).first();

        if (market?.genesisLastSubmittedPriceA) {
            const priceA = BigInt(market.genesisLastSubmittedPriceA);
            const price = isA ? priceA : PRICE_SCALE - priceA;
            totalUsdValue = (amount * price) / PRICE_SCALE;
        }
    } else {
        // Query ERC-1155 transfers
        const receipt = await provider.getTransactionReceipt(transactionHash);
        if (receipt) {
            const transferSingleTopic = ethers.id('TransferSingle(address,address,address,uint256,uint256)');
            const transferBatchTopic = ethers.id('TransferBatch(address,address,address,uint256[],uint256[])');

            const tokenTransfers: Array<{ tokenId: bigint; amount: bigint }> = [];

            for (const log of receipt.logs) {
                if (log.topics[0] === transferSingleTopic && log.address.toLowerCase() === USED_CONTRACTS.CONDITIONAL_TOKENS.toLowerCase()) {
                    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['uint256', 'uint256'], log.data);
                    tokenTransfers.push({
                        tokenId: decoded[0],
                        amount: decoded[1],
                    });
                } else if (log.topics[0] === transferBatchTopic && log.address.toLowerCase() === USED_CONTRACTS.CONDITIONAL_TOKENS.toLowerCase()) {
                    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['uint256[]', 'uint256[]'], log.data);
                    const tokenIds = decoded[0] as bigint[];
                    const amounts = decoded[1] as bigint[];
                    for (let i = 0; i < tokenIds.length; i++) {
                        tokenTransfers.push({
                            tokenId: tokenIds[i],
                            amount: amounts[i],
                        });
                    }
                }
            }

            // Match tokens to markets via clobTokenIds
            const allMarkets = await db<MarketRow>(MARKETS_TABLE).whereNotNull('genesisIndex').whereNotNull('genesisLastSubmittedPriceA');

            for (const transfer of tokenTransfers) {
                for (const market of allMarkets) {
                    const clobTokenIds = (market.clobTokenIds as unknown as string[]) || [];
                    const tokenIndex = clobTokenIds.findIndex(id => BigInt(id) === transfer.tokenId);
                    if (tokenIndex >= 0 && market.genesisLastSubmittedPriceA) {
                        const priceA = BigInt(market.genesisLastSubmittedPriceA);
                        const price = tokenIndex === 0 ? priceA : PRICE_SCALE - priceA; // First token is YES
                        totalUsdValue += (transfer.amount * price) / PRICE_SCALE;
                        break;
                    }
                }
            }
        }
    }

    // Decrease realized value from entries (can reduce multiple entries)
    let remainingValue = totalUsdValue;
    for (const entry of entries) {
        if (remainingValue <= 0n) break;

        const currentValue = BigInt(entry.realizedValue || '0');
        if (currentValue <= remainingValue) {
            // This entry is fully reduced
            await db(REFERRAL_ENTRIES_TABLE).where('id', entry.id).update({
                realizedValue: '0',
            });
            remainingValue -= currentValue;
        } else {
            // Partially reduce this entry
            await db(REFERRAL_ENTRIES_TABLE)
                .where('id', entry.id)
                .update({
                    realizedValue: (currentValue - remainingValue).toString(),
                });
            remainingValue = 0n;
        }
    }
}
