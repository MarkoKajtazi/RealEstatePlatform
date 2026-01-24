import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve('./src'),
        },
    },
    server: {
        hmr: {
            protocol: 'ws',
            host: 'localhost',
            port: 5173
        },
        proxy: {
            '/api': {
                target: 'https://localhost:7238',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
