import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { robinVaultManagerAbi } from '@robin-pm-staking/common/types/contracts';
import { createPublicClient, createWalletClient, formatEther, http } from 'viem';
import { polygon } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { NotificationService } from '@/lib/notification-service';

type InitializePayload = {
    conditionId: `0x${string}`;
};

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = '/api/markets/initialize';

    if (!rateLimit(ip, endpoint, 1, 60 * 1000)) {
        return NextResponse.json({ error: 'Too many requests. Try again in a few minutes.' }, { status: 429 });
    }

    try {
        const body = (await req.json()) as Partial<InitializePayload>;
        const conditionId = body?.conditionId;
        if (!conditionId || typeof conditionId !== 'string' || !conditionId.startsWith('0x')) {
            return NextResponse.json({ error: 'Missing or invalid conditionId' }, { status: 400 });
        }

        const rpcUrl = process.env.RPC_URL;
        const pk = process.env.PRIVATE_KEY;
        if (!rpcUrl) return NextResponse.json({ error: 'RPC not configured' }, { status: 500 });
        if (!pk) return NextResponse.json({ error: 'Server wallet not configured' }, { status: 500 });

        const account = privateKeyToAccount((pk.startsWith('0x') ? pk : `0x${pk}`) as `0x${string}`);
        const walletClient = createWalletClient({ chain: polygon, account, transport: http(rpcUrl) });
        const publicClient = createPublicClient({
            chain: polygon,
            transport: http(rpcUrl),
        });

        const balanceBefore = await publicClient.getBalance({ address: account.address });

        const txHash = await walletClient.writeContract({
            address: USED_CONTRACTS.VAULT_MANAGER,
            abi: robinVaultManagerAbi,
            functionName: 'createVault',
            args: [conditionId as `0x${string}`],
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        const balanceAfter = await publicClient.getBalance({ address: account.address });
        const spentWei = balanceBefore > balanceAfter ? balanceBefore - balanceAfter : 0n;

        // Fire-and-forget notification (don't block response on potential Telegram issues)
        NotificationService.sendNotification(
            `✅ Vault created\n` +
                `ConditionId: ${conditionId}\n` +
                `Tx: ${txHash}\n` +
                `POL before: ${formatEther(balanceBefore)}\n` +
                `POL after: ${formatEther(balanceAfter)}\n` +
                `POL diff: ${formatEther(spentWei)}`
        ).catch(() => {});

        return NextResponse.json({ ok: true, txHash, status: receipt.status });
    } catch (e) {
        console.error('initialize market error', e);
        return NextResponse.json({ error: 'Failed to initialize market' }, { status: 500 });
    }
}
