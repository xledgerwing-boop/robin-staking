// @ts-check
import { react, foundry } from '@wagmi/cli/plugins';
import { pascalCase } from 'change-case';
import { safeProxyFactoryAbi } from './src/types/abis/SafeProxyFactory';
import { gnosisSafeL2Abi } from './src/types/abis/GnosisSafeL2';
import { conditionalTokensAbi } from './src/types/abis/ConditionalTokens';

const nameMap: Record<string, number> = {};

export default {
    out: 'src/types/contracts.ts',
    contracts: [
        {
            name: 'SafeProxyFactory',
            abi: safeProxyFactoryAbi,
        },
        {
            name: 'GnosisSafeL2',
            abi: gnosisSafeL2Abi,
        },
        {
            name: 'ConditionalTokens',
            abi: conditionalTokensAbi,
        },
    ],
    plugins: [
        foundry({
            forge: {
                build: true,
                clean: false,
            },
            project: '/Users/ferdinandmartini/Projects/BloomStudios/robin-staking-vaults',
            exclude: ['**Errors**', '**IERC20**'],
        }),
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
