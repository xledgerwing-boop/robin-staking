'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useConfig, useWaitForTransactionReceipt } from 'wagmi';
import { CreateUseWriteContractReturnType } from 'wagmi/codegen';
import {
    Abi,
    ContractFunctionName,
    WaitForTransactionReceiptErrorType,
    encodeFunctionData,
    zeroAddress,
    padHex,
    concatHex,
    custom,
    http,
} from 'viem';
import { WriteContractData } from 'wagmi/query';
import { useProxyAccount } from './use-proxy-account';
import { useWriteGnosisSafeL2ExecTransaction } from '../types/contracts';
import Safe, { Eip1193Provider } from '@safe-global/protocol-kit';
import { TransactionResult } from '@safe-global/types-kit';
import { waitForTransactionReceipt } from 'wagmi/actions';

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
    batch: (items: (BatchItem<TAbi, TFunctionName, TContext> & { hookIndex: number })[]) => Promise<TransactionResult | WriteContractData>;
    isLoading: boolean;
    promise: React.RefObject<Promise<boolean> | null>;
} {
    const { proxyAddress, address: owner, connector } = useProxyAccount();
    const hookData = _hooks.map(hook => hook());

    const { data: hash, isPending, writeContractAsync: safeWriteContract } = useWriteGnosisSafeL2ExecTransaction();
    const { isLoading: receiptLoading, isSuccess, error } = useWaitForTransactionReceipt({ hash });
    const [batchRunning, setBatchRunning] = useState(false);
    const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);
    const rejectRef = useRef<((reason?: unknown) => void) | undefined>(undefined);
    const promiseRef = useRef<Promise<boolean> | null>(null);
    const protocolKit = useRef<Safe | null>(null);
    const config = useConfig();

    const isLoading = isPending || receiptLoading || batchRunning;

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
            if (connector && proxyAddress && typeof connector.getProvider === 'function') {
                const localTransport = process.env.NEXT_PUBLIC_LOCAL_TRANSPORT_ENABLED === 'true';
                let provider: Eip1193Provider | undefined = undefined;
                if (localTransport) {
                    provider = http('http://127.0.0.1:8545')({});
                    //provider = custom((window as any).ethereum)({});
                } else {
                    provider = (await connector.getProvider()) as Eip1193Provider;
                }
                Safe.init({ provider, safeAddress: proxyAddress }).then(safe => {
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
        items: (BatchItem<TAbi, TFunctionName, TContext> & { hookIndex: number })[]
    ): Promise<TransactionResult | WriteContractData> => {
        if (!proxyAddress) throw new Error('Missing proxyAddress (Safe).');
        if (!owner) throw new Error('Missing connected owner address.');
        if (!protocolKit.current) throw new Error('Missing protocolKit.');
        if (!Array.isArray(items) || items.length === 0) throw new Error('Missing items for batch.');

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
        try {
            setBatchRunning(true);
            const safeTx = await protocolKit.current.createTransaction({ transactions: txs });
            // return await safeWriteContract({
            //     address: proxyAddress as `0x${string}`,
            //     args: [
            //         safeTx.data.to as `0x${string}`,
            //         BigInt(safeTx.data.value),
            //         safeTx.data.data as `0x${string}`,
            //         OPERATION_CALL,
            //         0n,
            //         0n,
            //         0n,
            //         zeroAddress,
            //         zeroAddress,
            //         safeTx.encodedSignatures() as `0x${string}`,
            //     ],
            // });
            const executeTxResponse = await protocolKit.current.executeTransaction(safeTx);
            await waitForTransactionReceipt(config, { hash: executeTxResponse.hash as `0x${string}` });
            return executeTxResponse;
        } finally {
            setBatchRunning(false);
        }
    };

    return { error, write, batch, isLoading, promise: promiseRef };
}
