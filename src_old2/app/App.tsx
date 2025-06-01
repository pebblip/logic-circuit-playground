import React from 'react';
import { CircuitCanvas } from '../features/circuit-editor/ui/CircuitCanvas';
import { ModeSelector } from '../features/mode-selector/ui/ModeSelector';
import { useModeSelection } from '../features/mode-selector/model/useModeSelection';
import { CircuitModeProvider } from '../features/circuit-editor/model/CircuitModeContext';
import { AppMode } from '../entities/types/mode';
import { StoreProvider } from './providers/StoreProvider';
import { ResponsiveLayout } from './layouts/ResponsiveLayout';

function App() {
  const { currentMode, needsModeSelection, selectMode } = useModeSelection();

  // 開発中は一時的にモード選択をスキップ
  const skipModeSelection = true; // TODO: 本番環境では false にする
  
  // モード選択が必要な場合
  if (needsModeSelection && !skipModeSelection) {
    return <ModeSelector onSelectMode={selectMode} />;
  }

  return (
    <StoreProvider>
      <CircuitModeProvider mode={currentMode || 'free'}>
        <ResponsiveLayout>
          <CircuitCanvas />
        </ResponsiveLayout>
      </CircuitModeProvider>
    </StoreProvider>
  );
}

function getModeDisplay(mode: AppMode | null): string {
  switch (mode) {
    case 'learning':
      return '📚 学習モード';
    case 'free':
      return '🎨 自由モード';
    case 'puzzle':
      return '🧩 パズルモード';
    default:
      return '';
  }
}

export default App;