'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

const FAQS: Array<{ q: string; a: string }> = [
    {
        q: 'What tokens can I stake?',
        a: 'You can stake Polymarket outcome tokens (YES/NO) from participating markets that are added to this vault.',
    },
    {
        q: 'How are earnings calculated?',
        a: 'Earnings accrue based on the time-weighted USD value (USD-seconds) of your staked tokens. APY reflects current conditions and is subject to change as prices and TVL update.',
    },
    {
        q: 'When can I claim?',
        a: 'Rewards can be claimed after the campaign is finalized. Your payout is proportional to your accumulated USD-seconds at the end.',
    },
    {
        q: 'What happens if a market is not eligible?',
        a: 'Non-eligible markets still accrue base rewards; only eligible markets also accrue extra rewards when available.',
    },
];

export default function FAQ() {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="text-xl">FAQ</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {FAQS.map((f, idx) => (
                        <FaqItem key={idx} question={f.q} answer={f.a} />
                    ))}
                </div>
            </CardContent>
        </Card>
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
            {open && <div className="px-4 pb-4 text-sm text-muted-foreground">{answer}</div>}
        </div>
    );
}
