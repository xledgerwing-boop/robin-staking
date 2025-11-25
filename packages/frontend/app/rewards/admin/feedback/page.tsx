'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { type FeedbackSection } from '@/lib/feedback-schema';

const chartColors = ['#6366f1', '#ec4899', '#10b981', '#f97316', '#14b8a6', '#fbbf24', '#a855f7'];

type Submission = {
    id: string;
    userAddress: string;
    proxyAddress: string | null;
    answers: Record<string, unknown>;
    createdAt: string;
};

type OptionCount = { value: string; label: string; count: number };
type TextEntry = { submissionId: string; userAddress: string; proxyAddress: string | null; createdAt: string; answer: string };
type NumericEntry = TextEntry & { value: number };
type QuestionSummary = {
    id: string;
    label: string;
    sectionId: string;
    sectionTitle: string;
    type: 'text' | 'number' | 'select' | 'multi-select';
    totalResponses: number;
    otherLabel?: string;
    optionCounts?: OptionCount[];
    textResponses?: TextEntry[];
    otherEntries?: TextEntry[];
    numericValues?: NumericEntry[];
    numericStats?: { min: number; max: number; avg: number };
};

type FeedbackSummaryResponse = {
    totalSubmissions: number;
    sections: FeedbackSection[];
    questions: QuestionSummary[];
    submissions: Submission[];
};

