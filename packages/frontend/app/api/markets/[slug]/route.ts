import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureSchema, queryMarketBySlug } from '@/lib/repos';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const db = getDb();
    await ensureSchema(db);

    const { slug } = await params;

    try {
        const result = await queryMarketBySlug(db, slug);
        return NextResponse.json(result);
    } catch {
        return NextResponse.json({ error: 'Failed to query markets' }, { status: 500 });
    }
}
