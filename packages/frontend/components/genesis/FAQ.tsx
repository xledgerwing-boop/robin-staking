'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const FAQS: Array<{ q: string; a: string }> = [
    {
        q: 'What is the Genesis Reward Vault?',
        a: `<p>The Genesis Reward Vault is a <strong>30-day, yield-earning vault</strong> for Polymarket positions (YES/NO).</p>
<p>You stake your outcome tokens, and they immediately start earning USDC yield—while staying <strong>fully liquid and tradeable</strong> at all times.</p>
<ul>
<li>No lockups</li>
<li>Fully pre-funded by Robin</li>
<li>Capped at $100,000 TVL</li>
<li>Designed exclusively for early users as a thank-you campaign</li>
</ul>
<p><strong>Your Polymarket positions always remain yours. You can withdraw anytime.</strong></p>`,
    },
    {
        q: 'Where does the yield come from?',
        a: `<p>For this early-access vault, all yield is <strong>pre-funded by Robin</strong>.</p>
<ul>
<li>We deposit a fixed amount of USDC into the vault contract before launch</li>
<li>Users share this yield proportionally</li>
<li>You can verify the pre-funded amount directly on-chain</li>
</ul>
<p>After the audited mainnet launch, yield will come from cross-chain, DeFi-native strategies — but this campaign intentionally keeps things simple, safe, and risk-free.</p>`,
    },
    {
        q: 'How much can I earn?',
        a: `<p>The vault targets <strong>~6% APY over 30 days</strong>, and can reach <strong>~10% APY</strong> when combined with Polymarket's ~4% holding reward.</p>
<p>Your final APY depends on the vault fill level:</p>
<ul>
<li>If it does NOT fill to $100k → yields go up</li>
<li>If it fills quickly or oversubscribes → yields may adjust slightly down</li>
</ul>
<p><strong>Early stakers earn the most.</strong></p>`,
    },
    {
        q: 'Do I have to lock up funds or match tokens?',
        a: `<p><strong>No — zero lockup and no matching required.</strong></p>
<ul>
<li>Withdraw your YES/NO tokens at any time</li>
<li>Continue trading freely on Polymarket</li>
<li>Vault mechanics never restrict your liquidity or redemption</li>
<li>Yield is earned based on USD value, not YES/NO balance</li>
</ul>
<p>This is full flexibility with no strings attached.</p>`,
    },
    {
        q: 'What happens when the vault ends? How do I receive Robin reward points?',
        a: `<p>At the end of the 30-day campaign:</p>
<ul>
<li>Your accumulated USDC yield becomes claimable</li>
<li>You also receive your share of the <strong>50,000 Genesis Points</strong>
<li>Points are distributed proportionally based on your earned yield</li>
    <ul>
        
        <li>(your yield / total vault yield) × 50,000</li>
    </ul>
</li>
</ul>
<p>Resolved Polymarket positions simply stop earning yield—you can withdraw them immediately and redeem as normal.</p>`,
    },
];

export default function FAQ() {
    return (
        <div className="space-y-2 min-h-96">
            {FAQS.map((f, idx) => (
                <FaqItem key={idx} question={f.q} answer={f.a} />
            ))}
            <Link
                href="https://robin-markets.gitbook.io/robin-markets-docs/the-genesis-reward-vault"
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded-md w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent transition-colors"
            >
                <span className="font-medium">More in the documentation</span>
                <ExternalLink className="w-4 h-4" />
            </Link>
        </div>
    );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border rounded-md">
            <button type="button" className="w-full flex items-center justify-between px-4 py-3 text-left" onClick={() => setOpen(o => !o)}>
                <span className="font-medium">{question}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div
                    className="px-4 pb-4 text-sm text-muted-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-2 [&_ul]:space-y-1 [&_li]:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: answer }}
                />
            )}
        </div>
    );
}
