import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { GENESIS_INTERESTS_TABLE } from '@robin-pm-staking/common/lib/repos';
import { USED_CONTRACTS } from '@robin-pm-staking/common/src/constants';
import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';
import { robinGenesisVaultAbi } from '@robin-pm-staking/common/src/types/contracts-genesis';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/genesis/interest/register';

    if (!rateLimit(ip, endpoint)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const db = await getDb();
        const body = await req.json();
        const proxyAddress = (body?.proxyAddress as string | undefined)?.toLowerCase();
        const vaultAddress = (body?.vaultAddress as string | undefined)?.toLowerCase() || USED_CONTRACTS.GENESIS_VAULT.toLowerCase();
        if (!proxyAddress || !proxyAddress.startsWith('0x') || proxyAddress.length !== 42) {
            return NextResponse.json({ error: 'Invalid proxy address' }, { status: 400 });
        }

        const rpcUrl = process.env.RPC_URL || 'https://polygon-rpc.com';
        const client = createPublicClient({ chain: polygon, transport: http(rpcUrl) });

        // Read on-chain stakeable value tuple: [totalTokens, totalUsd, eligibleUsd]
        const [totalTokens, totalUsd, eligibleUsd] = (await client.readContract({
            address: vaultAddress as `0x${string}`,
            abi: robinGenesisVaultAbi,
            functionName: 'viewUserStakeableValue',
            args: [proxyAddress as `0x${string}`],
        })) as readonly [bigint, bigint, bigint];

        const now = Date.now().toString();
        // Upsert by (vaultAddress,userAddress)
        await db(GENESIS_INTERESTS_TABLE)
            .insert({
                id: `${vaultAddress}:${proxyAddress}`,
                vaultAddress,
                userAddress: proxyAddress,
                totalTokens: totalTokens.toString(),
                totalUsd: totalUsd.toString(),
                eligibleUsd: eligibleUsd.toString(),
                createdAt: now,
                updatedAt: now,
            })
            .onConflict(['vaultAddress', 'userAddress'])
            .merge({
                totalTokens: totalTokens.toString(),
                totalUsd: totalUsd.toString(),
                eligibleUsd: eligibleUsd.toString(),
                updatedAt: now,
            });

        return NextResponse.json({
            ok: true,
            totalTokens: totalTokens.toString(),
            totalUsd: totalUsd.toString(),
            eligibleUsd: eligibleUsd.toString(),
        });
    } catch (e) {
        console.error('POST /api/genesis/interest/register failed', e);
        return NextResponse.json({ error: 'Failed to register interest' }, { status: 500 });
    }
}
