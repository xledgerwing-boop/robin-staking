import { Abi, Address, ContractFunctionName } from 'viem';
import {
    createUseWriteContract as createUseWriteContractOriginal,
    CreateUseWriteContractParameters,
    CreateUseWriteContractReturnType,
} from 'wagmi/codegen';

type stateMutability = 'nonpayable' | 'payable';

export function createUseWriteContract<
    const abi extends Abi | readonly unknown[],
    const address extends Address | Record<number, Address> | undefined = undefined,
    functionName extends ContractFunctionName<abi, stateMutability> | undefined = undefined
>(props: CreateUseWriteContractParameters<abi, address, functionName>): CreateUseWriteContractReturnType<abi, address, functionName> {
    const resultFn = createUseWriteContractOriginal(props);
    return parameters => {
        return {
            ...resultFn(parameters),
            functionName: props.functionName, //we need these extra props exposed for out proxy, multi-transaction call hook
            abi: props.abi,
        };
    };
}
