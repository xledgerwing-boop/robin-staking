'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Clock, ArrowUpRight, CheckCircle, AlertCircle, Timer, ExternalLink, Wallet, Activity, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/navbar';

export default function VaultDetailPage() {
    const params = useParams();
    const vaultId = params.id as string;

    // Mock vault data - in real app, fetch based on vaultId
    const vaultData = {
        id: vaultId,
        conditionId: 'SPORTS_001',
        image: '/placeholder.png',
        title: 'Sports Betting Vault',
        liquidationDate: '2024-06-30',
        status: 'active',
        polymarketUrl: 'https://polymarket.com/event/sports-betting-vault',
        currentAPY: '28.5%',
        tvl: '$2.8M',
        matchedTokens: '$1.9M',
        unmatchedTokens: '$0.9M',
    };

    const userPosition = {
        yesTokens: '1,250',
        noTokens: '1,250',
        earnedYield: '$247.50',
        balance: '$5,420.00',
        withdrawableAmount: '$2,847.30',
    };

    // State for interaction
    const [activeTab, setActiveTab] = useState('deposit');
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showUserActivityOnly, setShowUserActivityOnly] = useState(false);
    const [activityTypeFilter, setActivityTypeFilter] = useState('all');

    // Mock activities data
    const activities = [
        {
            id: 1,
            walletAddress: '0x1234...5678',
            type: 'deposit',
            position: 'yes',
            info: 'Deposited 500 USDC',
            time: '2024-01-15 14:30',
            txHash: '0xabc123...',
            isCurrentUser: true,
        },
        {
            id: 2,
            walletAddress: '0x9876...5432',
            type: 'withdraw',
            position: 'no',
            info: 'Withdrew 250 USDC',
            time: '2024-01-15 12:15',
            txHash: '0xdef456...',
            isCurrentUser: false,
        },
        {
            id: 3,
            walletAddress: '0x1234...5678',
            type: 'harvest',
            position: 'both',
            info: 'Harvested $47.50 yield',
            time: '2024-01-14 16:45',
            txHash: '0xghi789...',
            isCurrentUser: true,
        },
        {
            id: 4,
            walletAddress: '0x5555...7777',
            type: 'deposit',
            position: 'no',
            info: 'Deposited 1000 USDC',
            time: '2024-01-14 09:20',
            txHash: '0xjkl012...',
            isCurrentUser: false,
        },
    ];

    // Filter activities
    const filteredActivities = useMemo(() => {
        let filtered = activities;

        if (showUserActivityOnly) {
            filtered = filtered.filter(activity => activity.isCurrentUser);
        }

        if (activityTypeFilter !== 'all') {
            filtered = filtered.filter(activity => activity.type === activityTypeFilter);
        }

        return filtered;
    }, [showUserActivityOnly, activityTypeFilter]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-blue-500" />;
            case 'pending':
                return <Timer className="w-4 h-4 text-yellow-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'default',
            completed: 'secondary',
            pending: 'outline',
        } as const;

        return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const handleMaxDeposit = () => {
        setDepositAmount(userPosition.balance.replace('$', '').replace(',', ''));
    };

    const handleMaxWithdraw = () => {
        setWithdrawAmount(userPosition.withdrawableAmount.replace('$', '').replace(',', ''));
    };

    const calculateExpectedYield = (amount: string) => {
        const numAmount = Number.parseFloat(amount) || 0;
        const apy = Number.parseFloat(vaultData.currentAPY.replace('%', '')) / 100;
        const daysUntilResolution = Math.ceil((new Date(vaultData.liquidationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const expectedYield = (numAmount * apy * daysUntilResolution) / 365;
        return expectedYield.toFixed(2);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Vault Header */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <Image
                                    src={vaultData.image || '/placeholder.svg'}
                                    alt={vaultData.title}
                                    width={64}
                                    height={64}
                                    className="rounded-lg"
                                />
                                <div>
                                    <h1 className="text-2xl font-bold">{vaultData.title}</h1>
                                    <p className="text-sm text-muted-foreground font-mono mb-2">{vaultData.conditionId}</p>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>Liquidates: {new Date(vaultData.liquidationDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(vaultData.status)}
                                            {getStatusBadge(vaultData.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Link href={vaultData.polymarketUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">
                                    View Market
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Current Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Current APY</p>
                                <p className="text-xl font-bold text-primary">{vaultData.currentAPY}</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">TVL</p>
                                <p className="text-xl font-bold">{vaultData.tvl}</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Matched Tokens</p>
                                <p className="text-xl font-bold text-green-500">{vaultData.matchedTokens}</p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Unmatched Tokens</p>
                                <p className="text-xl font-bold text-yellow-500">{vaultData.unmatchedTokens}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - User Position & Activities */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* User Position */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Wallet className="w-5 h-5" />
                                    <span>Your Position</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">YES Tokens</p>
                                        <p className="text-lg font-bold">{userPosition.yesTokens}</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">NO Tokens</p>
                                        <p className="text-lg font-bold">{userPosition.noTokens}</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">Earned Yield</p>
                                        <p className="text-lg font-bold text-green-500">{userPosition.earnedYield}</p>
                                    </div>
                                </div>
                                <Button className="w-full" disabled={vaultData.status !== 'completed'}>
                                    <Target className="w-4 h-4 mr-2" />
                                    Harvest Yield
                                    {vaultData.status !== 'completed' && <span className="ml-2 text-xs">(Available after market ends)</span>}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center space-x-2">
                                        <Activity className="w-5 h-5" />
                                        <span>Recent Activities</span>
                                    </CardTitle>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch id="user-activity" checked={showUserActivityOnly} onCheckedChange={setShowUserActivityOnly} />
                                            <Label htmlFor="user-activity" className="text-sm">
                                                My activity only
                                            </Label>
                                        </div>
                                        <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="deposit">Deposits</SelectItem>
                                                <SelectItem value="withdraw">Withdrawals</SelectItem>
                                                <SelectItem value="harvest">Harvests</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {filteredActivities.map(activity => (
                                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {activity.walletAddress}
                                                        {activity.isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{activity.info}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className="mb-1">
                                                    {activity.type}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                                                <Link
                                                    href={`https://etherscan.io/tx/${activity.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    View Tx
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredActivities.length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">No activities found.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Interaction Interface */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Position</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="deposit">Deposit</TabsTrigger>
                                        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="deposit" className="space-y-4">
                                        <div>
                                            <Label htmlFor="deposit-amount">Amount to Deposit</Label>
                                            <div className="flex space-x-2 mt-1">
                                                <Input
                                                    id="deposit-amount"
                                                    placeholder="0.00"
                                                    value={depositAmount}
                                                    onChange={e => setDepositAmount(e.target.value)}
                                                />
                                                <Button variant="outline" size="sm" onClick={handleMaxDeposit}>
                                                    Max
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Balance: {userPosition.balance}</p>
                                        </div>

                                        {depositAmount && (
                                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                                <h4 className="font-medium">Position Preview</h4>
                                                <div className="flex justify-between text-sm">
                                                    <span>Your Position:</span>
                                                    <span>${depositAmount}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>APY:</span>
                                                    <span className="text-primary">{vaultData.currentAPY}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Expected Yield by {new Date(vaultData.liquidationDate).toLocaleDateString()}:</span>
                                                    <span className="text-green-500">${calculateExpectedYield(depositAmount)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <Button className="w-full">
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            Deposit ${depositAmount || '0.00'}
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="withdraw" className="space-y-4">
                                        <div>
                                            <Label htmlFor="withdraw-amount">Amount to Withdraw</Label>
                                            <div className="flex space-x-2 mt-1">
                                                <Input
                                                    id="withdraw-amount"
                                                    placeholder="0.00"
                                                    value={withdrawAmount}
                                                    onChange={e => setWithdrawAmount(e.target.value)}
                                                />
                                                <Button variant="outline" size="sm" onClick={handleMaxWithdraw}>
                                                    Max
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">Withdrawable: {userPosition.withdrawableAmount}</p>
                                        </div>

                                        {withdrawAmount && (
                                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                                <h4 className="font-medium">Withdrawal Preview</h4>
                                                <div className="flex justify-between text-sm">
                                                    <span>Withdrawal Amount:</span>
                                                    <span>${withdrawAmount}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Remaining Position:</span>
                                                    <span>
                                                        $
                                                        {(
                                                            Number.parseFloat(userPosition.withdrawableAmount.replace('$', '').replace(',', '')) -
                                                            (Number.parseFloat(withdrawAmount) || 0)
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <Button className="w-full" variant="destructive">
                                            <ArrowUpRight className="w-4 h-4 mr-2" />
                                            Withdraw ${withdrawAmount || '0.00'}
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
