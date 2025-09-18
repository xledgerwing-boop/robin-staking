const ROOT_ID = 'pmx-staking-root';

export function getOrCreateMountPoint(): HTMLElement | null {
    // Select the Polymarket trade widget by its id.
    const maybeTrade = document.getElementById('trade-widget') as HTMLElement | null;

    const host = maybeTrade ?? document.body;
    if (!host) return null;

    let root = document.getElementById(ROOT_ID) as HTMLElement | null;
    if (!root) {
        root = document.createElement('div');
        root.id = ROOT_ID;
        root.style.marginTop = '16px';
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
    }
    return root;
}

export function alreadyInjected(): boolean {
    return !!document.getElementById(ROOT_ID);
}
