import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'es2022',
        rollupOptions: {
            input: {
                content: 'src/content.ts',
                inpage: 'src/inpage.tsx',
            },
            output: {
                // Stable names so manifest can reference them
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name][extname]',
            },
        },
    },
});
