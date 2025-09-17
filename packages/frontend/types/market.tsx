import { Badge } from '@/components/ui/badge';
import { PolymarketEventDTO } from './event';
import { CircleAlert, CircleCheck, RefreshCcw, Timer } from 'lucide-react';

export interface MarketRow {
    id: string;
    question: string;
    conditionId: string;
    slug: string;
    endDate?: string;
    startDate?: string;
    image?: string;
    outcomes: string;
    clobTokenIds: string;
    negRisk: boolean;
    createdAt: string;
    updatedAt: string;
    initialized: boolean;
    tvl: string;
    apyBps: number;
    eventId: string;
    unmatchedYesTokens: string;
    unmatchedNoTokens: string;
    matchedTokens: string;
}

export interface MarketRowWithEvent extends MarketRow {
    eventSlug: string;
}

export interface Market {
    id: string;
    question: string;
    conditionId: string;
    slug: string;
    endDate?: number;
    startDate?: number;
    image?: string;
    outcomes: string[];
    clobTokenIds: string[];
    negRisk: boolean;
    createdAt: number;
    updatedAt: number;
    initialized: boolean;
    tvl: bigint;
    apyBps: number;
    eventId: string;
    unmatchedYesTokens: bigint;
    unmatchedNoTokens: bigint;
    matchedTokens: bigint;
}

export interface MarketWithEvent extends Market {
    eventSlug: string;
}

export function MarketRowToMarket(row: MarketRow): Market {
    return {
        ...row,
        endDate: row.endDate ? Number.parseInt(row.endDate) : undefined,
        startDate: row.startDate ? Number.parseInt(row.startDate) : undefined,
        createdAt: Number.parseInt(row.createdAt),
        updatedAt: Number.parseInt(row.updatedAt),
        outcomes: row.outcomes as unknown as string[], //already comes parsed out of the DB
        clobTokenIds: row.clobTokenIds as unknown as string[], //already comes parsed out of the DB
        tvl: BigInt(row.tvl),
        unmatchedYesTokens: BigInt(row.unmatchedYesTokens),
        unmatchedNoTokens: BigInt(row.unmatchedNoTokens),
        matchedTokens: BigInt(row.matchedTokens),
    };
}

export function MarketRowToMarketWithEvent(row: MarketRowWithEvent): MarketWithEvent {
    const market = MarketRowToMarket(row);
    return {
        ...market,
        eventSlug: row.eventSlug,
    };
}

export interface PolymarketMarketDTO {
    id: string;
    question: string;
    conditionId: string;
    slug: string;
    endDate?: string;
    startDate?: string;
    image?: string;
    outcomes: string;
    clobTokenIds: string;
    negRisk?: boolean;
    eventId: string;
}

export interface PolymarketMarketWithEvent extends PolymarketMarketDTO {
    events: PolymarketEventDTO[];
}

const getStatusIcon = (status: string, initialized = true) => {
    if (!initialized) {
        return <CircleAlert className="w-4 h-4" />;
    }
    switch (status) {
        case 'active':
            return <RefreshCcw className="w-4 h-4" />;
        case 'completed':
            return <CircleCheck className="w-4 h-4" />;
        case 'pending':
            return <Timer className="w-4 h-4" />;
        default:
            return <RefreshCcw className="w-4 h-4" />;
    }
};

export const getStatusBadge = (status: string, initialized = true) => {
    if (!initialized) {
        return <Badge variant="outline">{getStatusIcon(status, initialized)} Uninitialized</Badge>;
    }
    const variants = {
        active: 'outline',
        completed: 'default',
        pending: 'secondary',
    } as const;

    return (
        <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
            {getStatusIcon(status, initialized)} {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
};
