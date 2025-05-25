// 再設計されたツールバーコンポーネント

import React, { memo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { colors, spacing, typography, shadows, radius } from '../../styles/design-tokens';
import GateIcon from './GateIcon';

/**
 * ドロップダウンメニュー付きの再設計されたツールバー
 */
const ToolbarRedesigned = memo(({
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
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // ゲートカテゴリーの定義
  const gateCategories = {
    basic: {
      label: '基本ゲート',
      gates: [
        { type: 'AND', name: 'AND', level: 1, description: '論理積' },
        { type: 'OR', name: 'OR', level: 1, description: '論理和' },
        { type: 'NOT', name: 'NOT', level: 1, description: '否定' },
        { type: 'NAND', name: 'NAND', level: 2, description: '否定論理積' },
        { type: 'NOR', name: 'NOR', level: 2, description: '否定論理和' },
        { type: 'XOR', name: 'XOR', level: 3, description: '排他的論理和' }
      ]
    },
    memory: {
      label: 'メモリ素子',
      gates: [
        { type: 'SR_LATCH', name: 'SRラッチ', level: 2, description: '基本記憶素子' },
        { type: 'D_FF', name: 'Dフリップフロップ', level: 2, description: 'データ保持' },
        { type: 'CLOCK', name: 'クロック', level: 2, description: 'タイミング信号' }
      ]
    },
    arithmetic: {
      label: '演算回路',
      gates: [
        { type: 'HALF_ADDER', name: '半加算器', level: 3, description: '1ビット加算' },
        { type: 'FULL_ADDER', name: '全加算器', level: 3, description: 'キャリー付き加算' }
      ]
    }
  };

  // クリック外でドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !Object.values(dropdownRefs.current).some(ref => ref?.contains(event.target))) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const toggleDropdown = (category) => {
    setOpenDropdown(openDropdown === category ? null : category);
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
    gap: spacing.xs,
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

  const iconButtonStyle = {
    ...buttonStyle,
    padding: spacing.sm,
    minWidth: '36px',
    justifyContent: 'center',
  };

  return (
    <div className="h-full flex items-center justify-between px-4">
      {/* 左側: 常時表示のゲートとドロップダウン */}
      <div className="flex items-center gap-2">
        {/* 常時表示: INPUT/OUTPUT */}
        <button
          onClick={() => onAddGate('INPUT')}
          className="group"
          style={secondaryButtonStyle}
          title="入力を追加"
        >
          <GateIcon type="INPUT" size={20} />
          <span className="hidden md:inline">入力</span>
        </button>

        <button
          onClick={() => onAddGate('OUTPUT')}
          className="group"
          style={secondaryButtonStyle}
          title="出力を追加"
        >
          <GateIcon type="OUTPUT" size={20} />
          <span className="hidden md:inline">出力</span>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* ゲートカテゴリードロップダウン */}
        {Object.entries(gateCategories).map(([category, { label, gates: categoryGates }]) => {
          const hasUnlockedGates = categoryGates.some(gate => unlockedLevels[gate.level]);
          
          return (
            <div key={category} className="relative" ref={el => dropdownRefs.current[category] = el}>
              <button
                onClick={() => toggleDropdown(category)}
                disabled={!hasUnlockedGates}
                className="group"
                style={{
                  ...secondaryButtonStyle,
                  opacity: hasUnlockedGates ? 1 : 0.5,
                  cursor: hasUnlockedGates ? 'pointer' : 'not-allowed',
                }}
              >
                <span>{label}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M3 5L6 8L9 5H3Z" />
                </svg>
              </button>

              {/* ドロップダウンメニュー */}
              {openDropdown === category && (
                <div 
                  className="absolute top-full left-0 mt-1 w-56 rounded-lg shadow-lg z-50"
                  style={{ 
                    backgroundColor: colors.ui.surface,
                    border: `1px solid ${colors.ui.border}`,
                  }}
                >
                  {categoryGates.map(gate => {
                    const isUnlocked = unlockedLevels[gate.level];
                    
                    return (
                      <button
                        key={gate.type}
                        onClick={() => {
                          if (isUnlocked) {
                            onAddGate(gate.type);
                            setOpenDropdown(null);
                          }
                        }}
                        disabled={!isUnlocked}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        style={{
                          opacity: isUnlocked ? 1 : 0.5,
                          cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        }}
                      >
                        <GateIcon type={gate.type} size={24} />
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{gate.name}</div>
                          <div className="text-xs text-gray-500">{gate.description}</div>
                        </div>
                        {!isUnlocked && (
                          <span className="text-xs text-gray-400">Lv.{gate.level}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 中央: シミュレーション制御 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCalculate}
          style={{
            ...primaryButtonStyle,
            backgroundColor: colors.ui.accent.success,
          }}
          title="回路を実行"
        >
          <span>⚡</span>
          <span className="hidden md:inline">実行</span>
        </button>

        {/* 自動モード */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoMode}
            onChange={onToggleAutoMode}
            className="sr-only"
          />
          <div 
            className="w-10 h-5 rounded-full relative transition-colors"
            style={{ 
              backgroundColor: autoMode ? colors.ui.accent.success : colors.ui.background,
              border: `1px solid ${autoMode ? colors.ui.accent.success : colors.ui.border}`,
            }}
          >
            <div 
              className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
              style={{ transform: autoMode ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </div>
          <span className="text-sm hidden md:inline">自動実行</span>
        </label>

        {autoMode && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">速度:</span>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={simulationSpeed}
              onChange={(e) => onUpdateSpeed(parseFloat(e.target.value))}
              className="w-20"
              style={{ accentColor: colors.ui.accent.primary }}
            />
            <span className="text-xs font-medium w-8">{simulationSpeed}Hz</span>
            
            <div 
              className="w-2 h-2 rounded-full ml-1"
              style={{
                backgroundColor: clockSignal ? colors.signal.on : colors.signal.off,
                boxShadow: clockSignal ? `0 0 4px ${colors.signal.onGlow}` : 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* 右側: アクション */}
      <div className="flex items-center gap-2">
        {/* 学習モード */}
        <button
          onClick={onToggleLearningMode}
          style={{
            ...secondaryButtonStyle,
            backgroundColor: learningMode !== 'sandbox' ? colors.ui.accent.primary : colors.ui.surface,
            color: learningMode !== 'sandbox' ? colors.ui.surface : colors.ui.text.primary,
          }}
          title="学習モード"
        >
          <span>🎓</span>
          <span className="hidden md:inline">
            {learningMode === 'sandbox' ? '学習' : '自由制作'}
          </span>
        </button>

        {earnedBadges && earnedBadges.length > 0 && (
          <div className="px-2 py-1 rounded text-sm" style={{ backgroundColor: colors.ui.background }}>
            🏆 {earnedBadges.length}
          </div>
        )}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            ...iconButtonStyle,
            ...secondaryButtonStyle,
            opacity: canUndo ? 1 : 0.5,
          }}
          title="元に戻す (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            ...iconButtonStyle,
            ...secondaryButtonStyle,
            opacity: canRedo ? 1 : 0.5,
          }}
          title="やり直す (Ctrl+Y)"
        >
          ↷
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* リセット */}
        <button
          onClick={onReset}
          style={{
            ...iconButtonStyle,
            ...secondaryButtonStyle,
            color: colors.ui.accent.error,
          }}
          title="リセット"
        >
          🔄
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* ヘルプ */}
        <button
          onClick={() => {
            console.log('Help button clicked');
            if (window.toggleHelp) {
              window.toggleHelp();
            } else {
              console.error('toggleHelp function not found');
            }
          }}
          style={{
            ...iconButtonStyle,
            ...secondaryButtonStyle,
          }}
          title="ヘルプ (F1)"
        >
          ❓
        </button>
      </div>
    </div>
  );
});

ToolbarRedesigned.displayName = 'ToolbarRedesigned';

ToolbarRedesigned.propTypes = {
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

export default ToolbarRedesigned;