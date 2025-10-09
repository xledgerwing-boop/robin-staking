import './tailwind.css';
import { createRoot, type Root } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { ROOT_ID, rootPath } from './inpage_utils';
import { StakingCard } from './components/staking-card';
import { Toaster } from '@/components/ui/sonner';
import { Web3Provider } from './components/web-3-provider';
import { Drawer, DrawerContent } from './components/ui/drawer';

const OPEN_DRAWER_EVENT = 'pmx:open-drawer';

function App() {
    const [isSmall, setIsSmall] = useState<boolean>(() => window.matchMedia('(max-width: 1023px)').matches);
    const [open, setOpen] = useState(false);
    const [dialogEl, setDialogEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 1023px)');
        const onChange = () => setIsSmall(mql.matches);
        try {
            mql.addEventListener('change', onChange);
        } catch (_e) {
            // Safari <14
            // @ts-ignore
            mql.addListener(onChange);
        }
        return () => {
            try {
                mql.removeEventListener('change', onChange);
            } catch (_e) {
                // @ts-ignore
                mql.removeListener(onChange);
            }
        };
    }, []);

    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener(OPEN_DRAWER_EVENT as any, handler as any);
        return () => window.removeEventListener(OPEN_DRAWER_EVENT as any, handler as any);
    }, []);

    useEffect(() => {
        if (!isSmall) {
            setDialogEl(null);
            return;
        }
        let mo: MutationObserver | null = null;
        const find = () => {
            const el = document.querySelector('div[role="dialog"][data-vaul-drawer-direction="bottom"]') as HTMLElement | null;
            if (el !== dialogEl) setDialogEl(el);
        };
        find();
        try {
            mo = new MutationObserver(find);
            mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
        } catch (_e) {
            // swallow
        }
        return () => mo?.disconnect();
    }, [isSmall, dialogEl]);

    const portalContainer = (window as any).__pmxPortalContainer as HTMLElement | undefined;

    return (
        <div className="mt-4">
            <Web3Provider>
                {isSmall ? (
                    <Drawer open={open} onOpenChange={setOpen}>
                        <DrawerContent portalContainer={portalContainer}>
                            <StakingCard isMobile={true} mobileDialog={dialogEl} />
                        </DrawerContent>
                    </Drawer>
                ) : (
                    <StakingCard />
                )}
            </Web3Provider>
            <Toaster />
        </div>
    );
}

let reactRoot: Root | null = null;
let __pmx_lastContainer: HTMLElement | null = null;

function ensureShadow(host: HTMLElement): { shadow: ShadowRoot; container: HTMLElement; newlyCreated: boolean } {
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    // Ensure a stylesheet is present inside the shadow. Prefer <link>, fall back to inline <style>.
    const LINK_ID = 'pmx-shadow-style-link';
    const INLINE_ID = 'pmx-shadow-style-inline';
    const hasStyle = !!shadow.getElementById(LINK_ID) || !!shadow.getElementById(INLINE_ID);
    if (!hasStyle) {
        const linkEl = document.createElement('link');
        linkEl.id = LINK_ID;
        linkEl.rel = 'stylesheet';
        linkEl.href = `${rootPath()}assets/inpage.css`;
        linkEl.onerror = () => {
            // Fallback: fetch and inline the CSS if <link> is blocked by CSP
            const styleEl = document.createElement('style');
            styleEl.id = INLINE_ID;
            shadow.appendChild(styleEl);
            fetch(linkEl.href)
                .then(r => (r.ok ? r.text() : Promise.reject(new Error(`Failed to load CSS: ${r.status}`))))
                .then(css => {
                    styleEl.textContent = css;
                })
                .catch(() => {
                    // swallow
                })
                .finally(() => {
                    linkEl.remove();
                });
        };
        shadow.appendChild(linkEl);
    }
    // Ensure a single container for React inside the shadow
    const CONTAINER_ID = 'pmx-shadow-app';
    let container = shadow.getElementById(CONTAINER_ID) as HTMLElement | null;
    let newlyCreated = false;
    if (!container) {
        newlyCreated = true;
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        container.className = 'pmx-root';
        shadow.appendChild(container);
    }
    // Expose container for portals rendered from within the Shadow DOM
    try {
        (window as any).__pmxPortalContainer = container;
    } catch (_e) {
        // swallow
    }
    return { shadow, container, newlyCreated };
}

