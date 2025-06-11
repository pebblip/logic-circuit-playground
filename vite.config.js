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
  build: {
    // チャンクサイズ警告の閾値を調整
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // ライブラリとアプリケーションコードを分離してバンドルサイズを最適化
        manualChunks(id) {
          // React関連ライブラリを分離
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Zustand状態管理を分離
          if (id.includes('node_modules/zustand')) {
            return 'state-vendor';
          }
          // 学習モードの機能を分離
          if (id.includes('/features/learning-mode/')) {
            return 'learning-mode';
          }
          // シミュレーションコアを分離
          if (id.includes('/domain/simulation/')) {
            return 'simulation-core';
          }
          // その他のnode_modulesをvendorとして分離
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // __tests__フォルダ内のファイルを自動的にテストとして認識
    include: ['src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}']
  }
})