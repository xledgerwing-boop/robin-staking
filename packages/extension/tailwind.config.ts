import type { Config } from 'tailwindcss';

const config = {
    darkMode: 'class',
    content: ['./src/**/*.{ts,tsx}', './public/**/*.html', './dist/**/*.html'],
    theme: {
        extend: {
            keyframes: {
                'collapsible-down': {
                    from: { height: '0', opacity: '0' },
                    to: { height: 'var(--radix-collapsible-content-height)', opacity: '1' },
                },
                'collapsible-up': {
                    from: { height: 'var(--radix-collapsible-content-height)', opacity: '1' },
                    to: { height: '0', opacity: '0' },
                },
            },
            animation: {
                'collapsible-down': 'collapsible-down 0.25s ease-out',
                'collapsible-up': 'collapsible-up 0.2s ease-in',
            },
        },
    },
    plugins: [],
} satisfies Config;

export default config;
