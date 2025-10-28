import { ensureSchema } from '@robin-pm-staking/common/lib/repos';
import { ensureRewardsSchema } from './rewards';
import knex, { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';

let dbInstance: Knex | null = null;

export async function getDb(): Promise<Knex> {
    if (!dbInstance) {
        const connectionString = process.env.POSTGRES_URI;
        if (!connectionString) {
            throw new Error('POSTGRES_URI env var is required');
        }

        dbInstance = knex({ client: 'pg', connection: connectionString, ...knexSnakeCaseMappers(), pool: { min: 0, max: 10 } });
        await ensureSchema(dbInstance);
        await ensureRewardsSchema(dbInstance);
    }
    return dbInstance;
}
