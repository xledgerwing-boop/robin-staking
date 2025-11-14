import { Skeleton } from './ui/skeleton';

export function ValueState({ value, loading, error }: { value?: string; loading: boolean; error: boolean }) {
    if (loading || value == null) return <Skeleton className="w-10 h-3 inline-block" />;
    if (error) return <span className="text-destructive/70">er</span>;
    return value;
}
