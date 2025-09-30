import { Badge } from '@/components/ui/badge';
import { CircleAlert, RefreshCcw, CircleCheck, Timer } from 'lucide-react';

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

export function MarketStatusBadge({ status, initialized }: { status: string; initialized: boolean }) {
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
}
