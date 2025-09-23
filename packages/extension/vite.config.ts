import { defineConfig } from 'vite';

export default defineConfig({
    resolve: {
        alias: {
            '@': '/src',
        },
    },
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
            onwarn(warning, defaultHandler) {
                const message = String((warning as any)?.message ?? '');
                // Suppress noisy warnings about PURE annotations comment placement from dependencies
                if (
                    message.includes('annotation that Rollup cannot interpret due to the position of the comment') ||
                    message.includes('/*#__PURE__*/')
                )
                    return;
                if (message.includes('Module level directives cause errors when bundled, "use client"')) return;
                defaultHandler(warning);
            },
        },
    },
});
