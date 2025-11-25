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
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { FEEDBACK_REWARD_PONTS } from '@/lib/constants';
import { FEEDBACK_SECTIONS, type FeedbackQuestion, type FeedbackSection } from '@/lib/feedback-schema';

export default function FeedbackPage() {
    const { address, proxyAddress, isConnected } = useProxyAccount();
    const [isEligible, setIsEligible] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const sections: FeedbackSection[] = FEEDBACK_SECTIONS;

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

    const validateField = (q: FeedbackQuestion, value: unknown): string | null => {
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