export default function AdminFeedbackListPage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [summary, setSummary] = useState<FeedbackSummaryResponse | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const headers: Record<string, string> = password ? { 'x-admin-password': password } : {};

    const load = async (pageArg?: number) => {
        try {
            setLoading(true);
            const p = pageArg ?? page;
            const res = await fetch(`/api/rewards/admin/feedback?page=${p}&pageSize=${pageSize}`, { headers });
            if (!res.ok) throw new Error('Unauthorized');
            const data = (await res.json()) as { submissions: Submission[]; page: number; pageSize: number; totalCount: number };
            setSubmissions(data.submissions || []);
            setTotalCount(data.totalCount || 0);
            setPage(data.page || 1);
        } catch (e) {
            toast.error((e as Error)?.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        if (!password) {
            toast.error('Admin password required');
            return;
        }
        try {
            setSummaryLoading(true);
            const res = await fetch('/api/rewards/admin/feedback/summary', { headers });
            if (!res.ok) throw new Error('Unauthorized');
            const data = (await res.json()) as FeedbackSummaryResponse;
            setSummary(data);
        } catch (e) {
            setSummary(null);
            toast.error((e as Error)?.message || 'Failed to load summary');
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await fetch('/api/rewards/admin/feedback/export', { headers });
            if (!res.ok) throw new Error('Failed to export');
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feedback-submissions-${new Date().toISOString()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            toast.error((e as Error)?.message || 'Export failed');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Feedback Submissions</h1>
                    <p className="text-muted-foreground">View all user-submitted feedback.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Auth</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <Label htmlFor="password">Admin Password</Label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => {
                                    if (!password) {
                                        toast.error('Admin password required');
                                        return;
                                    }
                                    void loadSummary();
                                    void load(1);
                                }}
                                disabled={!password || loading || summaryLoading}
                            >
                                {loading || summaryLoading ? 'Loading…' : 'Load Feedback'}
                            </Button>
                            <Button variant="outline" onClick={handleExport} disabled={!password}>
                                Export JSON
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {summaryLoading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : summary ? (
                            <>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <StatCard label="Total submissions" value={summary.totalSubmissions.toLocaleString()} />
                                    <StatCard
                                        label="Questions answered"
                                        value={summary.questions.reduce((acc, q) => acc + (q.totalResponses > 0 ? 1 : 0), 0).toLocaleString()}
                                        helper="Questions with at least one response"
                                    />
                                    <StatCard
                                        label="Avg. responses / question"
                                        value={(
                                            summary.questions.reduce((acc, q) => acc + q.totalResponses, 0) / Math.max(1, summary.questions.length)
                                        ).toFixed(1)}
                                    />
                                </div>

                                <div className="space-y-8">
                                    {summary.sections.map(section => {
                                        const questions = summary.questions.filter(q => q.sectionId === section.id);
                                        if (questions.length === 0) return null;
                                        return (
                                            <div key={section.id} className="space-y-3">
                                                <div>
                                                    <h3 className="text-xl font-semibold">{section.title}</h3>
                                                    {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
                                                </div>
                                                <div className="grid gap-4 lg:grid-cols-2">
                                                    {questions.map(question => (
                                                        <QuestionInsight key={question.id} question={question} />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground">Load feedback to see aggregated insights.</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>All Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : submissions.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No submissions</div>
                        ) : (
                            <div className="space-y-3">
                                {submissions.map(s => (
                                    <div key={s.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">{s.userAddress}</div>
                                            <div className="text-sm text-muted-foreground">{new Date(Number(s.createdAt)).toLocaleString()}</div>
                                        </div>
                                        {s.proxyAddress && <div className="text-xs text-muted-foreground">Proxy: {s.proxyAddress}</div>}
                                        <pre className="mt-2 text-xs whitespace-pre-wrap break-words">{JSON.stringify(s.answers, null, 2)}</pre>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between pt-2">
                                    <div className="text-sm text-muted-foreground">
                                        {`Showing ${Math.min((page - 1) * pageSize + 1, totalCount)}-${Math.min(
                                            page * pageSize,
                                            totalCount
                                        )} of ${totalCount}`}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                if (page > 1 && !loading) load(page - 1);
                                            }}
                                            disabled={page <= 1 || loading}
                                        >
                                            Prev
                                        </Button>
                                        <div className="text-sm">Page {page}</div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                if (page * pageSize < totalCount && !loading) load(page + 1);
                                            }}
                                            disabled={page * pageSize >= totalCount || loading}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
    return (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
            {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
        </div>
    );
}

function QuestionInsight({ question }: { question: QuestionSummary }) {
    return (
        <Card className="h-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-base">{question.label}</CardTitle>
                <p className="text-xs text-muted-foreground">
                    {question.totalResponses.toLocaleString()} response{question.totalResponses === 1 ? '' : 's'}
                    {question.type === 'multi-select' && ' · multi-select'}
                </p>
            </CardHeader>
            <CardContent>
                <QuestionContent question={question} />
            </CardContent>
        </Card>
    );
}

function QuestionContent({ question }: { question: QuestionSummary }) {
    if (question.type === 'text') {
        return <TextResponseList entries={question.textResponses} emptyLabel="No responses yet." />;
    }
    if (question.type === 'number') {
        return <NumberChart question={question} />;
    }
    return (
        <div className="space-y-4">
            <ChoiceChart question={question} />
            {question.otherEntries && question.otherEntries.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">{question.otherLabel ?? 'Other responses'}</p>
                    <TextResponseList entries={question.otherEntries} emptyLabel="No other responses" />
                </div>
            )}
        </div>
    );
}

function ChoiceChart({ question }: { question: QuestionSummary }) {
    const data = (question.optionCounts ?? []).map((opt, index) => ({
        label: opt.label,
        count: opt.count,
        fill: chartColors[index % chartColors.length],
    }));
    const hasData = data.some(d => d.count > 0);
    if (!hasData) {
        return <EmptyState text="No responses yet." />;
    }
    return (
        <>
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                    <XAxis dataKey="label" angle={-15} textAnchor="end" interval={0} height={60} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.map(entry => (
                            <Cell key={entry.label} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
                {question.type === 'multi-select'
                    ? 'Counts reflect individual selections (can exceed respondents).'
                    : 'Counts reflect unique respondents per choice.'}
            </p>
        </>
    );
}

function NumberChart({ question }: { question: QuestionSummary }) {
    const values = question.numericValues ?? [];
    if (!values.length) return <EmptyState text="No numeric responses yet." />;
    const distribution = values.reduce((acc, entry) => {
        const key = entry.value.toString();
        const current = acc.get(key) ?? { label: key, count: 0, numeric: entry.value };
        current.count += 1;
        acc.set(key, current);
        return acc;
    }, new Map<string, { label: string; count: number; numeric: number }>());
    const data = Array.from(distribution.values())
        .sort((a, b) => a.numeric - b.numeric)
        .map((item, index) => ({ ...item, fill: chartColors[index % chartColors.length] }));

    return (
        <>
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {data.map(entry => (
                            <Cell key={entry.label} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            {question.numericStats && (
                <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-4">
                    <span>Min: {question.numericStats.min}</span>
                    <span>Max: {question.numericStats.max}</span>
                    <span>Avg: {question.numericStats.avg.toFixed(2)}</span>
                </div>
            )}
        </>
    );
}

function TextResponseList({ entries, emptyLabel }: { entries?: TextEntry[]; emptyLabel: string }) {
    if (!entries || entries.length === 0) {
        return <EmptyState text={emptyLabel} />;
    }
    return (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {entries.map(entry => (
                <div key={`${entry.submissionId}-${entry.createdAt}-${entry.answer.slice(0, 8)}`} className="rounded-md border p-2">
                    <p className="text-sm whitespace-pre-wrap break-words">{entry.answer}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{formatMeta(entry)}</p>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return <p className="text-sm text-muted-foreground">{text}</p>;
}

function formatMeta(entry: TextEntry) {
    const ts = formatTimestamp(entry.createdAt);
    const address = shortenAddress(entry.userAddress);
    const proxy = entry.proxyAddress ? ` · proxy ${shortenAddress(entry.proxyAddress)}` : '';
    return `${address}${proxy} · ${ts}`;
}

function shortenAddress(addr: string) {
    if (!addr) return '';
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatTimestamp(value: string) {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    const date = new Date(num);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}
