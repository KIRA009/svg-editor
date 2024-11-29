import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), libInjectCss()],
    build: {
        lib: {
            entry: resolve(__dirname, 'src', 'lib', 'index.js'),
            name: 'svgEditor',
            formats: ['es'],
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            // input: Object.fromEntries(
            //     glob.sync('src/lib/**/*.{js,jsx}').map(file => [
            //     // The name of the entry point lib/nested/foo.ts becomes nested/foo
            //     relative(
            //         'src/lib',
            //       file.slice(0, file.length - extname(file).length),
            //     ),
            //     // The absolute path to the entry file lib/nested/foo.ts becomes /project/lib/nested/foo.ts
            //     fileURLToPath(new URL(file, import.meta.url)),
            //   ]),
            // ),
            // output: {
            //     assetFileNames: 'assets/[name][extname]',
            //     entryFileNames: '[name].js',
            //     inlineDynamicImports: false,
            // },
        },
    },
});
