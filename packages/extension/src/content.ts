const SCRIPT_ID = 'pmx-inpage-script';

function injectInpage() {
    if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = SCRIPT_ID;
        s.src = getExtURL('assets/inpage.js');
        s.type = 'module';
        s.dataset.rootPath = getExtURL();
        (document.head || document.documentElement).appendChild(s);
    }
}

function getExtURL(path?: string) {
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL) {
        return browser.runtime.getURL(path || '');
    }
    // fall back to chrome namespace
    return chrome.runtime?.getURL(path || '');
}

injectInpage();
