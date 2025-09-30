'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useWaitForTransactionReceipt, useWalletClient } from 'wagmi';
import { CreateUseWriteContractReturnType } from 'wagmi/codegen';
import { Abi, ContractFunctionName, WaitForTransactionReceiptErrorType, encodeFunctionData, zeroAddress, padHex, concatHex } from 'viem';
import { WriteContractData } from 'wagmi/query';
import { useProxyAccount } from './use-proxy-account';
import { useWriteGnosisSafeL2ExecTransaction } from '../types/contracts';
import Safe, { Eip1193Provider } from '@safe-global/protocol-kit';
import { TransactionResult } from '@safe-global/types-kit';

const OPERATION_CALL = 0; // Gnosis Safe Enum.Operation.CALL

type WriteArgs<
    TAbi extends Abi,
    TFunctionName extends `0x${string}` | Record<number, `0x${string}`> | undefined,
    TContext extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'> | undefined
> = Parameters<ReturnType<CreateUseWriteContractReturnType<TAbi, TFunctionName, TContext>>['writeContractAsync']>[0];

type BatchItem<
    TAbi extends Abi,
    TFunctionName extends `0x${string}` | Record<number, `0x${string}`> | undefined,
    TContext extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'> | undefined
> = WriteArgs<TAbi, TFunctionName, TContext>;

export default function useProxyContractInteraction<
    TAbi extends Abi,
    TFunctionName extends `0x${string}` | Record<number, `0x${string}`> | undefined,
    TContext extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'> | undefined = undefined
>(
    _hooks: CreateUseWriteContractReturnType<TAbi, TFunctionName, TContext>[]
): {
    error: WaitForTransactionReceiptErrorType | null;
    write: (args: WriteArgs<TAbi, TFunctionName, TContext> & { hookIndex: number }) => Promise<WriteContractData>;
    batch: (
        items: (BatchItem<TAbi, TFunctionName, TContext> & { hookIndex: number })[],
        options?: { atomic?: boolean }
    ) => Promise<TransactionResult | WriteContractData[]>;
    isLoading: boolean;
    promise: React.RefObject<Promise<boolean> | null>;
} {
    const { data: walletClient } = useWalletClient();
    const { proxyAddress, address: owner, connector } = useProxyAccount();
    const hookData = _hooks.map(hook => hook());

    const { data: hash, isPending, writeContractAsync: safeWriteContract } = useWriteGnosisSafeL2ExecTransaction();
    const { isLoading: receiptLoading, isSuccess, error } = useWaitForTransactionReceipt({ hash });
    const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);
    const rejectRef = useRef<((reason?: unknown) => void) | undefined>(undefined);
    const promiseRef = useRef<Promise<boolean> | null>(null);
    const protocolKit = useRef<Safe | null>(null);

    const isLoading = isPending || receiptLoading;

    useEffect(() => {
        if (!isLoading) {
            if (isSuccess) {
                resolveRef.current?.(isSuccess);
            } else if (error) {
                rejectRef.current?.(error);
            }
        }
    }, [isLoading, isSuccess, error]);

    useEffect(() => {
        const init = async () => {
            if (connector && proxyAddress) {
                Safe.init({ provider: (await connector.getProvider()) as Eip1193Provider, safeAddress: proxyAddress }).then(safe => {
                    protocolKit.current = safe;
                });
            }
        };
        init();
    }, [connector, proxyAddress]);

    const buildPrevalidatedSig = useMemo(() => {
        return (ownerAddr: `0x${string}`): `0x${string}` => {
            const r = padHex(ownerAddr, { size: 32 });
            const s = ('0x' + '00'.repeat(32)) as `0x${string}`;
            const v = '0x01';
            return concatHex([r, s, v as `0x${string}`]);
        };
    }, []);

    const write = async (args: WriteArgs<TAbi, TFunctionName, TContext> & { hookIndex: number }) => {
        if (!proxyAddress) throw new Error('Missing proxyAddress (Safe).');
        if (!owner) throw new Error('Missing connected owner address.');
        const to = (args as any).address as `0x${string}`;
        const functionName = (hookData[args.hookIndex] as any).functionName as string | undefined;
        const abi = (hookData[args.hookIndex] as any).abi as Abi | undefined;
        const fnArgs = (args as any).args as readonly unknown[] | undefined;
        const msgValue = typeof (args as any).value === 'bigint' ? ((args as any).value as bigint) : 0n;
        if (!to) throw new Error('Target address is required in args.address');
        if (!abi || !functionName) throw new Error('Proxy execution requires args.abi and args.functionName');

        const dataCalldata = encodeFunctionData({ abi, functionName, args: (fnArgs || []) as any });
        const signatures = buildPrevalidatedSig(owner as `0x${string}`);

        promiseRef.current = new Promise<boolean>((resolve, reject) => {
            resolveRef.current = resolve;
            rejectRef.current = reject;
        });

        return await safeWriteContract({
            address: proxyAddress as `0x${string}`,
            args: [to, msgValue, dataCalldata, OPERATION_CALL, 0n, 0n, 0n, zeroAddress, zeroAddress, signatures],
        });
    };

    const batch = async (
        items: (BatchItem<TAbi, TFunctionName, TContext> & { hookIndex: number })[],
        options?: { atomic?: boolean }
    ): Promise<TransactionResult | WriteContractData[]> => {
        if (!proxyAddress) throw new Error('Missing proxyAddress (Safe).');
        if (!owner) throw new Error('Missing connected owner address.');
        if (!protocolKit.current) throw new Error('Missing protocolKit.');
        if (!Array.isArray(items) || items.length === 0) throw new Error('Missing items for batch.');

        const atomic = options?.atomic ?? false;

        // Build the array of single-call txs (to, value, data)
        const txs = items.map(it => {
            const to = (it as any).address as `0x${string}`;
            const fn = (hookData[it.hookIndex] as any).functionName as string | undefined;
            const abi = (hookData[it.hookIndex] as any).abi as Abi | undefined;
            const fnArgs = (it as any).args as readonly unknown[] | undefined;
            const msgValue = typeof (it as any).value === 'bigint' ? ((it as any).value as bigint) : 0n;
            if (!to) throw new Error('Target address is required for each batch item');
            if (!abi || !fn) throw new Error('Each batch item requires abi and functionName');
            const data = encodeFunctionData({ abi, functionName: fn as any, args: (fnArgs || []) as any });
            return { to, value: msgValue.toString(), data };
        });
        if (atomic) {
            if (!walletClient) throw new Error('Missing wallet client for Safe Protocol Kit');

            const safeTx = await protocolKit.current.createTransaction({ transactions: txs });
            const executeTxResponse = await protocolKit.current.executeTransaction(safeTx);
            return executeTxResponse;
        }

        const signatures = buildPrevalidatedSig(owner as `0x${string}`);
        const results: WriteContractData[] = [];
        for (const { to, value, data } of txs) {
            const res = await safeWriteContract({
                address: proxyAddress as `0x${string}`,
                args: [to, BigInt(value), data, OPERATION_CALL, 0n, 0n, 0n, zeroAddress, zeroAddress, signatures],
            });
            results.push(res);
        }
        return results;
    };

    return { error, write, batch, isLoading, promise: promiseRef };
}
