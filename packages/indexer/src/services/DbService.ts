import knex, { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import { ActivityRow } from '@robin-pm-staking/common/types/activity';
import { MarketRow } from '@robin-pm-staking/common/types/market';
import { ensureSchema } from '@robin-pm-staking/common/lib/repos';

export class DBService {
    public knex: Knex;
    private static instance: DBService;

    public static getInstance(postgresUri: string) {
        if (!this.instance) {
            this.instance = new DBService(postgresUri);
        }
        return this.instance;
    }

    private constructor(postgresUri: string) {
        this.knex = knex({ client: 'pg', connection: postgresUri, ...knexSnakeCaseMappers() });
    }

    public async getMarket(conditionId: string): Promise<MarketRow | undefined> {
        return await this.knex('markets').where('conditionId', conditionId).first();
    }

    public async getMarketByAddress(address: string): Promise<MarketRow | undefined> {
        return await this.knex('markets').where('contractAddress', address).first();
    }

    public async insertMarket(market: MarketRow) {
        await this.knex('markets').insert(market).onConflict().ignore();
    }

    public async updateMarket(conditionId: string, update: Partial<MarketRow>) {
        const updateData: Partial<MarketRow> = { updatedAt: Date.now().toString(), ...update };
        await this.knex('markets').where('conditionId', conditionId).update(updateData);
    }

    public async insertActivity(activity: ActivityRow) {
        await this.knex('activities').insert(activity).onConflict('id').ignore();
    }

    public async setupDatabase() {
        await ensureSchema(this.knex);
    }
}
