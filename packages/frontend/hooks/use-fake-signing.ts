import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { encodeFunctionData, erc20Abi, zeroAddress, padHex, concatHex } from 'viem';
import { useWriteGnosisSafeL2ExecTransaction } from '@/types/contracts';
import { useProxyAccount } from './use-proxy-account';
import { USED_CONTRACTS } from '@/lib/constants';

const OPERATION_CALL = 0; // Gnosis Safe Enum.Operation.CALL

export default function useFakeSigning() {
    const { address: owner } = useAccount();
    const { proxyAddress } = useProxyAccount();

    const { writeContractAsync } = useWriteGnosisSafeL2ExecTransaction();

    // Build the special "pre-validated" signature (owner == msg.sender).
    const buildPrevalidatedSig = useCallback((ownerAddr: `0x${string}`): `0x${string}` => {
        // r = owner address (left-padded to 32 bytes), s = 0x00..00, v = 0x01
        const r = padHex(ownerAddr, { size: 32 });
        const s = '0x' + '00'.repeat(32);
        const v = '0x01';
        return concatHex([r, s as `0x${string}`, v]);
    }, []);

    /**
     * Approve `spender` to spend `amount` of `token` FROM the Safe.
     * `amount` should be a bigint (use `parseUnits` at call site if needed).
     */
    const approve = async () => {
        if (!proxyAddress) throw new Error('Missing proxyAddress (Safe).');
        if (!owner) throw new Error('Missing connected owner address.');

        const dataCalldata = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [owner, 0n],
        });

        const signatures = buildPrevalidatedSig(owner);

        try {
            await writeContractAsync({
                address: proxyAddress as `0x${string}`,
                // execTransaction(
                //   to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures
                // )
                args: [
                    USED_CONTRACTS.USDCE,
                    0n,
                    dataCalldata,
                    OPERATION_CALL,
                    0n, // safeTxGas
                    0n, // baseGas
                    0n, // gasPrice
                    zeroAddress, // gasToken
                    zeroAddress, // refundReceiver
                    signatures,
                ],
            });
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(error);
        }
    };

    return { approve };
}
