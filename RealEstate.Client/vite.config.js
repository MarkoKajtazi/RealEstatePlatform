import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
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
