import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // __tests__フォルダ内のファイルを自動的にテストとして認識
    include: ['src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}']
  }
})