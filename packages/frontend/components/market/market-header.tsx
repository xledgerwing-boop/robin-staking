import { Clock, ExternalLink } from 'lucide-react';
import { DateTime } from 'luxon';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { MarketStatusBadge } from './market-status-badge';
import { MarketStatus, MarketWithEvent, Outcome, ParsedPolymarketMarket } from '@robin-pm-staking/common/types/market';
import aaveLogo from '@/public/aave.png';
import { formatUnits } from '@robin-pm-staking/common/lib/utils';
import { UNDERYLING_DECIMALS } from '@robin-pm-staking/common/constants';
import Link from 'next/link';
import { useVaultUserInfo } from '@robin-pm-staking/common/hooks/use-vault-user-info';
import { useProxyAccount } from '@robin-pm-staking/common/hooks/use-proxy-account';
import OutcomeToken from '@robin-pm-staking/common/components/outcome-token';
import { ValueState } from '../value-state';
import { Badge } from '../ui/badge';

export default function MarketHeader({ market, polymarketMarket }: { market: MarketWithEvent; polymarketMarket: ParsedPolymarketMarket }) {
    const { proxyAddress } = useProxyAccount();

    const { vaultCurrentApyLoading, vaultCurrentApyError, calculateUserInfo } = useVaultUserInfo(
        market.contractAddress as `0x${string}`,
        proxyAddress as `0x${string}`,
        market
    );

    const { currentYesApyBps, currentNoApyBps } = calculateUserInfo(
        Number(polymarketMarket.outcomePrices[0]),
        Number(polymarketMarket.outcomePrices[1])
    );

    return (
        <Card className="mb-8">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="relative w-15 h-15 shrink-0">
                            <Image
                                src={market.image || '/placeholder.png'}
                                alt={market.question ?? 'Market'}
                                fill
                                className="rounded-lg object-cover"
                                sizes="150px"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{market.question}</h1>
                            <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{market.endDate ? DateTime.fromMillis(market.endDate).toLocaleString(DateTime.DATE_MED) : '—'}</span>
                                </div>
                                <div className="flex items-center">
                                    <MarketStatusBadge status={market.status} />
                                </div>
                                <Link href={`https://polymarket.com/event/${market.eventSlug}/${market.slug}`} target="_blank" className="lg:hidden">
                                    <Badge variant="outline">
                                        <ExternalLink className="w-2 h-2" /> View
                                    </Badge>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <Link href={`https://polymarket.com/event/${market.eventSlug}/${market.slug}`} target="_blank" className="hidden lg:block">
                        <Button variant="outline" size="sm">
                            View Market
                            <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>

                {market.status !== MarketStatus.Uninitialized && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Current APY</p>
                            <div className="flex items-center justify-center gap-4 lg:gap-8 text-md lg:text-xl">
                                <div className="font-bold text-primary flex items-center gap-1">
                                    <OutcomeToken outcome={Outcome.Yes} symbolHolder={market} noText />{' '}
                                    <ValueState
                                        value={((Number(currentYesApyBps) / 10_000) * 100).toFixed(2)}
                                        loading={vaultCurrentApyLoading}
                                        error={!!vaultCurrentApyError}
                                    />
                                    %
                                </div>
                                <div className="font-bold text-primary flex items-center gap-1">
                                    <OutcomeToken outcome={Outcome.No} symbolHolder={market} noText />{' '}
                                    <ValueState
                                        value={((Number(currentNoApyBps) / 10_000) * 100).toFixed(2)}
                                        loading={vaultCurrentApyLoading}
                                        error={!!vaultCurrentApyError}
                                    />
                                    %
                                </div>
                            </div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Yield Sources</p>
                            <div className="flex items-center justify-center gap-2 text-md font-bold text-primary mt-2">
                                {/* <Image src={infraredLogo} alt="Infrared" width={15} height={15} />
                                        <span>Infrared</span>
                                        <Image src={dolomiteLogo} alt="Dolomite" width={15} height={15} />
                                        <span>Dolomite</span> */}
                                <Image src={aaveLogo} alt="Aave" width={90} height={30} />
                            </div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">TVL</p>
                            <p className="text-xl font-bold">${formatUnits(market.tvl, UNDERYLING_DECIMALS)}</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Unmatched Tokens</p>
                            <p className="text-xl font-bold">
                                {market.unmatchedYesTokens > 0
                                    ? `${formatUnits(market.unmatchedYesTokens, UNDERYLING_DECIMALS)} ${market.outcomes[0]}`
                                    : ''}
                                {market.unmatchedNoTokens > 0
                                    ? `${formatUnits(market.unmatchedNoTokens, UNDERYLING_DECIMALS)} ${market.outcomes[1]}`
                                    : ''}
                                {market.unmatchedYesTokens === 0n && market.unmatchedNoTokens === 0n
                                    ? `0 ${market.outcomes[0]}/${market.outcomes[1]}`
                                    : ''}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
