/// <reference types="vitest vite-plugin-svgr/clientq">

import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    test: {
        cache: {
            dir: '.vitest',
        },
        environment: 'jsdom',
        globals: true,
        setupFiles: '../tests/setup.ts',
    },
})
