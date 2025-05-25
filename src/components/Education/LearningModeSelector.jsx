// 学習モード選択コンポーネント

import React from 'react';
import PropTypes from 'prop-types';
import { colors } from '../../styles/design-tokens';
import { LEARNING_OBJECTIVES } from '../../constants/education';

/**
 * 学習モード選択とチャレンジ一覧
 */
const LearningModeSelector = ({ 
  learningMode, 
  progress,
  currentLevel,
  onModeChange,
  onStartChallenge,
  calculateProgress,
  currentTutorial
}) => {
  const levelProgress = calculateProgress(`level${currentLevel}`);
  const objectives = LEARNING_OBJECTIVES[`level${currentLevel}`] || {};

  return (
    <div 
      className="absolute left-4 top-20 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg shadow-lg"
      style={{ 
        backgroundColor: colors.ui.surface,
        border: `1px solid ${colors.ui.border}`
      }}
    >
      {/* ヘッダー */}
      <div className="p-4 border-b" style={{ borderColor: colors.ui.border }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold" style={{ color: colors.ui.text.primary }}>
            学習モード
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: colors.ui.text.secondary }}>
              レベル:
            </span>
            <select
              value={currentLevel}
              onChange={(e) => {
                // レベル切り替え機能を追加
                const newLevel = parseInt(e.target.value);
                if (window.onLevelChange) {
                  window.onLevelChange(newLevel);
                }
              }}
              className="px-2 py-1 rounded border text-sm"
              style={{
                backgroundColor: colors.ui.surface,
                borderColor: colors.ui.border,
                color: colors.ui.text.primary
              }}
            >
              <option value={1}>レベル1</option>
              <option value={2}>レベル2</option>
              <option value={3}>レベル3</option>
            </select>
          </div>
        </div>
        
        {/* 進捗表示 */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: colors.ui.text.secondary }}>
              レベル{currentLevel}の進捗
            </span>
            <span style={{ color: colors.ui.accent.primary }}>
              {levelProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${levelProgress}%`,
                backgroundColor: colors.ui.accent.primary 
              }}
            />
          </div>
        </div>

        {/* モード選択 */}
        <div className="flex gap-2">
          <button
            onClick={() => onModeChange('sandbox')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
              learningMode === 'sandbox' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: learningMode === 'sandbox' 
                ? colors.ui.accent.primary 
                : colors.ui.background,
              color: learningMode === 'sandbox' 
                ? 'white' 
                : colors.ui.text.primary,
              ringColor: colors.ui.accent.primary
            }}
          >
            自由制作
          </button>
          <button
            onClick={() => onModeChange('tutorial')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
              learningMode === 'tutorial' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: learningMode === 'tutorial' 
                ? colors.ui.accent.primary 
                : colors.ui.background,
              color: learningMode === 'tutorial' 
                ? 'white' 
                : colors.ui.text.primary,
              ringColor: colors.ui.accent.primary
            }}
          >
            学習
          </button>
        </div>
      </div>

      {/* チャレンジ一覧 */}
      {learningMode === 'tutorial' && (
        <div className="p-4">
          {Object.entries(objectives).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h4 
                className="text-sm font-semibold mb-2 capitalize"
                style={{ color: colors.ui.text.secondary }}
              >
                {category === 'basics' ? '基礎' : 
                 category === 'constructions' ? '構築' : 
                 '応用'}
              </h4>
              
              <div className="space-y-2">
                {items.map(objective => (
                  <div
                    key={objective.id}
                    className="p-3 rounded cursor-pointer transition-all hover:shadow-md"
                    style={{
                      backgroundColor: objective.completed 
                        ? colors.ui.accent.success + '10' 
                        : currentTutorial === objective.id
                          ? colors.ui.accent.primary + '20'
                          : colors.ui.background,
                      border: `1px solid ${
                        objective.completed 
                          ? colors.ui.accent.success 
                          : currentTutorial === objective.id
                            ? colors.ui.accent.primary
                            : colors.ui.border
                      }`
                    }}
                    onClick={() => {
                      if (!objective.completed) {
                        onStartChallenge(objective.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 
                          className="font-medium text-sm"
                          style={{ color: colors.ui.text.primary }}
                        >
                          {objective.name}
                        </h5>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: colors.ui.text.secondary }}
                        >
                          {objective.description}
                        </p>
                      </div>
                      <div className="ml-3">
                        {objective.completed ? (
                          <span className="text-xl">✅</span>
                        ) : currentTutorial === objective.id ? (
                          <span 
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: colors.ui.accent.primary,
                              color: 'white'
                            }}
                          >
                            進行中
                          </span>
                        ) : (
                          <span 
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: colors.ui.accent.primary + '20',
                              color: colors.ui.accent.primary
                            }}
                          >
                            開始
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* サンドボックスモードの説明 */}
      {learningMode === 'sandbox' && (
        <div className="p-4">
          <p className="text-sm" style={{ color: colors.ui.text.secondary }}>
            自由に回路を作成できます。学習した内容を試したり、独自の回路を設計してみましょう。
          </p>
          <div 
            className="mt-4 p-3 rounded"
            style={{ 
              backgroundColor: colors.ui.accent.info + '10',
              border: `1px solid ${colors.ui.accent.info}`
            }}
          >
            <p className="text-sm" style={{ color: colors.ui.text.primary }}>
              💡 ヒント: 学習モードで新しい回路の作り方を学べます
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

LearningModeSelector.propTypes = {
  learningMode: PropTypes.oneOf(['sandbox', 'tutorial', 'challenge']).isRequired,
  progress: PropTypes.object.isRequired,
  currentLevel: PropTypes.number.isRequired,
  onModeChange: PropTypes.func.isRequired,
  onStartChallenge: PropTypes.func.isRequired,
  calculateProgress: PropTypes.func.isRequired,
  currentTutorial: PropTypes.string
};

export default LearningModeSelector;