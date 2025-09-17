'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ArrowDownToLine, ArrowUpToLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DateTime } from 'luxon';
import { MarketWithEvent } from '@/types/market';
import OutcomeToken from './outcome-token';

type UserPosition = {
    yesTokens: string;
    noTokens: string;
    earnedYield: string;
    balance: string;
    withdrawableAmount: string;
};

export default function ManagePositionCard({ market, userPosition }: { market: MarketWithEvent; userPosition: UserPosition }) {
    const [activeTab, setActiveTab] = useState('deposit');
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [depositSide, setDepositSide] = useState<'yes' | 'no'>('yes');

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateQueryParams = (updates: Record<string, string | null | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        const prev = searchParams.toString();
        const next = params.toString();
        if (prev !== next) {
            router.replace(`${pathname}${next ? `?${next}` : ''}`);
        }
    };

    const loadQueryParams = () => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'deposit' || tabParam === 'withdraw') {
            if (tabParam !== activeTab) setActiveTab(tabParam);
        }

        const sideParam = searchParams.get('side');
        if (sideParam === 'yes' || sideParam === 'no') {
            if (sideParam !== depositSide) setDepositSide(sideParam);
        }
    };

    useEffect(() => {
        loadQueryParams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleMaxDeposit = () => {
        setDepositAmount(userPosition.balance.replace('$', '').replace(/,/g, ''));
    };

    const handleMaxWithdraw = () => {
        setWithdrawAmount(userPosition.withdrawableAmount.replace('$', '').replace(/,/g, ''));
    };

    const calculateExpectedYield = (amount: string) => {
        const numAmount = Number.parseFloat(amount) || 0;
        const apy = market.apyBps / 10_000;
        const daysUntilResolution = DateTime.fromMillis(market.endDate ?? Date.now()).diff(DateTime.now(), 'days').days;
        const expectedYield = (numAmount * apy * daysUntilResolution) / 365;
        return expectedYield.toFixed(2);
    };

    const handleTabChange = (value: string) => {
        const tab = value === 'withdraw' ? 'withdraw' : 'deposit';
        setActiveTab(tab);
        updateQueryParams({ tab });
    };

    const handleDepositSideChange = (value: string) => {
        const side = value === 'no' ? 'no' : 'yes';
        setDepositSide(side);
        updateQueryParams({ side });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Position</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="deposit">Deposit</TabsTrigger>
                        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                    </TabsList>

                    <TabsContent value="deposit" className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3 border-b pb-4">
                                <Input
                                    id="deposit-amount"
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0"
                                    value={depositAmount}
                                    onChange={e => setDepositAmount(e.target.value)}
                                    className="flex-1 border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 h-auto px-0 py-0 text-4xl sm:text-4xl md:text-4xl appearance-none font-semibold tracking-tight"
                                />
                                <Select value={depositSide} onValueChange={handleDepositSideChange}>
                                    <SelectTrigger className="px-4 py-2 rounded-full border text-sm font-medium">
                                        <OutcomeToken isYes={depositSide === 'yes'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">
                                            <OutcomeToken isYes={true} />
                                        </SelectItem>
                                        <SelectItem value="no">
                                            <OutcomeToken isYes={false} />
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex space-x-2 justify-between">
                                <p className="text-sm text-muted-foreground">Balance: {userPosition.balance}</p>
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleMaxDeposit}>
                                    Max
                                </Button>
                            </div>
                        </div>

                        {depositAmount && (
                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <h4 className="font-medium">Position Preview</h4>
                                <div className="flex justify-between text-sm">
                                    <span>Your Position:</span>
                                    <span>
                                        {depositAmount} {depositSide}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>APY:</span>
                                    <span className="text-primary">{((market.apyBps / 10_000) * 100).toFixed(2)}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>
                                        Expected Yield by{' '}
                                        {market.endDate ? DateTime.fromMillis(market.endDate).toLocaleString(DateTime.DATE_MED) : '—'}:
                                    </span>
                                    <span className="text-primary">${calculateExpectedYield(depositAmount)}</span>
                                </div>
                            </div>
                        )}

                        <Button className="w-full">
                            <ArrowUpToLine className="w-4 h-4 mr-2" />
                            Deposit {depositAmount || '0.00'} {depositSide}
                        </Button>
                    </TabsContent>

                    <TabsContent value="withdraw" className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3 border-b pb-4">
                                <Input
                                    id="withdraw-amount"
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0"
                                    value={withdrawAmount}
                                    onChange={e => setWithdrawAmount(e.target.value)}
                                    className="flex-1 border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 h-auto px-0 py-0 text-4xl sm:text-4xl md:text-4xl appearance-none font-semibold tracking-tight"
                                />
                                <Select value={depositSide} onValueChange={handleDepositSideChange}>
                                    <SelectTrigger className="px-4 py-2 rounded-full border text-sm font-medium">
                                        <OutcomeToken isYes={depositSide === 'yes'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">
                                            <OutcomeToken isYes={true} />
                                        </SelectItem>
                                        <SelectItem value="no">
                                            <OutcomeToken isYes={false} />
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex space-x-2 justify-between">
                                <p className="text-sm text-muted-foreground">Balance: {userPosition.withdrawableAmount}</p>
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleMaxWithdraw}>
                                    Max
                                </Button>
                            </div>
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
                                            Number.parseFloat(userPosition.withdrawableAmount.replace('$', '').replace(/,/g, '')) -
                                            (Number.parseFloat(withdrawAmount) || 0)
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <Button className="w-full" variant="secondary">
                            <ArrowDownToLine className="w-4 h-4 mr-2" />
                            Withdraw {withdrawAmount || '0.00'} {depositSide}
                        </Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
