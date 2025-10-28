'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type Submission = {
    id: string;
    userAddress: string;
    proxyAddress: string | null;
    answers: Record<string, unknown>;
    createdAt: string;
};

export default function AdminFeedbackListPage() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

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
                            <Button onClick={() => load(1)} disabled={!password || loading}>
                                {loading ? 'Loading…' : 'Load Feedback'}
                            </Button>
                            <Button variant="outline" onClick={handleExport} disabled={!password}>
                                Export JSON
                            </Button>
                        </div>
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
