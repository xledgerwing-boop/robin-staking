import { rateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/health'; // Unique identifier per API

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Error fetching health:', error);
        return NextResponse.json({ error: 'Failed to fetch health' }, { status: 500 });
    }
}
