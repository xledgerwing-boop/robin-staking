import { usePathname, useSearchParams } from 'next/navigation';

export default function useUpdateQueryParams() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateQueryParams = (updates: Record<string, string | null | undefined>) => {
        // Use the History API instead of router.replace to avoid triggering a Next.js navigation
        // which would cause a server re-render/fetch. This keeps URL in sync without refetching.
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        const prev = typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : searchParams.toString();
        const next = params.toString();
        if (prev !== next && typeof window !== 'undefined') {
            const url = `${pathname}${next ? `?${next}` : ''}`;
            window.history.replaceState(window.history.state, '', url);
        }
    };

    return { updateQueryParams };
}
