import { USED_CONTRACTS } from '@robin-pm-staking/common/constants';
import { safeProxyFactoryAbi } from '@robin-pm-staking/common/types/contracts';
import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

const client = createPublicClient({
    chain: polygon,
    transport: http(process.env.RPC_URL),
});

export async function getProxyAddressForUser(eoaAddress: string): Promise<string | null> {
    // TODO: Implement real on-chain lookup. For now, return the lowercased input as placeholder.
    // You can change this to derive Safe proxy address or query your factory.
    if (!eoaAddress) return null;
    const proxyAddress = await client.readContract({
        address: USED_CONTRACTS.SAFE_PROXY_FACTORY,
        abi: safeProxyFactoryAbi,
        functionName: 'computeProxyAddress',
        args: [eoaAddress as `0x${string}`],
    });
    return proxyAddress.toLowerCase();
}
