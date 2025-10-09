import './tailwind.css';
import { createRoot, type Root } from 'react-dom/client';
import { ROOT_ID, rootPath } from './inpage_utils';
import { StakingCard } from './components/staking-card';
import { Toaster } from '@/components/ui/sonner';
import { Web3Provider } from './components/web-3-provider';

function App() {
    return (
        <div className="mt-4">
            <Web3Provider>
                <StakingCard />
            </Web3Provider>
            <Toaster />
        </div>
    );
}

let reactRoot: Root | null = null;

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
    return { shadow, container, newlyCreated };
}

function getOrCreateMountPoint(): HTMLElement | null {
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
    if (!reactRoot || newlyCreated) {
        reactRoot = createRoot(container);
    }
    reactRoot.render(<App />);
}

let __pmx_progressObserver: MutationObserver | null = null;

function isProgressVisible(): boolean {
    return !!document.querySelector('div.bprogress');
}

function mountWhenReady() {
    // If progress isn't visible, mount immediately
    if (!isProgressVisible()) {
        mount();
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
