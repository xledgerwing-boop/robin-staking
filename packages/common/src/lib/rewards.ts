import { ACTIVITIES_TABLE, GENESIS_ACTIVITIES_TABLE } from './repos';
import { VaultEvent } from '../types/conract-events';
import { Knex } from 'knex';
import { RewardActivity, RewardActivityRow } from '../types/reward-activity';
import { FeedbackSubmission, FeedbackSubmissionRow } from '../types/feedback-submission';
import { GenesisVaultEvent } from '../types/genesis-events';

export const REWARD_ACTIVITIES_TABLE = 'reward_activities';
export const FEEDBACK_SUBMISSIONS_TABLE = 'feedback_submissions';

export async function ensureRewardsSchema(db: Knex): Promise<void> {
    const hasRewards = await db.schema.hasTable(REWARD_ACTIVITIES_TABLE);
    if (!hasRewards) {
        await db.schema.createTable(REWARD_ACTIVITIES_TABLE, table => {
            table.string('id').primary();
            table.string('userAddress').notNullable().index();
            table.integer('points').notNullable();
            table.string('type').notNullable();
            table.jsonb('details');
            table.bigint('createdAt').notNullable();
        });
    }

    const hasFeedback = await db.schema.hasTable(FEEDBACK_SUBMISSIONS_TABLE);
    if (!hasFeedback) {
        await db.schema.createTable(FEEDBACK_SUBMISSIONS_TABLE, table => {
            table.string('id').primary();
            table.string('userAddress').notNullable().index();
            table.string('proxyAddress');
            table.jsonb('answers').notNullable();
            table.bigint('createdAt').notNullable();
            table.unique(['userAddress']); // one feedback per user for this program
        });
    }
}

export async function doesUserHaveDeposit(db: Knex, proxyAddress: string): Promise<boolean> {
    const row = await db(ACTIVITIES_TABLE).where('type', VaultEvent.Deposited).andWhere('userAddress', proxyAddress.toLowerCase()).first();
    return !!row;
}

export async function doesUserHaveGenesisDeposit(db: Knex, proxyAddress: string): Promise<boolean> {
    const row = await db(GENESIS_ACTIVITIES_TABLE)
        .whereIn('type', [GenesisVaultEvent.Deposit, GenesisVaultEvent.BatchDeposit])
        .andWhere('userAddress', proxyAddress.toLowerCase())
        .first();
    return !!row;
}

export async function doesUserQualifyForFeedbackReward(db: Knex, proxyAddress: string): Promise<boolean> {
    let hasDeposit = await doesUserHaveDeposit(db, proxyAddress);
    if (!hasDeposit) {
        hasDeposit = await doesUserHaveGenesisDeposit(db, proxyAddress);
    }
    return hasDeposit;
}

export async function queryUserRewardActivities(db: Knex, userAddress: string): Promise<RewardActivityRow[]> {
    const rows = (await db(REWARD_ACTIVITIES_TABLE)
        .where('userAddress', userAddress.toLowerCase())
        .orderBy('createdAt', 'desc')) as RewardActivityRow[];
    return rows ?? [];
}

export async function getUserAggregatedPoints(db: Knex, userAddress: string): Promise<number> {
    const result = await db(REWARD_ACTIVITIES_TABLE).where('userAddress', userAddress.toLowerCase()).sum<{ sum: string }[]>({ sum: 'points' });
    return Number(result?.[0]?.sum ?? 0);
}

export async function insertRewardActivity(
    db: Knex,
    row: Omit<RewardActivity, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
): Promise<RewardActivityRow> {
    const toInsert: RewardActivityRow = {
        id: row.id ?? crypto.randomUUID(),
        userAddress: row.userAddress.toLowerCase(),
        points: row.points,
        type: row.type,
        details: row.details ?? null,
        createdAt: row.createdAt ?? Date.now().toString(),
    } as RewardActivityRow;
    await db(REWARD_ACTIVITIES_TABLE).insert(toInsert).onConflict('id').ignore();
    return toInsert;
}

export async function hasUserSubmittedFeedback(db: Knex, userAddress: string): Promise<boolean> {
    const row = await db(FEEDBACK_SUBMISSIONS_TABLE).where('userAddress', userAddress.toLowerCase()).first();
    return !!row;
}

export async function upsertFeedbackSubmission(
    db: Knex,
    submission: Omit<FeedbackSubmission, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<FeedbackSubmissionRow> {
    const toInsert: FeedbackSubmissionRow = {
        id: submission.id ?? crypto.randomUUID(),
        userAddress: submission.userAddress.toLowerCase(),
        proxyAddress: submission.proxyAddress ?? null,
        answers: JSON.stringify(submission.answers),
        createdAt: submission.createdAt ?? Date.now().toString(),
    };

    // one-per-user policy: insert or replace existing
    const existing = (await db(FEEDBACK_SUBMISSIONS_TABLE).where('userAddress', toInsert.userAddress).first()) as FeedbackSubmissionRow | undefined;
    if (existing) {
        await db(FEEDBACK_SUBMISSIONS_TABLE)
            .where('userAddress', toInsert.userAddress)
            .update({ answers: toInsert.answers, proxyAddress: toInsert.proxyAddress, createdAt: Date.now().toString() });
        return (await db(FEEDBACK_SUBMISSIONS_TABLE).where('userAddress', toInsert.userAddress).first()) as FeedbackSubmissionRow;
    }

    await db(FEEDBACK_SUBMISSIONS_TABLE).insert(toInsert);
    return toInsert;
}

export async function listFeedbackSubmissions(
    db: Knex,
    page: number,
    pageSize: number
): Promise<{ rows: FeedbackSubmissionRow[]; totalCount: number }> {
    const safePage = Math.max(1, isNaN(page) ? 1 : page);
    const safePageSize = Math.max(1, Math.min(pageSize, 100));
    const offset = (safePage - 1) * safePageSize;

    const base = db(FEEDBACK_SUBMISSIONS_TABLE);
    const countRows = await base.clone().count<{ count: string }[]>({ count: '*' });
    const totalCount = Number(countRows?.[0]?.count ?? 0);
    const rows = (await base.clone().orderBy('createdAt', 'desc').limit(safePageSize).offset(offset)) as FeedbackSubmissionRow[];
    return { rows: rows ?? [], totalCount };
}
