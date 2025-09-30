import { PolymarketEvent } from '@robin-pm-staking/common/src/types/types';

export function formatAddress(addr?: string) {
    if (!addr) return '';
    return `${addr.slice(0, 4)}…${addr.slice(-2)}`;
}

export function getSelectedTitleElement(closed: boolean): HTMLElement | null {
    const maybeTrade = document.getElementById('trade-widget') as HTMLElement | null;
    if (!closed) {
        const titleElement = maybeTrade?.querySelector(':scope > div > div > div > div > div:nth-of-type(2) > p') as HTMLElement | null;
        return titleElement;
    } else {
        const titleElement = maybeTrade?.querySelector(':scope > div > div > div > p:nth-of-type(2)') as HTMLElement | null;
        return titleElement;
    }
}

export const ROOT_ID = 'pmx-staking-root';

export async function getEventData(): Promise<PolymarketEvent | null> {
    const pathname = window.location.pathname;
    const eventSlug = pathname.split('/')[2];
    if (!eventSlug) return null;
    const data = await fetch(`https://gamma-api.polymarket.com/events/slug/${eventSlug}`);
    const json = await data.json();
    return json;
}

export function rootPath() {
    return (document.getElementById(ROOT_ID) as HTMLElement | null)?.dataset?.rootPath || '/';
}
