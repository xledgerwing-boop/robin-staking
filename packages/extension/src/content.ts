import { getOrCreateMountPoint } from './utils.dom';

function injectInpage() {
    if (document.getElementById('pmx-inpage-script')) return;
    const s = document.createElement('script');
    s.id = 'pmx-inpage-script';
    s.src = chrome.runtime.getURL('assets/inpage.js');
    s.type = 'module';
    s.onload = () => s.remove(); // optional cleanup
    (document.head || document.documentElement).appendChild(s);
}

function tryMount() {
    const mount = getOrCreateMountPoint();
    if (!mount) return;
    injectInpage();
}

// Initial attempt
tryMount();
