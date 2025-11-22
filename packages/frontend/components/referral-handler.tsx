'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ReferralHandlerInner() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const referral = searchParams.get('r');
        if (referral) {
            // Set cookie that expires in 1 year
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1);
            document.cookie = `r=${referral}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
        }
    }, [searchParams]);

    return null;
}

export function ReferralHandler() {
    return (
        <Suspense fallback={null}>
            <ReferralHandlerInner />
        </Suspense>
    );
}
