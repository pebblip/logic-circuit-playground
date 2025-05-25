// モダンなツールバーコンポーネント

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { LEVELS, GATE_TYPES } from '../../constants/circuit';
import { colors, spacing, typography, shadows, radius } from '../../styles/design-tokens';

/**
 * モダンなツールバー
 */
const Toolbar = memo(({
  currentLevel,
  unlockedLevels,
  gates,
  autoMode,
  simulationSpeed,
  clockSignal,
  learningMode,
  earnedBadges,
  onAddGate,
  onToggleInput,
  onCalculate,
  onToggleAutoMode,
  onUpdateSpeed,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleLearningMode
}) => {
  const currentLevelGates = LEVELS[currentLevel]?.gates || [];
  
  // ゲートのカテゴリごとのアイコン
  const gateIcons = {
    AND: '∧',
    OR: '∨',
    NOT: '¬',
    XOR: '⊕',
    NAND: '⊼',
    NOR: '⊽',
    INPUT: '●',
    OUTPUT: '○',
    CLOCK: '⏰',
    SR_LATCH: '⟲',
    D_FF: '⟳',
    HALF_ADDER: '½+',
    FULL_ADDER: '1+',
  };

  // ボタンスタイル
  const buttonStyle = {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.md,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: colors.ui.accent.primary,
    color: colors.ui.surface,
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: colors.ui.surface,
    color: colors.ui.text.primary,
    border: `1px solid ${colors.ui.border}`,
  };

  return (
    <div className="h-full flex items-center justify-between px-4">
      {/* 左側: ゲート追加ボタン */}
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-gray-600 mr-2">
          ゲート追加:
        </div>
        {currentLevelGates.map(gateType => {
          const gateInfo = GATE_TYPES[gateType];
          const isUnlocked = unlockedLevels[gateInfo.level];
          
          return (
            <button
              key={gateType}
              onClick={() => onAddGate(gateType)}
              disabled={!isUnlocked}
              className="group relative"
              style={{
                ...secondaryButtonStyle,
                opacity: isUnlocked ? 1 : 0.5,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.backgroundColor = colors.ui.accent.primary;
                  e.currentTarget.style.color = colors.ui.surface;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = shadows.md;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.ui.surface;
                e.currentTarget.style.color = colors.ui.text.primary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="text-lg">{gateIcons[gateType] || '?'}</span>
              <span>{gateInfo.name}</span>
              
              {/* ツールチップ */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                            bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {gateType === 'AND' && 'すべての入力が1のとき1を出力'}
                {gateType === 'OR' && 'いずれかの入力が1のとき1を出力'}
                {gateType === 'NOT' && '入力を反転して出力'}
                {gateType === 'XOR' && '入力が異なるとき1を出力'}
                {gateType === 'NAND' && 'ANDの出力を反転'}
                {gateType === 'NOR' && 'ORの出力を反転'}
                {gateType === 'HALF_ADDER' && '2ビットの加算器'}
                {gateType === 'FULL_ADDER' && 'キャリー入力付き加算器'}
              </div>
            </button>
          );
        })}
      </div>

      {/* 中央: シミュレーション制御 */}
      <div className="flex items-center gap-4">
        {/* 手動計算ボタン */}
        <button
          onClick={onCalculate}
          style={{
            ...primaryButtonStyle,
            backgroundColor: colors.ui.accent.success,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = shadows.lg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>⚡</span>
          計算実行
        </button>

        {/* 自動モード切替 */}
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoMode}
              onChange={onToggleAutoMode}
              className="sr-only peer"
            />
            <div className={`
              w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
              peer-checked:after:translate-x-full peer-checked:after:border-white 
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
              after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
              ${autoMode ? 'bg-green-500' : 'bg-gray-300'}
            `}></div>
            <span className="ml-2 text-sm font-medium">
              自動実行 {autoMode && '(ON)'}
            </span>
          </label>
          
          {autoMode && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-600">速度:</span>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => onUpdateSpeed(parseFloat(e.target.value))}
                className="w-24"
                style={{
                  accentColor: colors.ui.accent.primary,
                }}
              />
              <span className="text-sm font-medium w-12">
                {simulationSpeed}Hz
              </span>
              
              {/* クロック信号インジケーター */}
              <div className="ml-2 flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full transition-all"
                  style={{
                    backgroundColor: clockSignal ? colors.signal.on : colors.signal.off,
                    boxShadow: clockSignal ? `0 0 8px ${colors.signal.onGlow}` : 'none',
                  }}
                />
                <span className="text-xs text-gray-600">CLK</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右側: アクションボタン */}
      <div className="flex items-center gap-2">
        {/* 学習モード切替 */}
        <button
          onClick={onToggleLearningMode}
          style={{
            ...secondaryButtonStyle,
            backgroundColor: learningMode !== 'sandbox' ? colors.ui.accent.primary : colors.ui.surface,
            color: learningMode !== 'sandbox' ? colors.ui.surface : colors.ui.text.primary,
            borderColor: colors.ui.accent.primary,
          }}
          title="学習モードの切り替え"
        >
          {learningMode === 'sandbox' ? '🎯 学習モード' : '🔨 自由制作'}
        </button>
        
        {/* バッジ表示 */}
        {earnedBadges && earnedBadges.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded" 
               style={{ backgroundColor: colors.ui.background }}>
            <span className="text-sm">🏆 {earnedBadges.length}</span>
          </div>
        )}
        
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              ...secondaryButtonStyle,
              padding: spacing.sm,
              opacity: canUndo ? 1 : 0.5,
              cursor: canUndo ? 'pointer' : 'not-allowed',
            }}
            title="元に戻す (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              ...secondaryButtonStyle,
              padding: spacing.sm,
              opacity: canRedo ? 1 : 0.5,
              cursor: canRedo ? 'pointer' : 'not-allowed',
            }}
            title="やり直す (Ctrl+Y)"
          >
            ↷
          </button>
        </div>

        {/* リセット */}
        <button
          onClick={onReset}
          style={{
            ...secondaryButtonStyle,
            color: colors.ui.accent.error,
            borderColor: colors.ui.accent.error,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.ui.accent.error;
            e.currentTarget.style.color = colors.ui.surface;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.ui.surface;
            e.currentTarget.style.color = colors.ui.accent.error;
          }}
        >
          <span>🔄</span>
          リセット
        </button>

        {/* ヘルプ */}
        <button
          style={{
            ...secondaryButtonStyle,
            padding: spacing.sm,
          }}
          title="ヘルプ"
        >
          ?
        </button>
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

Toolbar.propTypes = {
  currentLevel: PropTypes.number.isRequired,
  unlockedLevels: PropTypes.object.isRequired,
  gates: PropTypes.array.isRequired,
  autoMode: PropTypes.bool.isRequired,
  simulationSpeed: PropTypes.number.isRequired,
  clockSignal: PropTypes.bool.isRequired,
  learningMode: PropTypes.string.isRequired,
  earnedBadges: PropTypes.array,
  onAddGate: PropTypes.func.isRequired,
  onToggleInput: PropTypes.func.isRequired,
  onCalculate: PropTypes.func.isRequired,
  onToggleAutoMode: PropTypes.func.isRequired,
  onUpdateSpeed: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired,
  canUndo: PropTypes.bool.isRequired,
  canRedo: PropTypes.bool.isRequired,
  onToggleLearningMode: PropTypes.func.isRequired
};

export default Toolbar;