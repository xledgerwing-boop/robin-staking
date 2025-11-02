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
import { Loader } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { FEEDBACK_REWARD_PONTS } from '@/lib/constants';

type Option = { value: string; label: string };
type BaseQuestion = { id: string; label: string; required?: boolean };
type Question =
    | (BaseQuestion & { type: 'text'; placeholder?: string })
    | (BaseQuestion & { type: 'number'; placeholder?: string; unitSuffix?: string })
    | (BaseQuestion & { type: 'select'; options: Option[]; supportsOther?: boolean; otherLabel?: string })
    | (BaseQuestion & { type: 'multi-select'; options: Option[]; supportsOther?: boolean; otherLabel?: string });
type Section = { id: string; title: string; description?: string; questions: Question[] };

export default function FeedbackPage() {
    const { address, proxyAddress, isConnected } = useProxyAccount();
    const [isEligible, setIsEligible] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Editable schema – configure sections and questions here
    const sections: Section[] = useMemo(
        () => [
            {
                id: 'matching-efficiency',
                title: '1. Matching Efficiency & Idle Capital',
                questions: [
                    {
                        id: 'holdingDays',
                        label: 'How many days are you typically holding positions on Polymarket (roughly)?',
                        type: 'number',
                        placeholder: 'e.g. 7',
                        required: true,
                    },
                    {
                        id: 'withdrawImportance',
                        label: 'How much does it matter for you to be able to withdraw Polymarket positions from Robin at any time? (1 = Not at all, 5 = Dealbreaker)',
                        type: 'select',
                        options: [
                            { value: '1', label: '1 - Not at all' },
                            { value: '2', label: '2' },
                            { value: '3', label: '3' },
                            { value: '4', label: '4' },
                            { value: '5', label: '5 - Dealbreaker' },
                        ],
                        required: true,
                    },
                    {
                        id: 'lockupYieldPct',
                        label: 'How much yield (APY) would you need to earn to be willing to lock up positions for 30 days?',
                        type: 'number',
                        unitSuffix: '%',
                        placeholder: 'e.g. 10',
                        required: true,
                    },
                ],
            },
            {
                id: 'yield-risk-transparency',
                title: '2. Yield & Risk Transparency',
                questions: [
                    {
                        id: 'meaningYield',
                        label: 'When you hear “earn yield on your prediction-market positions,” what do you think that means?',
                        type: 'text',
                        placeholder: 'Open answer',
                        required: true,
                    },
                    {
                        id: 'confidenceFactors',
                        label: 'What would make you feel confident depositing $1,000 into our protocol? (Multi-select)',
                        type: 'multi-select',
                        options: [
                            { value: 'audits', label: 'Audits' },
                            { value: 'high_tvl', label: 'High TVL' },
                            { value: 'past_performance', label: 'Past performance' },
                            { value: 'x_following', label: 'X following' },
                            { value: 'big_community', label: 'Big community' },
                            { value: 'partners', label: 'Partners' },
                            { value: 'funding_round', label: 'Funding round' },
                        ],
                        supportsOther: true,
                        otherLabel: 'Other (specify)',
                        required: false,
                    },
                    {
                        id: 'apyClarity',
                        label: 'If a vault said “APY 5% from LPing USDC on Yearn,” is that clear, or would you want more details?',
                        type: 'select',
                        options: [
                            { value: 'clear', label: 'Yes it’s clear' },
                            { value: 'more_details', label: 'No, I want more details' },
                        ],
                        required: true,
                    },
                ],
            },
            {
                id: 'onboarding',
                title: '3. Onboarding',
                questions: [
                    {
                        id: 'confusingPart',
                        label: 'What’s the most confusing part about Robin?',
                        type: 'text',
                        placeholder: 'Open answer',
                        required: true,
                    },
                    {
                        id: 'missingInfo',
                        label: 'What information do you think is missing from our websites?',
                        type: 'text',
                        placeholder: 'Open answer',
                        required: true,
                    },
                ],
            },
            {
                id: 'comprehension',
                title: '4. User Comprehension',
                description: 'Answer these questions to the best of your knowledge about Robin.',
                questions: [
                    {
                        id: 'claimOnRobin',
                        label: 'When the event resolves on Polymarket and my positions are staked with Robin, I can claim my winnings directly on Robin.',
                        type: 'select',
                        options: [
                            { value: 'true', label: 'True' },
                            { value: 'false', label: 'False' },
                        ],
                        required: true,
                    },
                    {
                        id: 'withdrawThenClaim',
                        label: 'When the event resolves on Polymarket and my positions are staked with Robin, I have to first withdraw my positions and can then claim my winnings on Polymarket.',
                        type: 'select',
                        options: [
                            { value: 'true', label: 'True' },
                            { value: 'false', label: 'False' },
                        ],
                        required: true,
                    },
                    {
                        id: 'yieldImmediate',
                        label: 'When I withdraw my positions from Robin, I also get the yield that I earned immediately.',
                        type: 'select',
                        options: [
                            { value: 'true', label: 'True' },
                            { value: 'false', label: 'False' },
                        ],
                        required: true,
                    },
                    {
                        id: 'yieldAfterResolve',
                        label: 'The yield that I earned can be claimed from Robin only after the market resolved on Polymarket',
                        type: 'select',
                        options: [
                            { value: 'true', label: 'True' },
                            { value: 'false', label: 'False' },
                        ],
                        required: true,
                    },
                    {
                        id: 'awareDeltaNeutral',
                        label: 'Did you know before reading this that Robin only invests the YES and NO positions of which there are an equal amount in the pool?',
                        type: 'select',
                        options: [
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' },
                        ],
                        required: true,
                    },
                ],
            },
            {
                id: 'capital-efficiency',
                title: '5. Capital-Efficiency Appetite',
                questions: [
                    {
                        id: 'vaultPreference',
                        label: 'If there was a “High-Yield Vault” (riskier) and a “Safe Vault” (lower yield), which would you pick?',
                        type: 'select',
                        options: [
                            { value: 'high_yield', label: 'High-Yield Vault' },
                            { value: 'safe', label: 'Safe Vault' },
                        ],
                        required: true,
                    },
                    {
                        id: 'minApyPct',
                        label: 'What is the minimum percentage of APY that you would need in order to stake your positions with Robin?',
                        type: 'number',
                        unitSuffix: '%',
                        placeholder: 'e.g. 5',
                        required: true,
                    },
                    {
                        id: 'preventStakingAll',
                        label: 'If you can withdraw your positions at any time, is there anything that would prevent you from staking all your positions with Robin?',
                        type: 'text',
                        placeholder: 'Open answer',
                        required: true,
                    },
                    {
                        id: 'stakeDespiteDifferentYields',
                        label: 'Currently, Robin provides different APY for a market’s yes and no positions depending on the price of the position. For example, you want to stake YES positions for 3% APY and can see that NO positions are receiving 10% APY. Would you still stake your YES position?',
                        type: 'select',
                        options: [
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' },
                        ],
                        required: true,
                    },
                    {
                        id: 'stakeDifferentYieldsDetails',
                        label: 'Add details to your answer of the previous question (Optional)',
                        type: 'text',
                        placeholder: 'Open answer',
                        required: false,
                    },
                ],
            },
            {
                id: 'narrative-positioning',
                title: '6. Narrative & Positioning',
                questions: [
                    {
                        id: 'positioningPhrase',
                        label: 'Which phrase feels most accurate for you to describe Robin?',
                        type: 'select',
                        options: [
                            { value: 'yield_layer', label: '“Yield layer for prediction markets”' },
                            { value: 'liquidity_layer', label: '“Liquidity layer for bets”' },
                            { value: 'defi_savings', label: '“DeFi savings account for Polymarket positions”' },
                            { value: 'passive_income', label: '“Passive income from prediction markets”' },
                        ],
                        supportsOther: true,
                        otherLabel: 'Other suggestion',
                        required: true,
                    },
                    {
                        id: 'nameAssociation',
                        label: 'What does the name “Robin Markets” make you think of?',
                        type: 'text',
                        placeholder: 'Open answer',
                        required: true,
                    },
                    {
                        id: 'trustMessaging',
                        label: 'What kind of content or messaging would make you trust and try it?',
                        type: 'text',
                        placeholder: 'Open answer',
                        required: true,
                    },
                ],
            },
        ],
        []
    );

    const [walletAddressInput, setWalletAddressInput] = useState('');
    const [formValues, setFormValues] = useState<Record<string, unknown>>(() => {
        const init: Record<string, unknown> = {};
        sections.forEach(section => {
            section.questions.forEach(q => {
                if (q.type === 'multi-select') init[q.id] = [] as string[];
                else init[q.id] = '';
                if ((q.type === 'select' || q.type === 'multi-select') && q.supportsOther) init[`${q.id}__otherText`] = '';
            });
        });
        return init;
    });
    const [errors, setErrors] = useState<Record<string, string | null>>({});

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

    useEffect(() => {
        if (!carouselApi) return;
        const onSelect = () => {
            try {
                setCurrentSlide(carouselApi.selectedScrollSnap());
            } catch {}
        };
        onSelect();
        carouselApi.on('select', onSelect);
        return () => {
            try {
                carouselApi.off('select', onSelect);
            } catch {}
        };
    }, [carouselApi]);

    const validateField = (q: Question, value: unknown): string | null => {
        if (q.type === 'number') {
            const str = (value as string) ?? '';
            if ((q.required ?? true) && (!str || str.toString().trim() === '')) return 'This field is required';
            if (str && isNaN(Number(str))) return 'Please enter a valid number';
        } else if (q.type === 'text') {
            const str = (value as string) ?? '';
            if ((q.required ?? true) && (!str || str.trim() === '')) return 'This field is required';
        } else if (q.type === 'select') {
            const str = (value as string) ?? '';
            if ((q.required ?? true) && (!str || str.trim() === '')) return 'Please select an option';
            if (q.supportsOther && str === '__other__') {
                const other = (formValues[`${q.id}__otherText`] as string) ?? '';
                if (!other.trim()) return 'Please specify other';
            }
        } else if (q.type === 'multi-select') {
            const arr = (value as string[]) ?? [];
            if ((q.required ?? false) && (!Array.isArray(arr) || arr.length === 0)) return 'Please select at least one option';
            if (q.supportsOther && Array.isArray(arr) && arr.includes('__other__')) {
                const other = (formValues[`${q.id}__otherText`] as string) ?? '';
                if (!other.trim()) return 'Please specify other';
            }
        }
        return null;
    };

    const allRequiredFilled = useMemo(() => {
        let ok = true;
        sections.forEach(section => {
            section.questions.forEach(q => {
                const val = formValues[q.id];
                const err = validateField(q, val);
                if (err) ok = false;
            });
        });
        return ok;
    }, [sections, formValues]);

    const canSubmit = !!isEligible && !!walletAddressInput && allRequiredFilled && !submitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validate all sections before submit
        const nextErrors: Record<string, string | null> = {};
        let allOk = true;
        sections.forEach(section => {
            section.questions.forEach(q => {
                const val = formValues[q.id];
                const err = validateField(q, val);
                nextErrors[q.id] = err;
                if (err) allOk = false;
            });
        });
        if (!allOk) {
            setErrors(prev => ({ ...prev, ...nextErrors }));
            return;
        }
        if (!canSubmit) return;
        try {
            setSubmitting(true);
            // Build answers object, folding in "other, specify" fields
            const answers: Record<string, unknown> = { walletAddress: walletAddressInput };
            sections.forEach(section => {
                section.questions.forEach(q => {
                    const v = formValues[q.id];
                    if (q.type === 'select' && q.supportsOther && v === '__other__') {
                        answers[q.id] = { value: 'other', otherText: formValues[`${q.id}__otherText`] };
                    } else if (q.type === 'multi-select' && q.supportsOther && Array.isArray(v) && (v as string[]).includes('__other__')) {
                        const filtered = (v as string[]).filter(x => x !== '__other__');
                        answers[q.id] = { values: filtered, otherText: formValues[`${q.id}__otherText`] };
                    } else {
                        answers[q.id] = v;
                    }
                });
            });

            const res = await fetch('/api/rewards/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: walletAddressInput, answers }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || 'Submission failed');
            }
            toast.success(`Feedback submitted. ${FEEDBACK_REWARD_PONTS} points awarded.`);
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
                    <p className="text-muted-foreground">Share your experience after depositing to earn {FEEDBACK_REWARD_PONTS} points.</p>
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
                                <Input
                                    id="walletAddress"
                                    value={walletAddressInput}
                                    placeholder="0x..."
                                    readOnly
                                    disabled
                                    className="lg:w-1/2 w-full"
                                />
                            </div>

                            <Separator className="h-1 bg-background" />

                            <Carousel
                                setApi={setCarouselApi}
                                opts={{ loop: false, align: 'start', watchDrag: false }}
                                disableKeyScroll
                                className="w-full"
                            >
                                <CarouselContent>
                                    {sections.map((section, idx) => (
                                        <CarouselItem key={section.id}>
                                            <div className="mb-6 p-2">
                                                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                                                {section.description && <p className="text-sm text-muted-foreground mb-2">{section.description}</p>}
                                                {section.questions.map(q => (
                                                    <div key={q.id} className="mb-6">
                                                        <Label htmlFor={q.id} className="mb-2">
                                                            {q.label}
                                                            {q.required !== false && <span className="text-red-500">*</span>}
                                                        </Label>
                                                        {q.type === 'text' && (
                                                            <Input
                                                                id={q.id}
                                                                value={(formValues[q.id] as string) ?? ''}
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    setFormValues(prev => ({ ...prev, [q.id]: val }));
                                                                    setErrors(prev => ({ ...prev, [q.id]: validateField(q, val) }));
                                                                }}
                                                                placeholder={q.placeholder}
                                                                className="lg:w-1/2 w-full"
                                                            />
                                                        )}
                                                        {q.type === 'number' && (
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    id={q.id}
                                                                    inputMode="numeric"
                                                                    value={(formValues[q.id] as string) ?? ''}
                                                                    onChange={e => {
                                                                        const val = e.target.value;
                                                                        setFormValues(prev => ({ ...prev, [q.id]: val }));
                                                                        setErrors(prev => ({ ...prev, [q.id]: validateField(q, val) }));
                                                                    }}
                                                                    placeholder={q.placeholder}
                                                                    className="lg:w-50 w-full"
                                                                />
                                                                {q.unitSuffix && (
                                                                    <span className="text-sm text-muted-foreground">{q.unitSuffix}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {q.type === 'select' && (
                                                            <div className="space-y-2">
                                                                <Select
                                                                    value={(formValues[q.id] as string) ?? ''}
                                                                    onValueChange={v => {
                                                                        setFormValues(prev => ({ ...prev, [q.id]: v }));
                                                                        setErrors(prev => ({ ...prev, [q.id]: validateField(q, v) }));
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="lg:w-1/2 w-full">
                                                                        <SelectValue placeholder="Select one" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {q.options.map(opt => (
                                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                                {opt.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                        {q.supportsOther && (
                                                                            <SelectItem value="__other__">
                                                                                {q.otherLabel ?? 'Other (specify)'}
                                                                            </SelectItem>
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                {q.supportsOther && (formValues[q.id] as string) === '__other__' && (
                                                                    <Input
                                                                        id={`${q.id}__otherText`}
                                                                        placeholder="Please specify"
                                                                        value={(formValues[`${q.id}__otherText`] as string) ?? ''}
                                                                        onChange={e => {
                                                                            const val = e.target.value;
                                                                            setFormValues(prev => ({ ...prev, [`${q.id}__otherText`]: val }));
                                                                            setErrors(prev => ({ ...prev, [q.id]: validateField(q, '__other__') }));
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        {q.type === 'multi-select' && (
                                                            <div className="space-y-2">
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {[
                                                                        ...q.options,
                                                                        ...(q.supportsOther
                                                                            ? [{ value: '__other__', label: q.otherLabel ?? 'Other (specify)' }]
                                                                            : []),
                                                                    ].map(opt => {
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
                                                                                        const current = Array.isArray(existing)
                                                                                            ? (existing as string[])
                                                                                            : [];
                                                                                        const next = selected
                                                                                            ? current.filter(v => v !== opt.value)
                                                                                            : current.concat(opt.value);
                                                                                        const err = validateField(q, next);
                                                                                        setErrors(p => ({ ...p, [q.id]: err }));
                                                                                        return { ...prev, [q.id]: next };
                                                                                    })
                                                                                }
                                                                            >
                                                                                {opt.label}
                                                                            </Button>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {q.supportsOther &&
                                                                    Array.isArray(formValues[q.id]) &&
                                                                    (formValues[q.id] as string[]).includes('__other__') && (
                                                                        <Input
                                                                            id={`${q.id}__otherText`}
                                                                            placeholder="Please specify"
                                                                            value={(formValues[`${q.id}__otherText`] as string) ?? ''}
                                                                            onChange={e => {
                                                                                const val = e.target.value;
                                                                                setFormValues(prev => ({ ...prev, [`${q.id}__otherText`]: val }));
                                                                                setErrors(prev => ({
                                                                                    ...prev,
                                                                                    [q.id]: validateField(q, prev[q.id]),
                                                                                }));
                                                                            }}
                                                                        />
                                                                    )}
                                                            </div>
                                                        )}
                                                        {errors[q.id] && <p className="text-red-500 text-sm mt-1">{errors[q.id]}</p>}
                                                    </div>
                                                ))}
                                                <div className="flex items-center justify-between">
                                                    {idx < sections.length - 1 ? (
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                const nextErrors: Record<string, string | null> = {};
                                                                let ok = true;
                                                                section.questions.forEach(q => {
                                                                    const val = formValues[q.id];
                                                                    const err = validateField(q, val);
                                                                    nextErrors[q.id] = err;
                                                                    if (err) ok = false;
                                                                });
                                                                setErrors(prev => ({ ...prev, ...nextErrors }));
                                                                if (ok) carouselApi?.scrollTo(idx + 1);
                                                            }}
                                                        >
                                                            Next section
                                                        </Button>
                                                    ) : (
                                                        <Button type="submit" disabled={!canSubmit}>
                                                            {submitting && <Loader className="w-4 h-4 animate-spin" />} Submit Feedback
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>

                            <div className="flex items-center gap-2 justify-center mt-2">
                                {sections.map((_, i) => (
                                    <Button
                                        key={i}
                                        type="button"
                                        size="icon"
                                        variant={currentSlide === i ? 'default' : 'outline'}
                                        onClick={() => carouselApi?.scrollTo(i)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
