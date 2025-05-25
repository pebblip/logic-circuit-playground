// ツールバーコンポーネント

import React, { memo } from 'react';
import { getAvailableGateTypes } from '../../utils/circuit';
import { SIMULATION } from '../../constants/circuit';

/**
 * ツールバーコンポーネント
 */
const Toolbar = memo(({
  currentLevel,
  unlockedLevels,
  gates,
  autoMode,
  simulationSpeed,
  clockSignal,
  onAddGate,
  onToggleInput,
  onCalculate,
  onToggleAutoMode,
  onUpdateSpeed,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const availableGates = getAvailableGateTypes(currentLevel, unlockedLevels);
  const inputGates = gates.filter(g => g.type === 'INPUT');
  const hasClockGate = gates.some(g => g.type === 'CLOCK');

  return (
    <div className="bg-white border-b border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* ゲート追加ボタン */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">ゲート追加:</span>
            <div className="flex gap-1">
              {availableGates.map(([type, info]) => (
                <button
                  key={type}
                  onClick={() => onAddGate(type)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  title={info.name}
                >
                  {info.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-r pr-3 mr-3">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 text-sm rounded transition-colors ${
                canUndo 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="元に戻す (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 text-sm rounded transition-colors ${
                canRedo 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="やり直す (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>
          
          {/* 実行制御 */}
          <button
            onClick={onCalculate}
            className="px-4 py-1.5 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors"
          >
            計算
          </button>
          
          <button
            onClick={onToggleAutoMode}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${
              autoMode 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {autoMode ? '自動実行中' : '自動実行'}
          </button>

          <button
            onClick={onReset}
            className="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 hover:bg-gray-100 rounded transition-colors"
          >
            リセット
          </button>

          {/* 速度制御（自動実行時のみ表示） */}
          {autoMode && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">速度:</span>
              <input
                type="range"
                min={SIMULATION.MIN_SPEED}
                max={SIMULATION.MAX_SPEED}
                step={SIMULATION.SPEED_STEP}
                value={simulationSpeed}
                onChange={(e) => onUpdateSpeed(parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-700">{simulationSpeed}Hz</span>
            </div>
          )}
        </div>
      </div>

      {/* 入力制御 */}
      {(inputGates.length > 0 || hasClockGate) && (
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">入力制御:</span>
          {inputGates.map((gate, index) => (
            <button
              key={gate.id}
              onClick={() => onToggleInput(gate.id)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                gate.value 
                  ? 'bg-gray-900 text-white' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              IN{index + 1}: {gate.value ? '1' : '0'}
            </button>
          ))}
          {hasClockGate && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">CLK:</span>
              <div className={`w-4 h-4 rounded-full ${clockSignal ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;