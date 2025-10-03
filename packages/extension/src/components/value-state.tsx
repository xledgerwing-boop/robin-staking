import { Skeleton } from './ui/skeleton';

export default function ValueState({ value, loading, error }: { value: string; loading: boolean; error: boolean }) {
    if (loading) return <Skeleton className="w-10 h-3 inline-block" />;
    if (error) return <span className="text-xs text-destructive">--</span>;
    return value;
}
