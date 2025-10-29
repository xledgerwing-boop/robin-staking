import { Badge } from '@/components/ui/badge';
import { MarketStatus } from '@robin-pm-staking/common/types/market';
import { CircleAlert, RefreshCcw, CircleCheck, Timer } from 'lucide-react';

const getStatusIcon = (status: MarketStatus) => {
    switch (status) {
        case MarketStatus.Uninitialized:
            return <CircleAlert className="w-4 h-4" />;
        case MarketStatus.Active:
            return <RefreshCcw className="w-4 h-4" />;
        case MarketStatus.Unlocked:
            return <CircleCheck className="w-4 h-4" />;
        case MarketStatus.Finalized:
            return <Timer className="w-4 h-4" />;
        default:
            return <RefreshCcw className="w-4 h-4" />;
    }
};

const getStatusText = (status: MarketStatus) => {
    if (status === MarketStatus.Uninitialized) {
        return 'Activate';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
};

export function MarketStatusBadge({ status }: { status: MarketStatus }) {
    const variants = {
        [MarketStatus.Uninitialized]: 'outline',
        [MarketStatus.Active]: 'outline',
        [MarketStatus.Unlocked]: 'default',
        [MarketStatus.Finalized]: 'secondary',
    } as const;

    return (
        <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
            {getStatusIcon(status)} {getStatusText(status)}
        </Badge>
    );
}
