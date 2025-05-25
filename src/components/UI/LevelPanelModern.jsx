// モダンなレベル選択パネル

import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { LEVELS } from '../../constants/circuit';
import { colors, spacing, typography, shadows, radius } from '../../styles/design-tokens';

/**
 * モダンなレベル選択パネル
 */
const LevelPanelModern = memo(({ currentLevel, unlockedLevels, onLevelSelect }) => {
  const [expandedLevel, setExpandedLevel] = useState(currentLevel);

  const levelColors = {
    1: colors.gates.basic,
    2: colors.gates.memory,
    3: colors.gates.arithmetic,
    4: colors.gates.cpu,
  };

  const levelIcons = {
    1: '🔤', // 基本
    2: '💾', // メモリ
    3: '🧮', // 演算
    4: '🖥️', // CPU
  };

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div 
        className="p-4 border-b"
        style={{ borderColor: colors.ui.border }}
      >
        <h2 
          className="text-lg font-semibold"
          style={{ color: colors.ui.text.primary }}
        >
          学習レベル
        </h2>
        <p 
          className="text-xs mt-1"
          style={{ color: colors.ui.text.secondary }}
        >
          段階的に論理回路を学習しましょう
        </p>
      </div>

      {/* レベルリスト */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {Object.entries(LEVELS).map(([level, info]) => {
            const isUnlocked = unlockedLevels[level];
            const isActive = currentLevel === parseInt(level);
            const isExpanded = expandedLevel === parseInt(level);

            return (
              <div
                key={level}
                className="rounded-lg overflow-hidden transition-all"
                style={{
                  backgroundColor: isActive ? levelColors[level] + '10' : colors.ui.surface,
                  border: `2px solid ${isActive ? levelColors[level] : colors.ui.border}`,
                  opacity: isUnlocked ? 1 : 0.6,
                  boxShadow: isActive ? shadows.md : shadows.sm,
                }}
              >
                {/* レベルヘッダー */}
                <button
                  onClick={() => {
                    if (isUnlocked) {
                      onLevelSelect(parseInt(level));
                      setExpandedLevel(parseInt(level));
                    }
                  }}
                  className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  disabled={!isUnlocked}
                  style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
                >
                  <div className="flex items-center gap-3">
                    {/* アイコン */}
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{
                        backgroundColor: levelColors[level] + '20',
                        color: levelColors[level],
                      }}
                    >
                      {levelIcons[level]}
                    </div>
                    
                    {/* レベル情報 */}
                    <div>
                      <h3 
                        className="font-semibold flex items-center gap-2"
                        style={{ 
                          color: isActive ? levelColors[level] : colors.ui.text.primary,
                          fontSize: typography.size.base,
                        }}
                      >
                        レベル {level}: {info.name}
                        {isActive && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: levelColors[level] + '20',
                              color: levelColors[level],
                            }}
                          >
                            現在
                          </span>
                        )}
                      </h3>
                      <p 
                        className="text-xs"
                        style={{ color: colors.ui.text.secondary }}
                      >
                        {info.description}
                      </p>
                    </div>
                  </div>

                  {/* 状態アイコン */}
                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <span style={{ color: colors.ui.accent.success }}>✓</span>
                    ) : (
                      <span style={{ color: colors.ui.text.tertiary }}>🔒</span>
                    )}
                    <span
                      className="transition-transform"
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                        color: colors.ui.text.tertiary,
                      }}
                    >
                      ▼
                    </span>
                  </div>
                </button>

                {/* 展開コンテンツ */}
                {isExpanded && isUnlocked && (
                  <div 
                    className="px-3 pb-3"
                    style={{ borderTop: `1px solid ${colors.ui.border}` }}
                  >
                    <div className="mt-3 space-y-2">
                      <p 
                        className="text-xs font-semibold mb-2"
                        style={{ color: colors.ui.text.secondary }}
                      >
                        利用可能なゲート:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {info.gates.map(gate => (
                          <div
                            key={gate}
                            className="text-xs p-2 rounded flex items-center gap-2"
                            style={{
                              backgroundColor: colors.ui.background,
                              color: colors.ui.text.secondary,
                            }}
                          >
                            <span 
                              className="w-5 h-5 rounded flex items-center justify-center text-xs"
                              style={{
                                backgroundColor: levelColors[level] + '20',
                                color: levelColors[level],
                              }}
                            >
                              {gate.charAt(0)}
                            </span>
                            {gate.replace(/_/g, ' ')}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 進捗状況（将来実装用） */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: colors.ui.text.secondary }}>進捗</span>
                        <span style={{ color: levelColors[level] }}>0%</span>
                      </div>
                      <div 
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: colors.ui.border }}
                      >
                        <div 
                          className="h-full transition-all"
                          style={{
                            width: '0%',
                            backgroundColor: levelColors[level],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* フッター */}
      <div 
        className="p-4 border-t"
        style={{ borderColor: colors.ui.border }}
      >
        <button
          className="w-full py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: colors.ui.accent.primary,
            color: colors.ui.surface,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.ui.accent.primaryHover;
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.ui.accent.primary;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          チャレンジモード 🏆
        </button>
      </div>
    </div>
  );
});

LevelPanelModern.displayName = 'LevelPanelModern';

LevelPanelModern.propTypes = {
  currentLevel: PropTypes.number.isRequired,
  unlockedLevels: PropTypes.object.isRequired,
  onLevelSelect: PropTypes.func.isRequired
};

export default LevelPanelModern;