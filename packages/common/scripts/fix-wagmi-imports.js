/*
  Post-wagmi generate import fix:
  - Replace combined import of createUseWriteContract from 'wagmi/codegen'
    with a local import from './createUseWriteContract'.
*/

const fs = require('fs');
const path = require('path');

try {
    const targetPath = path.resolve(__dirname, '..', 'src', 'types', 'contracts.ts');
    replaceImports(targetPath);

    const targetPathPromo = path.resolve(__dirname, '..', 'src', 'types', 'contracts-promo.ts');
    replaceImports(targetPathPromo);
} catch (err) {
    console.error('[fix-wagmi-imports] Failed:', err);
    process.exit(1);
}

function replaceImports(targetPath) {
    if (!fs.existsSync(targetPath)) {
        process.exit(0);
    }

    const source = fs.readFileSync(targetPath, 'utf8');

    const pattern = new RegExp(
        String.raw`^import \{\s*createUseReadContract,\s*createUseWriteContract,\s*createUseSimulateContract,\s*createUseWatchContractEvent\s*\} from 'wagmi/codegen';?`,
        'm'
    );

    if (!pattern.test(source)) {
        process.exit(0);
    }

    const replaced = source.replace(
        pattern,
        "import { createUseReadContract, createUseSimulateContract, createUseWatchContractEvent } from 'wagmi/codegen';\nimport { createUseWriteContract } from './createUseWriteContract';"
    );

    fs.writeFileSync(targetPath, replaced, 'utf8');
}
