import { PolymarketEventWithMarkets } from '@robin-pm-staking/common/types/event';
import { extractEventSlugFromUrl, fetchEventAndMarketsByEventSlug } from '@robin-pm-staking/common/lib/polymarket';

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
export const SCRIPT_ID = 'pmx-inpage-script';

export async function getEventData(): Promise<PolymarketEventWithMarkets | null> {
    const eventSlug = extractEventSlugFromUrl(window.location.href);
    if (!eventSlug) return null;
    return fetchEventAndMarketsByEventSlug(eventSlug);
}

export function rootPath() {
    return (document.getElementById(SCRIPT_ID) as HTMLElement | null)?.dataset?.rootPath || '/';
}

export function getOrCreateMountPoint(): HTMLElement | null {
    let root = document.getElementById(ROOT_ID) as HTMLElement | null;
    if (root) return root;

    if (window.location.pathname.includes('/sports/live')) return null; // TODO: add support for live sports page

    if (!window.location.pathname.includes('/event/') && !window.location.pathname.includes('/sports/')) return null;

    // Select the Polymarket trade widget by its id.
    const host = document.getElementById('trade-widget') as HTMLElement | null;
    if (!host) return null;

    root = document.createElement('div');
    root.id = ROOT_ID;
    // Insert as the third child of the first child div of the host (if present)
    const firstChildDiv = host.querySelector(':scope > div') as HTMLElement | null;
    if (firstChildDiv) {
        const thirdChild = firstChildDiv.children.item(2);
        if (thirdChild && thirdChild.parentNode === firstChildDiv) {
            firstChildDiv.insertBefore(root, thirdChild);
        } else {
            firstChildDiv.appendChild(root);
        }
    } else {
        host.appendChild(root);
    }

    return root;
}
