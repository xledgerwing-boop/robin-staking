import './tailwind.css';
import { createRoot, type Root } from 'react-dom/client';
import { ROOT_ID, rootPath } from './inpage_utils';
import { Web3Provider } from './components/web-3-provider';
import { StakingCard } from './components/staking-card';
import { Toaster } from '@/components/ui/sonner';

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

function ensureShadow(host: HTMLElement): { shadow: ShadowRoot; container: HTMLElement } {
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
    if (!container) {
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        container.className = 'pmx-root';
        shadow.appendChild(container);
    }
    return { shadow, container };
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
    const host = document.getElementById(ROOT_ID);
    if (host) {
        const { container } = ensureShadow(host);
        syncThemeAttr(container);
        // Observe theme changes on the page and mirror them
        const observer = new MutationObserver(() => syncThemeAttr(container));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
        if (!reactRoot) {
            reactRoot = createRoot(container);
        }
        reactRoot.render(<App />);
    }
}
mount();

// Re-run on SPA URL changes
let __pmx_lastPathname = window.location.pathname;
setInterval(async () => {
    const current = window.location.pathname;
    if (current !== __pmx_lastPathname) {
        __pmx_lastPathname = current;
        await new Promise(resolve => setTimeout(resolve, 1000));
        mount();
    }
}, 1000);
