// @ts-check
import { react } from '@wagmi/cli/plugins';
import { pascalCase } from 'change-case';
import { safeProxyFactoryAbi } from './types/abis/SafeProxyFactory';
import { gnosisSafeL2Abi } from './types/abis/GnosisSafeL2';

const nameMap: Record<string, number> = {};

export default {
    out: 'types/contracts.ts',
    contracts: [
        {
            name: 'SafeProxyFactory',
            abi: safeProxyFactoryAbi,
        },
        {
            name: 'GnosisSafeL2',
            abi: gnosisSafeL2Abi,
        },
    ],
    plugins: [
        react({
            getHookName({ contractName, type, itemName }) {
                const name = originalGetHookName(type, contractName, itemName);
                if (nameMap[name] === undefined) {
                    nameMap[name] = 0;
                    return name as `use${string}`;
                }
                nameMap[name]++;
                return (name + '_' + nameMap[name]) as `use${string}`;
            },
        }),
    ],
};

const originalGetHookName = function (type: 'read' | 'simulate' | 'watch' | 'write', contractName: string, itemName?: string) {
    const ContractName = pascalCase(contractName);
    const ItemName = itemName ? pascalCase(itemName) : undefined;

    let hookName = `use${pascalCase(type)}${ContractName}${ItemName ?? ''}`;
    if (type === 'watch') hookName = `${hookName}Event`;
    return hookName;
};
