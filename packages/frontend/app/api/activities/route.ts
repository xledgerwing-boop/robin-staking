import { NextRequest, NextResponse } from 'next/server';
import knex from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import { rateLimit } from '@/lib/rate-limit';

const pg = knex({ client: 'pg', connection: process.env.POSTGRES_URI, ...knexSnakeCaseMappers() });

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/activities'; // Unique identifier per API

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

        let query = pg('activities').where('vaultAddress', vaultAddress).orderBy('timestamp', 'desc').limit(limit);

        if (since) {
            query = query.where('timestamp', '>', parseInt(since, 10));
        } else if (skip) {
            query = query.offset(parseInt(skip, 10));
        }

        if (types.length > 0) {
            query = query.whereIn('type', types);
        }

        if (userAddress) {
            query = query.where('userAddress', userAddress);
        }

        const activities = await query;
        return NextResponse.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
