'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

export default function AdminReferralsPage() {
    const { address } = useAccount();
    const [codes, setCodes] = useState<
        {
            id: string;
            code: string;
            ownerAddress: string;
            ownerName: string;
            createdAt: string;
        }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [ownerAddress, setOwnerAddress] = useState('');
    const [ownerName, setOwnerName] = useState('');

    useEffect(() => {
        loadCodes();
    }, []);

    const loadCodes = async () => {
        try {
            const res = await fetch('/api/referral/codes');
            const data = await res.json();
            setCodes(data.codes || []);
        } catch (e) {
            console.error('Failed to load codes', e);
        }
    };

    const createCode = async () => {
        if (!newCode || !ownerAddress || !ownerName) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const adminKey = prompt('Enter admin key:');
            if (!adminKey) {
                setLoading(false);
                return;
            }

            const res = await fetch('/api/referral/codes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': adminKey,
                },
                body: JSON.stringify({
                    code: newCode,
                    ownerAddress,
                    ownerName,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create code');
            }

            toast.success('Referral code created');
            setNewCode('');
            setOwnerAddress('');
            setOwnerName('');
            await loadCodes();
        } catch (e) {
            toast.error((e as Error).message || 'Failed to create referral code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Admin - Referral Codes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="code">Code</Label>
                            <Input id="code" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="e.g., PARTNER123" />
                        </div>
                        <div>
                            <Label htmlFor="owner">Owner Address</Label>
                            <Input id="owner" value={ownerAddress} onChange={e => setOwnerAddress(e.target.value)} placeholder="0x..." />
                        </div>
                        <div>
                            <Label htmlFor="ownerName">Owner Name</Label>
                            <Input id="ownerName" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="e.g., John Doe" />
                        </div>
                        <Button onClick={createCode} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Referral Code'}
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Existing Codes</h3>
                        {codes.length === 0 ? (
                            <p className="text-muted-foreground">No codes yet</p>
                        ) : (
                            <div className="space-y-2">
                                {codes.map(code => (
                                    <Card key={code.id}>
                                        <CardContent className="pt-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">{code.code}</div>
                                                    <div className="text-sm text-muted-foreground">{code.ownerAddress}</div>
                                                    <div className="text-sm text-muted-foreground">{code.ownerName}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Created: {new Date(Number(code.createdAt)).toLocaleString()}
                                                    </div>
                                                </div>
                                                <Button variant="outline" asChild>
                                                    <a href={`/referral/${code.id}`}>View Overview</a>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
