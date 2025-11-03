export const BLOCKED_ADDRESSES: Set<string> = new Set(['0xE58ED128325A33afD08e90187dB0640619819413'.toLowerCase()]);

export function isAddressBlocked(address?: string | null): boolean {
    if (!address) return false;
    return BLOCKED_ADDRESSES.has(address.toLowerCase());
}
