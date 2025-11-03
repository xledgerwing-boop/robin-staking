import knex, { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import { ActivityRow } from '@robin-pm-staking/common/types/activity';
import { MarketRow } from '@robin-pm-staking/common/types/market';
import { ensureSchema, USER_POSITIONS_TABLE } from '@robin-pm-staking/common/lib/repos';
import { UserPositionRow } from '@robin-pm-staking/common/types/position';

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

    public async getActivity(id: string): Promise<ActivityRow | undefined> {
        return await this.knex('activities').where('id', id).first();
    }

    public async adjustUserPosition(
        userAddress: string,
        conditionId: string,
        vaultAddress: string | undefined,
        deltas: { yesDelta?: bigint; noDelta?: bigint; yieldDelta?: bigint; usdRedeemedDelta?: bigint }
    ) {
        const now = Date.now().toString();
        const id = `${userAddress.toLowerCase()}:${conditionId}`;
        const yesDelta = (deltas.yesDelta ?? 0n).toString();
        const noDelta = (deltas.noDelta ?? 0n).toString();
        const yieldDelta = (deltas.yieldDelta ?? 0n).toString();
        const usdRedeemedDelta = (deltas.usdRedeemedDelta ?? 0n).toString();

        // Insert-then-merge with atomic increments
        await this.knex(USER_POSITIONS_TABLE)
            .insert(<UserPositionRow>{
                id,
                userAddress: userAddress.toLowerCase(),
                conditionId,
                vaultAddress,
                yesTokens: yesDelta,
                noTokens: noDelta,
                yieldHarvested: yieldDelta,
                usdRedeemed: usdRedeemedDelta,
                createdAt: now,
                updatedAt: now,
            })
            .onConflict(['userAddress', 'conditionId'])
            .merge({
                vaultAddress,
                updatedAt: now,
                yesTokens: this.knex.raw('??.?? + ?', [USER_POSITIONS_TABLE, 'yes_tokens', yesDelta]),
                noTokens: this.knex.raw('??.?? + ?', [USER_POSITIONS_TABLE, 'no_tokens', noDelta]),
                yieldHarvested: this.knex.raw('??.?? + ?', [USER_POSITIONS_TABLE, 'yield_harvested', yieldDelta]),
                usdRedeemed: this.knex.raw('??.?? + ?', [USER_POSITIONS_TABLE, 'usd_redeemed', usdRedeemedDelta]),
            });
    }

    public async setupDatabase() {
        await ensureSchema(this.knex);
    }
}
