import type { Config } from 'tailwindcss';

const config = {
    darkMode: 'class',
    content: ['./src/**/*.{ts,tsx}', './public/**/*.html', './dist/**/*.html'],
    theme: {},
    plugins: [],
} satisfies Config;

export default config;
