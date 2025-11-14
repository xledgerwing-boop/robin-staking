import { useState, useEffect } from 'react';

export function useIsXlScreen() {
    const [isLg, setIsLg] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1280px)');
        const handleChange = (e: MediaQueryListEvent) => setIsLg(e.matches);
        setIsLg(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    return isLg;
}
