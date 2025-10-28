'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader } from 'lucide-react';

type Option = { value: string; label: string };
type BaseQuestion = { id: string; label: string; required?: boolean };
type Question =
    | (BaseQuestion & { type: 'text'; placeholder?: string })
    | (BaseQuestion & { type: 'select'; options: Option[] })
    | (BaseQuestion & { type: 'multi-select'; options: Option[] });

export default function FeedbackPage() {
    const { address, proxyAddress, isConnected } = useProxyAccount();
    const [isEligible, setIsEligible] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Editable questions schema – add/edit fields here
    const questions: Question[] = useMemo(
        () => [
            { id: 'experience', label: 'Tell us about your experience', type: 'text', placeholder: 'Free text', required: true },
            {
                id: 'liked',
                label: 'What did you like? (multi-select)',
                type: 'multi-select',
                options: [
                    { value: 'ui', label: 'UI/UX' },
                    { value: 'apy', label: 'Yield/APY' },
                    { value: 'speed', label: 'Speed' },
                    { value: 'fees', label: 'Fees' },
                ],
                required: false,
            },
            {
                id: 'source',
                label: 'How did you hear about us?',
                type: 'select',
                options: [
                    { value: 'x', label: 'X/Twitter' },
                    { value: 'friend', label: 'Friend' },
                    { value: 'discord', label: 'Discord' },
                    { value: 'other', label: 'Other' },
                ],
                required: true,
            },
        ],
        []
    );

    const [walletAddressInput, setWalletAddressInput] = useState('');
    const [formValues, setFormValues] = useState<Record<string, unknown>>(() => {
        const init: Record<string, unknown> = {};
        questions.forEach(q => {
            if (q.type === 'multi-select') init[q.id] = [] as string[];
            else init[q.id] = '';
        });
        return init;
    });

    useEffect(() => {
        if (isConnected && address) setWalletAddressInput(address);
    }, [isConnected, address]);

    useEffect(() => {
        const run = async () => {
            if (!isConnected || !proxyAddress) return;
            try {
                setLoading(true);
                const res = await fetch(`/api/rewards/eligibility?proxyAddress=${proxyAddress}`);
                const data = (await res.json()) as { hasDeposit: boolean };
                setIsEligible(data.hasDeposit);
            } catch {
                setIsEligible(false);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [isConnected, proxyAddress]);

    const allRequiredFilled = useMemo(() => {
        return questions.every(q => {
            if (q.required === false) return true;
            const v = formValues[q.id];
            if (q.type === 'text' || q.type === 'select') return typeof v === 'string' && v.trim().length > 0;
            if (q.type === 'multi-select') return Array.isArray(v) && v.length > 0;
            return true;
        });
    }, [questions, formValues]);

    const canSubmit = !!isEligible && !!walletAddressInput && allRequiredFilled && !submitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        try {
            setSubmitting(true);
            const res = await fetch('/api/rewards/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: walletAddressInput, answers: { walletAddress: walletAddressInput, ...formValues } }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || 'Submission failed');
            }
            toast.success('Feedback submitted. 100 points awarded.');
        } catch (e) {
            toast.error((e as Error)?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Staking Feedback</h1>
                    <p className="text-muted-foreground">Share your experience after depositing to earn 100 points.</p>
                </div>

                <Card>
                    <CardContent>
                        {loading ? (
                            <div className="text-sm text-muted-foreground">Checking eligibility…</div>
                        ) : (
                            <div className="w-full">
                                <div className="relative font-medium flex items-start justify-between w-full">
                                    1. Make a deposit in any vault
                                    <div className="">
                                        <Badge variant={isEligible ? 'default' : 'outline'}>{isEligible ? 'Done' : 'Pending'}</Badge>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">Verified via on-chain activity of your proxy address.</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>2. Feedback Form</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label className="mb-2" htmlFor="walletAddress">
                                    Wallet Address
                                </Label>
                                <Input id="walletAddress" value={walletAddressInput} placeholder="0x..." readOnly disabled />
                            </div>

                            {questions.map(q => (
                                <div key={q.id} className="mb-6">
                                    <Label htmlFor={q.id}>
                                        {q.label}
                                        {q.required !== false && <span className="text-red-500 ml-1 mb-4">*</span>}
                                    </Label>
                                    {q.type === 'text' && (
                                        <Input
                                            id={q.id}
                                            value={(formValues[q.id] as string) ?? ''}
                                            onChange={e => setFormValues(prev => ({ ...prev, [q.id]: e.target.value }))}
                                            placeholder={q.placeholder}
                                        />
                                    )}
                                    {q.type === 'select' && (
                                        <Select
                                            value={(formValues[q.id] as string) ?? ''}
                                            onValueChange={v => setFormValues(prev => ({ ...prev, [q.id]: v }))}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select one" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {q.options.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {q.type === 'multi-select' && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {q.options.map(opt => {
                                                const selected = Array.isArray(formValues[q.id])
                                                    ? (formValues[q.id] as string[]).includes(opt.value)
                                                    : false;
                                                return (
                                                    <Button
                                                        key={opt.value}
                                                        type="button"
                                                        variant={selected ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() =>
                                                            setFormValues(prev => {
                                                                const existing = prev[q.id];
                                                                const current = Array.isArray(existing) ? (existing as string[]) : [];
                                                                const next = selected
                                                                    ? current.filter(v => v !== opt.value)
                                                                    : current.concat(opt.value);
                                                                return { ...prev, [q.id]: next };
                                                            })
                                                        }
                                                    >
                                                        {opt.label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex items-center gap-2">
                                <Button type="submit" disabled={!canSubmit}>
                                    {submitting && <Loader className="w-4 h-4 animate-spin" />} Submit Feedback
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
