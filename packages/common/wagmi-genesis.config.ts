// @ts-check
import { react, foundry } from '@wagmi/cli/plugins';
import { pascalCase } from 'change-case';

const nameMap: Record<string, number> = {};

export default {
    out: 'src/types/contracts-genesis.ts',
    plugins: [
        foundry({
            forge: {
                build: true,
                clean: false,
            },
            project: '../contracts/',
            include: ['**/RobinGenesisVault.json'],
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
