async function main(payload) {
    const { data } = payload;

    const relevantLogs = [];
    for (const blockData of data) {
        const timestamp = blockData.block.timestamp;
        for (const receipt of blockData.receipts) {
            for (const log of receipt.logs) {
                const isRelevant = log.address.toLowerCase() === promotionVault;
                if (isRelevant) {
                    relevantLogs.push({ ...log, timestamp });
                }
            }
        }
    }

    return relevantLogs;
}

const promotionVault = '0x443d773831c8B542F20bd9712c672084911eE10B'.toLowerCase();
