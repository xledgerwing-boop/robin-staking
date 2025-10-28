'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type RewardActivity = {
    id: string;
    userAddress: string;
    points: number;
    type: string;
    createdAt: string;
    details?: Record<string, unknown> | null;
};

export default function AdminRewardsPage() {
    const [password, setPassword] = useState('');
    const [activities, setActivities] = useState<RewardActivity[]>([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({ id: '', userAddress: '', points: 0, type: '', details: '' });
    const [batch, setBatch] = useState({ userAddresses: '', type: '', amount: 0 });

    const headers: Record<string, string> = password ? { 'x-admin-password': password } : {};

    const load = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/rewards/admin', { headers });
            if (!res.ok) throw new Error('Unauthorized');
            const data = (await res.json()) as { activities: RewardActivity[] };
            setActivities(data.activities || []);
        } catch (e) {
            toast.error((e as Error)?.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                id: form.id || undefined,
                userAddress: form.userAddress,
                points: Number(form.points),
                type: form.type,
                details: form.details ? JSON.parse(form.details) : undefined,
            };
            const res = await fetch('/api/rewards/admin', {
                method: form.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to save');
            toast.success('Saved');
            setForm({ id: '', userAddress: '', points: 0, type: '', details: '' });
            await load();
        } catch (e) {
            toast.error((e as Error)?.message || 'Failed to save');
        }
    };

    const handleEdit = (a: RewardActivity) => {
        setForm({ id: a.id, userAddress: a.userAddress, points: a.points, type: a.type, details: a.details ? JSON.stringify(a.details) : '' });
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/rewards/admin?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers,
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Deleted');
            await load();
        } catch (e) {
            toast.error((e as Error)?.message || 'Failed to delete');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Rewards Admin</h1>
                    <p className="text-muted-foreground">Manage reward activities. Requires admin password.</p>
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
                        <Button onClick={load} disabled={!password || loading}>
                            {loading ? 'Loading…' : 'Load Activities'}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Create / Edit Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="id">ID (leave empty to create)</Label>
                                <Input id="id" value={form.id} onChange={e => setForm(prev => ({ ...prev, id: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="userAddress">User Address</Label>
                                <Input
                                    id="userAddress"
                                    value={form.userAddress}
                                    onChange={e => setForm(prev => ({ ...prev, userAddress: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="points">Points</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    value={form.points}
                                    onChange={e => setForm(prev => ({ ...prev, points: Number(e.target.value) }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="type">Type</Label>
                                <Input id="type" value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))} />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="details">Details (JSON)</Label>
                                <Input id="details" value={form.details} onChange={e => setForm(prev => ({ ...prev, details: e.target.value }))} />
                            </div>
                        </div>
                        <Button onClick={handleSave} disabled={!password}>
                            Save Activity
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Batch Create Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <Label htmlFor="addresses">User Addresses (comma separated)</Label>
                                <Input
                                    id="addresses"
                                    placeholder="0xabc..., 0xdef..., 0x123..."
                                    value={batch.userAddresses}
                                    onChange={e => setBatch(prev => ({ ...prev, userAddresses: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="batchType">Type</Label>
                                <Input id="batchType" value={batch.type} onChange={e => setBatch(prev => ({ ...prev, type: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="batchAmount">Amount</Label>
                                <Input
                                    id="batchAmount"
                                    type="number"
                                    value={batch.amount}
                                    onChange={e => setBatch(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                />
                            </div>
                        </div>
                        <Button
                            onClick={async () => {
                                try {
                                    const res = await fetch('/api/rewards/admin/batch', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', ...headers },
                                        body: JSON.stringify(batch),
                                    });
                                    if (!res.ok) throw new Error('Failed to create batch');
                                    const data = await res.json();
                                    toast.success(`Created ${data.created} activities`);
                                    setBatch({ userAddresses: '', type: '', amount: 0 });
                                    await load();
                                } catch (e) {
                                    toast.error((e as Error)?.message || 'Batch create failed');
                                }
                            }}
                            disabled={!password}
                        >
                            Create Batch
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {activities.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No activities</div>
                        ) : (
                            activities.map(a => (
                                <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{a.type}</div>
                                        <div className="text-sm text-muted-foreground">{a.userAddress}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold">+{a.points}</div>
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(a)}>
                                            Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(a.id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
