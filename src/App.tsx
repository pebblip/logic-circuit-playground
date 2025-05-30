import React from 'react'
import UltraModernCircuitWithViewModel from './components/UltraModernCircuitWithViewModel'
import ErrorBoundary from './components/ErrorBoundary'
import AppModeSelector from './components/mode/AppModeSelector'
import { LearningModeManager } from './components/Education/LearningModeManager'
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
        <main className="flex-1 flex">
          {/* 学習モード用サイドパネル */}
          {currentMode === 'learning' && (
            <aside className="w-80 bg-gray-100 border-r border-gray-300 overflow-y-auto">
              <LearningModeManager currentMode={currentMode} />
            </aside>
          )}
          
          {/* 回路エディタ */}
          <div className="flex-1">
            <UltraModernCircuitWithViewModel />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App