const MOBILE_TRIGGER_ID = 'pmx-staking-mobile-trigger';
const MOBILE_HOST_ID = ROOT_ID; // reuse same id across modes

function isSmallScreen(): boolean {
    return window.matchMedia && window.matchMedia('(max-width: 1023px)').matches;
}

function moveRootToBody(root: HTMLElement) {
    if (root.parentElement !== document.body) document.body.appendChild(root);
}

function getOrCreateMountPoint(): HTMLElement | null {
    let root = document.getElementById(ROOT_ID) as HTMLElement | null;

    if (window.location.pathname.includes('/sports/live')) return null; // TODO: add support for live sports page

    if (!window.location.pathname.includes('/event/') && !window.location.pathname.includes('/sports/')) return null;

    // Select the Polymarket trade widget by its id.
    const desktopHost = document.getElementById('trade-widget') as HTMLElement | null;

    if (isSmallScreen()) {
        if (!root) {
            root = document.createElement('div');
            root.id = MOBILE_HOST_ID;
            document.body.appendChild(root);
        } else {
            // Ensure root resides under body in mobile mode
            moveRootToBody(root);
        }
        return root;
    }

    // Desktop mode
    if (!desktopHost) return null;

    if (!root) {
        root = document.createElement('div');
        root.id = ROOT_ID;
    }

    // Insert as the third child of the first child div of the host (if present)
    const firstChildDiv = desktopHost.querySelector(':scope > div') as HTMLElement | null;
    if (firstChildDiv) {
        const thirdChild = firstChildDiv.children.item(2);
        if (thirdChild && thirdChild.parentNode === firstChildDiv) {
            firstChildDiv.insertBefore(root, thirdChild);
        } else {
            firstChildDiv.appendChild(root);
        }
    } else {
        desktopHost.appendChild(root);
    }

    return root;
}

