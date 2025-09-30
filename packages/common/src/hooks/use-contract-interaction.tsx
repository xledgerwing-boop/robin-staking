'use client';

import { useWaitForTransactionReceipt } from 'wagmi';
import { useEffect, useRef } from 'react';
import { CreateUseWriteContractReturnType } from 'wagmi/codegen';
import { Abi, ContractFunctionName, WaitForTransactionReceiptErrorType } from 'viem';
import { WriteContractData } from 'wagmi/query';

export default function useContractInteraction<
    TAbi extends Abi,
    TFunctionName extends `0x${string}` | Record<number, `0x${string}`> | undefined,
    TContext extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'> | undefined = undefined
>(
    hook: CreateUseWriteContractReturnType<TAbi, TFunctionName, TContext>
): {
    error: WaitForTransactionReceiptErrorType | null;
    write: (
        args: Parameters<ReturnType<CreateUseWriteContractReturnType<TAbi, TFunctionName, TContext>>['writeContractAsync']>[0]
    ) => Promise<WriteContractData>;
    isLoading: boolean;
    promise: React.RefObject<Promise<boolean> | null>;
} {
    const { data: hash, isPending, writeContractAsync: writeContract } = hook();
    const { isLoading: receiptLoading, isSuccess, error } = useWaitForTransactionReceipt({ hash });
    const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);
    const rejectRef = useRef<((reason?: any) => void) | undefined>(undefined);
    const promiseRef = useRef<Promise<boolean> | null>(null);

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

    const write = async (args: Parameters<typeof writeContract>[0]) => {
        promiseRef.current = new Promise<boolean>((resolve, reject) => {
            resolveRef.current = resolve;
            rejectRef.current = reject;
        });
        return await writeContract(args);
    };

    return { error, write, isLoading, promise: promiseRef };
}
