import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@models': resolve(__dirname, './src/models'),
      '@viewmodels': resolve(__dirname, './src/viewmodels'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@domain': resolve(__dirname, './src/domain'),
      '@shared': resolve(__dirname, './src/shared'),
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@features': resolve(__dirname, './src/features'),
      '@tests': resolve(__dirname, './tests'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // __tests__フォルダ内のファイルを自動的にテストとして認識
    include: ['src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}']
  }
})