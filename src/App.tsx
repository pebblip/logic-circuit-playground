import React from 'react'
import UltraModernCircuitWithViewModel from './components/UltraModernCircuitWithViewModel'
import ErrorBoundary from './components/ErrorBoundary'
import AppModeSelector from './components/mode/AppModeSelector'
import { useAppMode } from './hooks/useAppMode'

function App(): React.ReactElement {
  const { currentMode } = useAppMode();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* モード選択ヘッダー */}
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">
                ⚡ Logic Circuit Playground
              </h1>
              <AppModeSelector size="md" />
            </div>
            <div className="text-sm text-gray-400">
              現在のモード: {currentMode}
            </div>
          </div>
        </header>
        
        {/* メインコンテンツ */}
        <main className="flex-1">
          <UltraModernCircuitWithViewModel />
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App