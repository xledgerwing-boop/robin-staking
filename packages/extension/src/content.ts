const ROOT_ID = 'pmx-staking-root';
const SCRIPT_ID = 'pmx-inpage-script';

function getOrCreateMountPoint(): HTMLElement | null {
    if (!window.location.pathname.includes('/event/')) return null;
    // Select the Polymarket trade widget by its id.
    const maybeTrade = document.getElementById('trade-widget') as HTMLElement | null;

    const host = maybeTrade ?? document.body;
    if (!host) return null;

    let root = document.getElementById(ROOT_ID) as HTMLElement | null;
    // Resolve extension asset URLs in the content-script context
    const rootPath = typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('') : undefined;
    if (!root) {
        root = document.createElement('div');
        root.id = ROOT_ID;
        if (rootPath) root.dataset.rootPath = rootPath;
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
    } else {
        if (rootPath) root.dataset.rootPath = rootPath;
    }
    return root;
}

function injectInpage() {
    if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = SCRIPT_ID;
        s.src = chrome.runtime.getURL('assets/inpage.js');
        s.type = 'module';
        (document.head || document.documentElement).appendChild(s);
    }
}

function tryMount() {
    const mount = getOrCreateMountPoint();
    if (!mount) return;
    injectInpage();
}

// Initial attempt
tryMount();

// Re-run on SPA URL changes
let __pmx_lastPathname = window.location.pathname;
setInterval(async () => {
    const current = window.location.pathname;
    if (current !== __pmx_lastPathname) {
        __pmx_lastPathname = current;
        tryMount();
    }
}, 500);
