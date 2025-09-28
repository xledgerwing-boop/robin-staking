import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function shortenAddress(address?: string | null, beginning = 6): string {
    if (!address) return '-';
    return `${address.slice(0, beginning)}...${address.slice(-4)}`;
}
