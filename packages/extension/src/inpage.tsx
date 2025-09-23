import './tailwind.css';
import { createRoot } from 'react-dom/client';
import { ROOT_ID } from './inpage_utils';
import { Web3Provider } from './components/web-3-provider';
import { StakingCard } from './components/staking-card';

function App() {
    return (
        <Web3Provider>
            <StakingCard />
        </Web3Provider>
    );
}

// Mount under the node created by the content script
function mount() {
    const host = document.getElementById(ROOT_ID);
    if (host) {
        const root = createRoot(host);
        root.render(<App />);
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
