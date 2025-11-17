import { NextRequest, NextResponse } from 'next/server';
import knex from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import { rateLimit } from '@/lib/rate-limit';
import { GENESIS_ACTIVITIES_TABLE } from '@robin-pm-staking/common/lib/repos';
import { GenesisVaultEvent } from '@robin-pm-staking/common/src/types/genesis-events';

const pg = knex({ client: 'pg', connection: process.env.POSTGRES_URI, ...knexSnakeCaseMappers() });

const ALLOWED_TYPES: string[] = [
    GenesisVaultEvent.Deposit,
    GenesisVaultEvent.BatchDeposit,
    GenesisVaultEvent.Withdraw,
    GenesisVaultEvent.BatchWithdraw,
    GenesisVaultEvent.Claim,
    GenesisVaultEvent.MarketAdded,
    GenesisVaultEvent.MarketEnded,
];

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/genesis/activities';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const vaultAddress = request.nextUrl.searchParams.get('vaultAddress');
        const since = request.nextUrl.searchParams.get('since');
        const skip = request.nextUrl.searchParams.get('skip');
        const limit = 10;
        const types = request.nextUrl.searchParams.getAll('types');
        const userAddress = request.nextUrl.searchParams.get('userAddress');

        if (!vaultAddress) return NextResponse.json({ error: 'Missing vaultAddress' }, { status: 400 });

        let query = pg(GENESIS_ACTIVITIES_TABLE).where('vaultAddress', vaultAddress).orderBy('timestamp', 'desc').orderBy('id', 'desc').limit(limit);

        if (since) {
            query = query.where('timestamp', '>', parseInt(since, 10));
        } else if (skip) {
            query = query.offset(parseInt(skip, 10));
        }

        // Always filter to allowed types; allow additional narrowing via query param
        query = query.whereIn('type', types.length > 0 ? types : ALLOWED_TYPES);

        if (userAddress) {
            query = query.where('userAddress', userAddress.toLowerCase());
        }

        const activities = await query;
        return NextResponse.json(activities);
    } catch (error) {
        console.error('Error fetching genesis activities:', error);
        return NextResponse.json({ error: 'Failed to fetch genesis activities' }, { status: 500 });
    }
}
