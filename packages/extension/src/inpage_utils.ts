export function formatAddress(addr?: string) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