function isDarkTheme(): boolean {
    const dt = document.documentElement.getAttribute('data-theme');
    if (dt === 'dark') return true;
    if (dt === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function syncThemeAttr(target: HTMLElement) {
    const dark = isDarkTheme();
    if (dark) {
        target.setAttribute('data-theme', 'dark');
    } else {
        target.removeAttribute('data-theme');
    }
}

// Mount under the node created by the content script, inside a Shadow DOM
function mount() {
    const host = getOrCreateMountPoint();
    if (!host) return;
    const { container, newlyCreated } = ensureShadow(host);
    syncThemeAttr(container);
    // Observe theme changes on the page and mirror them
    const observer = new MutationObserver(() => syncThemeAttr(container));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    // If the container changed (e.g., moved between mobile/desktop), re-create the root
    const needsNewRoot = __pmx_lastContainer !== container;
    if (!reactRoot || needsNewRoot || newlyCreated) {
        try {
            reactRoot?.unmount();
        } catch (_e) {
            // swallow
        }
        reactRoot = createRoot(container);
    }
    reactRoot.render(<App />);
    __pmx_lastContainer = container;
}

let __pmx_progressObserver: MutationObserver | null = null;
let __pmx_mobileObserver: MutationObserver | null = null;
let __pmx_desktopObserver: MutationObserver | null = null;

function isProgressVisible(): boolean {
    return !!document.querySelector('div.bprogress');
}

function mountWhenReady() {
    // If progress isn't visible, mount immediately
    if (!isProgressVisible()) {
        mount();
        // Ensure mobile injection if needed
        if (isSmallScreen()) {
            startMobileDialogObserver();
            stopDesktopHostObserver();
        } else {
            stopMobileDialogObserver();
            startDesktopHostObserver();
        }
        return;
    }

    // Avoid duplicating observers
    if (__pmx_progressObserver) return;

    const attemptMount = () => {
        if (!isProgressVisible()) {
            if (__pmx_progressObserver) {
                __pmx_progressObserver.disconnect();
                __pmx_progressObserver = null;
            }
            mount();
        }
    };

    // Observe DOM changes to detect when the progress element disappears
    __pmx_progressObserver = new MutationObserver(() => {
        attemptMount();
    });
    const target = document.body || document.documentElement;
    try {
        __pmx_progressObserver.observe(target, { childList: true, subtree: true });
    } catch (_e) {
        // Fallback: poll if observer setup fails (e.g., early in document lifecycle)
        const poll = setInterval(() => {
            if (!isProgressVisible()) {
                clearInterval(poll);
                if (__pmx_progressObserver) {
                    __pmx_progressObserver.disconnect();
                    __pmx_progressObserver = null;
                }
                mount();
                if (isSmallScreen()) {
                    startMobileDialogObserver();
                    stopDesktopHostObserver();
                } else {
                    stopMobileDialogObserver();
                    startDesktopHostObserver();
                }
            }
        }, 200);
    }
}

mountWhenReady();

// Re-run on SPA URL changes
let __pmx_lastPathname = window.location.pathname;
setInterval(async () => {
    const current = window.location.pathname;
    if (current === __pmx_lastPathname) return;
    __pmx_lastPathname = current;
    mountWhenReady();
}, 1000);

// React to screen size changes to switch modes dynamically
(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    const onChange = () => {
        // remount to ensure correct host and update injection hooks
        mountWhenReady();
    };
    try {
        mql.addEventListener('change', onChange);
    } catch (_e) {
        // Safari <14
        // @ts-ignore
        mql.addListener(onChange);
    }
})();

function startMobileDialogObserver() {
    if (__pmx_mobileObserver) return;
    const target = document.body || document.documentElement;
    const tryInject = () => {
        const dialog = document.querySelector('div[role="dialog"][data-vaul-drawer-direction="bottom"]') as HTMLElement | null;
        if (!dialog) return;

        // Find the side selection button
        const sideBtn = dialog.querySelector('button[aria-label="side selection"]') as HTMLElement | null;
        if (!sideBtn) return;

        // Already injected?
        if (dialog.querySelector(`#${MOBILE_TRIGGER_ID}`)) return;

        const btn = document.createElement('button');
        btn.id = MOBILE_TRIGGER_ID;
        btn.type = 'button';
        btn.title = 'Stake with Robin';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.width = '36px';
        btn.style.height = '36px';
        btn.style.marginLeft = '8px';
        btn.style.borderRadius = '9999px';
        btn.style.border = '1px solid rgba(0,0,0,0.1)';
        btn.style.background = 'var(--color-background, #111827)';
        btn.style.cursor = 'pointer';

        const img = document.createElement('img');
        img.src = `${rootPath()}logo.png`;
        img.alt = 'Robin';
        img.width = 20;
        img.height = 20;
        img.style.width = '20px';
        img.style.height = '20px';
        btn.appendChild(img);

        btn.addEventListener('click', () => {
            window.dispatchEvent(new Event(OPEN_DRAWER_EVENT));
        });

        const parent = sideBtn.parentElement;
        if (parent && sideBtn.nextSibling) parent.insertBefore(btn, sideBtn.nextSibling);
        else if (parent) parent.appendChild(btn);
        else sideBtn.insertAdjacentElement('afterend', btn);
    };

    __pmx_mobileObserver = new MutationObserver(() => tryInject());
    try {
        __pmx_mobileObserver.observe(target, { childList: true, subtree: true });
    } catch (_e) {
        // swallow
    }
    // Attempt immediately in case dialog already exists
    tryInject();
}

function stopMobileDialogObserver() {
    if (__pmx_mobileObserver) {
        __pmx_mobileObserver.disconnect();
        __pmx_mobileObserver = null;
    }
    // Remove any injected triggers
    document.querySelectorAll(`#${MOBILE_TRIGGER_ID}`).forEach(el => el.remove());
}

function startDesktopHostObserver() {
    if (__pmx_desktopObserver) return;
    const target = document.body || document.documentElement;
    const tryMount = () => {
        const desktopHost = document.getElementById('trade-widget') as HTMLElement | null;
        const root = document.getElementById(ROOT_ID) as HTMLElement | null;
        if (isSmallScreen()) return;
        if (!desktopHost) return;
        // If root is already attached inside the desktop host, stop observing
        if (root && desktopHost.contains(root)) {
            stopDesktopHostObserver();
            return;
        }
        // Otherwise mount once; mount() will attach root under desktopHost
        mount();
        // If after mounting, root resides in desktopHost, stop observer
        const postRoot = document.getElementById(ROOT_ID) as HTMLElement | null;
        if (postRoot && desktopHost.contains(postRoot)) stopDesktopHostObserver();
    };
    __pmx_desktopObserver = new MutationObserver(() => tryMount());
    try {
        __pmx_desktopObserver.observe(target, { childList: true, subtree: true });
    } catch (_e) {
        // swallow
    }
    tryMount();
}

function stopDesktopHostObserver() {
    if (__pmx_desktopObserver) {
        __pmx_desktopObserver.disconnect();
        __pmx_desktopObserver = null;
    }
}
