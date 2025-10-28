'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { usePathname, useRouter } from 'next/navigation';

export function BackButton() {
    const pathname = usePathname();
    const router = useRouter();
    const includedPage = pathname.includes('/market/') || pathname.includes('/portfolio') || pathname.includes('/rewards');

    if (!includedPage) return null;
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                    router.back();
                } else {
                    router.push('/');
                }
            }}
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
        </Button>
    );
}
