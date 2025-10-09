const SCRIPT_ID = 'pmx-inpage-script';

function injectInpage() {
    if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = SCRIPT_ID;
        s.src = chrome.runtime.getURL('assets/inpage.js');
        s.type = 'module';
        const rootPath = typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('') : undefined;
        if (rootPath) s.dataset.rootPath = rootPath;
        (document.head || document.documentElement).appendChild(s);
    }
}

injectInpage();
