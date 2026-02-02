import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 환경에서만 프록시 사용 (프로덕션에서는 Vercel이 직접 처리)
    proxy: process.env.NODE_ENV === 'development' ? {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    } : undefined
  }
})
