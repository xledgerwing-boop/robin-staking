export function formatAddress(addr?: string) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function getSelectedTitleElement(): HTMLElement | null {
    const maybeTrade = document.getElementById('trade-widget') as HTMLElement | null;
    const titleElement = maybeTrade?.querySelector(':scope > div > div > div > div > div:nth-of-type(2) > p') as HTMLElement | null;
    return titleElement;
}
