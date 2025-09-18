import { getOrCreateMountPoint } from './utils.dom';

const STYLE_ID = 'pmx-inpage-style';
const SCRIPT_ID = 'pmx-inpage-script';

function injectInpage() {
    if (!document.getElementById(STYLE_ID)) {
        const link = document.createElement('link');
        link.id = STYLE_ID;
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('assets/inpage.css');
        (document.head || document.documentElement).appendChild(link);
    }
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
